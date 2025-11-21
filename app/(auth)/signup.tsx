import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AlertCircleIcon, Eye, EyeOff } from "lucide-react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address. Try again.")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .matches(/[A-Z]/, "Must contain at least 1 uppercase letter")
    .matches(/\d/, "Must contain at least 1 number")
    .min(8, "Must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Password mismatch. Please re-enter your password.")
    .required("Confirm password is required"),
});

const getPasswordStrength = (password: string) => {
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasLength = password.length >= 8;
  const score = [hasUpper, hasNumber, hasLength].filter(Boolean).length;

  let label = "Weak";
  let color = "#EF4444";
  let width = "33%";

  if (score === 2) {
    label = "Medium";
    color = "#F59E0B";
    width = "66%";
  }
  if (score === 3) {
    label = "Strong";
    color = "#22C55E";
    width = "100%";
  }

  return { score, label, color, width, hasUpper, hasNumber, hasLength };
};

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const passwordValue = watch("password") || "";
  const strength = getPasswordStrength(passwordValue);

  const submitForm = (data: any) => {
    console.log("✔ Valid form:", data);
    router.push("/(auth)/otp-verification");
  };

  return (
    <Box className="bg-white p-6 w-full h-full pt-16">
      <VStack space="sm" className="mt-8">
        <Heading className="text-[18px] font-manropesemibold leading-[28px] text-center my-[32px]">
          Create your Account
        </Heading>
      </VStack>

      <VStack space="xl" className="flex-1">
        {/* EMAIL */}
        <FormControl isInvalid={Boolean(errors.email)}>
          <FormControlLabel>
            <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
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
                className={`w-full rounded-[99px] h-[48px] ${
                  errors.email ? "border-2 border-red-500" : "border border-[#D0D5DD]"
                }`}
              >
                <InputField
                  placeholder="olivia@untitledui.com"
                  className="w-full text-[14px] text-[#717680] h-[48px]"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>
            )}
          />

          {errors.email && (
            <FormControlError>
              <FormControlErrorIcon className="text-red-500" as={AlertCircleIcon} />
              <FormControlErrorText className="text-red-500">
                {errors.email?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        {/* PASSWORD */}
        <FormControl isInvalid={Boolean(errors.password)}>
          <FormControlLabel>
            <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
              Create Password
            </FormControlLabelText>
          </FormControlLabel>

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                size="xl"
                className={`w-full rounded-[99px] h-[48px] ${
                  errors.password ? "border-2 border-red-500" : "border border-[#D0D5DD]"
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
                <InputSlot className="pr-3" onPress={() => setShowPassword(!showPassword)}>
                  <InputIcon as={showPassword ? Eye : EyeOff} />
                </InputSlot>
              </Input>
            )}
          />

          {errors.password && (
            <FormControlError>
              <FormControlErrorIcon className="text-red-500" as={AlertCircleIcon} />
              <FormControlErrorText className="text-red-500">
                {errors.password?.message}
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
                className={`w-full rounded-[99px] h-[48px] ${
                  errors.confirmPassword ? "border-2 border-red-500" : "border border-[#D0D5DD]"
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
                <InputSlot className="pr-3" onPress={() => setShowConfirmPassword(!setShowConfirmPassword)}>
                  <InputIcon as={showConfirmPassword ? Eye : EyeOff} />
                </InputSlot>
              </Input>
            )}
          />

          {errors.confirmPassword && (
            <FormControlError>
              <FormControlErrorIcon className="text-red-500" as={AlertCircleIcon} />
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

            <Box className="w-full h-[4px] bg-[#E4E7EC] rounded-full overflow-hidden">
              <Box
                className="h-full rounded-full transition-all"
                 style={{
                  width: strength.width as any,
                  backgroundColor: strength.color,
                }}
              />
            </Box>

            <VStack space="xs" className="mt-1">
              <HStack space="sm" className="items-center">
                <Box
                  className="w-[10px] h-[10px] rounded-full"
                  style={{
                    backgroundColor: strength.hasUpper ? "#22C55E" : "#E4E7EC",
                  }}
                />
                <Text className="text-[12px] text-[#414651]">At least 1 uppercase.</Text>
              </HStack>

              <HStack space="sm" className="items-center">
                <Box
                  className="w-[10px] h-[10px] rounded-full"
                  style={{
                    backgroundColor: strength.hasNumber ? "#22C55E" : "#E4E7EC",
                  }}
                />
                <Text className="text-[12px] text-[#414651]">At least 1 number.</Text>
              </HStack>

              <HStack space="sm" className="items-center">
                <Box
                  className="w-[10px] h-[10px] rounded-full"
                  style={{
                    backgroundColor: strength.hasLength ? "#22C55E" : "#E4E7EC",
                  }}
                />
                <Text className="text-[12px] text-[#414651]">At least 8 characters.</Text>
              </HStack>
            </VStack>
          </VStack>
        )}
      </VStack>

      {/* BUTTONS */}
      <VStack space="sm" className="mt-auto pb-6">
        <Button
          className="rounded-full bg-[#132939] h-[48px]"
          size="xl"
          onPress={handleSubmit(submitForm)}
        >
          <ButtonText className="text-white text-[14px]">Create Account</ButtonText>
        </Button>

        <HStack space="sm" className="items-center justify-center my-[16px]">
          <Text className="text-[14px] text-[#717680]">Already have an account?</Text>
          <Button onPress={() => router.push("/(auth)/signin")} variant="link">
            <ButtonText className="text-[14px]">Log in</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}