import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { PageHeader } from "@/components/page-header";

interface TierLimit {
  tier: string;
  accountLimit: string;
  transactionLimit: string;
}

export default function TransactionLimit() {
  const handleBack = () => {
    router.back();
  };

  const tiers: TierLimit[] = [
    {
      tier: "Tier 1 Limit",
      accountLimit: "₦200,000",
      transactionLimit: "₦50,000",
    },
    {
      tier: "Tier 2 Limit",
      accountLimit: "₦500,000",
      transactionLimit: "₦200,000",
    },
    {
      tier: "Tier 3 Limit",
      accountLimit: "₦100,00,000",
      transactionLimit: "₦5,000,000",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <PageHeader
        title="Transaction Limit"
        onBack={handleBack}
        showBackButton={true}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Box className="bg-white px-4 pt-6 pb-24 flex-1">
          <VStack space="lg">
            {tiers.map((tier, index) => (
              <View
                key={index}
                className="bg-[#F9FAFB] rounded-[20px] p-4"
              >
                <VStack space="md">
                  {/* Tier Title */}
                  <Text className="text-[18px] leading-[24px] font-medium font-manropesemibold text-[#0A0D14]">
                    {tier.tier}
                  </Text>

                  {/* Account Limit */}
                  <HStack className="justify-between items-center">
                    <Text className="text-[16px] font-normal font-manroperegular text-[#525866]">
                      Maximum account limit
                    </Text>
                    <Text className="text-[14px] font-normal font-manropesemibold text-[#0A0D14]">
                      {tier.accountLimit}
                    </Text>
                  </HStack>

                  {/* Transaction Limit */}
                  <HStack className="justify-between items-center">
                    <Text className="text-[16px] font-normal font-manroperegular text-[#525866]">
                      Maximum transaction limit
                    </Text>
                    <Text className="text-[14px] font-manropesemibold text-[#000000]">
                      {tier.transactionLimit}
                    </Text>
                  </HStack>
                </VStack>
              </View>
            ))}
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}