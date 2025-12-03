import { Button, ButtonText } from "@/components/ui/button";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ChevronRight, Copy } from "lucide-react-native";
import { Platform, TouchableOpacity, View, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

interface TopUpWalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hasCompletedKYC?: boolean;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
}

export default function TopUpWalletDrawer({
  isOpen,
  onClose,
  hasCompletedKYC = false,
  accountNumber = "9325678767",
  accountName = "SIMKASH/ADAM BABA YUSUF",
  bankName = "WEMA BANK",
}: TopUpWalletDrawerProps) {
  const insets = useSafeAreaInsets();

  const handleCopyAccountNumber = () => {
    // In a real app, you'd use Clipboard API
    Alert.alert("Copied!", "Account number copied to clipboard");
  };

  const handleUnlockAccount = () => {
    onClose();
    router.push("/kyc");
  };

  const handleSecurePayment = () => {
    Alert.alert("Secure Payment", "Top up using cards, USSD and more");
  };

  return (
    <Drawer
      className="border-t-0"
      isOpen={isOpen}
      size="md"
      anchor="bottom"
      onClose={onClose}
    >
      <DrawerBackdrop
        style={{
          backgroundColor: "#24242440",
          opacity: 1,
        }}
      />
      <DrawerContent
        className="rounded-t-[30px] pt-[28px] bg-[#FFFFFF]"
        style={{
          borderTopWidth: 0,
          borderColor: "transparent",
          shadowOpacity: 0,
          elevation: 0,
          paddingBottom: insets.bottom || 16,
        }}
      >
        <DrawerHeader className="border-b-0 pb-2">
          <Heading className="font-manropesemibold text-center text-[18px] text-[#000000] mb2">
                        Top Up Wallet

          </Heading>
          <DrawerCloseButton />
        </DrawerHeader>

        <DrawerBody className="pt-4">
          <VStack space="lg">
            {/* Personal Account Section */}
            {!hasCompletedKYC ? (
              // Blurred account with unlock button
              <View className="relative rounded-[16px] border border-[#E5E7EB] overflow-hidden">
                <View className="p-4">
                  <HStack className="items-center gap-3 mb-4">
                    {/* Avatar with Badge */}
                    <View className="relative">
                      <View className="w-12 h-12 bg-[#3B82F6] rounded-full items-center justify-center">
                        <Text className="text-white text-[18px] font-manropesemibold">
                          A
                        </Text>
                      </View>
                      <View className="absolute -top-1 -right-1 w-6 h-6 bg-[#3B82F6] rounded-full items-center justify-center border-2 border-white">
                        <Text className="text-white text-[10px]">👤</Text>
                      </View>
                    </View>

                    <VStack className="flex-1">
                      <Text className="text-[16px] font-manropesemibold text-[#000000] mb-1">
                        ••••• •••• •
                      </Text>
                      <Text className="text-[12px] font-manroperegular text-[#6B7280]">
                        Your dedicated account number
                      </Text>
                    </VStack>
                  </HStack>

                  <Button
                    className="rounded-full z-10 bg-[#132939] h-[44px] w-full"
                    size="lg"
                    onPress={handleUnlockAccount}
                  >
                    <ButtonText className="text-white text-[14px] font-medium">
                      Unlock Personal Account
                    </ButtonText>
                  </Button>
                </View>

                {/* Blur overlay */}
                {Platform.OS === "ios" ? (
                  <BlurView
                    intensity={10}
                    tint="light"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                    }}
                  />
                )}
              </View>
            ) : (
              // Unlocked account with details
              <View className="rounded-[16px] border border-[#E5E7EB] p-4">
                <HStack className="items-center justify-between mb-2">
                  <HStack className="items-center gap-2 flex-1">
                    <Text className="text-[16px] font-bold font-manropebold text-[#000000]">
                      {accountNumber}
                    </Text>
                    <TouchableOpacity
                      onPress={handleCopyAccountNumber}
                      className="p-1"
                      activeOpacity={0.7}
                    >
                      <Copy size={18} color="#1E1E1E" />
                    </TouchableOpacity>
                  </HStack>
                </HStack>

                <HStack className="items-center gap-2">
                  <Text className="text-[12px] font-bold font-manropesemibold text-[#000000]">
                    {accountName}
                  </Text>
                  <View className="w-1 h-1 rounded-full bg-[#6B7280]" />
                  <Text className="text-[12px] font-bold font-manropesemibold text-[#000000]">
                    {bankName}
                  </Text>
                </HStack>
              </View>
            )}

            {/* OR Divider */}
              <Text className="text-[14px] text-center font-semibold font-manroperegular text-[#000000]">
                OR
              </Text>

            {/* Secure Payment Channels */}
            <TouchableOpacity
              onPress={handleSecurePayment}
              activeOpacity={0.7}
              className="flex-row items-center border border-[#E5E7EF] px-4 justify-between py-4 rounded-[16px]"
            >
              <VStack className="flex-1">
                <Text className="font-manropesemibold text-[14px] leading-[100%] font-bold text-[#000000] mb-1">
                  Secure Payment Channels
                </Text>
                <Text className="font-manroperegular font-medium text-[12px] text-[#303237]">
                  Top up using cards, USSD and more
                </Text>
              </VStack>
              <ChevronRight size={20} color="#000000" />
            </TouchableOpacity>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
