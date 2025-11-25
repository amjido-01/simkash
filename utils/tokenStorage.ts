import * as SecureStore from 'expo-secure-store';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Set access token (replaces: Cookies.set("accessToken", token))
  async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Error setting access token:', error);
    }
  },

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  // Set refresh token
  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  },

  // Remove all tokens (replaces: Cookies.remove())
  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  // Set both tokens at once (useful after login)
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.setAccessToken(accessToken),
      this.setRefreshToken(refreshToken),
    ]);
  },
};