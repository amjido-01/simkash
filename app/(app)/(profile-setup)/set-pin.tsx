import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
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
import { router } from "expo-router";
import { AlertCircleIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { OtpInput } from "react-native-otp-entry";
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
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

// Validation schema
const pinSchema = yup.object({
  newPin: yup
    .string()
    .required("PIN is required")
    .matches(/^[0-9]{4}$/, "PIN must be exactly 4 digits"),
  confirmPin: yup
    .string()
    .required("Please confirm your PIN")
    .oneOf([yup.ref("newPin")], "PINs do not match"),
});

type PinFormData = yup.InferType<typeof pinSchema>;

// Step Indicator Component
const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <View
      className="flex-row gap-1 mt-2"
      accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className={`h-1 flex-1 rounded-full ${
            index < currentStep ? "bg-[#132939]" : "bg-[#E4E7EC]"
          }`}
          accessibilityLabel={`Step ${index + 1} ${
            index < currentStep ? "completed" : "not completed"
          }`}
        />
      ))}
    </View>
  );
};

export default function SetUpPin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { height } = useWindowDimensions();
  const currentStep = 2;
  const totalSteps = 3;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    watch,
  } = useForm<PinFormData>({
    resolver: yupResolver(pinSchema),
    defaultValues: {
      newPin: "",
      confirmPin: "",
    },
    mode: "onChange",
  });

  const newPinValue = watch("newPin");

  const onSubmit = async (data: PinFormData) => {
    try {
      setIsSubmitting(true);
      console.log("PIN set successfully:", data);

      // TODO: Add your API call here to save the PIN
      // await savePinToBackend(data.newPin);

      // Navigate to next step
      router.push("/(app)/(profile-setup)/set-passcode");
    } catch (error) {
      console.error("Error setting PIN:", error);
      Alert.alert("Error", "Failed to set up PIN. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsSubmitting(false);
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
                  Set up Pin
                </Heading>

                {/* Step Indicator */}
                <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
              </VStack>

              <VStack space="xl" className="flex-1 mt-6">
                {/* New PIN */}
                <FormControl isInvalid={Boolean(errors.newPin)}>
                  <Text className="text-[#414651] text-[14px] font-medium text-center mb-3">
                    New Pin
                  </Text>

                  <Controller
                    control={control}
                    name="newPin"
                    render={({ field: { onChange } }) => (
                      <OtpInput
                        numberOfDigits={4}
                        autoFocus={true}
                        focusColor="#132939"
                        placeholder="0000"
                        type="numeric"
                        secureTextEntry={true}
                        onTextChange={(text) => {
                          onChange(text);
                          if (text.length === 4) {
                            trigger("newPin");
                          }
                        }}
                        onFilled={(text) => {
                          onChange(text);
                          trigger("newPin");
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
                            borderColor: errors.newPin ? "#EF4444" : "#D0D5DD",
                            backgroundColor: "#FFFFFF",
                            marginHorizontal: 6,
                            justifyContent: "center",
                            alignItems: "center",
                          },
                          focusedPinCodeContainerStyle: {
                            borderColor: errors.newPin ? "#EF4444" : "#132939",
                          },
                          pinCodeTextStyle: {
                            color: "#131416",
                          },
                          filledPinCodeContainerStyle: {
                            borderColor: errors.newPin ? "#EF4444" : "#132939",
                          },
                        }}
                      />
                    )}
                  />
                  {errors.newPin && (
                    <FormControlError className="mt-2 w-[70%] mx-auto">
                      <FormControlErrorIcon
                        className="text-red-500"
                        as={AlertCircleIcon}
                      />
                      <FormControlErrorText className="text-red-500 text-[14px]">
                        {errors.newPin?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Confirm PIN */}
                <FormControl isInvalid={Boolean(errors.confirmPin)} className="mt-8">
                  <Text className="text-[#414651] text-[14px] font-medium text-center mb-3">
                    Confirm Pin
                  </Text>

                  <Controller
                    control={control}
                    name="confirmPin"
                    render={({ field: { onChange } }) => (
                      <OtpInput
                        numberOfDigits={4}
                        focusColor="#132939"
                        type="numeric"
                        placeholder="0000"
                        secureTextEntry={true}
                        disabled={!newPinValue || newPinValue.length < 4}
                        onTextChange={(text) => {
                          onChange(text);
                          if (text.length === 4) {
                            trigger("confirmPin");
                          }
                        }}
                        onFilled={(text) => {
                          onChange(text);
                          trigger("confirmPin");
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
                            borderColor: errors.confirmPin
                              ? "#EF4444"
                              : "#D0D5DD",
                            backgroundColor: "#FFFFFF",
                            marginHorizontal: 6,
                            justifyContent: "center",
                            alignItems: "center",
                          },
                          focusedPinCodeContainerStyle: {
                            borderColor: errors.confirmPin
                              ? "#EF4444"
                              : "#132939",
                          },
                          pinCodeTextStyle: {
                            color: "#131416",
                          },
                          filledPinCodeContainerStyle: {
                            borderColor: errors.confirmPin
                              ? "#EF4444"
                              : "#132939",
                          },
                        }}
                      />
                    )}
                  />
                  {errors.confirmPin && (
                    <FormControlError className="mt-2 w-[70%] mx-auto">
                      <FormControlErrorIcon
                        className="text-red-500"
                        as={AlertCircleIcon}
                      />
                      <FormControlErrorText className="text-red-500 text-[14px]">
                        {errors.confirmPin?.message}
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
                  isDisabled={!isValid || isSubmitting}
                  accessibilityLabel="Continue to next step"
                >
                  <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                    {isSubmitting ? "Setting up..." : "Continue"}
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