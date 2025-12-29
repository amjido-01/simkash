import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useRouter } from "expo-router";
// useLocalSearchParams,
import { Share } from "lucide-react-native";
import { Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PayLaterSuccess() {
  const router = useRouter();
//   const params = useLocalSearchParams();

//   const {
//     amount,
//     // country,
//     // state,
//     // lga,
//     // status,
//     partnerName,
//     partnerPhone,
//     partnerRole,
//   } = params;

  const handleDone = () => {
    // Navigate back to home tab
    router.push("/(tabs)");
  };


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
              Repayment Successful!
            </Heading>

            {/* Description */}
            <Text className="text-[14px] font-manroperegular text-[#000000] leading-[100%] text-center px-6 mt-2">
              Payment is due on Dec 25, 2024. Please note that a 10% interest
              applies to this payment.
            </Text>

            {/* Action Buttons */}
            <HStack className="w-full justify-center mt-8" space="4xl">
              <TouchableOpacity
                onPress={() => {
                  console.log("share");
                }}
                className="items-center"
              >
                <View className="w-14 h-14 rounded-full bg-[#F0FDF4] items-center justify-center mb-3">
                  <Share size={24} color="#10B981" />
                </View>
                <Text className="text-[12px] font-medium font-manroperegular text-[#000000]">
                  Share Receipt
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
