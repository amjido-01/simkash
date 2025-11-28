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
  ChevronDownIcon,
  ChevronLeft,
  Gift,
  Wallet,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OtpInput } from "react-native-otp-entry";
import * as yup from "yup";
import { router } from "expo-router";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from "@/components/ui/select";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const schema = yup.object().shape({
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(10, "Phone number must be exactly 10 digits"),
  bank: yup.string().required("Please select a bank"),
  amount: yup
    .string()
    .required("Please enter amount")
    .matches(/^[0-9]+$/, "Amount must contain only numbers")
    .test("min-amount", "Minimum amount is ₦100", (value) => {
      if (!value) return false;
      return parseInt(value) >= 100;
    })
    .test("max-amount", "Maximum amount is ₦500,000", (value) => {
      if (!value) return false;
      return parseInt(value) <= 500000;
    }),

  narration: yup
    .string()
    .optional()
    .max(200, "Narration must not exceed 200 characters"),
});

export default function ToBank() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [stage, setStage] = React.useState<"account" | "amount">("account");

  const otpRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const phoneValue = watch("phone");
  const amountValue = watch("amount");
  const narrationValue = watch("narration");


  // Simulate phone number verification
  const handlePhoneBlur = () => {
    if (phoneValue && phoneValue.length >= 10) {
      // Simulate API call
      setTimeout(() => {
        setAccountName("Abdullatif Abdulkarim");
        setPhoneVerified(true);
      }, 500);
    }
  };

  const submitForm = (data: any) => {
    console.log("✔ Valid form:", data);
    setShowDrawer(true);
  };

  const handleContinueToPin = () => {
    setShowPinDrawer(true);
  };

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setPinError("");

      // Update OTP input programmatically
      if (otpRef.current) {
        otpRef.current.setValue(newPin);
      }

      // Auto-submit when 4 digits entered
      if (newPin.length === 4) {
        setTimeout(() => handlePinSubmit(newPin), 300);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      setPinError("");

      // Update OTP input programmatically
      if (otpRef.current) {
        otpRef.current.setValue(newPin);
      }
    }
  };

  const handlePinChange = (text: string) => {
    setPin(text);
    setPinError("");
  };

  const handlePinSubmit = (pinToSubmit?: string) => {
    const finalPin = pinToSubmit || pin;

    if (finalPin.length !== 4) {
      setPinError("Please enter your 4-digit PIN");
      return;
    }

    console.log("PIN entered:", finalPin);
    // Process transaction here

    // Close both drawers on success
    setShowPinDrawer(false);
    setShowDrawer(false);
    setPin("");

    // Show success message or navigate
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
  };

  const handleContinue = () => {
    const bank = watch("bank");
    const account = watch("phone");

    if (bank && account && account.length === 10 && phoneVerified) {
      setStage("amount");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <HStack className="px-4 mb-[40px] py-3 mt-2 items-center justify-center border-b border-[#F3F4F6]">
          <TouchableOpacity
            className="absolute left-4"
            onPress={() => {
              if (stage === "amount") {
                // Go back to account section
                setStage("account");
              } else {
                // Go back to tabs
                router.push("/(tabs)");
              }
            }}
          >
            <ChevronLeft size={24} color="#000000" />
          </TouchableOpacity>

          <Text className="text-[16px] font-semibold font-manropesemibold text-[#000000]">
            Simkash to Bank Account
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
              {stage === "account" && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <VStack space="lg" className="flex-1">
                    {/* RECIPIENT PHONE NUMBER */}
                    <FormControl isInvalid={Boolean(errors.phone)}>
                      <FormControlLabel>
                        <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                          Recipient Account Number
                        </FormControlLabelText>
                      </FormControlLabel>

                      <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <Input
                            variant="outline"
                            size="xl"
                            className={`w-full p-2 rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
                              errors.phone
                                ? "border-2 border-red-500"
                                : "border border-[#D0D5DD]"
                            }`}
                          >
                            <InputField
                              placeholder="Enter recipient bank number"
                              className="w-full text-[14px] text-[#717680] h-[48px]"
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
                            />
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

                    <FormControl isInvalid={Boolean(errors.bank)}>
                      <FormControlLabel>
                        <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                          Bank
                        </FormControlLabelText>
                      </FormControlLabel>

                      <Controller
                        control={control}
                        name="bank"
                        render={({ field: { onChange, value } }) => (
                          <Select
                            onValueChange={onChange}
                            selectedValue={value}
                          >
                            <SelectTrigger
                              variant="outline"
                              size="xl"
                              className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
                                errors.bank
                                  ? "border-2 border-red-500"
                                  : "border border-[#D0D5DD]"
                              }`}
                            >
                              <SelectInput
                                placeholder="Select"
                                className="text-[14px] text-[#717680] flex-1"
                              />
                              <SelectIcon
                                as={ChevronDownIcon}
                                className="ml-auto mr-3"
                              />
                            </SelectTrigger>
                            <SelectPortal>
                              <SelectBackdrop />
                              <SelectContent className="z-99 border-2">
                                <SelectDragIndicatorWrapper>
                                  <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                <SelectItem label="Opay" value="opay" />
                                <SelectItem
                                  label="Moniepoint"
                                  value="moniepoint"
                                />
                              </SelectContent>
                            </SelectPortal>
                          </Select>
                        )}
                      />

                      {errors.bank && (
                        <FormControlError>
                          <FormControlErrorIcon
                            className="text-red-500"
                            as={AlertCircleIcon}
                          />
                          <FormControlErrorText className="text-red-500">
                            {errors.bank?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>

                    {/* ACCOUNT NAME */}
                    {phoneVerified && accountName && (
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
                          className="w-full p-2 rounded-[16px] h-[48px] border border-[#D0D5DD]"
                        >
                          <InputField
                            value={accountName}
                            className="w-full text-[14px] text-[#000000] h-[48px]"
                            editable={false}
                          />
                          <View className="absolute right-4 top-3">
                            <CheckCircle size={20} color="#10B981" />
                          </View>
                        </Input>
                      </FormControl>
                    )}
                  </VStack>
                </Animated.View>
              )}

              {stage === "amount" && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <VStack space="lg" className="flex-1">
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
                            className={`w-full p-2 rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
                              errors.amount
                                ? "border-2 border-red-500"
                                : "border border-[#D0D5DD]"
                            }`}
                          >
                            <View className="absolute left-4 top-[12px] z-10">
                              <Text className="text-[14px] font-manropesemibold text-[#000000]">
                                ₦
                              </Text>
                            </View>
                            <InputField
                              placeholder="₦100 - ₦500,000"
                              className="w-full text-[14px] text-[#717680] h-[48px] pl-6"
                              value={value}
                              onChangeText={onChange}
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
                    <FormControl>
                      <FormControlLabel>
                        <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                          Narration
                        </FormControlLabelText>
                      </FormControlLabel>

                      <Controller
                        control={control}
                        name="narration"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <Textarea
                            size="md"
                            isReadOnly={false}
                            isInvalid={false}
                            isDisabled={false}
                            className="w-full p-2 min-h-[80px] rounded-[16px] border border-[#D0D5DD]"
                          >
                            <TextareaInput
                              placeholder="Enter description"
                              className="text-[14px] text-[#717680]"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                            />
                          </Textarea>
                        )}
                      />
                    </FormControl>
                  </VStack>
                </Animated.View>
              )}
            </VStack>
          </Box>
        </ScrollView>

        {/* FIXED BOTTOM BUTTON */}
        <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4 border-t border-[#F3F4F6]">
          <Button
            className="rounded-full bg-[#132939] h-[48px] w-full"
            size="xl"
            onPress={handleContinue}
            // onPress={handleSubmit(submitForm)}
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
          className="rounded-t-[30px] pt-[39px] bg-[#FFFFFF]"
          style={{
            borderTopWidth: 0,
            borderColor: "transparent",
            shadowOpacity: 0,
            elevation: 0,
            paddingBottom: Platform.OS === "ios" ? 34 : 16,
          }}
        >
          <DrawerHeader className="border-b-0 pb-2 px-6">
            <VStack>
              <VStack>
                <Heading className="font-manropesemibold text-center text-[18px] text-[#000000] mb-2">
                  Confirm Transaction
                </Heading>
                <Text className="text-center text-[12px] font-manroperegular text-[#6B7280] px-4">
                  Please review details carefully, transactions once done are
                  irreversible.
                </Text>
              </VStack>
              <Heading className="text-[28px] font-medium text-center mt-[24px] font-manropebold text-[#000000]">
                ₦{amountValue}
              </Heading>
            </VStack>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody className="pt-4 px-1 pb-6 border2">
            <VStack space="md">
              {/* Transaction Details */}
              <View className="rounded-[20px] border-[#E5E7EF] border p-4">
                <VStack space="sm">
                  <HStack className="justify-between items-center py-4">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Recipient
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      {accountName || phoneValue}
                    </Text>
                  </HStack>

                  <View className="h-[1px] bg-[#E5E7EB]" />

                  <HStack className="justify-between items-center py-2">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Phone Number
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      {phoneValue}
                    </Text>
                  </HStack>

                  <View className="h-[1px] bg-[#E5E7EB]" />

                  <HStack className="justify-between items-center py-2">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Amount
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      ₦{amountValue}
                    </Text>
                  </HStack>

                  {narrationValue && (
                    <>
                      <View className="h-[1px] bg-[#E5E7EB]" />
                      <HStack className="justify-between items-start py-2">
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
              <View className="rounded-[20px] border-[#E5E7EF] p-4">
                <VStack space="sm">
                  <HStack className="justify-between items-center py-4">
                    <HStack space="sm">
                      <Wallet className="h-[4px] w-[4px]" color="#FF8D28" />
                      <Text className="text-[12px] font-manroperegular text-[#303237]">
                        Wallet Balance
                      </Text>
                    </HStack>

                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      ₦ 50,000
                    </Text>
                  </HStack>

                  <View className="h-[1px] bg-[#E5E7EB]" />

                  <HStack className="justify-between items-center py-2">
                    <HStack space="sm">
                      <Gift className="h-[4px] w-[4px]" color="#CB30E0" />
                      <Text className="text-[12px] font-manroperegular text-[#303237]">
                        Cashback
                      </Text>
                    </HStack>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      ₦ 500
                    </Text>
                  </HStack>
                </VStack>
              </View>
            </VStack>
          </DrawerBody>

          <DrawerFooter className="px4 pt4 pb-4">
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
          setShowPinDrawer(false);
          setPin("");
          setPinError("");
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
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody className="pt-2 px-2 pb-8">
            <VStack space="lg" className="items-center">
              {/* OTP Input Library */}
              <View className="mb-6">
                <OtpInput
                  ref={otpRef}
                  numberOfDigits={4}
                  focusColor="transparent"
                  type="numeric"
                  secureTextEntry={true}
                  disabled={false}
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
                      borderColor: "#E5E7EB",
                      backgroundColor: "#FFFFFF",
                      marginHorizontal: 4,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                    focusedPinCodeContainerStyle: {
                      borderColor: "#E5E7EB",
                    },
                    pinCodeTextStyle: {
                      color: "#000000",
                      fontSize: 32,
                      fontWeight: "600",
                    },
                    filledPinCodeContainerStyle: {
                      borderColor: "#E5E7EB",
                    },
                  }}
                />
              </View>

              {/* Error Message */}
              {pinError && (
                <Text className="text-red-500 text-[12px] font-manroperegular text-center mb-2">
                  {pinError}
                </Text>
              )}

              {/* Number Keypad */}
              <View className="w-full max-w[320px]">
                <VStack space="lg">
                  {/* Row 1: 1, 2, 3 */}
                  <HStack className="justify-between px-4">
                    {[1, 2, 3].map((num) => (
                      <TouchableOpacity
                        key={num}
                        onPress={() => handleNumberPress(num.toString())}
                        className="w-[70px] h-[60px] items-center justify-center"
                        activeOpacity={0.6}
                      >
                        <Text className="text-[28px] font-manropesemibold text-[#000000]">
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </HStack>

                  {/* Row 2: 4, 5, 6 */}
                  <HStack className="justify-between px-4">
                    {[4, 5, 6].map((num) => (
                      <TouchableOpacity
                        key={num}
                        onPress={() => handleNumberPress(num.toString())}
                        className="w-[70px] h-[60px] items-center justify-center"
                        activeOpacity={0.6}
                      >
                        <Text className="text-[28px] font-manropesemibold text-[#000000]">
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </HStack>

                  {/* Row 3: 7, 8, 9 */}
                  <HStack className="justify-between px-4">
                    {[7, 8, 9].map((num) => (
                      <TouchableOpacity
                        key={num}
                        onPress={() => handleNumberPress(num.toString())}
                        className="w-[70px] h-[60px] items-center justify-center"
                        activeOpacity={0.6}
                      >
                        <Text className="text-[28px] font-manropesemibold text-[#000000]">
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </HStack>

                  {/* Row 4: fingerprint, 0, backspace */}
                  <HStack className="justify-between px-4">
                    {/* Fingerprint/Biometric */}
                    <TouchableOpacity
                      onPress={() => console.log("Biometric auth")}
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
                    >
                      <Text className="text-[24px]">⌫</Text>
                    </TouchableOpacity>
                  </HStack>
                </VStack>
              </View>

              {/* Forgot PIN */}
              <TouchableOpacity
                onPress={() => console.log("Forgot PIN")}
                className="mt-6"
              >
                <Text className="text-[14px] font-manropesemibold text-[#132939]">
                  Forgot PIN?
                </Text>
              </TouchableOpacity>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}
