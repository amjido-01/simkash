import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const goToLoginPage = () => {
    router.push("/(auth)/otp-verification");
  };

  return (
    <Box className="bg-white p-8 w-full h-full pt-16">
      {/* Top Section */}
      <VStack space="sm" className="mt-8">
        <Heading className="text-[18px] font-manropesemibold leading-[28px] text-center my-[32px]">
          Create your Account
        </Heading>
      </VStack>

      {/* Form Section */}
      <VStack space="xl" className="flex-1">
        {/* Email */}
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
              Email
            </FormControlLabelText>
          </FormControlLabel>
          <Input
            variant="outline"
            size="xl"
            className="w-full rounded-[99px] bg-white h-[48px]"
          >
            <InputField
              type="text"
              className="text-[14px] text-[#717680]"
              placeholder="olivia@untitledui.com"
            />
          </Input>
        </FormControl>

        {/* Password */}
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
              Create Password
            </FormControlLabelText>
          </FormControlLabel>
          <Input
            variant="outline"
            size="xl"
            className="w-full rounded-[99px] bg-white h-[48px]"
          >
            <InputField
              type={showPassword ? "text" : "password"}
              className="text-[14px] text-[#717680]"
              placeholder="Passwordsimcard1"
            />
            <InputSlot className="pr-3" onPress={togglePassword}>
              <InputIcon as={showPassword ? Eye : EyeOff} />
            </InputSlot>
          </Input>
        </FormControl>

        {/* Confirm Password */}
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
              Confirm Password
            </FormControlLabelText>
          </FormControlLabel>
          <Input
            variant="outline"
            size="xl"
            className="w-full rounded-[99px] bg-white h-[48px]"
          >
            <InputField
                type={showConfirmPassword ? "text" : "password"}
                className="text-[14px] text-[#717680]"
              placeholder="Passwordsimcard1"
            />
            <InputSlot className="pr-3" onPress={toggleConfirmPassword}>
               <InputIcon as={showConfirmPassword ? Eye : EyeOff} />
            </InputSlot>
          </Input>
        </FormControl>
      </VStack>

      {/* Bottom Buttons (always at bottom) */}
      <VStack space="sm" className="mt-auto pb-6">
        <Button className="rounded-full bg-[#132939] h-[48px]" size="xl">
          <ButtonText className="text-white text-[14px]">
            Create Account
          </ButtonText>
        </Button>

        <HStack
          space={"sm"}
          className={
            "items-center justify-center my-[16px] text-[14px] leading-[24px]"
          }
        >
          {" "}
          <Text>Already have an account?</Text>{" "}
          <Button onPress={goToLoginPage} variant={"link"}>
            {" "}
            <ButtonText>Log in</ButtonText>{" "}
          </Button>{" "}
        </HStack>
      </VStack>
    </Box>
  );
}
