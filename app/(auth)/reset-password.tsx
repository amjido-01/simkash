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
import { AlertCircleIcon } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import * as yup from "yup";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address. Try again.")
    .required("Email is required"),
});

export default function ResetPassword() {

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
    router.push("/(auth)/create-password");
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
              Reset Your Password
            </Heading>
            <Text className="mb-[51px] text-[#303237] font-medium text-[14px] leading-[100%]">
              Enter the email linked to your account and we’ll send you a code to reset your password.
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
          </VStack>

          {/* BUTTONS */}
          <VStack space="sm" className="px6 pb6">
            <Button
              className="rounded-full bg-[#132939] h-[48px]"
              size="xl"
              onPress={handleSubmit(submitForm)}
            >
              <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                Send Reset Code
              </ButtonText>
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
