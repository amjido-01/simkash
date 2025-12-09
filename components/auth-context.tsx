// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { tokenStorage } from '@/utils/tokenStorage';
import { useSegments, useRouter } from 'expo-router';

interface AuthContextType {
  isAuthenticated: boolean | null; // null = loading, true = authenticated, false = not authenticated
  isLoading: boolean;
  signIn: (token: string, refreshToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Protected route logic
  useEffect(() => {
    if (isLoading || isAuthenticated === null) {
      // Still checking authentication, don't redirect yet
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    console.log('🔍 Route protection check:', {
      segments,
      isAuthenticated,
      inAuthGroup,
      inTabsGroup,
    });

    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and trying to access protected routes
      console.log('❌ Not authenticated, redirecting to sign in');
      router.replace('/(auth)/signin');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but on auth screens, redirect to home
      console.log('✅ Authenticated, redirecting to home');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, router]);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = await tokenStorage.getAccessToken();
      
      console.log('🔍 Auth check - Token exists:', !!token);
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token: string, refreshToken?: string) => {
    try {
      await tokenStorage.setAccessToken(token);
      if (refreshToken) {
        await tokenStorage.setRefreshToken(refreshToken);
      }
      setIsAuthenticated(true);
      console.log('✅ User signed in');
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await tokenStorage.clearTokens();
      setIsAuthenticated(false);
      console.log('✅ User signed out');
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}