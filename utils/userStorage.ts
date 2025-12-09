import * as SecureStore from 'expo-secure-store';

const USER_EMAIL_KEY = 'user_email';
const USER_NAME_KEY = 'user_name';
const USER_PHONE_KEY = 'user_phone';
const REMEMBER_ME_KEY = 'remember_me';
const SHOW_BALANCE_KEY = 'user_show_balance_preference'; 

export const userStorage = {
  // Save user info after successful login/registration
  saveUserInfo: async (email: string, name?: string, phone?: string) => {
    try {
      await SecureStore.setItemAsync(USER_EMAIL_KEY, email);
      if (name) await SecureStore.setItemAsync(USER_NAME_KEY, name);
      if (phone) await SecureStore.setItemAsync(USER_PHONE_KEY, phone);
      await SecureStore.setItemAsync(REMEMBER_ME_KEY, 'true');
      console.log('✅ User info saved successfully');
    } catch (error) {
      console.error('❌ Error saving user info:', error);
    }
  },

  // Get saved email
  getEmail: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(USER_EMAIL_KEY);
    } catch (error) {
      console.error('❌ Error getting email:', error);
      return null;
    }
  },

  // Get saved name
  getName: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(USER_NAME_KEY);
    } catch (error) {
      console.error('❌ Error getting name:', error);
      return null;
    }
  },

  // Get saved phone
  getPhone: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(USER_PHONE_KEY);
    } catch (error) {
      console.error('❌ Error getting phone:', error);
      return null;
    }
  },

  // Check if user should be remembered
  shouldRemember: async (): Promise<boolean> => {
    try {
      const remember = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
      return remember === 'true';
    } catch (error) {
      console.error('❌ Error checking remember me:', error);
      return false;
    }
  },

  // Get all user info
  getUserInfo: async () => {
    try {
      const [email, name, phone, remember] = await Promise.all([
        SecureStore.getItemAsync(USER_EMAIL_KEY),
        SecureStore.getItemAsync(USER_NAME_KEY),
        SecureStore.getItemAsync(USER_PHONE_KEY),
        SecureStore.getItemAsync(REMEMBER_ME_KEY),
      ]);

      return {
        email,
        name,
        phone,
        shouldRemember: remember === 'true',
      };
    } catch (error) {
      console.error('❌ Error getting user info:', error);
      return {
        email: null,
        name: null,
        phone: null,
        shouldRemember: false,
      };
    }
  },

  // Clear user info (on logout or sign out)
  clearUserInfo: async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(USER_EMAIL_KEY),
        SecureStore.deleteItemAsync(USER_NAME_KEY),
        SecureStore.deleteItemAsync(USER_PHONE_KEY),
        SecureStore.deleteItemAsync(REMEMBER_ME_KEY),
      ]);
      console.log('✅ User info cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing user info:', error);
    }
  },

  // Update specific fields
  updateEmail: async (email: string) => {
    try {
      await SecureStore.setItemAsync(USER_EMAIL_KEY, email);
    } catch (error) {
      console.error('❌ Error updating email:', error);
    }
  },

  updateName: async (name: string) => {
    try {
      await SecureStore.setItemAsync(USER_NAME_KEY, name);
    } catch (error) {
      console.error('❌ Error updating name:', error);
    }
  },

  updatePhone: async (phone: string) => {
    try {
      await SecureStore.setItemAsync(USER_PHONE_KEY, phone);
    } catch (error) {
      console.error('❌ Error updating phone:', error);
    }
  },

  getShowBalancePreference: async (): Promise<boolean> => {
    try {
      const preference = await SecureStore.getItemAsync(SHOW_BALANCE_KEY);
      // Default to true (show balance) if no preference is set
      return preference !== null ? preference === 'true' : true;
    } catch (error) {
      console.error('❌ Error getting balance visibility preference:', error);
      return true; // Default to showing balance on error
    }
  },

  /**
   * Set user's balance visibility preference
   * @param show - true to show balance, false to hide
   */
  setShowBalancePreference: async (show: boolean): Promise<void> => {
    try {
      await SecureStore.setItemAsync(SHOW_BALANCE_KEY, String(show));
      console.log('✅ Balance visibility preference saved:', show);
    } catch (error) {
      console.error('❌ Error saving balance visibility preference:', error);
      throw error;
    }
  },

  toggleShowBalancePreference: async (): Promise<boolean> => {
    try {
      const currentPreference = await userStorage.getShowBalancePreference();
      const newPreference = !currentPreference;
      await userStorage.setShowBalancePreference(newPreference);
      return newPreference;
    } catch (error) {
      console.error('❌ Error toggling balance visibility preference:', error);
      throw error;
    }
  },

  clearShowBalancePreference: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(SHOW_BALANCE_KEY);
      console.log('✅ Balance visibility preference cleared');
    } catch (error) {
      console.error('❌ Error clearing balance visibility preference:', error);
    }
  },
};