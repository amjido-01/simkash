import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Share2, UserPlus } from "lucide-react-native";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { amount, recipient, phoneNumber, narration, commission } = params;

  const handleDone = () => {
    // Navigate back to home tab
    router.push("/(tabs)");
  };

  const handleShareReceipt = () => {
    console.log("Share receipt");
    // You can use expo-sharing here
  };

  const handleAddBeneficiary = () => {
    console.log("Add as beneficiary");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="flex-1 px-4 pt-8 pb-6">
        <VStack className="flex-1 items-center justify-between">
          <VStack className="items-center w-full" space="sm">
            {/* Success Animation */}
            <Image 
              source={require("../assets/images/success.gif")}
              style={{
                width: 200,
                height: 200,
                alignSelf: "center",
              }}
              resizeMode="contain"
            />

            <Heading className="text-[18px] font-semibold tracking-tighter font-manropesemibold text-[#000000] text-center mt-[20px]">
              Transfer Successful
            </Heading>

            <Heading className="text-[28px] font-medium font-manropebold text-[#000000] text-center">
              ₦{amount}
            </Heading>

            <Text className="text-[14px] font-medium font-manroperegular text-[#000000] text-center px-8">
              Your transfer was successful. The recipient will receive the funds shortly.
            </Text>

            {/* Action Buttons */}
            <HStack className="w-full justify-center mt-6" space="4xl">
              <TouchableOpacity onPress={handleShareReceipt} className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#F3F4F6] items-center justify-center mb-3">
                  <Share2 size={20} color="#006AB1" />
                </View>
                <Text className="text-[12px] font-medium font-manroperegular text-[#000000]">
                  Share Receipt
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleAddBeneficiary} className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#F3F4F6] items-center justify-center mb-3">
                  <UserPlus size={20} color="#066042" />
                </View>
                <Text className="text-[12px] font-medium font-manroperegular text-[#000000]">
                  Add as Beneficiary
                </Text>
              </TouchableOpacity>
            </HStack>

            {/* Commission Card */}
            <View className="w-full mt-6 p-4 rounded-[20px] bg-[#F9FAFB]">
              <VStack className="items-center" space="xs">
                <Text className="text-2xl">🎉</Text>
                <Heading className="text-[20px] font-medium font-manropebold text-[#000000]">
                  ₦{commission || "10"}
                </Heading>
                <Text className="text-[14px] font-manroperegular text-[#303237]">
                  Commission Earned
                </Text>
              </VStack>
            </View>
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