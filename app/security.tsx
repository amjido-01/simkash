import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Lock, Key, RefreshCw, Smartphone, ChevronRight } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { PageHeader } from "@/components/page-header";

interface SecurityMenuItem {
  icon: React.ReactNode;
  title: string;
  route: string;
  iconBgColor: string;
}

export default function Security() {
  const menuItems: SecurityMenuItem[] = [
    {
      icon: <Lock size={20} color="#132939" />,
      title: "Change Password",
      route: "/change-password",
      iconBgColor: "#E8F5FF",
    },
    {
      icon: <Key size={20} color="#132939" />,
      title: "Change Transaction PIN",
      route: "/change-transaction-pin",
      iconBgColor: "#FFF4E6",
    },
    {
      icon: <RefreshCw size={20} color="#132939" />,
      title: "Reset Transaction PIN",
      route: "/reset-pin",
      iconBgColor: "#F0FFF4",
    },
    {
      icon: <Smartphone size={20} color="#132939" />,
      title: "Devices & Sessions",
      route: "/devices-sessions",
      iconBgColor: "#FFF0F5",
    },
  ];

  const handleMenuPress = (route: string) => {
    router.push(route as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]" edges={["top"]}>
      {/* Header */}
      <PageHeader
        title="Security"
        onBack={handleBack}
        showBackButton={true}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Box className="bg-white px-4 pt-6 pb-24 flex-1">
          <VStack space="sm">
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
                    <Text className="text-[15px] font-manropesemibold font-medium text-[#000000]">
                      {item.title}
                    </Text>
                  </HStack>

                  {/* Chevron */}
                  <ChevronRight size={20} color="#000000" />
                </HStack>
              </TouchableOpacity>
            ))}
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}