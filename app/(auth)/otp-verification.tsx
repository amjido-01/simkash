import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import React, { useState } from "react";
import { OtpInput } from "react-native-otp-entry";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OtpVerification() {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { height } = useWindowDimensions();

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit code.", [
        { text: "OK" },
      ]);
      return;
    }

    try {
      setIsVerifying(true);
      console.log("OTP:", otp);

      // TODO: Add your API call here to verify OTP
      // await verifyOtpWithBackend(otp);

      // Navigate to next step
      router.push("/(app)/(profile-setup)/basic-info");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert("Error", "Failed to verify OTP. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOtp = async () => {
    try {
      setIsResending(true);

      // TODO: Add your API call here to resend OTP
      // await resendOtpToEmail();

      Alert.alert("Success", "A new code has been sent to your email.", [
        { text: "OK" },
      ]);
      setOtp(""); // Clear the OTP input
    } catch (error) {
      console.error("Error resending OTP:", error);
      Alert.alert("Error", "Failed to resend code. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Box className="flex-1 bg-white">
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 30,
                // paddingTop: 64,
                paddingBottom: 24,
                minHeight: height - 100,
              }}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              {/* Title */}
              <VStack space="sm" className="mt-8">
                <Heading className="mt-[32px] text-[18px] font-manropesemibold leading-[28px]">
                  OTP Verification
                </Heading>
                <Text className="text-[#303237] mb-[41px] font-medium text-[14px] leading-[100%]">
                  Weve sent a 6-digit code to yusuf@gmail.com. Please enter it
                  to proceed.
                </Text>
              </VStack>

              {/* OTP Component */}
              <VStack space="xl" className="flex-1 justify-center">
                <OtpInput
                  numberOfDigits={6}
                  autoFocus={true}
                  focusColor="#132939"
                  placeholder="000000"
                  type="numeric"
                  secureTextEntry={false}
                  onTextChange={(text) => setOtp(text)}
                  onFilled={(text) => {
                    setOtp(text);
                    console.log("Filled OTP:", text);
                  }}
                  theme={{
                    containerStyle: {
                      width: "auto",
                      alignSelf: "center",
                      marginTop: 20,
                    },
                    pinCodeContainerStyle: {
                      width: 49,
                      height: 49,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: "#D0D5DD",
                      backgroundColor: "#FFFFFF",
                      marginHorizontal: 4,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                    focusedPinCodeContainerStyle: {
                      borderColor: "#132939",
                    },
                    pinCodeTextStyle: {
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#131416",
                    },
                    placeholderTextStyle: {
                      color: "#A0A4AB",
                    },
                    filledPinCodeContainerStyle: {
                      borderColor: "#132939",
                    },
                  }}
                />

                <HStack
                  space="sm"
                  className="items-center justify-center text-[14px] leading-[24px]"
                >
                  <Text className="text-[#717680] text-[14px]">
                    Didnt receive code?
                  </Text>
                  <Button
                    onPress={resendOtp}
                    variant="link"
                    className="ml-1"
                    isDisabled={isResending}
                  >
                    <ButtonText className="text-[14px]">
                      {isResending ? "Resending..." : "Resend"}
                    </ButtonText>
                  </Button>
                </HStack>

                {/* Spacer to push button to bottom */}
                <Box className="flex-1 min-h-[24px]" />
              </VStack>

              {/* Verify Button */}
              <VStack space="sm" className="mt-auto pt-6">
                <Button
                  className="rounded-full bg-[#132939] h-[48px]"
                  size="xl"
                  onPress={verifyOtp}
                  isDisabled={otp.length !== 6 || isVerifying}
                >
                  <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                    {isVerifying ? "Verifying..." : "Verify"}
                  </ButtonText>
                </Button>
              </VStack>
            </ScrollView>
          </Box>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
