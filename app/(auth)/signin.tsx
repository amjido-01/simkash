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
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { AlertCircleIcon, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import * as yup from "yup";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address. Try again.")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const submitForm = (data: any) => {
    console.log("✔ Valid form:", data);
    // Navigate to dashboard or home
    router.push("/(app)/dashboard");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <Box className="bg-white p-6 w-full h-full pt-16 flex1">
          <VStack space="sm" className="mt-8">
            <Heading className="text-[18px] font-manropesemibold leading-[28px] mt-[32px]">
              Welcome Back
            </Heading>
            <Text className="mb-[51px] text-[#303237] font-medium text-[14px] leading-[100%]">
              Your account is just a step away.
            </Text>
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
                    className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
                      errors.email
                        ? "border-2 border-red-500"
                        : "border border-[#D0D5DD]"
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
                  <FormControlErrorIcon
                    className="text-red-500"
                    as={AlertCircleIcon}
                  />
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
                  Password
                </FormControlLabelText>
              </FormControlLabel>

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant="outline"
                    size="xl"
                    className={`w-full rounded-[99px] h-[48px] focus:border-2 focus:border-[#D0D5DD] ${
                      errors.password
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

              {errors.password && (
                <FormControlError>
                  <FormControlErrorIcon
                    className="text-red-500"
                    as={AlertCircleIcon}
                  />
                  <FormControlErrorText className="text-red-500">
                    {errors.password?.message}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* FORGOT PASSWORD */}
            <HStack className="justify-end">
              <Button
                onPress={() => router.push("/profile-setup")}
                variant="link"
                className="p-0"
              >
                <ButtonText className="text-[12px] font-manroperegular text-[#132939] font-bold">
                  Forgot Password?
                </ButtonText>
              </Button>
            </HStack>
          </VStack>

          {/* BUTTONS */}
          <VStack space="sm" className="px6 pb6">
            <Button
              className="rounded-full bg-[#132939] h-[48px]"
              size="xl"
              onPress={handleSubmit(submitForm)}
            >
              <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                Sign In
              </ButtonText>
            </Button>

            <HStack
              space="sm"
              className="items-center justify-center my-[16px]"
            >
              <Text className="text-[14px] font-medium text-[#000000]">
                Dont have an account?
              </Text>
              <Button
                onPress={() => router.push("/(auth)/signup")}
                variant="link"
              >
                <ButtonText className="text-[14px]">Sign up</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
