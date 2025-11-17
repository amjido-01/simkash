import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";   // correct CSS import path

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
