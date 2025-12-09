import axios, { AxiosError } from 'axios';
import { tokenStorage } from '@/utils/tokenStorage';
import { ApiResponse, ApiError } from '@/types';
import { BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
// Get base URL from environment variables

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  async (config) => {
    console.log('Attaching access token to request');
    
    // Get token from secure storage (async operation)
    const accessToken = await tokenStorage.getAccessToken();
    console.log('Access token retrieved:', accessToken);
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * Handle token refresh and errors
 */
api.interceptors.response.use(
  (response) => {
    // Check if response follows your API pattern
    const data = response.data as ApiResponse;
    
    // If backend returns responseSuccessful: false, treat as error
    if (data.responseSuccessful === false) {
      throw new ApiError(
        data.responseMessage || 'Request failed',
        response.status,
        data
      );
    }
    
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - same logic as Next.js
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      // Get refresh token from secure storage
      const refreshToken = await tokenStorage.getRefreshToken();

      if (!refreshToken) {
        // No refresh token - logout and redirect
         await tokenStorage.clearTokens();
        
        // ✅ Use Zustand store to sign out
        useAuthStore.getState().signOut();
        return Promise.reject(error);
      }

      try {
        console.log('Attempting token refresh...');
        
        // Call refresh endpoint
        // IMPORTANT: Use axios.post directly (not api.post) to avoid interceptor loop
        const response = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        console.log('Refresh response:', response.data);

        // Check if refresh was successful
        if (!response.data.responseSuccessful) {
          throw new Error('Token refresh failed');
        }

        const { accessToken } = response.data.responseBody;
        console.log('New access token received');

        // Store new access token
        await tokenStorage.setAccessToken(accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Refresh failed - logout
        await tokenStorage.clearTokens();
        useAuthStore.getState().signOut();
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      const data = error.response.data;
      throw new ApiError(
        data?.responseMessage || 'An error occurred',
        error.response.status,
        data
      );
    } else if (error.request) {
      throw new ApiError('No response from server', 0);
    } else {
      throw new ApiError(error.message || 'Request failed', 0);
    }
  }
);

// Separate axios instance for refresh calls (to avoid interceptor loops)
export const authApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Generic API client function
 * Extracts responseBody automatically
 */
export async function apiClient<T>(
  endpoint: string,
  options?: any
): Promise<T> {
  const response = await api<ApiResponse<T>>(endpoint, options);
  return response.data.responseBody;
}