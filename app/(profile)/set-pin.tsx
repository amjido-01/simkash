// app/(onboarding)/set-pin.tsx
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
import { AlertCircleIcon, ArrowLeft, Loader2 } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";
import { userStorage } from "@/utils/userStorage";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { router, useLocalSearchParams } from "expo-router";
import { StepIndicator } from "@/components/step-indicator";
import * as yup from "yup";
import { authEndpoints } from "@/app/api/endpoints";
import { Icon } from "@/components/ui/icon";
import { useCountries } from "@/hooks/use-countries";
import { CustomAlert } from "@/components/custom-alert";

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

type Gender = "male" | "female" | "other";

interface ProfileSetupPayload {
  fullname: string;
  phone: string;
  gender: Gender;
  country: string;
  pin: string;
}

interface AlertState {
  show: boolean;
  type: "success" | "error" | "info";
  message: string;
}

export default function SetPin() {
  const params = useLocalSearchParams();

  // Get all data from previous screen
  const profileData = {
    email: params.email as string,
    fullName: params.fullName as string,
    phoneNumber: params.phoneNumber as string,
    gender: params.gender as string,
    dateOfBirth: params.dateOfBirth as string,
    country: params.country as string,
  };

  console.log("🟢 SetPin - Received data:", JSON.stringify(profileData));

  const isSubmittingRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const isMountedRef = useRef(true);

  const { countriesForPicker } = useCountries();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });
  const { height } = useWindowDimensions();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  const onSubmit = async (formData: PinFormData) => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current) {
      console.log("⚠️ Already submitting, ignoring duplicate call");
      return;
    }

    isSubmittingRef.current = true;

    try {
      setIsSubmitting(true);
      console.log("Submitting profile setup with PIN");

      // Validate required data
      if (
        !profileData.fullName ||
        !profileData.phoneNumber ||
        !profileData.gender ||
        !profileData.country
      ) {
        throw new Error(
          "Missing required profile information. Please go back and complete all fields."
        );
      }

      // Clean phone number
      const cleanPhone = profileData.phoneNumber.replace(/-/g, "");

      // Get country label
      const countryObj = countriesForPicker.find(
        (c) => c.value === profileData.country
      );

      const countryLabel = countryObj?.label || "";
      const cleanCountry = countryLabel
        .replace(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu, "")
        .trim();

      // Prepare payload
      const payload: ProfileSetupPayload = {
        fullname: profileData.fullName,
        phone: cleanPhone,
        gender: profileData.gender as Gender,
        country: cleanCountry,
        pin: formData.newPin,
      };

      console.log("Payload being sent:", payload);

      // Call API
      const message = await authEndpoints.profileSetup(payload);

      if (!isMountedRef.current) {
        console.log("⚠️ Component unmounted, stopping");
        return;
      }

      console.log("✅ Profile setup successful:", message);

      // Save user info
      await userStorage.saveUserInfo(
        profileData.email || "",
        profileData.fullName,
        cleanPhone
      );

      // Show success drawer
      setShowDrawer(true);
    } catch (error: any) {
      if (!isMountedRef.current) return;

      console.error("❌ Profile setup failed:", error);

      let errorMessage = "Failed to set up profile. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.responseMessage) {
        errorMessage = error.responseMessage;
      }

      setAlert({
        show: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
      // Reset after delay
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 1000);
    }
  };

 const handleGetStarted = () => {
  if (isNavigatingRef.current) {
    console.log("⚠️ Already navigating");
    return;
  }

  isNavigatingRef.current = true;
  console.log("🟢 Get Started clicked");

  setShowDrawer(false);

  // Wait for drawer animation to complete
  setTimeout(() => {
    if (!isMountedRef.current) {
      console.log("⚠️ Component unmounted");
      return;
    }

    try {
      console.log("🟢 Navigating to tabs...");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("❌ Navigation error:", error);
      // Fallback
      router.replace("/");
    } finally {
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 500);
    }
  }, 400);
};

  const handleBack = () => {
    console.log("🔙 Going back to basic info");
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
                paddingBottom: 24,
                minHeight: height - 100,
              }}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              {/* Back Button */}
              <Button
                variant="link"
                className="absolute left-6 top-6 z-20 flex-row items-center"
                onPress={handleBack}
              >
                <Icon
                  as={ArrowLeft}
                  className="text-[#132939]"
                  size="sm"
                  stroke="#132939"
                />
                <ButtonText className="text-[#132939] text-[14px] ml-1">
                  Back
                </ButtonText>
              </Button>

              {/* Title Section */}
              <VStack space="sm" className="mt-20">
                <Text className="text-[#303237] font-medium text-[14px] leading-[100%]">
                  Profile Setup
                </Text>
                <Heading className="text-[18px] font-manropesemibold leading-[28px]">
                  Set up Pin
                </Heading>
              </VStack>

              <StepIndicator currentStep={2} totalSteps={2} />

              <VStack space="xl" className="flex-1 mt-6">
                {alert.show && (
                  <CustomAlert
                    type={alert.type}
                    message={alert.message}
                    onClose={() =>
                      setAlert((prev) => ({ ...prev, show: false }))
                    }
                  />
                )}

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
                <FormControl
                  isInvalid={Boolean(errors.confirmPin)}
                  className="mt-8"
                >
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

                {/* Spacer */}
                <Box className="flex-1 min-h-[24px]" />
              </VStack>

              {/* Continue Button */}
              <VStack space="sm" className="mt-auto pt-6">
                <Button
                  className="rounded-full bg-[#132939] h-[48px]"
                  size="xl"
                  onPress={handleSubmit(onSubmit)}
                  isDisabled={isSubmitting || !isValid}
                  accessibilityLabel="Continue to next step"
                >
                  {isSubmitting ? (
                    <>
                      <Icon
                        as={Loader2}
                        className="text-typography-white mr-2 animate-spin"
                        size="sm"
                        stroke="white"
                      />
                      <ButtonText className="text-white text-[14px]">
                        Setting up...
                      </ButtonText>
                    </>
                  ) : (
                    <ButtonText className="text-white text-[14px]">
                      Continue
                    </ButtonText>
                  )}
                </Button>
              </VStack>
            </ScrollView>
          </Box>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Success Drawer */}
      <Drawer
        className="border-t-0"
        isOpen={showDrawer}
        size="md"
        anchor="bottom"
        onClose={() => setShowDrawer(false)}
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
              <VStack space="xs" className="items-center mt-2">
                <Heading className="text-[18px] leading-[24px] font-semibold font-manropesemibold text-center">
                  Welcome on Board
                  {profileData.fullName
                    ? `, ${profileData.fullName.split(" ")[0]}`
                    : ""}
                  !
                </Heading>
                <Text className="text-[#303237] text-[14px] text-center leading-[20px] font-medium px-4 mt-1">
                  Your profile is all set. You&apos;re now ready to enjoy
                  everything Simkash has to offer.
                </Text>
              </VStack>

              <Button
                className="rounded-full bg-[#132939] mt-10 h-[48px] w-full"
                size="xl"
                onPress={handleGetStarted}
                isDisabled={isNavigatingRef.current}
                accessibilityLabel="Get started with Simkash"
              >
                <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                  Get Started
                </ButtonText>
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}