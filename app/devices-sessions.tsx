import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Compass, Trash2, DraftingCompassIcon } from "lucide-react-native";
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

interface DeviceSession {
  id: string;
  deviceName: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  deviceType: "mobile" | "desktop";
}

export default function DevicesSessions() {
  const sessions: DeviceSession[] = [
    {
      id: "1",
      deviceName: "Arc on Tecno Camon",
      browser: "Arc",
      location: "Lagos, Nigeria",
      lastActive: "Current session",
      isCurrent: true,
      deviceType: "desktop",
    },
    {
      id: "2",
      deviceName: "Safari on iPhone 12",
      browser: "Safari",
      location: "Lagos, Nigeria",
      lastActive: "2 days ago",
      isCurrent: false,
      deviceType: "mobile",
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleRemoveSession = (session: DeviceSession) => {
    if (session.isCurrent) {
      Alert.alert(
        "Current Session",
        "You cannot remove your current session.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Remove Session",
      `Are you sure you want to remove this session from ${session.deviceName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            // Handle session removal
            console.log("Removing session:", session.id);
          },
        },
      ]
    );
  };

  const getDeviceIcon = (deviceType: "mobile" | "desktop") => {
    if (deviceType === "mobile") {
      return <Compass size={24} color="#006AB1" />;
    }
    return <DraftingCompassIcon size={24} color="#EF4444" />;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]" edges={["top"]}>
      {/* Header */}
      <PageHeader
        title="Devices & Sessions"
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
            {sessions.map((session) => (
              <View
                key={session.id}
                className="bg-white rounded-[20px] border border-[#E5E7EF] p-4"
              >
                <HStack className="items-center justify-between">
                  <HStack space="md" className="items-center flex-1">
                    {/* Device Icon Container */}
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{
                        backgroundColor:
                          session.deviceType === "mobile"
                            ? "#E8F5FF"
                            : "#FEE2E2",
                      }}
                    >
                      {getDeviceIcon(session.deviceType)}
                    </View>

                    {/* Device Info */}
                    <VStack space="xs" className="flex-1">
                      <HStack space="sm" className="items-center">
                        <Text className="text-[15px] font-manropesemibold text-[#000000]">
                          {session.deviceName}
                        </Text>
                        {session.isCurrent && (
                          <View className="bg-[#10B981] px-2 py-0.5 rounded-full">
                            <Text className="text-[10px] font-manropesemibold text-white">
                              Current session
                            </Text>
                          </View>
                        )}
                      </HStack>
                      <Text className="text-[12px] font-manroperegular text-[#6B7280]">
                        {session.location}
                      </Text>
                      {!session.isCurrent && (
                        <Text className="text-[12px] font-manroperegular text-[#6B7280]">
                          {session.lastActive}
                        </Text>
                      )}
                    </VStack>
                  </HStack>

                  {/* Remove Button */}
                  <TouchableOpacity
                    onPress={() => handleRemoveSession(session)}
                    className="ml-2"
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2
                      size={20}
                      color={session.isCurrent ? "#D1D5DB" : "#EF4444"}
                    />
                  </TouchableOpacity>
                </HStack>
              </View>
            ))}
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}