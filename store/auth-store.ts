// stores/authStore.ts
import { create } from "zustand";
import { tokenStorage } from "@/utils/tokenStorage";
import { userStorage } from "@/utils/userStorage";
import { User, UserProfile } from "@/types";
import { queryClient } from "@/app/_layout";

interface AuthState {
  // State
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  showBalance: boolean;
  needsProfileSetup: boolean;

  // Actions
  initialize: () => Promise<void>;
  setUser: (user: User) => void;
  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  syncUserFromDashboard: (user: User, profile: UserProfile) => void;
  toggleShowBalance: () => Promise<void>;
  setShowBalance: (show: boolean) => Promise<void>;
  completeProfileSetup: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  showBalance: true,
  needsProfileSetup: false,

  // Initialize auth state on app start
  initialize: async () => {
    try {
      console.log("🔄 Initializing auth state...");
      set({ isLoading: true });

      const accessToken = await tokenStorage.getAccessToken();
      const refreshToken = await tokenStorage.getRefreshToken();

      if (accessToken && refreshToken) {
        const userInfo = await userStorage.getUserInfo();
        const showBalance = await userStorage.getShowBalancePreference();

        // ✅ Create minimal user object - dashboard will provide full data
        const user: User = {
          id: 0,
          username: null,
          email: userInfo.email || "",
          phone: userInfo.phone || "",
          password: "",
          status: "active",
          pin: null,
          isVerified: false,
          source: "",
          fmcToken: null,
          refereshToken: null,
          lastLogin: "",
          createdAt: "",
          updatedAt: "",
        };

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          showBalance,
          needsProfileSetup: false, // ✅ Dashboard will update this
        });

        console.log("✅ Auth initialized - waiting for dashboard sync");
      } else {
        console.log("❌ No tokens found - user not authenticated");
        const showBalance = await userStorage.getShowBalancePreference();
        set({
          user: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          showBalance,
          needsProfileSetup: false,
        });
      }
    } catch (error) {
      console.error("❌ Error initializing auth:", error);
      set({
        user: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        needsProfileSetup: false,
      });
    }
  },

  // Set user data
  setUser: (user) => {
    set({ user });
  },

  // Set authentication (after login/register)
  setAuth: async (user, accessToken, refreshToken) => {
    try {
      await tokenStorage.setTokens(accessToken, refreshToken);

      // ✅ Only save email for quick login reference
      // Full user data (name, phone) will be saved by syncUserFromDashboard
      await userStorage.updateEmail(user.email);

      // ✅ Check if user needs profile setup
      const needsSetup =
        user.isProfileComplete !== undefined
          ? !user.isProfileComplete
          : !user.phone || user.phone === "";

      console.log(
        "✅ Authentication set successfully, needsProfileSetup:",
        needsSetup
      );
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        needsProfileSetup: needsSetup,
      });
    } catch (error) {
      console.error("❌ Error setting auth:", error);
      throw error;
    }
  },

  // Sync user data from dashboard
  syncUserFromDashboard: async (user, profile) => {
    if (user && profile) {
      // ✅ Save the complete user info from dashboard API
      await userStorage.saveUserInfo(user.email, profile.fullname, user.phone);

      set({
        user: user,
        userProfile: profile,
        needsProfileSetup: false, // Profile exists = setup complete
      });
      console.log(
        "✅ User and profile synced from dashboard and saved to storage"
      );
    }
  },

  // Sign out
  signOut: async () => {
    try {
      console.log("🔓 Signing out...");
      await tokenStorage.clearTokens();

      queryClient.clear();

      console.log("✅ Signed out successfully");
      set({
        user: null,
        userProfile: null,
        isAuthenticated: false,
        needsProfileSetup: false,
      });
    } catch (error) {
      console.error("❌ Error signing out:", error);

      queryClient.clear();

      set({
        user: null,
        userProfile: null,
        isAuthenticated: false,
        needsProfileSetup: false,
      });
    }
  },

  // Update user data
  updateUser: (updates) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      set({ user: updatedUser });

      if (updates.email) userStorage.updateEmail(updates.email);
      if (updates.phone) userStorage.updatePhone(updates.phone);
    }
  },

  // Mark profile setup as complete
  completeProfileSetup: () => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        needsProfileSetup: false,
        user: {
          ...currentUser,
          isProfileComplete: true,
        },
      });
      console.log("✅ Profile setup marked as complete");
    } else {
      set({ needsProfileSetup: false });
    }
  },

  // Toggle balance visibility
  toggleShowBalance: async () => {
    try {
      const newShowBalance = await userStorage.toggleShowBalancePreference();
      set({ showBalance: newShowBalance });
      console.log("✅ Balance visibility toggled:", newShowBalance);
    } catch (error) {
      console.error("❌ Error toggling balance visibility:", error);
    }
  },

  // Set balance visibility explicitly
  setShowBalance: async (show) => {
    try {
      await userStorage.setShowBalancePreference(show);
      set({ showBalance: show });
    } catch (error) {
      console.error("❌ Error setting balance visibility:", error);
    }
  },
}));
