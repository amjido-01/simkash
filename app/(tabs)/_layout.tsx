// app/(tabs)/_layout.tsx
import { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { Home, User, WalletMinimal } from "lucide-react-native";
import { tokenStorage } from "@/utils/tokenStorage"; // If you have this

export default function TabsLayout() {
  // Optional: Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      // Uncomment when you have tokenStorage set up
      // const token = await tokenStorage.getAccessToken();
      // if (!token) {
      //   router.replace("/(auth)/signin");
      // }
    };
    
    checkAuth();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="device-sim"
        options={{
          title: "Device Sim",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
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