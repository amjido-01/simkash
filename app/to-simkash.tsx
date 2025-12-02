import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
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
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AlertCircleIcon,
  CheckCircle,
  ChevronLeft,
  Gift,
  Wallet,
} from "lucide-react-native";
import React, { useCallback, useRef, useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { OtpInput } from "react-native-otp-entry";
import * as yup from "yup";
import { router } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { PIN_LENGTH, ACCOUNT_VERIFICATION_DELAY } from "@/constants/menu";

// Validation schema
const schema = yup.object().shape({
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(10, "Phone number must be exactly 10 digits"),
  amount: yup
    .string()
    .required("Please enter amount")
    .matches(/^[0-9]+$/, "Amount must contain only numbers")
    .test("min-amount", "Minimum amount is ₦100", (value) => {
      if (!value) return false;
      return parseInt(value, 10) >= 100;
    })
    .test("max-amount", "Maximum amount is ₦500,000", (value) => {
      if (!value) return false;
      return parseInt(value, 10) <= 500000;
    }),
  narration: yup
    .string()
    .optional()
    .max(200, "Narration must not exceed 200 characters"),
});

type FormData = yup.InferType<typeof schema>;

export default function ToSimkash() {
  // State management
  const insets = useSafeAreaInsets();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpRef = useRef<any>(null);
  const verificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: "onChange",
    defaultValues: {
      phone: "",
      amount: "",
      narration: "",
    },
  });

  const phoneValue = watch("phone");
  const amountValue = watch("amount");
  const narrationValue = watch("narration");

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  // Account verification with debouncing
  const handlePhoneBlur = useCallback(() => {
    // Clear previous timeout
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }

    // Reset verification state
    setAccountName("");
    setPhoneVerified(false);

    if (phoneValue && phoneValue.length === 10) {
      setIsVerifyingAccount(true);

      // Simulate API call with timeout
      verificationTimeoutRef.current = setTimeout(() => {
        // In production, replace with actual API call
        // Example: const response = await verifySimkashAccount(phoneValue);

        try {
          // Simulated successful verification
          setAccountName("Abdullatif Abdulkarim");
          setPhoneVerified(true);
        } catch (error) {
          // Handle verification failure
          Alert.alert(
            "Verification Failed",
            "Unable to verify Simkash account. Please check the phone number and try again."
          );
        } finally {
          setIsVerifyingAccount(false);
        }
      }, ACCOUNT_VERIFICATION_DELAY);
    }
  }, [phoneValue]);

  // Re-verify when phone changes
  useEffect(() => {
    if (phoneValue && phoneValue.length === 10) {
      handlePhoneBlur();
    } else {
      setAccountName("");
      setPhoneVerified(false);
    }
  }, [phoneValue, handlePhoneBlur]);

  // Form submission
  const submitForm = useCallback((data: FormData) => {
    console.log("✔ Valid form:", data);
    setShowDrawer(true);
  }, []);

  // Continue to PIN entry
  const handleContinueToPin = useCallback(() => {
    setShowDrawer(true);
    // Small delay for smooth transition
    setTimeout(() => {
      setShowPinDrawer(true);
    }, 300);
  }, []);

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

      setIsSubmitting(true);

      try {
        // In production, validate PIN with backend
        // const isValid = await validatePin(finalPin);
        // if (!isValid) throw new Error("Invalid PIN");

        console.log("PIN entered:", finalPin);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Success - close drawers and navigate
        setShowPinDrawer(false);
        setShowDrawer(false);
        setPin("");
        reset();

        router.push({
          pathname: "/transaction-success",
          params: {
            amount: amountValue,
            recipient: accountName,
            phoneNumber: phoneValue,
            narration: narrationValue || "",
            commission: "10",
          },
        });
      } catch (error) {
        setPinError("Invalid PIN. Please try again.");
        setPin("");
        if (otpRef.current) {
          otpRef.current.clear();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [pin, amountValue, accountName, phoneValue, narrationValue, reset]
  );

  // Continue button handler
  const handleContinue = useCallback(async () => {
    const valid = await trigger();

    if (!valid) {
      return;
    }

    if (!phoneVerified) {
      Alert.alert(
        "Account Verification Required",
        "Please wait for account verification to complete."
      );
      return;
    }

    if (isVerifyingAccount) {
      Alert.alert(
        "Verification In Progress",
        "Please wait while we verify the account details."
      );
      return;
    }

    handleSubmit(submitForm)();
  }, [trigger, phoneVerified, isVerifyingAccount, handleSubmit, submitForm]);

  // Back navigation handler
  const handleBack = useCallback(() => {
    // Confirm before leaving if form has data
    if (phoneValue || amountValue) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to go back? All entered information will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.push("/(tabs)"),
          },
        ]
      );
    } else {
      router.push("/(tabs)");
    }
  }, [phoneValue, amountValue]);

  // Format amount for display
  const formatAmount = useCallback((amount: string) => {
    if (!amount) return "";
    return parseInt(amount, 10).toLocaleString();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <HStack className="px-4 mb-[40px] mt-2 py-3 items-center justify-center border-b border-[#F3F4F6]">
          <TouchableOpacity
            className="absolute left-4"
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={24} color="#000000" />
          </TouchableOpacity>
          <Text className="text-[16px] font-semibold font-manropesemibold text-[#000000]">
            Simkash to Simkash
          </Text>
        </HStack>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Box className="bg-white px-4 pt-6 pb-24 flex-1">
            <VStack space="lg" className="flex-1">
              {/* RECIPIENT PHONE NUMBER */}
              <FormControl isInvalid={Boolean(errors.phone)}>
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Recipient Phone Number
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      variant="outline"
                      size="xl"
                      className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] min-h-[48px] ${
                        errors.phone
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      }`}
                    >
                      <InputField
                        placeholder="Enter 10-digit phone number"
                        className="text-[14px] text-[#717680] px-4 py-3"
                        value={value}
                        maxLength={10}
                        keyboardType="number-pad"
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9]/g, "");
                          onChange(cleaned);
                        }}
                        onBlur={() => {
                          onBlur();
                          handlePhoneBlur();
                        }}
                        autoCapitalize="none"
                        editable={!isVerifyingAccount}
                      />
                      {isVerifyingAccount && (
                        <View className="absolute right-4 top-3">
                          <ActivityIndicator size="small" color="#132939" />
                        </View>
                      )}
                    </Input>
                  )}
                />

                {errors.phone && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.phone?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* ACCOUNT NAME */}
              {phoneVerified && accountName && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <FormControl>
                    <FormControlLabel>
                      <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                        Account Name
                      </FormControlLabelText>
                    </FormControlLabel>

                    <Input
                      variant="outline"
                      size="xl"
                      isReadOnly={true}
                      className="w-full rounded-[16px] min-h-[48px] border border-[#10B981] bg-[#F0FDF4]"
                    >
                      <InputField
                        value={accountName}
                        className="text-[14px] text-[#000000] font-manropesemibold px-4 py-3"
                        editable={false}
                      />
                      <View className="absolute right-4 top-3">
                        <CheckCircle size={20} color="#10B981" />
                      </View>
                    </Input>
                  </FormControl>
                </Animated.View>
              )}

              {/* AMOUNT */}
              <FormControl isInvalid={Boolean(errors.amount)}>
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Amount
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      variant="outline"
                      size="xl"
                      className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] min-h-[48px] ${
                        errors.amount
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      }`}
                    >
                      <View className="absolute left-4  border-r pr-2 border-gray-200 h-full top[12px] z-10">
                        <Text className="text-[14px] font-manropesemibold text-center mt-3 text-[#000000]">
                          ₦
                        </Text>
                      </View>
                      <InputField
                        placeholder="₦100 - ₦500,000"
                        className="text-[14px] placeholder:ml-6 text-[#717680] pl-6 pr-4 py-3"
                        value={value}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9]/g, "");
                          onChange(cleaned);
                        }}
                        onBlur={onBlur}
                        keyboardType="numeric"
                        autoCapitalize="none"
                      />
                    </Input>
                  )}
                />

                {errors.amount && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.amount?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* NARRATION */}
              <FormControl isInvalid={Boolean(errors.narration)}>
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Narration (Optional)
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="narration"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Textarea
                      size="md"
                      isReadOnly={false}
                      isInvalid={Boolean(errors.narration)}
                      isDisabled={false}
                      className="w-full min-h-[100px] rounded-[16px] border border-[#D0D5DD]"
                    >
                      <TextareaInput
                        placeholder="Enter description (optional)"
                        className="text-[14px] text-[#717680] p-3"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        maxLength={200}
                      />
                    </Textarea>
                  )}
                />

                {errors.narration && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.narration?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            </VStack>
          </Box>
        </ScrollView>

        {/* FIXED BOTTOM BUTTON */}
        <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4"
         style={{ 
          paddingBottom: Math.max(insets.bottom, 16),
          // paddingTop: 16
        }}
        >
          <Button
            className="rounded-full bg-[#132939] h-[48px] w-full"
            size="xl"
            onPress={handleContinue}
          >
            <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
              Continue
            </ButtonText>
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* CONFIRMATION DRAWER */}
      <Drawer
        className="border-t-0"
        isOpen={showDrawer}
        size="lg"
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
          className="rounded-t-[30px] pt-[39px] bg-[#FFFFFF]"
          style={{
            borderTopWidth: 0,
            borderColor: "transparent",
            shadowOpacity: 0,
            elevation: 0,
            // paddingBottom: Platform.OS === "ios" ? 34 : 16,
            paddingBottom: insets.bottom || 16, 
          }}
        >
          <DrawerHeader className="border-b-0 pb2 px-6">
            <VStack>
              <VStack>
                <Heading className="font-manropesemibold text-center text-[18px] text-[#000000] mb-2">
                  Confirm Transaction
                </Heading>
                <Text className="text-center text-[12px] font-manroperegular text-[#6B7280] px-2">
                  Please review details carefully. Transactions are
                  irreversible.
                </Text>
              </VStack>
              <Heading className="text-[28px] font-medium text-center mt-[24px] font-manropebold text-[#000000]">
                ₦{formatAmount(amountValue)}
              </Heading>
            </VStack>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody className="pt-4 px-1 pb2">
            <VStack space="md">
              {/* Transaction Details */}
              <View className="rounded-[20px] border-[#E5E7EF] border px-4 py-2">
                <VStack space="sm">
                  <HStack className="justify-between items-center py-3">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Recipient
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      {accountName}
                    </Text>
                  </HStack>

                  <View className="h-[1px] bg-[#E5E7EB]" />

                  <HStack className="justify-between items-center py-3">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Phone Number
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      {phoneValue}
                    </Text>
                  </HStack>

                  <View className="h-[1px] bg-[#E5E7EB]" />

                  <HStack className="justify-between items-center py-3">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Amount
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      ₦{formatAmount(amountValue)}
                    </Text>
                  </HStack>

                  {narrationValue && (
                    <>
                      <View className="h-[1px] bg-[#E5E7EB]" />
                      <HStack className="justify-between items-start py-3">
                        <Text className="text-[12px] font-manroperegular text-[#303237]">
                          Narration
                        </Text>
                        <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316] text-right flex-1 ml-4">
                          {narrationValue}
                        </Text>
                      </HStack>
                    </>
                  )}
                </VStack>
              </View>

              {/* Wallet & Cashback */}
              <View className="p-4">
                <VStack space="sm">
                  <HStack className="justify-between items-center py-3">
                    <HStack space="sm" className="items-center">
                      <Wallet size={16} color="#FF8D28" />
                      <Text className="text-[12px] font-manroperegular text-[#303237]">
                        Wallet Balance
                      </Text>
                    </HStack>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      ₦50,000
                    </Text>
                  </HStack>

                  <View className="h-[1px] bg-[#E5E7EB]" />

                  <HStack className="justify-between items-center py-3">
                    <HStack space="sm" className="items-center">
                      <Gift size={16} color="#CB30E0" />
                      <Text className="text-[12px] font-manroperegular text-[#303237]">
                        Cashback
                      </Text>
                    </HStack>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#10B981]">
                      +₦500
                    </Text>
                  </HStack>
                </VStack>
              </View>
            </VStack>
          </DrawerBody>

          <DrawerFooter className="px-4 pt-4 pb-0">
            <Button
              className="rounded-full bg-[#132939] h-[48px] w-full"
              size="xl"
              onPress={handleContinueToPin}
              
            >
              <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                Continue
              </ButtonText>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* PIN DRAWER */}
      <Drawer
        className="border-t-0"
        isOpen={showPinDrawer}
        size="lg"
        anchor="bottom"
        onClose={() => {
          if (!isSubmitting) {
            setShowPinDrawer(false);
            setPin("");
            setPinError("");
          }
        }}
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
            <Heading className="font-manropesemibold w-full text-center text-[18px] text-[#000000] mb-2">
              Enter PIN
            </Heading>
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
                    Processing transaction...
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
              {!isSubmitting && (
                <TouchableOpacity
                  onPress={() => {
                    // Implement forgot PIN flow
                    Alert.alert(
                      "Forgot PIN",
                      "Please contact support to reset your PIN.",
                      [{ text: "OK" }]
                    );
                  }}
                  className="mt-6"
                >
                  <Text className="text-[14px] font-manropesemibold text-[#132939]">
                    Forgot PIN?
                  </Text>
                </TouchableOpacity>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}
