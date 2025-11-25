import { apiClient,authApi } from './axios';
import { tokenStorage } from '@/utils/tokenStorage';
import { LoginResponse, RefreshResponse, User, ApiResponse } from '@/types';

/**
 * Auth endpoints
 * Similar to your Next.js setup but adapted for mobile
 */
export const authEndpoints = {
  // Login
  login: async (email: string, password: string) => {
    const response = await authApi.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      { email, password }
    );

    if (response.data.responseSuccessful) {
      const { accessToken, refreshToken } = response.data.responseBody;
      
      // Store tokens (replaces setting cookies in Next.js)
      await tokenStorage.setTokens(accessToken, refreshToken);
      
      return response.data.responseBody;
    }

    throw new Error(response.data.responseMessage || 'Login failed');
  },

  // Logout
  logout: async () => {
    try {
      await apiClient<void>('/auth/logout', { method: 'POST' });
    } finally {
      // Always clear tokens, even if API call fails
      await tokenStorage.clearTokens();
    }
  },

  // Refresh token (called automatically by interceptor)
  refresh: async (refreshToken: string) => {
    const response = await authApi.post<ApiResponse<RefreshResponse>>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data.responseBody;
  },

  // Get current user
  me: () => apiClient<User>('/auth/me', { method: 'GET' }),
};

/**
 * Other API endpoints
 */
export const api = {
  // Users
  getUsers: () => apiClient<User[]>('/users', { method: 'GET' }),
  getUser: (id: string) => apiClient<User>(`/users/${id}`, { method: 'GET' }),
  
  // Posts
  getPosts: () => apiClient<any[]>('/posts', { method: 'GET' }),
  createPost: (data: any) => 
    apiClient<any>('/posts', { method: 'POST', data }),
};