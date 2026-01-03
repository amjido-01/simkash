import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { OtpInput } from "react-native-otp-entry";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authEndpoints } from "../api/endpoints";
import { CustomAlert } from "@/components/custom-alert";
import { Icon } from "@/components/ui/icon";
import { Loader2 } from "lucide-react-native";

const OTP_EXPIRY_TIME = 180; // 3 minutes in seconds

export default function OtpVerification() {
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(OTP_EXPIRY_TIME);
  const [canResend, setCanResend] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "warning" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const { height } = useWindowDimensions();
  const hasAutoSubmitted = useRef(false); // Prevent double submission

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const verifyOtp = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp;

    if (otpToVerify.length !== 6) {
      setAlert({
        show: true,
        type: "error",
        message: "Please enter a 6-digit code.",
      });
      return;
    }

    if (!email) {
      setAlert({
        show: true,
        type: "error",
        message: "Email not found. Please go back and register again.",
      });
      return;
    }

    if (isVerifying) return;

    try {
      setIsVerifying(true);

      const response = await authEndpoints.verifyOtp({
        email,
        otp: otpToVerify,
      });

      console.log("OTP verified successfully:", response);

      setAlert({
        show: true,
        type: "success",
        message: "OTP verified successfully!",
      });

      setOtp("");

     setTimeout(() => {
      setAlert({ show: false, type: "info", message: "" });
      // Navigation happens automatically
    }, 1000);
    } catch (error: any) {
      console.error("OTP verification failed:", error);

      setAlert({
        show: true,
        type: "error",
        message: error.message || "Failed to verify OTP. Please try again.",
      });

      setOtp("");
      hasAutoSubmitted.current = false;
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOtp = async () => {
    if (!canResend) return;

    if (!email) {
      setAlert({
        show: true,
        type: "error",
        message: "Email not found. Please go back and register again.",
      });
      return;
    }

    try {
      setIsResending(true);
      console.log("Resending OTP to:", email);

      const message = await authEndpoints.resendOtp({ email });

      console.log("✅ OTP resent successfully");

      setAlert({
        show: true,
        type: "success",
        message: message || "A new code has been sent to your email.",
      });

      // Reset UI states
      setOtp("");
      setCountdown(OTP_EXPIRY_TIME);
      setCanResend(false);
      hasAutoSubmitted.current = false;
    } catch (error: any) {
      console.error("Failed to resend OTP:", error);

      setAlert({
        show: true,
        type: "error",
        message: error.message || "Failed to resend code. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Handle OTP filled - auto submit
  const handleOtpFilled = (text: string) => {
    console.log("OTP Filled:", text);
    setOtp(text);

    // Auto-submit only once
    if (!hasAutoSubmitted.current && text.length === 6) {
      hasAutoSubmitted.current = true;
      // Small delay to allow state update
      setTimeout(() => {
        verifyOtp(text);
      }, 100);
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
                  We&apos;ve sent a 6-digit code to {email || "your email"}.
                  Please enter it to proceed.
                </Text>
              </VStack>

              {/* OTP Component */}
              <VStack space="xl" className="flex-1 justify-center">
                {/* Alert */}
                {alert.show && (
                  <CustomAlert
                    type={alert.type}
                    message={alert.message}
                    onClose={() =>
                      setAlert((prev) => ({ ...prev, show: false }))
                    }
                  />
                )}

                <OtpInput
                  numberOfDigits={6}
                  autoFocus={true}
                  focusColor="#132939"
                  placeholder="000000"
                  type="numeric"
                  secureTextEntry={false} // Changed to false to allow copy-paste visibility
                  disabled={isVerifying} // Disable input while verifying
                  onTextChange={(text) => {
                    setOtp(text);
                    // Reset auto-submit flag when user types
                    if (text.length < 6) {
                      hasAutoSubmitted.current = false;
                    }
                  }}
                  onFilled={handleOtpFilled} // Auto-submit when filled
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

                {/* Show verifying indicator */}
                {isVerifying && (
                  <HStack className="items-center justify-center mt-4">
                    <Icon
                      as={Loader2}
                      className="text-[#132939] mr-2 animate-spin"
                      size="sm"
                    />
                    <Text className="text-[#132939] text-[14px]">
                      Verifying your code...
                    </Text>
                  </HStack>
                )}

                {/* Timer and Resend */}
                <VStack space="sm" className="items-center mt-4">
                  {!canResend ? (
                    <Text className="text-[#717680] text-[14px]">
                      Code expires in {formatTime(countdown)}
                    </Text>
                  ) : (
                    <HStack
                      space="sm"
                      className="items-center justify-center text-[14px] leading-[24px]"
                    >
                      <Text className="text-[#717680] text-[14px]">
                        Didn&apos;t receive code?
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
                  )}
                </VStack>

                {/* Spacer to push button to bottom */}
                <Box className="flex-1 min-h-[24px]" />
              </VStack>
            </ScrollView>
          </Box>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
