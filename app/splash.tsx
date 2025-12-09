// import BottomSvg from "@/assets/images/BottomSvg.svg";
// import TopLeft from "@/assets/images/topleft.svg";
// import TopRight from "@/assets/images/topright.svg";
// import { Image, View } from "react-native";

// export default function Splash() {
//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "#fff",
//       }}
//     >
//       <TopRight
//         width={"40%"}
//         height={170}
//         style={{
//           position: "absolute",
//           left: 0,
//           top: -50,
//         }}
//       />
//       <TopLeft
//         width={"40%"}
//         height={100}
//         style={{
//           position: "absolute",
//           right: 0,
//           top: -50,
//         }}
//       />
//       <BottomSvg
//         width="100%"
//         height={200} // choose a fixed height
//         preserveAspectRatio="xMidYMax slice"
//         style={{
//           position: "absolute",
//           bottom: 0,
//         }}
//       />

//       <Image
//         source={require("../assets/images/splash.png")}
//         resizeMode="contain"
//         style={{
//           width: 180,
//           height: 180,
//         }}
//       />
//     </View>
//   );
// }

// app/splash.tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, View } from "react-native";
import { router } from 'expo-router';
import BottomSvg from "@/assets/images/BottomSvg.svg";
import TopLeft from "@/assets/images/topleft.svg";
import TopRight from "@/assets/images/topright.svg";
import { useAuthStore } from '@/store/auth-store';
import { onboardingStorage } from '@/utils/onboardingStorage';

export default function Splash() {
  const { isAuthenticated, isInitialized } = useAuthStore();
   const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

    // Check onboarding status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        setIsCheckingOnboarding(true);
        const completed = await onboardingStorage.isOnboardingComplete();
        console.log('📱 Onboarding status:', { completed });
        setIsOnboardingComplete(completed);
      } catch (error) {
        console.error('❌ Error checking onboarding:', error);
        setIsOnboardingComplete(false); // Default to false on error
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    console.log('🎯 Splash screen - Auth state:', {
      isAuthenticated,
      isInitialized,
      isOnboardingComplete,
      isCheckingOnboarding
    });

    // Don't redirect until auth is initialized
     if (!isInitialized || isCheckingOnboarding || isOnboardingComplete === null) {
      console.log('⏳ Waiting for initialization...');
      return;
    }

    // Add a small delay for smooth UX
    const timer = setTimeout(() => {
      console.log('🚀 Redirecting from splash...');
      
      if (!isOnboardingComplete) {
        // First-time user - show onboarding
        console.log('👋 First-time user, redirecting to onboarding');
        router.replace('/onboarding');
      } else if (isAuthenticated) {
        // Returning user who is authenticated
        console.log('✅ User is authenticated, redirecting to home');
        router.replace('/(tabs)');
      } else {
        // Returning user who is not authenticated
        console.log('❌ User is not authenticated, redirecting to sign in');
        router.replace('/(auth)/signin');
      }
    }, 3000); // 1.5 second delay for splash animation

    return () => clearTimeout(timer);
  }, [isAuthenticated, isInitialized, isOnboardingComplete, isCheckingOnboarding]);

   if (isCheckingOnboarding) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#244155" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <TopRight
        width={"40%"}
        height={170}
        style={{
          position: "absolute",
          left: 0,
          top: -50,
        }}
      />
      <TopLeft
        width={"40%"}
        height={100}
        style={{
          position: "absolute",
          right: 0,
          top: -50,
        }}
      />
      <BottomSvg
        width="100%"
        height={200}
        preserveAspectRatio="xMidYMax slice"
        style={{
          position: "absolute",
          bottom: 0,
        }}
      />

      <Image
        source={require("../assets/images/splash.png")}
        resizeMode="contain"
        style={{
          width: 180,
          height: 180,
        }}
      />
    </View>
  );
}