// hooks/useProtectedRoute.ts
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitialized, needsProfileSetup } = useAuthStore();

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

    // Priority 1: Not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      console.log('❌ Not authenticated, redirecting to sign in');
      router.replace('/(auth)/signin');
      return;
    }

    // Priority 2: Authenticated but needs profile setup
    if (isAuthenticated && needsProfileSetup && currentSegment !== 'profile-setup') {
      console.log('👤 Profile setup required, redirecting...');
      router.replace('/profile-setup');
      return;
    }

    // Priority 3: Authenticated, profile complete, but on auth/setup screens
    if (isAuthenticated && !needsProfileSetup && (currentSegment === '(auth)' || currentSegment === 'profile-setup')) {
      console.log('✅ Authenticated and profile complete, redirecting to home');
      router.replace('/(tabs)');
      return;
    }

  }, [isAuthenticated, segments, isLoading, isInitialized, router, needsProfileSetup]);
}