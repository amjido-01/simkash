// app/(tabs)/_layout.tsx
import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Home, User, WalletMinimal, Gift, Bold } from "lucide-react-native";
// import { tokenStorage } from "@/utils/tokenStorage"; // If you have this
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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
        // Active tab color
        tabBarActiveTintColor: "#244155", // Your brand color
        // Inactive tab color
        tabBarInactiveTintColor: "#9CA3AF", // Gray color

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "ManropeMedium", // Use your custom font
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
