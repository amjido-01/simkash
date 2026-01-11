import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Bell } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  // TouchableOpacity,
  View,
  Switch,
} from "react-native";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { PageHeader } from "@/components/page-header";

export default function Notifications() {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const handleBack = () => {
    router.back();
  };

  const toggleNotifications = () => {
    setIsNotificationsEnabled((prev) => !prev);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <PageHeader
        title="Notifications"
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
            <View className="bg-white rounded-[20px] border border-[#E5E7EF] p-4">
              <HStack className="items-center justify-between">
                <HStack space="md" className="items-center flex-1">
                  {/* Icon Container */}
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: "#E8F5FF" }}
                  >
                    <Bell size={20} color="#132939" />
                  </View>

                  {/* Text Content */}
                  <Text className="text-[15px] font-manropesemibold font-medium text-[#000000]">
                    Get Notifications
                  </Text>
                </HStack>

                {/* Toggle Switch */}
                <Switch
                  value={isNotificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#D1D5DB"
                />
              </HStack>
            </View>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}