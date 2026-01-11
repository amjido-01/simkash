import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { User, Trash2, ChevronRight } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { PageHeader } from "@/components/page-header";

interface SettingsMenuItem {
  icon: React.ReactNode;
  title: string;
  route: string;
  iconBgColor: string;
  isDanger?: boolean;
}

export default function ProfileSettings() {
  const menuItems: SettingsMenuItem[] = [
    {
      icon: <User size={20} color="#132939" />,
      title: "Manage Profile Details",
      route: "/manage-profile",
      iconBgColor: "#E8F5FF",
    },
    {
      icon: <Trash2 size={20} color="#EF4444" />,
      title: "Delete Account",
      route: "/delete-account",
      iconBgColor: "#FEE2E2",
      isDanger: true,
    },
  ];

  const handleMenuPress = (item: SettingsMenuItem) => {
    if (item.isDanger) {
      Alert.alert(
        "Delete Account",
        "Are you sure you want to delete your account? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              router.push(item.route as any);
            },
          },
        ]
      );
    } else {
      router.push(item.route as any);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <PageHeader
        title="Profile Settings"
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
                onPress={() => handleMenuPress(item)}
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
                    <Text
                      className={`text-[15px] font-manropesemibold font-medium ${
                        item.isDanger ? "text-[#EF4444]" : "text-[#000000]"
                      }`}
                    >
                      {item.title}
                    </Text>
                  </HStack>

                  {/* Chevron */}
                  <ChevronRight
                    size={20}
                    color={item.isDanger ? "#EF4444" : "#000000"}
                  />
                </HStack>
              </TouchableOpacity>
            ))}
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}