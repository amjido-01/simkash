// // app/_layout.tsx
// import { Stack, router } from "expo-router";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
// import { AppStateStatus, Platform } from "react-native";
// import {
//   QueryClient,
//   QueryClientProvider,
//   focusManager,
// } from "@tanstack/react-query";
// import "../global.css";
// import { useAuthStore } from "@/store/auth-store";
// import { useEffect } from "react";
// import { useAppState } from "@/hooks/use-app-state";
// import { useOnlineManager } from "@/hooks/use-online-manager";
// import SimpleLoader from "@/components/simple-loader";
// import { useProtectedRoute } from "@/components/use-protected-route"; // Updated import
// import * as Linking from "expo-linking";

// function onAppStateChange(status: AppStateStatus) {
//   if (Platform.OS !== "web") {
//     focusManager.setFocused(status === "active");
//   }
// }

// const queryClient = new QueryClient({
//   defaultOptions: { queries: { retry: 2 } },
// });

// function RootLayoutNav() {
//   const { initialize, isLoading, isInitialized } = useAuthStore();

//   // Initialize auth on mount - only once
//   useEffect(() => {
//     console.log("🔄 RootLayoutNav - Initializing auth store...");
//     initialize();
//   }, [initialize]);

//   // Deep link handler
//   useEffect(() => {
//     console.log("🔗 Setting up deep link listeners...");

//     // Handle deep link when app is already open
//     const subscription = Linking.addEventListener("url", handleDeepLinkEvent);

//     // Handle deep link that opened the app (cold start)
//     Linking.getInitialURL().then((url) => {
//       if (url) {
//         console.log("🔗 Initial deep link detected:", url);
//         handleDeepLink(url);
//       }
//     });

//     return () => {
//       console.log("🔗 Removing deep link listeners");
//       subscription.remove();
//     };
//   }, []);

//   const handleDeepLinkEvent = ({ url }: { url: string }) => {
//     console.log("🔗 Deep link received (app already open):", url);
//     handleDeepLink(url);
//   };

//   const handleDeepLink = (url: string) => {
//     try {
//       const { hostname, path, queryParams } = Linking.parse(url);

//       console.log("📱 Parsed deep link:", {
//         hostname,
//         path,
//         queryParams,
//         fullUrl: url,
//       });

//       // Handle payment verification deep links
//       // Matches: simkash://payment-verification?reference=XXX&status=success
//       // Or: https://simkash.com/successpage?reference=XXX
//       if (
//         path === "payment-verification" ||
//         path === "successpage" ||
//         hostname === "payment-verification" ||
//         url.includes("successpage")
//       ) {
//         const reference = queryParams?.reference || queryParams?.trxref;
//         const status = queryParams?.status;

//         console.log("💳 Payment deep link detected:", { reference, status });

//         if (reference) {
//           // Small delay to ensure app and navigation are ready
//           setTimeout(() => {
//             console.log("📍 Navigating to payment verification screen");
//             router.push({
//               pathname: "/payment-verification",
//               params: {
//                 reference: reference as string,
//                 status: (status as string) || "unknown",
//               },
//             });
//           }, 300);
//         } else {
//           console.warn("⚠️ Payment deep link missing reference");
//         }
//       }
//     } catch (error) {
//       console.error("❌ Error handling deep link:", error);
//     }
//   };

//   // Use the protected route hook
//   useProtectedRoute();

//   // Show loader while initializing
//   if (!isInitialized || isLoading) {
//     console.log(
//       "⏳ Showing loader - isInitialized:",
//       isInitialized,
//       "isLoading:",
//       isLoading
//     );
//     return <SimpleLoader />;
//   }

//   console.log("✅ Auth initialized, rendering Stack");

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       <Stack.Screen
//         name="payment-verification"
//         options={{
//           headerShown: false,
//           presentation: "modal",
//           animation: "fade",
//         }}
//       />
//     </Stack>
//   );
// }

// export default function RootLayout() {
//   useOnlineManager();
//   useAppState(onAppStateChange);

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <SafeAreaProvider>
//         <GluestackUIProvider mode="light">
//           <QueryClientProvider client={queryClient}>
//             <RootLayoutNav />
//           </QueryClientProvider>
//         </GluestackUIProvider>
//       </SafeAreaProvider>
//     </GestureHandlerRootView>
//   );
// }

// app/_layout.tsx
import { Stack, router } from "expo-router";
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
import { useEffect, useCallback } from "react";
import { useAppState } from "@/hooks/use-app-state";
import { useOnlineManager } from "@/hooks/use-online-manager";
import { useProtectedRoute } from "@/components/use-protected-route";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
});

function RootLayoutNav() {
  const { initialize, isLoading, isInitialized } = useAuthStore();

  // Initialize auth on mount - only once
  useEffect(() => {
    console.log("🔄 RootLayoutNav - Initializing auth store...");
    initialize();
  }, [initialize]);

  // Hide splash screen when app is ready
  const onLayoutRootView = useCallback(async () => {
    if (isInitialized && !isLoading) {
      console.log("✅ App ready, hiding splash screen");
      await SplashScreen.hideAsync();
    }
  }, [isInitialized, isLoading]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  // Deep link handler
  useEffect(() => {
    console.log("🔗 Setting up deep link listeners...");

    const subscription = Linking.addEventListener("url", handleDeepLinkEvent);

    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("🔗 Initial deep link detected:", url);
        handleDeepLink(url);
      }
    });

    return () => {
      console.log("🔗 Removing deep link listeners");
      subscription.remove();
    };
  }, []);

  const handleDeepLinkEvent = ({ url }: { url: string }) => {
    console.log("🔗 Deep link received (app already open):", url);
    handleDeepLink(url);
  };

  const handleDeepLink = (url: string) => {
    try {
      const { hostname, path, queryParams } = Linking.parse(url);

      console.log("📱 Parsed deep link:", {
        hostname,
        path,
        queryParams,
        fullUrl: url,
      });

      if (
        path === "payment-verification" ||
        path === "successpage" ||
        hostname === "payment-verification" ||
        url.includes("successpage")
      ) {
        const reference = queryParams?.reference || queryParams?.trxref;
        const status = queryParams?.status;

        console.log("💳 Payment deep link detected:", { reference, status });

        if (reference) {
          setTimeout(() => {
            console.log("📍 Navigating to payment verification screen");
            router.push({
              pathname: "/payment-verification",
              params: {
                reference: reference as string,
                status: (status as string) || "unknown",
              },
            });
          }, 300);
        } else {
          console.warn("⚠️ Payment deep link missing reference");
        }
      }
    } catch (error) {
      console.error("❌ Error handling deep link:", error);
    }
  };

  useProtectedRoute();

  // Don't show loader - splash screen handles this
  if (!isInitialized || isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="payment-verification"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "fade",
        }}
      />
    </Stack>
  );
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
