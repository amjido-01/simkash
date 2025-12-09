// hooks/useProtectedRoute.ts
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    console.log('🔄 useProtectedRoute effect triggered:', {
      segments,
      isAuthenticated,
      isLoading,
      isInitialized,
      currentSegment: segments[0],
    });

    if (!isInitialized || isLoading) {
      console.log('⏳ Waiting for auth initialization...');
      return;
    }

     const currentSegment = segments[0];
    
    // Define public routes that don't require authentication
   const publicRoutes = [
      'index',           // Your home/index route
      'onboarding',      // Onboarding screens
      '(auth)',          // Auth group
      'splash',          // Splash screen
    ];
    
    const isPublicRoute = publicRoutes.includes(currentSegment || '');

    console.log('🔍 Route decision:', {
      currentSegment,
      isAuthenticated,
      isPublicRoute,
    });

     if (!isAuthenticated && !isPublicRoute) {
      // Not authenticated and trying to access protected route
      console.log('❌ Not authenticated, redirecting to sign in');
      router.replace('/(auth)/signin');
    } else if (isAuthenticated && currentSegment === '(auth)') {
      // Authenticated but on auth screen, go to tabs
      console.log('✅ Authenticated, redirecting to home');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, isInitialized, router]);
}