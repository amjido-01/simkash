import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  //   DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { yupResolver } from "@hookform/resolvers/yup";
import { AlertCircleIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { StepIndicator } from "./step-indicator";
import * as yup from "yup";
import { PasscodeFormData, StepProps } from "@/types";
import { router } from "expo-router";

// Validation schema
const passcodeSchema = yup.object({
  newPasscode: yup
    .string()
    .required("Passcode is required")
    .matches(/^[0-9]{6}$/, "Passcode must be exactly 6 digits"),
  confirmPasscode: yup
    .string()
    .required("Please confirm your passcode")
    .oneOf([yup.ref("newPasscode")], "Passcodes do not match"),
});

interface SetPasscodeProps extends StepProps<PasscodeFormData> {
  isSubmitting?: boolean;
}

export default function SetPasscode({
  onNext,
  onBack,
  initialData,
  isSubmitting: externalIsSubmitting,
}: SetPasscodeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { height } = useWindowDimensions();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    watch,
  } = useForm<PasscodeFormData>({
    resolver: yupResolver(passcodeSchema),
    defaultValues: {
      newPasscode: "",
      confirmPasscode: "",
    },
    mode: "onChange",
  });

  const newPasscodeValue = watch("newPasscode");

  const onSubmit = async (data: PasscodeFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Passcode data collected:", data);

      // Simulate brief processing
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Pass data to parent - THIS TRIGGERS FINAL SUBMISSION
      onNext(data);

      // Show success drawer after submission
      setShowDrawer(true);
    } catch (error) {
      console.error("Error setting passcode:", error);
      Alert.alert("Error", "Failed to set up passcode. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetStarted = () => {
    setShowDrawer(false);
    // Navigate to main app
    router.push("/(tabs)")
  };

  const isProcessing = isSubmitting || externalIsSubmitting;

  return (
    <SafeAreaView className="flex-1">
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
                paddingHorizontal: 24,
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
                <Text className="text-[#303237] font-medium text-[14px] leading-[100%]">
                  Profile Setup
                </Text>
                <Heading className="text-[18px] font-manropesemibold leading-[28px]">
                  Set up Passcode
                </Heading>
              </VStack>

              <StepIndicator currentStep={3} totalSteps={3} />

              <VStack space="xl" className="flex-1 mt-6">
                {/* New Passcode */}
                <FormControl isInvalid={Boolean(errors.newPasscode)}>
                  <Text className="text-[#414651] text-[14px] font-medium text-center mb-3">
                    New Passcode
                  </Text>

                  <Controller
                    control={control}
                    name="newPasscode"
                    render={({ field: { onChange } }) => (
                      <OtpInput
                        numberOfDigits={6}
                        autoFocus={true}
                        focusColor="#132939"
                        placeholder="000000"
                        type="numeric"
                        secureTextEntry={true}
                        onTextChange={(text) => {
                          onChange(text);
                          if (text.length === 6) {
                            trigger("newPasscode");
                          }
                        }}
                        onFilled={(text) => {
                          onChange(text);
                          trigger("newPasscode");
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
                            borderColor: errors.newPasscode
                              ? "#EF4444"
                              : "#E4E7EC",
                            backgroundColor: "#FFFFFF",
                            marginHorizontal: 4,
                            justifyContent: "center",
                            alignItems: "center",
                          },
                          focusedPinCodeContainerStyle: {
                            borderColor: errors.newPasscode
                              ? "#EF4444"
                              : "#132939",
                          },
                          pinCodeTextStyle: {
                            color: "#131416",
                            fontSize: 20,
                            fontWeight: "500",
                          },
                          filledPinCodeContainerStyle: {
                            borderColor: errors.newPasscode
                              ? "#EF4444"
                              : "#132939",
                          },
                        }}
                      />
                    )}
                  />
                  {errors.newPasscode && (
                    <FormControlError className="mt-2 items-center justify-center">
                      <FormControlErrorIcon
                        className="text-red-500"
                        as={AlertCircleIcon}
                      />
                      <FormControlErrorText className="text-red-500 text-[14px]">
                        {errors.newPasscode?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Confirm Passcode */}
                <FormControl
                  isInvalid={Boolean(errors.confirmPasscode)}
                  className="mt-8"
                >
                  <Text className="text-[#414651] text-[14px] font-medium text-center mb-3">
                    Confirm Passcode
                  </Text>

                  <Controller
                    control={control}
                    name="confirmPasscode"
                    render={({ field: { onChange } }) => (
                      <OtpInput
                        numberOfDigits={6}
                        focusColor="#132939"
                        type="numeric"
                        placeholder="000000"
                        secureTextEntry={true}
                        disabled={
                          !newPasscodeValue || newPasscodeValue.length < 6
                        }
                        onTextChange={(text) => {
                          onChange(text);
                          if (text.length === 6) {
                            trigger("confirmPasscode");
                          }
                        }}
                        onFilled={(text) => {
                          onChange(text);
                          trigger("confirmPasscode");
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
                            borderColor: errors.confirmPasscode
                              ? "#EF4444"
                              : "#E4E7EC",
                            backgroundColor: "#FFFFFF",
                            marginHorizontal: 4,
                            justifyContent: "center",
                            alignItems: "center",
                          },
                          focusedPinCodeContainerStyle: {
                            borderColor: errors.confirmPasscode
                              ? "#EF4444"
                              : "#132939",
                          },
                          pinCodeTextStyle: {
                            color: "#131416",
                            fontSize: 20,
                            fontWeight: "500",
                          },
                          filledPinCodeContainerStyle: {
                            borderColor: errors.confirmPasscode
                              ? "#EF4444"
                              : "#132939",
                          },
                        }}
                      />
                    )}
                  />
                  {errors.confirmPasscode && (
                    <FormControlError className="mt-2 items-center justify-center">
                      <FormControlErrorIcon
                        className="text-red-500"
                        as={AlertCircleIcon}
                      />
                      <FormControlErrorText className="text-red-500 text-[14px]">
                        {errors.confirmPasscode?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Spacer to push button to bottom */}
                <Box className="flex-1 min-h-[24px]" />
              </VStack>

              {/* Continue Button */}
              <VStack space="sm" className="mt-auto pt-6">
                <Button
                  className="rounded-full bg-[#132939] h-[48px]"
                  size="xl"
                  onPress={handleSubmit(onSubmit)}
                  isDisabled={!isValid || isProcessing}
                  accessibilityLabel="Complete profile setup"
                >
                  <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                    {isProcessing ? "Completing setup..." : "Continue"}
                  </ButtonText>
                </Button>
              </VStack>
            </ScrollView>
          </Box>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Drawer
        className="border-t-0"
        isOpen={showDrawer}
        size="md"
        anchor="bottom"
        onClose={() => {
          setShowDrawer(false);
        }}
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
          <DrawerBody className="px6 py-2">
            <VStack space="md" className="items-center">
              {/* Celebration Image/Icon */}
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

                {/* Main celebration icon */}
                <View className="w-20 h-20 bg-[#FEF3C7] rounded-full items-center justify-center">
                  <Text className="text-4xl">🎉</Text>
                </View>
              </View>

              {/* Welcome Text */}
              <VStack space="xs" className="items-center border2 mt-2">
                <Heading className="text-[18px] leading-[24px] font-semibold font-manropesemibold text-center">
                  Welcome on Board, Yusuf!
                </Heading>
                <Text className="text-[#303237] text-[14px] text-center leading-[20px] font-medium px-4 mt-1">
                  Your profile is all set. Youre now ready to enjoy everything
                  Simkash has to offer.
                </Text>
              </VStack>
              <Button
                className="rounded-full bg-[#132939] mt-10 h-[48px] w-full"
                size="xl"
                onPress={handleGetStarted}
                accessibilityLabel="Get started with Simkash"
              >
                <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                  Get Started
                </ButtonText>
              </Button>
            </VStack>
          </DrawerBody>
          {/* <DrawerFooter className="px-6 m-0m border-2 pt-4 pb-2">
            <Button
              className="rounded-full bg-[#132939] h-[48px] w-full"
              size="xl"
              onPress={handleGetStarted}
              accessibilityLabel="Get started with Simkash"
            >
              <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                Get Started
              </ButtonText>
            </Button>
          </DrawerFooter> */}
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}
