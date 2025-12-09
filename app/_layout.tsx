import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // ⬅️ CRITICAL IMPORT
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AppStateStatus, Platform } from "react-native";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
// import { StatusBar } from "react-native";
// import { config } from "@/components/ui/gluestack-ui-provider/config";
import "../global.css";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
import { useProtectedRoute } from "@/components/use-protected-route";

import { useAppState } from "@/hooks/use-app-state";
import { useOnlineManager } from "@/hooks/use-online-manager";
import SimpleLoader from "@/components/simple-loader";

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
});

function RootLayoutNav() {
  const { initialize, isLoading, isInitialized } = useAuthStore();
  
  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Protect routes
  useProtectedRoute();

  // Show loader while initializing
  if (!isInitialized || isLoading) {
    return <SimpleLoader />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  useOnlineManager();
  useAppState(onAppStateChange);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <GluestackUIProvider mode="light">
          <QueryClientProvider client={queryClient}>
            {/* <StatusBar /> */}
           <RootLayoutNav />
          </QueryClientProvider>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
