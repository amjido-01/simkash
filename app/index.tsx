import Entypo from "@expo/vector-icons/Entypo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SignIn from "./(auth)/signin";
import OnboardingScreens from "./onboarding";
import Splash from "./splash";

// Keep native splash visible
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function Home() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true); // in-app splash
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  // Load assets before showing UI
  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
            ...Entypo.font,
          ManropeMedium: require("../assets/fonts/Manrope-Medium.ttf"),
          ManropeSemiBold: require("../assets/fonts/Manrope-SemiBold.ttf"),
        });
          // Check if user is first-time
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");

         if (hasLaunched === null) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem("hasLaunched", "true");
        } else {
          setIsFirstLaunch(false);
        }

        // Delay to make splash feel nice
        await new Promise((resolve) => setTimeout(resolve, 1500));

      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Hide native splash when app is ready
  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();

      // After native splash hides → show custom splash for 3 seconds
      setTimeout(() => {
        setShowSplash(false);
      }, 3000);
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // keeps native splash visible
  }

  return (
    <SafeAreaView className="flex-1 bg-white" onLayout={onLayoutRootView}>
      {showSplash ? (
        <Splash />
      ) : isFirstLaunch ? (
        <OnboardingScreens /> 
      ) : (
        <SignIn />       // <---- RETURNING USER
      )}
    </SafeAreaView>
  );
}
