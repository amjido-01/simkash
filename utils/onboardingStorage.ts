// utils/onboardingStorage.ts
import * as SecureStore from 'expo-secure-store';

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

export const onboardingStorage = {
  // Check if onboarding has been completed
  isOnboardingComplete: async (): Promise<boolean> => {
    try {
      const value = await SecureStore.getItemAsync(ONBOARDING_COMPLETE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error);
      return false; // Default to false on error
    }
  },

  // Mark onboarding as complete
  markOnboardingComplete: async (): Promise<void> => {
    try {
      await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, 'true');
      console.log('✅ Onboarding marked as complete');
    } catch (error) {
      console.error('❌ Error marking onboarding complete:', error);
      throw error;
    }
  },

  // Reset onboarding status (for testing/debugging)
  resetOnboarding: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(ONBOARDING_COMPLETE_KEY);
      console.log('✅ Onboarding status reset');
    } catch (error) {
      console.error('❌ Error resetting onboarding:', error);
    }
  },
};