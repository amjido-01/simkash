import React, { useRef, useCallback, useState } from "react";
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
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  Platform,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { PIN_LENGTH } from "@/constants/menu";

interface PinDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<void>;
  title?: string;
  subtitle?: string;
  isSubmitting?: boolean;
  loadingText?: string;
  showForgotPin?: boolean;
  onForgotPin?: () => void;
}

export const PinDrawer: React.FC<PinDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Enter PIN",
  subtitle,
  isSubmitting = false,
  loadingText = "Processing...",
  showForgotPin = true,
  onForgotPin,
}) => {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const otpRef = useRef<any>(null);

  // PIN pad number press
  const handleNumberPress = useCallback(
    (num: string) => {
      if (pin.length < PIN_LENGTH) {
        const newPin = pin + num;
        setPin(newPin);
        setPinError("");

        // Update OTP input
        if (otpRef.current) {
          otpRef.current.setValue(newPin);
        }

        // Auto-submit when complete
        if (newPin.length === PIN_LENGTH) {
          setTimeout(() => handlePinSubmit(newPin), 300);
        }
      }
    },
    [pin]
  );

  // Backspace handler
  const handleBackspace = useCallback(() => {
    if (pin.length > 0) {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      setPinError("");

      if (otpRef.current) {
        otpRef.current.setValue(newPin);
      }
    }
  }, [pin]);

  // PIN change handler
  const handlePinChange = useCallback((text: string) => {
    setPin(text);
    setPinError("");
  }, []);

  // PIN submission
  const handlePinSubmit = useCallback(
    async (pinToSubmit?: string) => {
      const finalPin = pinToSubmit || pin;

      if (finalPin.length !== PIN_LENGTH) {
        setPinError("Please enter your 4-digit PIN");
        return;
      }

      try {
        await onSubmit(finalPin);
        // Reset on success
        setPin("");
        setPinError("");
        if (otpRef.current) {
          otpRef.current.clear();
        }
      } catch (error) {
        setPinError(
          error instanceof Error ? error.message : "Invalid PIN. Please try again."
        );
        setPin("");
        if (otpRef.current) {
          otpRef.current.clear();
        }
      }
    },
    [pin, onSubmit]
  );

  // Handle forgot PIN
  const handleForgotPin = useCallback(() => {
    if (onForgotPin) {
      onForgotPin();
    } else {
      Alert.alert(
        "Forgot PIN",
        "Please contact support to reset your PIN.",
        [{ text: "OK" }]
      );
    }
  }, [onForgotPin]);

  // Handle drawer close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setPin("");
      setPinError("");
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <Drawer
      className="border-t-0"
      isOpen={isOpen}
      size="lg"
      anchor="bottom"
      onClose={handleClose}
    >
      <DrawerBackdrop
        style={{
          backgroundColor: "#24242440",
          opacity: 1,
        }}
      />
      <DrawerContent
        className="rounded-t-[30px] pt-[39px] bg-[#FFFFFF]"
        style={{
          borderTopWidth: 0,
          borderColor: "transparent",
          shadowOpacity: 0,
          elevation: 0,
          paddingBottom: Platform.OS === "ios" ? 34 : 16,
        }}
      >
        <DrawerHeader className="border-b-0 pb-6 px-4">
          <VStack className="items-center w-full">
            <Heading className="font-manropesemibold w-full text-center text-[18px] text-[#000000] mb-2">
              {title}
            </Heading>
            {subtitle && (
              <Text className="text-center text-[12px] font-manroperegular text-[#6B7280] px-2">
                {subtitle}
              </Text>
            )}
          </VStack>
          {!isSubmitting && <DrawerCloseButton />}
        </DrawerHeader>

        <DrawerBody className="pt-2 px-2 pb-8">
          <VStack space="lg" className="items-center">
            {/* OTP Input */}
            <View className="mb-6">
              <OtpInput
                ref={otpRef}
                numberOfDigits={PIN_LENGTH}
                focusColor="transparent"
                type="numeric"
                secureTextEntry={true}
                disabled={isSubmitting}
                autoFocus={false}
                onTextChange={handlePinChange}
                theme={{
                  containerStyle: {
                    width: "auto",
                    alignSelf: "center",
                  },
                  pinCodeContainerStyle: {
                    width: 49,
                    height: 49,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: pinError ? "#EF4444" : "#E5E7EB",
                    backgroundColor: "#FFFFFF",
                    marginHorizontal: 4,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                  focusedPinCodeContainerStyle: {
                    borderColor: pinError ? "#EF4444" : "#132939",
                  },
                  pinCodeTextStyle: {
                    color: "#000000",
                    fontSize: 32,
                    fontWeight: "600",
                  },
                  filledPinCodeContainerStyle: {
                    borderColor: pinError ? "#EF4444" : "#10B981",
                  },
                }}
              />
            </View>

            {/* Error or Loading */}
            {pinError && !isSubmitting && (
              <Text className="text-red-500 text-[12px] font-manroperegular text-center mb-2">
                {pinError}
              </Text>
            )}

            {isSubmitting && (
              <View className="mb-4">
                <ActivityIndicator size="small" color="#132939" />
                <Text className="text-[12px] font-manroperegular text-[#6B7280] text-center mt-2">
                  {loadingText}
                </Text>
              </View>
            )}

            {/* Number Keypad */}
            {!isSubmitting && (
              <View className="w-full max-w-[320px]">
                <VStack space="lg">
                  {/* Row 1-3: Numbers 1-9 */}
                  {[
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9],
                  ].map((row, rowIndex) => (
                    <HStack key={rowIndex} className="justify-between px-4">
                      {row.map((num) => (
                        <TouchableOpacity
                          key={num}
                          onPress={() => handleNumberPress(num.toString())}
                          className="w-[70px] h-[60px] items-center justify-center"
                          activeOpacity={0.6}
                          disabled={pin.length >= PIN_LENGTH}
                        >
                          <Text className="text-[28px] font-manropesemibold text-[#000000]">
                            {num}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </HStack>
                  ))}

                  {/* Row 4: Biometric, 0, Backspace */}
                  <HStack className="justify-between px-4">
                    {/* Biometric placeholder */}
                    <TouchableOpacity
                      onPress={() => {
                        // Implement biometric auth
                        console.log("Biometric auth");
                      }}
                      className="w-[70px] h-[60px] items-center justify-center"
                      activeOpacity={0.6}
                    >
                      <Text className="text-[28px]">👆</Text>
                    </TouchableOpacity>

                    {/* Zero */}
                    <TouchableOpacity
                      onPress={() => handleNumberPress("0")}
                      className="w-[70px] h-[60px] items-center justify-center"
                      activeOpacity={0.6}
                      disabled={pin.length >= PIN_LENGTH}
                    >
                      <Text className="text-[28px] font-manropesemibold text-[#000000]">
                        0
                      </Text>
                    </TouchableOpacity>

                    {/* Backspace */}
                    <TouchableOpacity
                      onPress={handleBackspace}
                      className="w-[70px] h-[60px] items-center justify-center"
                      activeOpacity={0.6}
                      disabled={pin.length === 0}
                    >
                      <Text
                        className={`text-[24px] ${
                          pin.length === 0 ? "opacity-30" : ""
                        }`}
                      >
                        ⌫
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                </VStack>
              </View>
            )}

            {/* Forgot PIN */}
            {!isSubmitting && showForgotPin && (
              <TouchableOpacity onPress={handleForgotPin} className="mt-6">
                <Text className="text-[14px] font-manropesemibold text-[#132939]">
                  Forgot PIN?
                </Text>
              </TouchableOpacity>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};