import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import React, { useState } from "react";
import { OtpInput } from "react-native-otp-entry";

export default function OtpVerification() {
  const [otp, setOtp] = useState("");

//   const verifyOtp = () => {
//     console.log("OTP:", otp);
//     // Handle verification logic here
//   };

  const goBack = () => router.back();

  return (
    <Box className="bg-white p-8 w-full h-full pt-16">
      {/* Title */}
      <VStack space="sm" className="mt-8">
        <Heading className="text-[18px] font-manropesemibold leading-[28px] text-center my-[32px]">
          OTP Verification
        </Heading>
      </VStack>

      {/* OTP Component */}
      <VStack space="xl" className="flex1 justify-center">
        <OtpInput
          numberOfDigits={6}
          autoFocus={true}
          focusColor="#132939"
          placeholder="000000"
          type="numeric"
          secureTextEntry={false}
          onTextChange={(text) => setOtp(text)}
          onFilled={(text) => {
            setOtp(text);
            console.log("Filled OTP:", text);
          }}
          theme={{
            containerStyle: {
              width: "auto",
              alignSelf: "center",
              marginTop: 20,
            },
            pinCodeContainerStyle: {
              width: 48,
              height: 48,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: "#D0D5DD",
              backgroundColor: "#FFFFFF",
              marginHorizontal: 6,
              justifyContent: "center",
              alignItems: "center",
            },
            focusedPinCodeContainerStyle: {
              borderColor: "#132939",
            },
            pinCodeTextStyle: {
              fontSize: 18,
              fontWeight: "600",
              color: "#131416",
            },
            placeholderTextStyle: {
              color: "#A0A4AB",
            },
            filledPinCodeContainerStyle: {
              borderColor: "#132939",
            },
          }}
        />

        <HStack
          space={"sm"}
          className={
            "items-center justify-center my-[16px] text-[14px] leading-[24px]"
          }
        >
          {" "}
          <Text className="text-[#717680] text-[14px]">
            Didn’t receive code?
          </Text>
          <Button variant="link" className="ml-1">
            <ButtonText className="text-[14px]">Resend</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
