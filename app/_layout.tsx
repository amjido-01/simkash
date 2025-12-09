// app/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AppStateStatus, Platform } from "react-native";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import "../global.css";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
import { useAppState } from "@/hooks/use-app-state";
import { useOnlineManager } from "@/hooks/use-online-manager";
import SimpleLoader from "@/components/simple-loader";
import { useProtectedRoute } from "@/components/use-protected-route"; // Updated import

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
});

function RootLayoutNav() {
  const { initialize, isLoading, isInitialized } = useAuthStore();
  
  // Initialize auth on mount - only once
  useEffect(() => {
    console.log('🔄 RootLayoutNav - Initializing auth store...');
    initialize();
  }, [initialize]);

  // Use the protected route hook
  useProtectedRoute();

  // Show loader while initializing
  if (!isInitialized || isLoading) {
    console.log('⏳ Showing loader - isInitialized:', isInitialized, 'isLoading:', isLoading);
    return <SimpleLoader />;
  }

  console.log('✅ Auth initialized, rendering Stack');
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  useOnlineManager();
  useAppState(onAppStateChange);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GluestackUIProvider mode="light">
          <QueryClientProvider client={queryClient}>
            <RootLayoutNav />
          </QueryClientProvider>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}