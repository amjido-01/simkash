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
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

const schema = yup.object().shape({
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .min(10, "Phone number must be at least 10 digits")
    .max(11, "Phone number must not exceed 11 digits"),
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

export default function ToSimkash() {
  const [showDrawer, setShowDrawer] = useState(false);
    const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
 const [pin, setPin] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState("");

  // Create refs for each PIN input
  const pinRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];
  
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

  const handlePinChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setPinError("");

    // Auto-focus next input
    if (value && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyPress = (index: number, key: string) => {
    // Handle backspace
    if (key === "Backspace" && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

    const handlePinSubmit = () => {
    const pinString = pin.join("");
    
    if (pinString.length !== 4) {
      setPinError("Please enter your 4-digit PIN");
      return;
    }

    console.log("PIN entered:", pinString);
    // Process transaction here
    
    // Close both drawers on success
    setShowPinDrawer(false);
    setShowDrawer(false);
    setPin(["", "", "", ""]);
    
    // Show success message or navigate
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <HStack className="px-4 mb-[40px] py-3 items-center justify-center border-b border-[#F3F4F6]">
          <TouchableOpacity
            className="absolute left-4"
            onPress={() => console.log("Go back")}
          >
            <ChevronLeft size={24} color="#000000" />
          </TouchableOpacity>
          <Text className="text-[16px] font-manropesemibold text-[#000000]">
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
                      className={`w-full p-2 rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
                        errors.phone
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      }`}
                    >
                      <InputField
                        placeholder="Enter recipient simkash number"
                        className="w-full text-[14px] text-[#717680] h-[48px]"
                        value={value}
                        onChangeText={onChange}
                        onBlur={() => {
                          onBlur();
                          handlePhoneBlur();
                        }}
                        keyboardType="phone-pad"
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

              {/* ACCOUNT NAME (shown after phone verification) */}
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
                    className="w-full p-2 rounded-[99px] h-[48px] border border-[#D0D5DD]"
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
          </Box>
        </ScrollView>

        {/* FIXED BOTTOM BUTTON */}
        <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4 border-t border-[#F3F4F6]">
          <Button
            className="rounded-full bg-[#132939] h-[48px] w-full"
            size="xl"
            onPress={handleSubmit(submitForm)}
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

          <DrawerBody className="pt-4 px-1 pb-6">
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

          <DrawerFooter className="px-6 pt-4 pb-2 border-t-0">
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
        size="md"
        anchor="bottom"
        onClose={() => {
          setShowPinDrawer(false);
          setPin(["", "", "", ""]);
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
                Enter Transaction PIN
              </Heading>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody className="pt-4 px-6 pb-6">
            <VStack space="lg" className="items-center">
              {/* PIN Input Boxes */}
              <HStack space="md" className="justify-center">
                {[0, 1, 2, 3].map((index) => (
                  <TextInput
                    key={index}
                    ref={pinRefs[index]}
                    value={pin[index]}
                    onChangeText={(value) => handlePinChange(index, value)}
                    onKeyPress={({ nativeEvent: { key } }) =>
                      handlePinKeyPress(index, key)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    secureTextEntry
                    selectTextOnFocus
                    style={{
                      width: 56,
                      height: 56,
                      borderWidth: 2,
                      borderColor: pin[index] ? "#132939" : "#D0D5DD",
                      borderRadius: 12,
                      fontSize: 24,
                      textAlign: "center",
                      fontWeight: "600",
                      backgroundColor: "#F9FAFB",
                    }}
                  />
                ))}
              </HStack>

              {/* Error Message */}
              {pinError && (
                <Text className="text-red-500 text-[12px] font-manroperegular text-center">
                  {pinError}
                </Text>
              )}

              {/* Forgot PIN */}
              <TouchableOpacity onPress={() => console.log("Forgot PIN")}>
                <Text className="text-[14px] font-manropesemibold text-[#132939]">
                  Forgot PIN?
                </Text>
              </TouchableOpacity>
            </VStack>
          </DrawerBody>

          <DrawerFooter className="px-6 pt-4 pb-2 border-t-0">
            <Button
              className="rounded-full bg-[#132939] h-[48px] w-full"
              size="xl"
              onPress={handlePinSubmit}
            >
              <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                Confirm
              </ButtonText>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}
