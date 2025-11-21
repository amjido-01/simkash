import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // ⬅️ CRITICAL IMPORT
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { config } from "@/components/ui/gluestack-ui-provider/config";

import "../global.css";

export default function RootLayout() {
  return (
    // 1. GestureHandlerRootView MUST be the outermost wrapper after SafeAreaProvider
    <GestureHandlerRootView>
      <SafeAreaProvider>
        {/* 2. GluestackUIProvider must wrap all components that use gluestack */}
        <GluestackUIProvider config={config} mode="light"> 
          <Stack screenOptions={{ headerShown: false }} />
        </GluestackUIProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}