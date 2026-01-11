import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { AlertCircleIcon } from "lucide-react-native";
import React, { useState, useRef, useCallback } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { PageHeader } from "@/components/page-header";
import { OtpInput } from "react-native-otp-entry";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

type PinStep = "email" | "otp" | "new" | "confirm";

const OTP_LENGTH = 6;
const PIN_LENGTH = 4;

// Validation schema for email
const emailSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email"),
});

type EmailFormData = yup.InferType<typeof emailSchema>;

export default function ResetTransactionPin() {
  const { height } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState<PinStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const otpInputRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema) as any,
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const handleBack = () => {
    if (currentStep === "email") {
      router.back();
    } else if (currentStep === "otp") {
      setCurrentStep("email");
      setOtp("");
      setOtpError("");
    } else if (currentStep === "new") {
      setCurrentStep("otp");
      setNewPin("");
      setError("");
    } else {
      setCurrentStep("new");
      setConfirmPin("");
      setError("");
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "email":
        return "Reset Your PIN";
      case "otp":
        return "OTP Verification";
      case "new":
        return "Set up Pin";
      case "confirm":
        return "Set up Pin";
    }
  };

  const getStepLabel = () => {
    switch (currentStep) {
      case "new":
        return "New Pin";
      case "confirm":
        return "Confirm Pin";
      default:
        return "";
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case "new":
        return 1;
      case "confirm":
        return 2;
      default:
        return 0;
    }
  };

  // Submit email to get OTP
  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    setEmail(data.email);

    try {
      // TODO: Call API to send OTP to email
      console.log("Sending OTP to:", data.email);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Move to OTP step
      setCurrentStep("otp");
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError(err?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleOtpChange = useCallback((text: string) => {
    setOtp(text);
    setOtpError("");

    // Auto-verify when complete
    if (text.length === OTP_LENGTH) {
      setTimeout(() => {
        handleVerifyOtp(text);
      }, 300);
    }
  }, []);

  const handleVerifyOtp = async (otpText: string) => {
    if (otpText.length !== OTP_LENGTH) {
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      console.log("Verifying OTP:", otpText);

      // TODO: Call API to verify OTP
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success - move to new PIN step
      setCurrentStep("new");
      setOtp("");
    } catch (error) {
      setOtpError("Invalid OTP. Please try again.");
      setOtp("");
      if (otpInputRef.current) {
        otpInputRef.current.clear();
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle PIN input
  const handlePinFilled = async (pin: string) => {
    setError("");

    if (currentStep === "new") {
      setNewPin(pin);
      setCurrentStep("confirm");
    } else if (currentStep === "confirm") {
      // Check if pins match
      if (newPin !== pin) {
        setError("PINs do not match");
        setConfirmPin("");
        return;
      }

      setConfirmPin(pin);

      // Call API to reset PIN
      setIsLoading(true);
      try {
        // TODO: Call API to reset PIN
        console.log("Resetting PIN with:", { email, otp, newPin: pin });

        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Success - show success drawer
        setShowSuccessDrawer(true);
      } catch (err: any) {
        console.error("Error resetting PIN:", err);
        setError(
          err?.responseMessage ||
            err?.message ||
            "Failed to reset PIN. Please try again."
        );
        setConfirmPin("");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDone = () => {
    setShowSuccessDrawer(false);
    setEmail("");
    setOtp("");
    setNewPin("");
    setConfirmPin("");
    setCurrentStep("email");
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Box className="flex-1 bg-[#fafafa]">
            <PageHeader
              title="Reset Your PIN"
              onBack={handleBack}
              showBackButton={true}
            />

            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 24,
                minHeight: height - 100,
              }}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              {/* Email Input Step */}
              {currentStep === "email" && (
                <VStack space="xl" className="flex-1 mt6">
                  <VStack space="sm">
                    <Text className="text-[20px] font-manropebold text-[#0A0D14]">
                      {getStepTitle()}
                    </Text>
                    <Text className="text-[16px] text-[#303237] font-manroperegular">
                      Enter the email linked to your account and we&apos;ll send you a code to retrieve your PIN.
                    </Text>
                  </VStack>

                  <FormControl isInvalid={Boolean(errors.email)}>
                    <FormControlLabel>
                      <FormControlLabelText className="text-[13px] text-[#414651] mb-[6px]">
                        Email
                      </FormControlLabelText>
                    </FormControlLabel>

                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          variant="outline"
                          size="xl"
                          className={`w-full rounded-[99px] min-h-[48px] ${
                            errors.email
                              ? "border-2 border-red-500"
                              : "border border-[#D0D5DD]"
                          }`}
                        >
                          <InputField
                            placeholder="Enter email address"
                            className="text-[14px] text-[#141316] px-4 py-3"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                          />
                        </Input>
                      )}
                    />

                    {errors.email && (
                      <FormControlError className="mt-2">
                        <FormControlErrorIcon
                          className="text-red-500"
                          as={AlertCircleIcon}
                        />
                        <FormControlErrorText className="text-red-500 text-[14px]">
                          {errors.email?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>

                  <Box className="flex-1" />

                  <Button
                    className="rounded-full bg-[#132939] h-[48px] w-full"
                    size="xl"
                    onPress={handleSubmit(handleEmailSubmit)}
                    disabled={isLoading}
                  >
                    <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                      {isLoading ? "Sending..." : "Continue"}
                    </ButtonText>
                  </Button>
                </VStack>
              )}

              {/* PIN Input Steps (New & Confirm) */}
              {(currentStep === "new" || currentStep === "confirm") && (
                <VStack space="xl" className="flex-1 mt-6">
                  <VStack space="xs">
                    <Text className="text-[#6B7280] text-[12px] font-manroperegular">
                      Reset PIN
                    </Text>
                    <Text className="text-[18px] font-manropebold text-[#0A0D14]">
                      {getStepTitle()}
                    </Text>

                    {/* Step Progress Indicator */}
                    <View className="flex-row gap-2 mt-4">
                      {[1, 2].map((step) => (
                        <View
                          key={step}
                          className="h-1 flex-1 rounded-full"
                          style={{
                            backgroundColor:
                              step <= getStepNumber() ? "#132939" : "#E5E7EF",
                          }}
                        />
                      ))}
                    </View>
                  </VStack>

                  <VStack space="md" className="mt-4">
                    <Text className="text-[#414651] text-[14px] font-medium text-center mb-3">
                      {getStepLabel()}
                    </Text>

                    <OtpInput
                      key={currentStep}
                      numberOfDigits={PIN_LENGTH}
                      autoFocus={true}
                      focusColor="#132939"
                      placeholder="0000"
                      type="numeric"
                      secureTextEntry={true}
                      disabled={isLoading}
                      onTextChange={(text) => {
                        if (error) setError("");
                      }}
                      onFilled={(text) => {
                        if (!isLoading) {
                          handlePinFilled(text);
                        }
                      }}
                      theme={{
                        containerStyle: {
                          width: "auto",
                          alignSelf: "center",
                          marginTop: 4,
                        },
                        pinCodeContainerStyle: {
                          width: 49,
                          height: 49,
                          borderRadius: 12,
                          borderWidth: 1.5,
                          borderColor: error ? "#EF4444" : "#D0D5DD",
                          backgroundColor: isLoading ? "#F3F4F6" : "#FFFFFF",
                          marginHorizontal: 6,
                          justifyContent: "center",
                          alignItems: "center",
                        },
                        focusedPinCodeContainerStyle: {
                          borderColor: error ? "#EF4444" : "#132939",
                        },
                        pinCodeTextStyle: {
                          color: "#131416",
                        },
                        filledPinCodeContainerStyle: {
                          borderColor: error ? "#EF4444" : "#132939",
                        },
                      }}
                    />

                    {isLoading && (
                      <Text className="text-[#6B7280] text-[14px] text-center mt-2">
                        Processing...
                      </Text>
                    )}

                    {error && (
                      <Text className="text-red-500 text-[14px] text-center mt-2">
                        {error}
                      </Text>
                    )}
                  </VStack>

                  <Box className="flex-1" />
                </VStack>
              )}
            </ScrollView>
          </Box>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* OTP VERIFICATION DRAWER */}
      <Drawer
        className="border-t-0"
        isOpen={currentStep === "otp"}
        size="full"
        anchor="bottom"
        onClose={() => {
          if (!isVerifyingOtp) {
            setCurrentStep("email");
            setOtp("");
            setOtpError("");
          }
        }}
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
            paddingBottom: Platform.OS === "ios" ? 34 : 16,
          }}
        >
          <DrawerHeader className="border-b-0 mt-[100px] pb-6 px-4">
            <VStack>
              <Heading className="font-manropesemibold w-full text-center text-[18px] text-[#000000] mb-2">
                OTP Verification
              </Heading>
              <Text className="text-center text-[12px] font-manroperegular text-[#6B7280] px-2">
                We&apos;ve sent a 6-digit code to your email. Please enter it to proceed.
              </Text>
            </VStack>
            {!isVerifyingOtp && <DrawerCloseButton />}
          </DrawerHeader>

          <DrawerBody className="pt-2 px-2 pb-8">
            <VStack space="lg" className="items-center">
              {/* OTP Input */}
              <View className="mb-6">
                <OtpInput
                  ref={otpInputRef}
                  numberOfDigits={OTP_LENGTH}
                  focusColor="transparent"
                  type="numeric"
                  disabled={isVerifyingOtp}
                  autoFocus={true}
                  onTextChange={handleOtpChange}
                  theme={{
                    containerStyle: {
                      width: "auto",
                      alignSelf: "center",
                    },
                    pinCodeContainerStyle: {
                      width: 49,
                      height: 49,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: otpError ? "#EF4444" : "#E5E7EB",
                      backgroundColor: "#FFFFFF",
                      marginHorizontal: 4,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                    focusedPinCodeContainerStyle: {
                      borderColor: otpError ? "#EF4444" : "#132939",
                    },
                    pinCodeTextStyle: {
                      color: "#000000",
                      fontSize: 24,
                      fontWeight: "600",
                    },
                    filledPinCodeContainerStyle: {
                      borderColor: otpError ? "#EF4444" : "#10B981",
                    },
                  }}
                />
              </View>

              {/* Error or Loading */}
              {otpError && !isVerifyingOtp && (
                <Text className="text-red-500 text-[12px] font-manroperegular text-center mb-2">
                  {otpError}
                </Text>
              )}

              {isVerifyingOtp && (
                <View className="mb-4">
                  <ActivityIndicator size="small" color="#132939" />
                  <Text className="text-[12px] font-manroperegular text-[#6B7280] text-center mt-2">
                    Verifying OTP...
                  </Text>
                </View>
              )}

              {/* Resend Code */}
              {!isVerifyingOtp && (
                <Text className="text-[12px] font-manroperegular text-[#6B7280] text-center">
                  Resend code in 32s
                </Text>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Success Drawer */}
      <Drawer
        className="border-t-0"
        isOpen={showSuccessDrawer}
        size="md"
        anchor="bottom"
        onClose={() => setShowSuccessDrawer(false)}
      >
        <DrawerBackdrop
          style={{
            backgroundColor: "#24242440",
            opacity: 1,
          }}
        />
        <DrawerContent
          className="rounded-t-3xl bg-[#FFFFFF]"
          style={{
            borderTopWidth: 0,
            borderColor: "transparent",
            shadowOpacity: 0,
            elevation: 0,
            paddingBottom: Platform.OS === "ios" ? 20 : 8,
          }}
        >
          <DrawerHeader className="pb-2">
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody className="px-6 py-2">
            <VStack space="md" className="items-center">
              <View className="relative items-center justify-center mb-2">
                <View className="absolute -left-8 -top-4">
                  <Text className="text-2xl">🎉</Text>
                </View>
                <View className="absolute -right-6 -top-2">
                  <Text className="text-xl">✨</Text>
                </View>
                <View className="absolute -left-6 top-12">
                  <Text className="text-lg">🎊</Text>
                </View>
                <View className="absolute -right-8 top-10">
                  <Text className="text-xl">⭐</Text>
                </View>

                <View className="w-20 h-20 bg-[#FEF3C7] rounded-full items-center justify-center">
                  <Text className="text-4xl">🎉</Text>
                </View>
              </View>

              <VStack space="xs" className="items-center mt-2">
                <Heading className="text-[20px] leading-[24px] font-bold font-manropesemibold text-center">
                  PIN have been changed Successful!
                </Heading>
                <Text className="text-[#303237] text-[14px] text-center leading-[20px] font-medium px-4 mt-1">
                  All updates have been successfully saved and applied to your
                  account settings.
                </Text>
              </VStack>

              <Button
                className="rounded-full bg-[#132939] mt-10 h-[48px] w-full"
                size="xl"
                onPress={handleDone}
                accessibilityLabel="Done"
              >
                <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                  Done
                </ButtonText>
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}