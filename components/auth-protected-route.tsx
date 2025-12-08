// components/auth-protected-route.tsx
import { useEffect, useState } from "react";
import { router, usePathname } from "expo-router";
import { tokenStorage } from "@/utils/tokenStorage";
import { View, ActivityIndicator } from "react-native";

interface AuthProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true for protected routes, false for public routes
}

export default function AuthProtectedRoute({
  children,
  requireAuth = true,
}: AuthProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = await tokenStorage.getAccessToken();
        const hasToken = !!token;

        console.log(`🔍 Auth check for ${pathname}:`, { 
          hasToken, 
          requireAuth,
          pathname 
        });

        if (requireAuth && !hasToken) {
          console.log("🚫 No token, redirecting to sign in");
          // Store the intended destination for after login
          if (pathname !== "/(auth)/signin") {
            await tokenStorage.setRedirectPath(pathname);
          }
          router.replace("/(auth)/signin");
          return;
        }

        if (!requireAuth && hasToken) {
          console.log("✅ Already authenticated, redirecting to home");
          // If user is already authenticated and trying to access auth pages
          if (pathname.startsWith("/(auth)")) {
            const redirectPath = await tokenStorage.getRedirectPath();
            router.replace(redirectPath || "/(tabs)");
            return;
          }
        }

        setIsAuthenticated(requireAuth ? hasToken : true);
      } catch (error) {
        console.error("❌ Auth check error:", error);
        if (requireAuth) {
          router.replace("/(auth)/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, requireAuth]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#244155" />
      </View>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}