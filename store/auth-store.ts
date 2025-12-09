// stores/authStore.ts
import { create } from 'zustand';
import { tokenStorage } from '@/utils/tokenStorage';
import { userStorage } from '@/utils/userStorage';
import { User } from '@/types';

interface AuthState {
  // State
  user: User | null;
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
   toggleShowBalance: () => Promise<void>; // NEW: Toggle balance visibility
  setShowBalance: (show: boolean) => Promise<void>; // NEW: Set balance visibility

}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
   showBalance: true,

  // Initialize auth state on app start
  initialize: async () => {
    try {
      console.log('🔄 Initializing auth state...');
      set({ isLoading: true });

      // Check if tokens exist
      const accessToken = await tokenStorage.getAccessToken();
      const refreshToken = await tokenStorage.getRefreshToken();

      if (accessToken && refreshToken) {
        // Get user info from secure storage
        const userInfo = await userStorage.getUserInfo();

          const showBalance = await userStorage.getShowBalancePreference();
        
        // Create user object from stored info
        // Note: You might want to fetch full user data from API here
        const user: User = {
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          // Add other user fields as needed
          // You may want to call an API to get full user data
        } as User;

        console.log('✅ User authenticated from storage');
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
      // Store tokens
      await tokenStorage.setTokens(accessToken, refreshToken);
      
      // Store user info for quick access
      await userStorage.saveUserInfo(
        user.email,
        // user.username,
        user.phone
      );

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

  // Sign out
  signOut: async () => {
    try {
      console.log('🔓 Signing out...');
      
      // Clear tokens
      await tokenStorage.clearTokens();
      
      // Optionally keep user info for quick login
      // If you want to clear everything:
      // await userStorage.clearUserInfo();

      console.log('✅ Signed out successfully');
      set({ 
        user: null, 
        isAuthenticated: false 
      });
    } catch (error) {
      console.error('❌ Error signing out:', error);
      // Force logout even on error
      set({ 
        user: null, 
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
      
      // Optionally update storage
      if (updates.email) userStorage.updateEmail(updates.email);
      if (updates.phone) userStorage.updatePhone(updates.phone);
    //   if (updates.firstName) userStorage.updateName(updates.firstName);
    }
  },

    // Toggle balance visibility
  toggleShowBalance: async () => {
    try {
      // Use userStorage utility to toggle
      const newShowBalance = await userStorage.toggleShowBalancePreference();
      set({ showBalance: newShowBalance });
      console.log('✅ Balance visibility toggled:', newShowBalance);
    } catch (error) {
      console.error('❌ Error toggling balance visibility:', error);
    }
  },

  // Set balance visibility explicitly
  setShowBalance: async (show: boolean) => {
    try {
      // Use userStorage utility to save
      await userStorage.setShowBalancePreference(show);
      set({ showBalance: show });
      console.log('✅ Balance visibility set:', show);
    } catch (error) {
      console.error('❌ Error setting balance visibility:', error);
    }
  },
}));