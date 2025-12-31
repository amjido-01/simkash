import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react-native";

interface BNPLTermsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  isRequired?: boolean; // ✅ New prop to indicate if terms must be accepted
}

export default function BNPLTermsDrawer({
  isOpen,
  onClose,
  onAccept,
  isRequired = false,
}: BNPLTermsDrawerProps) {
  const insets = useSafeAreaInsets();
  const [isAccepted, setIsAccepted] = useState(false);

  const handleContinue = () => {
    if (onAccept) {
      onAccept();
    }
    setIsAccepted(false); // Reset for next time
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
        className="rounded-t-[30px] pt[28px] px-4 bg-[#FFFFFF]"
        style={{
          borderTopWidth: 0,
          borderColor: "transparent",
          shadowOpacity: 0,
          elevation: 0,
          paddingBottom: insets.bottom || 16,
          maxHeight: "85%",
        }}
      >
        <DrawerHeader className="pb2 flex-row items-center justify-between">
          <Heading className="font-manropesemibold text-[18px] text-[#000000] flex-1 text-center">
            Terms & Condition
          </Heading>
          {/* ✅ Only show close button if not required */}
          {!isRequired && (
            <TouchableOpacity onPress={onClose} className="px-2">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          )}
        </DrawerHeader>

        <DrawerBody className="pt-4 px-4 flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <VStack space="sm">
              <Text className="text-[14px] font-manroperegular text-[#303237] leading-[22px]">
                You Understand that:
              </Text>

              <VStack space="sm">
                <View className="flex-row">
                  <View className="w-5 h-5 rounded-full bg-[#F3F4F6] items-center justify-center mr-3 mt-1">
                    <Text className="text-[12px] font-manropesemibold text-[#6B7280]">
                      1
                    </Text>
                  </View>
                  <Text className="text-[14px] font-manroperegular text-[#303237] flex-1 leading-[22px]">
                    Repayment must be made on or before the agreed date.
                  </Text>
                </View>

                <View className="flex-row">
                  <View className="w-5 h-5 rounded-full bg-[#F3F4F6] items-center justify-center mr-3 mt-1">
                    <Text className="text-[12px] font-manropesemibold text-[#6B7280]">
                      2
                    </Text>
                  </View>
                  <Text className="text-[14px] font-manroperegular text-[#303237] flex-1 leading-[22px]">
                    Late payment may attract extra charges or service
                    restrictions.
                  </Text>
                </View>

                <View className="flex-row">
                  <View className="w-5 h-5 rounded-full bg-[#F3F4F6] items-center justify-center mr-3 mt-1">
                    <Text className="text-[12px] font-manropesemibold text-[#6B7280]">
                      3
                    </Text>
                  </View>
                  <Text className="text-[14px] font-manroperegular text-[#303237] flex-1 leading-[22px]">
                    Your account activity may be reviewed before loan approval.
                  </Text>
                </View>

                <View className="flex-row">
                  <View className="w-5 h-5 rounded-full bg-[#F3F4F6] items-center justify-center mr-3 mt-1">
                    <Text className="text-[12px] font-manropesemibold text-[#6B7280]">
                      4
                    </Text>
                  </View>
                  <Text className="text-[14px] font-manroperegular text-[#303237] flex-1 leading-[22px]">
                    Simkash reserves the right to suspend or deny future credit
                    if repayment is delayed.
                  </Text>
                </View>
              </VStack>

              {/* Checkbox */}
              <TouchableOpacity
                onPress={() => setIsAccepted(!isAccepted)}
                activeOpacity={0.7}
                className="flex-row items-center mt4 p-3 bg-[#F9FAFB] rounded-[12px]"
              >
                <View
                  className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
                    isAccepted
                      ? "bg-[#132939] border-[#132939]"
                      : "bg-white border-[#D0D5DD]"
                  }`}
                >
                  {isAccepted && (
                    <Text className="text-white text-[12px]">✓</Text>
                  )}
                </View>
                <Text className="text-[14px] font-manroperegular text-[#303237] flex-1">
                  I Agree to the{" "}
                  <Text className="text-[#132939] font-manropesemibold">
                    Terms & Condition
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Continue Button */}
              <Button
                onPress={handleContinue}
                disabled={!isAccepted}
                className={`rounded-full h-[52px] w-full mt4 ${
                  !isAccepted ? "bg-gray-300" : "bg-[#132939]"
                }`}
              >
                <ButtonText
                  className={`text-[16px] font-manropesemibold ${
                    !isAccepted ? "text-gray-500" : "text-white"
                  }`}
                >
                  Continue
                </ButtonText>
              </Button>
            </VStack>
          </ScrollView>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}