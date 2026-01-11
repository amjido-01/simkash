import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import {
  ChevronRight,
  User,
  Shield,
  Bell,
  IdCard,
  TrendingUp,
} from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

interface MenuItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  route: string;
  iconBgColor?: string;
}

export default function Profile() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const {
    // user,
    userProfile,
    signOut,
  } = useAuthStore();

  const menuItems: MenuItem[] = [
    {
      icon: <User size={20} color="#132939" />,
      title: "Profile Settings",
      subtitle: "Top up using cards, USSD and more",
      route: "/profile-settings",
      iconBgColor: "#E8F5FF",
    },
    {
      icon: <IdCard size={20} color="#132939" />,
      title: "KYC",
      subtitle: "Top up using cards, USSD and more",
      route: "/kyc",
      iconBgColor: "#FFF4E6",
    },
    {
      icon: <Shield size={20} color="#132939" />,
      title: "Security",
      subtitle: "Top up using cards, USSD and more",
      route: "/security",
      iconBgColor: "#F0FFF4",
    },
    {
      icon: <Bell size={20} color="#132939" />,
      title: "Notifications",
      subtitle: "Top up using cards, USSD and more",
      route: "/notifications",
      iconBgColor: "#FFF0F5",
    },
    {
      icon: <TrendingUp size={20} color="#132939" />,
      title: "Transactions Limit",
      subtitle: "Top up using cards, USSD and more",
      route: "/transactions-limit",
      iconBgColor: "#F5F0FF",
    },
  ];

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleUpgrade = () => {
    // router.push("/upgrade-tier");
  };

  const handleMenuPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Box className="bg-white px-4 pt-6 pb-24 flex-1">
          <VStack space="xl" className="flex-1">
            {/* Header Section */}
            <VStack space="md" className="items-center">
              {/* Profile Image */}
              <View className="relative w-24 h-24">
  {/* Loader */}
  {isLoading && (
    <View className="absolute inset-0 items-center justify-center rounded-full bg-[#F3F4F6] z-10">
      <ActivityIndicator size="small" color="#006AB1" />
    </View>
  )}

  <Image
    source={{
      uri: "https://api.dicebear.com/7.x/avataaars/png?seed=Yusuf",
    }}
    alt="Profile"
    className="w-24 h-24 rounded-full"
    resizeMode="cover"
    onLoadStart={() => setIsLoading(true)}
    onLoadEnd={() => setIsLoading(false)}
    onError={() => setIsLoading(false)}
  />
              </View>

              {/* Name and Email */}
              <VStack space="xs" className="items-center">
                <Heading className="text-[20px] font-manropebold text-[#141316]">
                  {userProfile?.fullname}
                </Heading>
                <Text className="text-[14px] font-manroperegular text-[#6B7280]">
                  {/* {userProfile.email} */}
                </Text>
              </VStack>

              {/* Upgrade Button */}
              <TouchableOpacity
                onPress={handleUpgrade}
                className="bg-gradient-to-r from-[#006AB1] to-[#0088E0] rounded-full px-6 py-3"
              >
                <HStack space="sm" className="items-center">
                  <View className="bg-white/20 rounded-full p-1">
                    <TrendingUp size={16} color="#FFFFFF" />
                  </View>
                  <Text className="text-[14px] font-manropesemibold text-white">
                    Upgrade to Simkash Pro
                  </Text>
                </HStack>
              </TouchableOpacity>
            </VStack>

            {/* Menu Items */}
            <VStack space="sm" className="mt-4">
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleMenuPress(item.route)}
                  className="bg-white rounded-[20px] border border-[#E5E7EF] p-4"
                  activeOpacity={0.7}
                >
                  <HStack className="items-center justify-between">
                    <HStack space="md" className="items-center flex-1">
                      {/* Icon Container */}
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: item.iconBgColor }}
                      >
                        {item.icon}
                      </View>

                      {/* Text Content */}
                      <VStack space="xs" className="flex-1">
                        <Text className="text-[15px] font-bold font-manropesemibold text-[#000000]">
                          {item.title}
                        </Text>
                        <Text className="text-[12px] font-manroperegular text-[#303237]">
                          {item.subtitle}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Chevron */}
                    <ChevronRight size={20} color="#000000" />
                  </HStack>
                </TouchableOpacity>
              ))}
            </VStack>

            {/* Logout Button */}
            <View className="mt-auto pt-6">
              <TouchableOpacity
                onPress={handleLogout}
                className="items-center py-4"
                activeOpacity={0.7}
              >
                <Text className="text-[16px] font-manropesemibold text-[#EF4444]">
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
