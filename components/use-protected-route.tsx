// hooks/useProtectedRoute.ts
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized || isLoading) {
      // Still initializing or loading, don't redirect yet
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    
    // Define public routes that don't require authentication
    const publicRoutes = [
      '(auth)',
      'splash',
      'onboarding',
    ];
    
    const isPublicRoute = publicRoutes.some(route => segments[0] === route);

    console.log('🔍 Route protection check:', {
      segments,
      currentRoute: segments[0],
      isAuthenticated,
      inAuthGroup,
      isPublicRoute,
    });

    if (!isAuthenticated && !isPublicRoute) {
      // User is not authenticated and trying to access protected routes
      console.log('❌ Not authenticated, redirecting to sign in');
      router.replace('/(auth)/signin');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but on auth screens, redirect to home
      console.log('✅ Authenticated, redirecting to home');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, isInitialized, router]);
}