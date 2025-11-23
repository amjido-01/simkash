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
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { AlertCircleIcon, CircleCheck, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import * as yup from "yup";

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .required("Password is required")
    .matches(/[A-Z]/, "Must contain at least 1 uppercase letter")
    .matches(/\d/, "Must contain at least 1 number")
    .min(8, "Must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Password mismatch. Please re-enter your password.")
    .required("Confirm password is required"),
});

const getPasswordStrength = (password: string) => {
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasLength = password.length >= 8;
  const score = [hasUpper, hasNumber, hasLength].filter(Boolean).length;

  let label = "Weak";
  let color = "#EF4444";

  if (score === 2) {
    label = "Medium";
    color = "#F59E0B";
  }
  if (score === 3) {
    label = "Strong";
    color = "#22C55E";
  }

  return { score, label, color, hasUpper, hasNumber, hasLength };
};

export default function CreatePassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { height } = useWindowDimensions();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const passwordValue = watch("newPassword") || "";
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log("Password set successfully:", data);

      // TODO: Add your API call here to save the password
      // await updatePasswordToBackend(data.newPassword);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success drawer
      setShowDrawer(true);
    } catch (error) {
      console.error("Error setting password:", error);
      Alert.alert("Error", "Failed to update password. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    setShowDrawer(false);
    // Navigate to sign in
    router.push("/(auth)/signin");
  };

  return (
    <>
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
                  paddingTop: 64,
                  paddingBottom: 24,
                  minHeight: height - 100,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* Header Section */}
                <VStack space="sm" className="mt-8">
                  <Heading className="text-[18px] font-manropesemibold leading-[28px] mt-[32px]">
                    Create New Password
                  </Heading>
                  <Text className="mb-[51px] text-[#303237] font-medium text-[14px] leading-[100%]">
                    Choose a strong password you'll remember.
                  </Text>
                </VStack>

                {/* Form Section */}
                <VStack space="xl" className="flex-1">
                  {/* NEW PASSWORD */}
                  <FormControl isInvalid={Boolean(errors.newPassword)}>
                    <FormControlLabel>
                      <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                        New Password
                      </FormControlLabelText>
                    </FormControlLabel>

                    <Controller
                      control={control}
                      name="newPassword"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          variant="outline"
                          size="xl"
                          className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
                            errors.newPassword
                              ? "border-2 border-red-500"
                              : "border border-[#D0D5DD]"
                          }`}
                        >
                          <InputField
                            type={showPassword ? "text" : "password"}
                            placeholder="Passwordsimcard1"
                            className="text-[14px] text-[#717680]"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            autoCapitalize="none"
                          />
                          <InputSlot
                            className="pr-3"
                            onPress={() => setShowPassword(!showPassword)}
                          >
                            <InputIcon as={showPassword ? Eye : EyeOff} />
                          </InputSlot>
                        </Input>
                      )}
                    />

                    {errors.newPassword && (
                      <FormControlError>
                        <FormControlErrorIcon
                          className="text-red-500"
                          as={AlertCircleIcon}
                        />
                        <FormControlErrorText className="text-red-500">
                          {errors.newPassword?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>

                  {/* CONFIRM PASSWORD */}
                  <FormControl isInvalid={Boolean(errors.confirmPassword)}>
                    <FormControlLabel>
                      <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                        Confirm Password
                      </FormControlLabelText>
                    </FormControlLabel>

                    <Controller
                      control={control}
                      name="confirmPassword"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          variant="outline"
                          size="xl"
                          className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
                            errors.confirmPassword
                              ? "border-2 border-red-500"
                              : "border border-[#D0D5DD]"
                          }`}
                        >
                          <InputField
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Passwordsimcard1"
                            className="text-[14px] text-[#717680]"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            autoCapitalize="none"
                          />
                          <InputSlot
                            className="pr-3"
                            onPress={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            <InputIcon as={showConfirmPassword ? Eye : EyeOff} />
                          </InputSlot>
                        </Input>
                      )}
                    />

                    {errors.confirmPassword && (
                      <FormControlError>
                        <FormControlErrorIcon
                          className="text-red-500"
                          as={AlertCircleIcon}
                        />
                        <FormControlErrorText className="text-red-500">
                          {errors.confirmPassword?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>

                  {/* PASSWORD STRENGTH METER */}
                  {passwordValue.length > 0 && (
                    <VStack space="xs" className="mt-1">
                      <Text className="text-[12px] text-[#414651]">
                        {strength.label} password. Must contain:
                      </Text>

                      {/* Segmented Progress Bar */}
                      <Box className="flex-row gap-1 w-full h-[4px]">
                        {/* Segment 1 - Weak */}
                        <Box
                          className="flex-1 h-full rounded-full"
                          style={{
                            backgroundColor:
                              strength.score >= 1 ? strength.color : "#E4E7EC",
                          }}
                        />
                        {/* Segment 2 - Medium */}
                        <Box
                          className="flex-1 h-full rounded-full"
                          style={{
                            backgroundColor:
                              strength.score >= 2 ? strength.color : "#E4E7EC",
                          }}
                        />
                        {/* Segment 3 - Strong */}
                        <Box
                          className="flex-1 h-full rounded-full"
                          style={{
                            backgroundColor:
                              strength.score >= 3 ? strength.color : "#E4E7EC",
                          }}
                        />
                      </Box>

                      <VStack space="sm" className="mt-1">
                        <HStack space="sm" className="items-center">
                          <Box
                            className="w-[10px] h-[10px] rounded-full"
                            style={{
                              backgroundColor: strength.hasUpper
                                ? "#22C55E"
                                : "#E4E7EC",
                            }}
                          />
                          <Text className="text-[12px] text-[#414651]">
                            At least 1 uppercase.
                          </Text>
                        </HStack>

                        <HStack space="sm" className="items-center">
                          <Box
                            className="w-[10px] h-[10px] rounded-full"
                            style={{
                              backgroundColor: strength.hasNumber
                                ? "#22C55E"
                                : "#E4E7EC",
                            }}
                          />
                          <Text className="text-[12px] text-[#414651]">
                            At least 1 number.
                          </Text>
                        </HStack>

                        <HStack space="sm" className="items-center">
                          <Box
                            className="w-[10px] h-[10px] rounded-full"
                            style={{
                              backgroundColor: strength.hasLength
                                ? "#22C55E"
                                : "#E4E7EC",
                            }}
                          />
                          <Text className="text-[12px] text-[#414651]">
                            At least 8 characters.
                          </Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  )}

                  {/* Spacer to push buttons to bottom */}
                  <Box className="flex-1 min-h-[24px]" />
                </VStack>

                {/* BUTTONS - Fixed at bottom with proper spacing */}
                <VStack space="sm" className="mt-auto pt-6">
                  <Button
                    className="rounded-full bg-[#132939] h-[48px]"
                    size="xl"
                    onPress={handleSubmit(onSubmit)}
                    isDisabled={isSubmitting}
                  >
                    <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                      {isSubmitting ? "Updating..." : "Update Password"}
                    </ButtonText>
                  </Button>
                </VStack>
              </ScrollView>
            </Box>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Drawer
        className="border-t-0"
        size="md"
        isOpen={showDrawer}
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
          style={{
            maxHeight: height * 0.45,
            borderTopWidth: 0,
            borderColor: "transparent",
            shadowOpacity: 0,
            elevation: 0,
          }}
          className="rounded-t-3xl bg-[#FFFFFF]"
        >
          <DrawerHeader className="pb-2 pt-2">
            <DrawerCloseButton />
          </DrawerHeader>

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
            }}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <DrawerBody className="px-6 py-4">
              <VStack space="md" className="items-center">
                {/* Success Icon */}
                <Box className="w-20 h-20 bg-[#D1FAE5] rounded-full items-center justify-center mb-2">
                  <CircleCheck className="text-[#22C55E]" size={48} />
                </Box>

                {/* Success Text */}
                <VStack space="xs" className="items-center mt-2 mb-6">
                  <Heading className="text-[18px] leading-[24px] font-semibold font-manropesemibold text-center">
                    Password Reset Successfully!
                  </Heading>
                  <Text className="text-[#303237] text-[14px] text-center leading-[20px] font-medium px-4 mt-1">
                    Your password has been updated. You can now log in with your
                    new credentials.
                  </Text>
                </VStack>

                {/* Continue Button */}
                <Button
                  className="rounded-full bg-[#132939] h-[48px] w-full"
                  size="xl"
                  onPress={handleContinue}
                  accessibilityLabel="Continue to sign in"
                >
                  <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                    Continue to Sign In
                  </ButtonText>
                </Button>
              </VStack>
            </DrawerBody>
          </ScrollView>
        </DrawerContent>
      </Drawer>
    </>
  );
}