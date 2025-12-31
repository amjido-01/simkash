import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Copy, MessageCircle, Phone } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

export default function SimRequestSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [copied, setCopied] = useState(false);

  const {
    requestId,
    amount,
    // country,
    // state,
    // lga,
    // status,
    partnerName,
    partnerPhone,
    partnerRole,
  } = params;

  const handleDone = () => {
    // Navigate back to home tab
    router.push("/(tabs)");
  };

  const rawPartnerPhone = partnerPhone;
const phone =
  typeof rawPartnerPhone === "string"
    ? rawPartnerPhone
    : rawPartnerPhone?.[0];


const handleCallPartner = () => {
  if (!phone) {
    Alert.alert("Unavailable", "Partner phone number is not available.");
    return;
  }

  Alert.alert(
    "Call Partner",
    `Would you like to call ${partnerName}?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call",
        onPress: async () => {
          const phoneUrl = `tel:${phone}`;
          const supported = await Linking.canOpenURL(phoneUrl);

          if (supported) {
            await Linking.openURL(phoneUrl);
          } else {
            Alert.alert("Error", "Unable to open phone dialer.");
          }
        },
      },
    ]
  );
};


const handleChatOnWhatsApp = () => {
  if (!phone) {
    Alert.alert("Unavailable", "Partner phone number is not available.");
    return;
  }

  const formattedPhone = phone.startsWith("0")
    ? `234${phone.slice(1)}`
    : phone;

  const whatsappUrl = `https://wa.me/${formattedPhone}`;

  Alert.alert(
    "Chat on WhatsApp",
    `Would you like to chat with ${partnerName} on WhatsApp?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open WhatsApp",
        onPress: async () => {
          const supported = await Linking.canOpenURL(whatsappUrl);

          if (supported) {
            await Linking.openURL(whatsappUrl);
          } else {
            Alert.alert(
              "WhatsApp Not Installed",
              "Please install WhatsApp to continue."
            );
          }
        },
      },
    ]
  );
};


  const handleCopyRequestId = async () => {
    await Clipboard.setStringAsync(requestId as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const partnerTitle =
    partnerRole === "agent" ? "Assigned Agent" : "Assigned Partner";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="flex-1 px-4 pt-8 pb-6">
        <VStack className="flex-1 items-center justify-between">
          <VStack className="items-center w-full" space="md">
            {/* Success Icon */}
            <Image
              source={require("../assets/images/success.gif")}
              style={{
                width: 200,
                height: 200,
                alignSelf: "center",
              }}
              resizeMode="contain"
            />

            {/* Title */}
            <Heading className="text-[18px] font-semibold tracking-tighter font-manropesemibold text-[#000000] text-center">
              SIM Request Submitted!
            </Heading>

            {/* Description */}
            <Text className="text-[14px] font-manroperegular text-[#000000] leading-[100%] text-center px-6 mt-2">
              You will be contacted within 24-48 hours for delivery
              arrangements, and you will be charged ₦{amount || "8,500"} only
              for the SIM card.
            </Text>

            {/* Request ID Card */}
            <View className="w-full mt-6 p-4 text-start rounded-[16px] bg-[#F9FAFB] border border-[#E5E7EB]">
              <VStack className="itemscenter" space="sm">
                <HStack className="itemscenter" space="sm">
                  <Text className="text-[18px] font-manropebold text-[#000000]">
                    {partnerPhone}
                  </Text>
                  <TouchableOpacity onPress={handleCopyRequestId}>
                    <Copy size={18} color={copied ? "#10B981" : "#6B7280"} />
                  </TouchableOpacity>
                </HStack>

                <Text className="text-[12px] font-manroperegular text-[#000000]">
                  {partnerName} - {partnerTitle}
                </Text>
              </VStack>
            </View>

            {/* Action Buttons */}
            <HStack className="w-full justify-center mt-8" space="4xl">
              <TouchableOpacity
                onPress={handleCallPartner}
                className="items-center"
              >
                <View className="w-14 h-14 rounded-full bg-[#EBF5FF] items-center justify-center mb-3">
                  <Phone size={24} color="#006AB1" />
                </View>
                <Text className="text-[12px] font-medium font-manroperegular text-[#000000]">
                  Call Partner
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChatOnWhatsApp}
                className="items-center"
              >
                <View className="w-14 h-14 rounded-full bg-[#F0FDF4] items-center justify-center mb-3">
                  <MessageCircle size={24} color="#10B981" />
                </View>
                <Text className="text-[12px] font-medium font-manroperegular text-[#000000]">
                  Chat on WhatsApp
                </Text>
              </TouchableOpacity>
            </HStack>
          </VStack>

          {/* Done Button */}
          <View className="w-full mt-6">
            <Button
              className="rounded-full bg-[#132939] h-[48px] w-full"
              size="xl"
              onPress={handleDone}
            >
              <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                Done
              </ButtonText>
            </Button>
          </View>
        </VStack>
      </Box>
    </SafeAreaView>
  );
}
