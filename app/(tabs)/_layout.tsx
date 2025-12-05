// app/(tabs)/_layout.tsx
import { useEffect, useState } from "react";
import { Tabs, router } from "expo-router";
import { Home, User, WalletMinimal, Gift } from "lucide-react-native";
import { tokenStorage } from "@/utils/tokenStorage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import SimpleLoader from "@/components/simple-loader";

export default function TabsLayout() {
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ✅ Add delay to allow token storage to complete
        // This prevents race condition when navigating from onboarding
        await new Promise((resolve) => setTimeout(resolve, 800));

        const token = await tokenStorage.getAccessToken();
        
        console.log("🔍 Auth check - Token exists:", !!token);

        if (!token) {
          console.log("❌ No token found, redirecting to sign in");
          router.replace("/(auth)/signin");
        } else {
          console.log("✅ Token found, user authenticated");
          setIsAuthChecked(true);
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        // On error, redirect to sign in
        router.replace("/(auth)/signin");
      }
    };

    checkAuth();
  }, []);

  // Optional: Show nothing while checking (prevents flash)
  // You can also show a loading spinner here
  if (!isAuthChecked) {
    return (
        <SimpleLoader />
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#244155",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          fontFamily: "ManropeMedium",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ color, size }) => (
            <WalletMinimal color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="device-sim"
        options={{
          title: "Device Sim",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="sim-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color, size }) => <Gift color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}