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
import { AlertCircleIcon, Eye, EyeOff, Loader2 } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import * as yup from "yup";
import { userStorage } from "@/utils/userStorage";
import { authEndpoints } from "../api/endpoints";
import { Icon } from "@/components/ui/icon";
import { CustomAlert } from "@/components/custom-alert";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address. Try again.")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedUserInfo, setSavedUserInfo] = useState<{
    email: string | null;
    name: string | null;
    phone: string | null;
  }>({ email: null, name: null, phone: null });
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "warning" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  // Load saved user info on mount
  useEffect(() => {
    loadSavedUserInfo();
  }, []);

  const loadSavedUserInfo = async () => {
    try {
      const userInfo = await userStorage.getUserInfo();

      if (userInfo.email && userInfo.shouldRemember) {
        setSavedUserInfo({
          email: userInfo.email,
          name: userInfo.name,
          phone: userInfo.phone,
        });
        setValue("email", userInfo.email);
      } else {
        setShowEmailInput(true);
      }
    } catch (error) {
      console.error("Error loading saved user info:", error);
      setShowEmailInput(true);
    }
  };

  const submitForm = async (data: any) => {
    try {
      setIsLoading(true);

      let response;

      if (savedUserInfo.email && !showEmailInput) {
        // Quick login with saved email
        response = await authEndpoints.quickLogin(data.password);
      } else {
        // Full login with email

        if (!data.email) {
          throw new Error("Please enter your email");
        }

        response = await authEndpoints.login(data.email, data.password);
      }


      // setAlert({
      //   show: true,
      //   type: "success",
      //   message: "Login successful! Redirecting...",
      // });

      await new Promise((res) => setTimeout(res, 800));

      // Navigate to dashboard
      router.replace("/(tabs)");
      // setTimeout(() => {
      //   router.replace("/(tabs)");
      // }, 1000);
    } catch (error: any) {
      console.error("❌ Login failed:", error);

      let errorMessage = "Login failed. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setAlert({
        show: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchAccount = () => {
    setShowEmailInput(true);
    setSavedUserInfo({ email: null, name: null, phone: null });
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
            <Heading className="text-[20px] font-manropesemibold leading-[28px] mt-[32px]">
              Welcome Back
            </Heading>
            <Text className="mb-[51px] text-[#303237] font-medium text-[16px] leading-[100%]">
              Your account is just a step away.
            </Text>
          </VStack>

          <VStack space="xl" className="flex-1">
            {alert.show && (
              <CustomAlert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
              />
            )}

            {/* EMAIL */}
            {showEmailInput && (
              <FormControl isInvalid={Boolean(errors.email)}>
                <FormControlLabel>
                  <FormControlLabelText className="text-[14px] text-[#414651] mb-[6px]">
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
                      className={`w-full p-2 rounded-[99px] focus:border-2 focus:border-[#D0D5DD] min-h-[48px] ${
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
            )}

            {/* PASSWORD */}
            <FormControl isInvalid={Boolean(errors.password)}>
              <FormControlLabel>
                <FormControlLabelText className="text-[14px] text-[#414651] mb-[6px]">
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
                    className={`w-full p-2 rounded-[99px] min-h-[48px] focus:border-2 focus:border-[#D0D5DD] ${
                      errors.password
                        ? "border-2 border-red-500"
                        : "border border-[#D0D5DD]"
                    }`}
                  >
                    <InputField
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter 6-Digit Password"
                      className="text-[14px] text-[#717680]"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      maxLength={10}
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

            {/* SWITCH ACCOUNT BUTTON */}
            {savedUserInfo.email && !showEmailInput && (
              <HStack className="justify-start mt-2">
                <Button
                  variant="link"
                  onPress={handleSwitchAccount}
                  className="self-start -mt-2"
                >
                  <ButtonText className="text-[14px] text-[#132939] underline underline-offset-8">
                    Switch account
                  </ButtonText>
                </Button>
              </HStack>
            )}

            {/* FORGOT PASSWORD */}
            <HStack className="justify-end">
              <Button
                onPress={() => router.push("/profile-setup")}
                variant="link"
                className="p-0"
              >
                <ButtonText className="text-[14px] font-manroperegular text-[#132939] font-bold">
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
              isDisabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon
                    as={Loader2}
                    className="text-typography-white mr-2 animate-spin"
                    size="sm"
                    stroke="white"
                  />
                  <ButtonText className="text-white text-[14px]">
                    Signing in...
                  </ButtonText>
                </>
              ) : (
                <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                  Sign In
                </ButtonText>
              )}
            </Button>

            <HStack
              space="sm"
              className="items-center justify-center my-[16px]"
            >
              <Text className="text-[14px] font-medium text-[#000000]">
                Don&apos;t have an account?
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
