// stores/authStore.ts
import { create } from 'zustand';
import { tokenStorage } from '@/utils/tokenStorage';
import { userStorage } from '@/utils/userStorage';
import { User, UserProfile } from '@/types';

interface AuthState {
  // State
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  showBalance: boolean; 
  
  // Actions
  initialize: () => Promise<void>;
  setUser: (user: User) => void;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  syncUserFromDashboard: (user: User, profile: UserProfile) => void;
  toggleShowBalance: () => Promise<void>;
  setShowBalance: (show: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  showBalance: true,

  // Initialize auth state on app start
  initialize: async () => {
    try {
      console.log('🔄 Initializing auth state...');
      set({ isLoading: true });

      const accessToken = await tokenStorage.getAccessToken();
      const refreshToken = await tokenStorage.getRefreshToken();

      if (accessToken && refreshToken) {
        const userInfo = await userStorage.getUserInfo();
        const showBalance = await userStorage.getShowBalancePreference();
        
        // Create minimal user object with required fields
        // We'll populate the full user data when dashboard loads
        const user: User = {
          id: 0, // Temporary, will be updated from dashboard
          username: null,
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          password: '', // Not stored locally for security
          status: 'active',
          pin: null,
          isVerified: false,
          source: '',
          fmcToken: null,
          refereshToken: null,
          lastLogin: '',
          createdAt: '',
          updatedAt: '',
        };

        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false,
          isInitialized: true, 
          showBalance,
        });
      } else {
        console.log('❌ No tokens found - user not authenticated');
        const showBalance = await userStorage.getShowBalancePreference();
        set({ 
          user: null,
          userProfile: null,
          isAuthenticated: false, 
          isLoading: false,
          isInitialized: true, 
          showBalance,
        });
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      set({ 
        user: null,
        userProfile: null,
        isAuthenticated: false, 
        isLoading: false,
        isInitialized: true 
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
      await userStorage.saveUserInfo(user.email, user.phone);

      console.log('✅ Authentication set successfully');
      set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      console.error('❌ Error setting auth:', error);
      throw error;
    }
  },

  // Sync user data from dashboard
  syncUserFromDashboard: (user, profile) => {
    const currentUser = get().user;
    if (user && profile) {
      // Use the full user object from dashboard
      set({ 
        user: user,
        userProfile: profile 
      });
      console.log('✅ User and profile synced from dashboard');
    }
  },

  // Sign out
  signOut: async () => {
    try {
      console.log('🔓 Signing out...');
      await tokenStorage.clearTokens();

      console.log('✅ Signed out successfully');
      set({ 
        user: null,
        userProfile: null,
        isAuthenticated: false 
      });
    } catch (error) {
      console.error('❌ Error signing out:', error);
      set({ 
        user: null,
        userProfile: null,
        isAuthenticated: false 
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

  // Toggle balance visibility
  toggleShowBalance: async () => {
    try {
      const newShowBalance = await userStorage.toggleShowBalancePreference();
      set({ showBalance: newShowBalance });
      console.log('✅ Balance visibility toggled:', newShowBalance);
    } catch (error) {
      console.error('❌ Error toggling balance visibility:', error);
    }
  },

  // Set balance visibility explicitly
  setShowBalance: async (show) => {
    try {
      await userStorage.setShowBalancePreference(show);
      set({ showBalance: show });
    } catch (error) {
      console.error('❌ Error setting balance visibility:', error);
    }
  },
}));