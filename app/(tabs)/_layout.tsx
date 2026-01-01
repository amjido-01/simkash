// app/(tabs)/_layout.tsx
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { Gift, Home, User, WalletMinimal } from "lucide-react-native";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  return (
    <SafeAreaView className="flex-1">
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: Platform.OS === 'android' ? true : false,
        tabBarActiveTintColor: "#244155",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 88 : 60, // Increased for iOS
          paddingBottom: Platform.OS === 'ios' ? 30 : 8, // Increased bottom padding
          // marginBottom: 45,
          paddingTop: 4,
          // Fix for iOS keyboard avoidance
          ...Platform.select({
            ios: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 14,
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
    </SafeAreaView>
  );
}