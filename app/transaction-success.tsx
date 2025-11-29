import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Share2, UserPlus } from "lucide-react-native";
import React, { useMemo } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Transaction type configurations
const TRANSACTION_CONFIGS = {
  // Transfer transactions
  "simkash-to-bank": {
    title: "Transfer Successful",
    description: "Your transfer was successful. The recipient will receive the funds shortly.",
    showBeneficiary: true,
    details: [
      { label: "Recipient", key: "recipient", optional: false },
      { label: "Account Number", key: "accountNumber", optional: false },
      { label: "Bank", key: "bank", optional: false },
      { label: "Narration", key: "narration", optional: true },
    ],
  },
  "simkash-to-simkash": {
    title: "Transfer Successful",
    description: "Your transfer was successful. The recipient will receive the funds instantly.",
    showBeneficiary: true,
    details: [
      { label: "Recipient", key: "recipient", optional: false },
      { label: "Phone Number", key: "phoneNumber", optional: false },
      { label: "Narration", key: "narration", optional: true },
    ],
  },

  // Airtime purchase
  airtime: {
    title: "Airtime Purchase Successful",
    description: "Airtime has been successfully loaded to the phone number.",
    showBeneficiary: true,
    details: [
      { label: "Phone Number", key: "phoneNumber", optional: false },
      { label: "Network", key: "network", optional: false },
    ],
  },

  // Data purchase
  data: {
    title: "Data Purchase Successful",
    description: "Data bundle has been successfully activated on the phone number.",
    showBeneficiary: true,
    details: [
      { label: "Phone Number", key: "phoneNumber", optional: false },
      { label: "Network", key: "network", optional: false },
      { label: "Data Plan", key: "dataPlan", optional: false },
    ],
  },

  // Bill payments
  electricity: {
    title: "Payment Successful",
    description: "Your electricity token has been generated successfully.",
    showBeneficiary: false,
    details: [
      { label: "Meter Number", key: "meterNumber", optional: false },
      { label: "Disco", key: "disco", optional: false },
      { label: "Token", key: "token", optional: false },
    ],
  },
  cable: {
    title: "Subscription Successful",
    description: "Your cable TV subscription has been activated successfully.",
    showBeneficiary: false,
    details: [
      { label: "Smart Card Number", key: "cardNumber", optional: false },
      { label: "Provider", key: "provider", optional: false },
      { label: "Package", key: "package", optional: false },
    ],
  },
  internet: {
    title: "Payment Successful",
    description: "Your internet subscription has been renewed successfully.",
    showBeneficiary: false,
    details: [
      { label: "Account Number", key: "accountNumber", optional: false },
      { label: "Provider", key: "provider", optional: false },
      { label: "Plan", key: "plan", optional: false },
    ],
  },

  // Betting
  betting: {
    title: "Wallet Funded",
    description: "Your betting wallet has been funded successfully.",
    showBeneficiary: false,
    details: [
      { label: "Betting Platform", key: "platform", optional: false },
      { label: "User ID", key: "userId", optional: false },
    ],
  },

  // Education
  "exam-pin": {
    title: "Purchase Successful",
    description: "Your exam PIN has been generated successfully.",
    showBeneficiary: false,
    details: [
      { label: "Exam Type", key: "examType", optional: false },
      { label: "PIN", key: "pin", optional: false },
      { label: "Serial Number", key: "serialNumber", optional: false },
    ],
  },

  // Default fallback
  default: {
    title: "Transaction Successful",
    description: "Your transaction was completed successfully.",
    showBeneficiary: false,
    details: [
      { label: "Reference", key: "reference", optional: false },
    ],
  },
};

export default function TransactionSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
   const {
    amount,
    recipient,
    phoneNumber,
    accountNumber,
    narration,
    commission,
    transactionType = "default",
    reference,
    network,
    bank,
    dataPlan,
    meterNumber,
    disco,
    token,
    cardNumber,
    provider,
    package: packageName,
    plan,
    platform,
    userId,
    examType,
    pin,
    serialNumber,
  } = params;

    // Get configuration for transaction type
  const config = useMemo(() => {
    return TRANSACTION_CONFIGS[transactionType as keyof typeof TRANSACTION_CONFIGS] || TRANSACTION_CONFIGS.default;
  }, [transactionType]);

    // Build transaction details dynamically
  const transactionDetails = useMemo(() => {
    const allParams = {
      recipient,
      phoneNumber,
      accountNumber,
      narration,
      reference,
      network,
      bank,
      dataPlan,
      meterNumber,
      disco,
      token,
      cardNumber,
      provider,
      package: packageName,
      plan,
      platform,
      userId,
      examType,
      pin,
      serialNumber,
    };

    return config.details
      .map((detail) => ({
        label: detail.label,
        value: allParams[detail.key as keyof typeof allParams],
        optional: detail.optional ?? false,
      }))
      .filter((detail) => detail.value || !detail.optional);
  }, [config, recipient, phoneNumber, accountNumber, narration, reference, network, bank, dataPlan, meterNumber, disco, token, cardNumber, provider, packageName, plan, platform, userId, examType, pin, serialNumber]);


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
              {config.title}
            </Heading>

            <Heading className="text-[28px] font-medium font-manropebold text-[#000000] text-center">
              ₦{amount}
            </Heading>

            <Text className="text-[14px] font-medium font-manroperegular text-[#000000] text-center px-8">
              Your transfer was {config.title} The recipient will receive the funds shortly.
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