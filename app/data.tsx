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
import { VStack } from "@/components/ui/vstack";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AlertCircleIcon,
  ChevronDownIcon,
  ChevronLeft,
  Gift,
  Wallet,
} from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { OtpInput } from "react-native-otp-entry";
import * as yup from "yup";
import { router } from "expo-router";
import { NETWORKS, PIN_LENGTH } from "@/constants/menu";
import { DATA_BUNDLES } from "@/utils/mock";

// Validation schema
const schema = yup.object().shape({
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(11, "Phone number must be exactly 11 digits"),
  network: yup.string().required("Please select a network"),
  dataBundle: yup.string().required("Please select a data bundle"),
});

type FormData = yup.InferType<typeof schema>;

export default function DataBundle() {
  // State management
  const insets = useSafeAreaInsets();
  const [showNetworkDrawer, setShowNetworkDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpRef = useRef<any>(null);

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: "onChange",
    defaultValues: {
      phoneNumber: "",
      network: "",
      dataBundle: "",
    },
  });

  const phoneValue = watch("phoneNumber");
  const networkValue = watch("network");
  const dataBundleValue = watch("dataBundle");

  // Get selected items
  const selectedNetwork = NETWORKS.find((n) => n.value === networkValue);
  const selectedBundle = DATA_BUNDLES.find((b) => b.id === dataBundleValue);

  // Form submission
  const submitForm = useCallback((data: FormData) => {
    console.log("✔ Valid form:", data);
    setShowConfirmDrawer(true);
  }, []);

  // Continue to PIN entry
  const handleContinueToPin = useCallback(() => {
    setShowConfirmDrawer(true);
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

        if (otpRef.current) {
          otpRef.current.setValue(newPin);
        }

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
        console.log("PIN entered:", finalPin);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setShowPinDrawer(false);
        setShowConfirmDrawer(false);
        setPin("");
        reset();

        router.push({
          pathname: "/transaction-success",
          params: {
            amount: selectedBundle?.price,
            recipient: phoneValue,
            phoneNumber: phoneValue,
            transactionType: "data",
            network: networkValue,
            dataBundle: selectedBundle?.name,
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
    [pin, selectedBundle, phoneValue, networkValue, reset]
  );

  // Continue button handler
  const handleContinue = useCallback(async () => {
    const valid = await trigger();
    if (!valid) {
      return;
    }
    handleSubmit(submitForm)();
  }, [trigger, handleSubmit, submitForm]);

  // Back navigation handler
  const handleBack = useCallback(() => {
    if (phoneValue || dataBundleValue) {
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
  }, [phoneValue, dataBundleValue]);

  // Format amount for display
  const formatAmount = useCallback((amount: string) => {
    if (!amount) return "";
    return parseInt(amount, 10).toLocaleString();
  }, []);

  // Handle network selection
  const handleNetworkSelect = useCallback(
    (networkVal: string) => {
      setValue("network", networkVal, { shouldValidate: true });
      setShowNetworkDrawer(false);
    },
    [setValue]
  );

  // Handle bundle selection
  const handleBundleSelect = useCallback(
    (bundleId: string) => {
      setValue("dataBundle", bundleId, { shouldValidate: true });
    },
    [setValue]
  );

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
            Data Bundle
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
              {/* Phone Number with Network Selector */}
              <FormControl
                isInvalid={Boolean(errors.phoneNumber || errors.network)}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Phone Number
                  </FormControlLabelText>
                </FormControlLabel>

                <View
                  className={`w-full rounded-[99px] border min-h-[48px] flex-row items-center overflow-hidden ${
                    errors.phoneNumber || errors.network
                      ? "border-2 border-red-500"
                      : "border border-[#D0D5DD]"
                  }`}
                >
                  {/* Network Selector */}
                  <Controller
                    control={control}
                    name="network"
                    render={({ field: { value } }) => (
                      <TouchableOpacity
                        onPress={() => setShowNetworkDrawer(true)}
                        className="w-[70px] h-[48px] flex-row items-center justify-center px-2"
                      >
                        <Text className="text-[20px]">
                          {selectedNetwork?.icon || "📱"}
                        </Text>
                        <ChevronDownIcon
                          size={16}
                          color="#717680"
                          style={{ marginLeft: -4 }}
                        />
                      </TouchableOpacity>
                    )}
                  />

                  {/* Phone Number Input */}
                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        variant="outline"
                        size="xl"
                        className="flex-1 border-0 rounded-none"
                      >
                        <InputField
                          placeholder="Enter your phone number"
                          className="text-[14px] text-[#717680] px-2 py-3"
                          value={value}
                          maxLength={11}
                          keyboardType="number-pad"
                          onChangeText={(text) => {
                            const cleaned = text.replace(/[^0-9]/g, "");
                            onChange(cleaned);
                          }}
                          onBlur={onBlur}
                        />
                      </Input>
                    )}
                  />
                </View>

                {(errors.phoneNumber || errors.network) && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.phoneNumber?.message || errors.network?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Data Bundle Selection */}
              {networkValue && (
                <FormControl isInvalid={Boolean(errors.dataBundle)}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                      Popular Data Bundles
                    </FormControlLabelText>
                  </FormControlLabel>

                  <Controller
                    control={control}
                    name="dataBundle"
                    render={({ field: { value } }) => (
                      <VStack space="sm">
                        {DATA_BUNDLES.map((bundle) => (
                          <TouchableOpacity
                            key={bundle.id}
                            onPress={() => handleBundleSelect(bundle.id)}
                            className={`flex-row justify-between items-center p-4 rounded-[16px] ${
                              value === bundle.id
                                ? "border-[#132939] border bg-[#F9FAFB]"
                                : "border[#E5E7EB] bg-white"
                            }`}
                          >
                            <View>
                              <Text className="text-[14px] font-medium font-manropesemibold text-[#000000] mb-1">
                                {bundle.name}
                              </Text>
                              <Text className="text-[12px] font-manroperegular text-[#6B7280]">
                                Validity: {bundle.validity}
                              </Text>
                            </View>
                            <Text className="text-[16px] font-semibold font-manropebold text-[#132939]">
                              ₦{bundle.price}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </VStack>
                    )}
                  />

                  {errors.dataBundle && (
                    <FormControlError>
                      <FormControlErrorIcon
                        className="text-red-500"
                        as={AlertCircleIcon}
                      />
                      <FormControlErrorText className="text-red-500">
                        {errors.dataBundle?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>
              )}
            </VStack>
          </Box>
        </ScrollView>

        {/* FIXED BOTTOM BUTTON */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-4 pt-4 border-t border-[#F3F4F6]"
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
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

      {/* NETWORK SELECTION DRAWER */}
      <Drawer
        className="border-t-0"
        isOpen={showNetworkDrawer}
        size="sm"
        anchor="bottom"
        onClose={() => setShowNetworkDrawer(false)}
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
          <DrawerHeader className="border-b-0 pb-6 px-6">
            <Heading className="font-manropesemibold text-center text-[18px] text-[#000000]">
              Choose network Provider
            </Heading>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody className="px-6 pb-6">
            <View className="flex-row justify-around">
              {NETWORKS.map((network) => (
                <TouchableOpacity
                  key={network.value}
                  onPress={() => handleNetworkSelect(network.value)}
                  className="items-center"
                >
                  <View className="w-[60px] h-[60px] rounded-full bg-[#F9FAFB] items-center justify-center mb-2">
                    <Text className="text-[32px]">{network.icon}</Text>
                  </View>
                  <Text className="text-[12px] font-manropesemibold text-[#000000]">
                    {network.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* CONFIRMATION DRAWER */}
      <Drawer
        className="border-t-0"
        isOpen={showConfirmDrawer}
        size="lg"
        anchor="bottom"
        onClose={() => setShowConfirmDrawer(false)}
      >
        <DrawerBackdrop
          style={{
            backgroundColor: "#24242440",
            opacity: 1,
          }}
        />
        <DrawerContent
          className="rounded-t-[30px] pt-[29px] bg-[#FFFFFF]"
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
                <Heading className="font-manropesemibold text-center text-[18px] text-[#000000] mb2">
                  Confirm Transaction
                </Heading>
                <Text className="text-center text-[12px] font-manroperegular text-[#6B7280] px-2">
                  Please review details carefully. Transactions are
                  irreversible.
                </Text>
              </VStack>
              <Heading className="text-[24px] font-medium text-center mt-[18px] font-manropebold text-[#000000]">
                {selectedBundle?.name}
              </Heading>
            </VStack>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody className="pt4 px-1 pb4">
            <VStack space="md">
              {/* Transaction Details */}
              <View className="rounded-[20px] border-[#E5E7EF] border px-4 py-2">
                <VStack space="sm">
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
                      Network
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      {selectedNetwork?.label}
                    </Text>
                  </HStack>
                  <View className="h-[1px] bg-[#E5E7EB]" />
                  <HStack className="justify-between items-center py-2">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Data Plan
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      {selectedBundle?.name}
                    </Text>
                  </HStack>
                  <View className="h-[1px] bg-[#E5E7EB]" />
                  <HStack className="justify-between items-center py-2">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Validity
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      {selectedBundle?.validity}
                    </Text>
                  </HStack>
                  <View className="h-[1px] bg-[#E5E7EB]" />
                  <HStack className="justify-between items-center py-2">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Amount
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      ₦{formatAmount(selectedBundle?.price || "0")}
                    </Text>
                  </HStack>
                </VStack>
              </View>

              {/* Wallet & Cashback */}
              <View className="px-4 py-2">
                <VStack space="sm">
                  <HStack className="justify-between items-center py-2">
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
                  <HStack className="justify-between items-center py-2">
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
          <DrawerFooter className="px-4 pt-2 pb-0">
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
