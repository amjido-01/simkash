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
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { OtpInput } from "react-native-otp-entry";
import { View, Alert } from "react-native";
import * as yup from "yup";
import { 
  Drawer, 
  DrawerBackdrop, 
  DrawerContent, 
  DrawerHeader, 
  DrawerBody, 
  DrawerFooter,
  DrawerCloseButton 
} from "@/components/ui/drawer";
import { Icon, X, AlertCircleIcon } from "lucide-react-native";

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

type PasscodeFormData = yup.InferType<typeof passcodeSchema>;

// Step Indicator Component
const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <View className="flex-row gap-1 mt-2" accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className={`h-1 flex-1 rounded-full ${
            index < currentStep ? "bg-[#132939]" : "bg-[#E4E7EC]"
          }`}
          accessibilityLabel={`Step ${index + 1} ${index < currentStep ? 'completed' : 'not completed'}`}
        />
      ))}
    </View>
  );
};

export default function SetPasscode() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const currentStep = 3;
  const totalSteps = 3;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
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
      console.log("Passcode set successfully:", data);
      
      // TODO: Add your API call here to save the passcode
      // await savePasscodeToBackend(data.newPasscode);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success drawer
      setShowDrawer(true);
    } catch (error) {
      console.error("Error setting passcode:", error);
      Alert.alert(
        "Error",
        "Failed to set up passcode. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetStarted = () => {
    setShowDrawer(false);
    // Navigate to main app
    // router.push("/(app)/(tabs)/home");
  };

  const goBack = () => router.back();

  return (
    <>
      <Box className="bg-white p-6 w-full h-full pt-16">
        {/* Title */}
        <VStack space="sm" className="my-8">
          <Text className="text-[#303237] font-medium text-[14px] leading-[100%]">
            Profile Setup
          </Text>
          <Heading className="text-[18px] font-manropesemibold leading-[28px]">
            Set up Passcode
          </Heading>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </VStack>

        <VStack space="xl" className="flex-1">
          {/* New Passcode */}
          <FormControl isInvalid={Boolean(errors.newPasscode)}>
            <Text className="text-[#414651] text-[14px] font-medium text-center mb-3">
              New Passcode
            </Text>

            <Controller
              control={control}
              name="newPasscode"
              render={({ field: { onChange, value } }) => (
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
                      borderColor: errors.newPasscode ? "#EF4444" : "#E4E7EC",
                      backgroundColor: "#FFFFFF",
                      marginHorizontal: 4,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                    focusedPinCodeContainerStyle: {
                      borderColor: errors.newPasscode ? "#EF4444" : "#132939",
                    },
                    pinCodeTextStyle: {
                      color: "#131416",
                      fontSize: 20,
                      fontWeight: "500",
                    },
                    filledPinCodeContainerStyle: {
                      borderColor: errors.newPasscode ? "#EF4444" : "#132939",
                    },
                  }}
                />
              )}
            />
            {errors.newPasscode && (
              <FormControlError className="mt-2">
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
          <FormControl isInvalid={Boolean(errors.confirmPasscode)} className="mt-8">
            <Text className="text-[#414651] text-[14px] font-medium text-center mb-3">
              Confirm Passcode
            </Text>
            
            <Controller
              control={control}
              name="confirmPasscode"
              render={({ field: { onChange, value } }) => (
                <OtpInput
                  numberOfDigits={6}
                  focusColor="#132939"
                  type="numeric"
                  placeholder="000000"
                  secureTextEntry={true}
                  disabled={!newPasscodeValue || newPasscodeValue.length < 6}
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
                      borderColor: errors.confirmPasscode ? "#EF4444" : "#E4E7EC",
                      backgroundColor: "#FFFFFF",
                      marginHorizontal: 4,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                    focusedPinCodeContainerStyle: {
                      borderColor: errors.confirmPasscode ? "#EF4444" : "#132939",
                    },
                    pinCodeTextStyle: {
                      color: "#131416",
                      fontSize: 20,
                      fontWeight: "500",
                    },
                    filledPinCodeContainerStyle: {
                      borderColor: errors.confirmPasscode ? "#EF4444" : "#132939",
                    },
                  }}
                />
              )}
            />
            {errors.confirmPasscode && (
              <FormControlError className="mt-2">
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
        </VStack>

        {/* Continue Button */}
        <VStack space="sm" className="mt-auto pb-6">
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
      </Box>

      {/* Success Drawer - Following the exact pattern from docs */}
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
      backgroundColor: '#24242440', // Force red background
      opacity: 1,           // Force full opacity
    }}
        />
        <DrawerContent className="pb-8 bottom-2 rounded-t-3xl bg-[#FFFFFF]">
          <DrawerHeader>
            <Heading size="lg">Welcome!</Heading>
            <DrawerCloseButton>
              {/* <Icon as={X} /> */}
            </DrawerCloseButton>
          </DrawerHeader>
          <DrawerBody className="px-6 pt-4 pb-6">
            <VStack space="lg" className="items-center">
              {/* Celebration Image/Icon */}
              <View className="relative items-center justify-center mb-4">
                {/* Decorative confetti elements */}
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
                <View className="w-24 h-24 bg-[#FEF3C7] rounded-full items-center justify-center">
                  <Text className="text-5xl">🎉</Text>
                </View>
              </View>

              {/* Welcome Text */}
              <VStack space="sm" className="items-center">
                <Heading className="text-[24px] font-manropesemibold text-center leading-[32px]">
                  Welcome on Board, Yusuf!
                </Heading>
                <Text className="text-[#667085] text-[14px] text-center leading-[20px] px-4">
                  Your profile is all set. Youre now ready to enjoy everything Simkash has to offer.
                </Text>
              </VStack>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
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
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}