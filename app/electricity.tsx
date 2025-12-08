import { ConfirmationDrawer } from "@/components/confirmation-drawer";
import { PinDrawer } from "@/components/pin-drawer";
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
import { usePurchaseElectricity } from "@/hooks/use-purchase-electricity";
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
import { ACCOUNT_VERIFICATION_DELAY, PIN_LENGTH } from "@/constants/menu";
import { yupResolver } from "@hookform/resolvers/yup";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import {
  AlertCircleIcon,
  CheckCircle,
  ChevronDownIcon,
  ChevronLeft,
  Gift,
  Search,
  Wallet,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useGetElectricity } from "@/hooks/use-electricity";
import * as yup from "yup";
import ElectricitySelector from "@/components/electricity-selector";
import { useVerifyMeter } from "@/hooks/use-verify-metre";

// Mock electricity providers
const ELECTRICITY_PROVIDERS = [
  { id: "1", name: "Kedco", icon: "🔵", value: "kedco" },
  { id: "2", name: "Aedc", icon: "🔵", value: "aedc" },
  { id: "3", name: "Ekedc", icon: "🔵", value: "ekedc" },
  { id: "4", name: "Ikedc", icon: "🔵", value: "ikedc" },
  { id: "5", name: "Phed", icon: "🟢", value: "phed" },
  { id: "6", name: "Jos Electric", icon: "🟢", value: "jos" },
];

const METER_TYPES = [
  { label: "Prepaid", value: "prepaid" },
  { label: "Postpaid", value: "postpaid" },
];

// Validation schema
const schema = yup.object().shape({
  company: yup.string().required("Please select a company"),
  meterType: yup.string().required("Please select meter type"),
  meterNumber: yup
    .string()
    .required("Meter number is required")
    .matches(/^[0-9]+$/, "Meter number must contain only digits")
    .min(10, "Meter number must be at least 10 digits")
    .max(13, "Meter number must not exceed 13 digits"),
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
});

type FormData = yup.InferType<typeof schema>;

type Stage = "company" | "details";

export default function Electricity() {
  // State management
  const insets = useSafeAreaInsets();
  const { electricityProviders, isLoading, isError } = useGetElectricity();
  const { mutateAsync: verifyMeter, isPending: isVerifyingMeter } =
    useVerifyMeter();
    const { purchaseElectricity, isLoading: isPurchasingElectricity } = usePurchaseElectricity();
  const [showProviderDrawer, setShowProviderDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerVerified, setCustomerVerified] = useState(false);
  const [isVerifyingCustomer, setIsVerifyingCustomer] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [stage, setStage] = useState<Stage>("company");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: "onChange",
    defaultValues: {
      company: "",
      meterType: "",
      meterNumber: "",
      amount: "",
    },
  });

  const companyValue = watch("company");
  const meterTypeValue = watch("meterType");
  const meterNumberValue = watch("meterNumber");
  const amountValue = watch("amount");

  // Get selected company
 const selectedCompany = electricityProviders.find(
  (p) => p.serviceID === companyValue
);

  // Filter providers based on search
  const filteredProviders = ELECTRICITY_PROVIDERS.filter((provider) =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  // Customer verification with debouncing
  const handleMeterBlur = useCallback(async () => {
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }

    setCustomerName("");
    setCustomerVerified(false);

    if (
      meterNumberValue &&
      meterNumberValue.length >= 10 &&
      companyValue &&
      meterTypeValue
    ) {
      // Find the selected company
      const selectedProvider = electricityProviders.find(
        (p) => p.serviceID === companyValue
      );

      if (!selectedProvider) {
        console.warn("No provider selected");
        return;
      }

      setIsVerifyingCustomer(true);

      verificationTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await verifyMeter({
            serviceID: selectedProvider.serviceID,
            billersCode: meterNumberValue,
            type: meterTypeValue as "prepaid" | "postpaid",
          });

          console.log("✅ Meter verified:", response);

          // Set customer details from API response
          setCustomerName(response.Customer_Name);
          setCustomerVerified(true);
        } catch (error: any) {
          console.error("❌ Meter verification failed:", error);

          Alert.alert(
            "Verification Failed",
            error?.message ||
              "Unable to verify meter number. Please check and try again."
          );

          setCustomerName("");
          setCustomerVerified(false);
        } finally {
          setIsVerifyingCustomer(false);
        }
      }, ACCOUNT_VERIFICATION_DELAY);
    }
  }, [
    meterNumberValue,
    companyValue,
    meterTypeValue,
    electricityProviders,
    verifyMeter,
  ]);

  // Re-verify when company or meter type changes
  useEffect(() => {
    if (
      meterNumberValue &&
      meterNumberValue.length >= 10 &&
      companyValue &&
      meterTypeValue
    ) {
      handleMeterBlur();
    } else {
      setCustomerName("");
      setCustomerVerified(false);
    }
  }, [companyValue, meterTypeValue, meterNumberValue, handleMeterBlur]);

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
      console.log("🔐 PIN entered, processing electricity purchase...");

      // Validate that we have all required data
      if (!selectedCompany) {
        throw new Error("No electricity company selected. Please select a company.");
      }

      if (!meterNumberValue) {
        throw new Error("Meter number is required.");
      }

      if (!meterTypeValue) {
        throw new Error("Meter type is required.");
      }

      if (!customerVerified || !customerName) {
        throw new Error("Customer verification failed. Please verify the meter number.");
      }

      // Prepare the payload
      const payload = {
        serviceID: selectedCompany.serviceID,
        billersCode: meterNumberValue,
        variation_code: meterTypeValue as "prepaid" | "postpaid",
        amount: amountValue,
        phone: meterNumberValue, // Using meter number as phone (adjust if needed)
        pin: parseInt(finalPin, 10),
      };

      console.log("⚡ Electricity purchase payload:", payload);

      // Call the purchase electricity API
      const result = await purchaseElectricity(payload);

      console.log("Electricity Purchase Success => ", result);

      // Success - close drawers and navigate
      setShowPinDrawer(false);
      setShowConfirmDrawer(false);
      setPin("");
      reset();

      router.push({
        pathname: "/transaction-success",
        params: {
          amount: amountValue,
          recipient: customerName,
          meterNumber: meterNumberValue,
          transactionType: "electricity",
          company: selectedCompany.name,
          token: result.responseBody?.token || "N/A",
          units: result.responseBody?.units || "N/A",
          transactionId: result.responseBody?.transactionId || "",
          reference: result.responseBody?.reference || "",
          message: result.responseMessage || "Electricity purchased successfully",
        },
      });
    } catch (error: any) {
      console.error("Electricity purchase error:", error);

      // Handle specific error messages
      let errorMessage = "Transaction failed. Please try again.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.responseMessage) {
        errorMessage = error.responseMessage;
      }

      // Show user-friendly error messages based on content
      if (errorMessage.toLowerCase().includes("pin")) {
        errorMessage = "Invalid PIN. Please try again.";
      } else if (errorMessage.toLowerCase().includes("insufficient")) {
        errorMessage = "Insufficient balance. Please fund your wallet.";
      } else if (errorMessage.toLowerCase().includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (errorMessage.toLowerCase().includes("meter")) {
        errorMessage = "Invalid meter number. Please verify and try again.";
      }

      setPinError(errorMessage);
      setPin("");
      if (otpRef.current) {
        otpRef.current.clear();
      }
    } finally {
      setIsSubmitting(false);
    }
  },
  [
    pin,
    amountValue,
    customerName,
    meterNumberValue,
    meterTypeValue,
    selectedCompany,
    customerVerified,
    purchaseElectricity,
    reset,
  ]
);

  // Continue button handler
  const handleContinue = useCallback(async () => {
    if (stage === "company") {
      const valid = await trigger(["company"]);

      if (!valid) {
        return;
      }

      setStage("details");
      return;
    }

    if (stage === "details") {
      const valid = await trigger();

      if (!valid) {
        return;
      }

      if (!customerVerified) {
        Alert.alert(
          "Customer Verification Required",
          "Please wait for customer verification to complete."
        );
        return;
      }

      handleSubmit(submitForm)();
    }
  }, [stage, trigger, customerVerified, handleSubmit, submitForm]);

  // Back navigation handler
  const handleBack = useCallback(() => {
    if (stage === "details") {
      setStage("company");
    } else {
      if (companyValue || meterNumberValue || amountValue) {
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
    }
  }, [stage, companyValue, meterNumberValue, amountValue]);

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
        <HStack className="px-4 mb-[40px] py-3 mt-2 items-center justify-center border-b border-[#F3F4F6]">
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
            Electricity Payment
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
              {/* COMPANY SELECTION STAGE */}
              {stage === "company" && (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  style={{ flex: 1 }}
                >
                  <VStack space="lg" className="flex-1">
                    <FormControl isInvalid={Boolean(errors.company)}>
                      <FormControlLabel>
                        <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                          Company
                        </FormControlLabelText>
                      </FormControlLabel>

                      <Controller
                        control={control}
                        name="company"
                        render={({ field: { onChange, value } }) => (
                          <>
                            {isLoading ? (
                              <View className="w-full rounded-[99px] border border-[#D0D5DD] min-h-[48px] flex items-center justify-center">
                                <ActivityIndicator
                                  size="small"
                                  color="#132939"
                                />
                              </View>
                            ) : isError ? (
                              <View className="w-full rounded-[99px] border border-red-500 min-h-[48px] flex items-center justify-center px-4">
                                <Text className="text-[12px] text-red-500">
                                  Failed to load providers
                                </Text>
                              </View>
                            ) : (
                              <ElectricitySelector
                                value={value}
                                onValueChange={onChange}
                                providers={electricityProviders}
                                placeholder="Select your electricity company"
                                error={Boolean(errors.company)}
                              />
                            )}
                          </>
                        )}
                      />

                      {errors.company && (
                        <FormControlError>
                          <FormControlErrorIcon
                            className="text-red-500"
                            as={AlertCircleIcon}
                          />
                          <FormControlErrorText className="text-red-500">
                            {errors.company?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>
                  </VStack>
                </Animated.View>
              )}

              {/* DETAILS STAGE */}
              {stage === "details" && (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  style={{ flex: 1 }}
                >
                  <VStack space="lg" className="flex-1">
                    {/* COMPANY DISPLAY */}
                    <FormControl isInvalid={Boolean(errors.company)}>
                      <FormControlLabel>
                        <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                          Company
                        </FormControlLabelText>
                      </FormControlLabel>

                      <Controller
                        control={control}
                        name="company"
                        render={({ field: { onChange, value } }) => (
                          <>
                            {isLoading ? (
                              <View className="w-full rounded-[99px] border border-[#D0D5DD] min-h-[48px] flex items-center justifycenter">
                                <ActivityIndicator
                                  size="small"
                                  color="#132939"
                                />
                              </View>
                            ) : isError ? (
                              <View className="w-full rounded-[99px] border border-red-500 min-h-[48px] flex items-center justify-center px-4">
                                <Text className="text-[12px] text-red-500">
                                  Failed to load providers
                                </Text>
                              </View>
                            ) : (
                              <ElectricitySelector
                                value={value}
                                onValueChange={onChange}
                                providers={electricityProviders}
                                placeholder="Select your electricity company"
                                error={Boolean(errors.company)}
                              />
                            )}
                          </>
                        )}
                      />

                      {errors.company && (
                        <FormControlError>
                          <FormControlErrorIcon
                            className="text-red-500"
                            as={AlertCircleIcon}
                          />
                          <FormControlErrorText className="text-red-500">
                            {errors.company?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>

                    {/* METER TYPE */}
                    <FormControl isInvalid={Boolean(errors.meterType)}>
                      <FormControlLabel>
                        <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                          Meter Type
                        </FormControlLabelText>
                      </FormControlLabel>

                      <Controller
                        control={control}
                        name="meterType"
                        render={({ field: { onChange, value } }) => (
                          <View
                            className={`w-full rounded-[99px] border min-h-[48px] flex items-center justify-center ${
                              errors.meterType
                                ? "border-2 border-red-500"
                                : "border border-[#D0D5DD]"
                            }`}
                          >
                            <Picker
                              selectedValue={value}
                              onValueChange={(itemValue) => {
                                if (itemValue !== "") {
                                  onChange(itemValue);
                                }
                              }}
                              style={{
                                height: 48,
                                width: "100%",
                                marginLeft: Platform.OS === "android" ? 10 : 0,
                              }}
                              itemStyle={{
                                fontSize: 14,
                                height: 48,
                              }}
                              dropdownIconColor="#717680"
                              mode="dropdown"
                            >
                              <Picker.Item
                                label="Choose Meter Type"
                                value=""
                                color="#717680"
                                style={{ fontSize: 14 }}
                              />
                              {METER_TYPES.map((type) => (
                                <Picker.Item
                                  key={type.value}
                                  label={type.label}
                                  value={type.value}
                                  style={{
                                    fontSize: 14,
                                    color: "#414651",
                                  }}
                                />
                              ))}
                            </Picker>
                          </View>
                        )}
                      />

                      {errors.meterType && (
                        <FormControlError>
                          <FormControlErrorIcon
                            className="text-red-500"
                            as={AlertCircleIcon}
                          />
                          <FormControlErrorText className="text-red-500">
                            {errors.meterType?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>

                    {/* METER NUMBER */}
                    <FormControl isInvalid={Boolean(errors.meterNumber)}>
                      <FormControlLabel>
                        <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                          Meter Number
                        </FormControlLabelText>
                      </FormControlLabel>

                      <Controller
                        control={control}
                        name="meterNumber"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <Input
                            variant="outline"
                            size="xl"
                            className={`w-full p-2 rounded-[99px] focus:border-2 focus:border-[#D0D5DD] min-h-[48px] ${
                              errors.meterNumber
                                ? "border-2 border-red-500"
                                : "border border-[#D0D5DD]"
                            }`}
                          >
                            <InputField
                              placeholder="Enter Meter Number"
                              className="w-full text-[14px] text-[#717680] min-h-[48px] px-4 py-3"
                              value={value}
                              maxLength={13}
                              keyboardType="number-pad"
                              onChangeText={(text) => {
                                const cleaned = text.replace(/[^0-9]/g, "");
                                onChange(cleaned);
                              }}
                              onBlur={() => {
                                onBlur();
                                handleMeterBlur();
                              }}
                              autoCapitalize="none"
                              editable={
                                !isVerifyingCustomer && !isVerifyingMeter
                              }
                            />
                            {(isVerifyingCustomer || isVerifyingMeter) && (
                              <View className="absolute right-4 top-3">
                                <ActivityIndicator
                                  size="small"
                                  color="#132939"
                                />
                              </View>
                            )}
                          </Input>
                        )}
                      />

                      {errors.meterNumber && (
                        <FormControlError>
                          <FormControlErrorIcon
                            className="text-red-500"
                            as={AlertCircleIcon}
                          />
                          <FormControlErrorText className="text-red-500">
                            {errors.meterNumber?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>

                    {/* CUSTOMER NAME */}
                    {customerVerified && customerName && (
                      <Animated.View entering={FadeIn.duration(300)}>
                        <FormControl>
                          <FormControlLabel>
                            <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                              Customer Name
                            </FormControlLabelText>
                          </FormControlLabel>

                          <Input
                            variant="outline"
                            size="xl"
                            isReadOnly={true}
                            className="w-full p-2 rounded-[16px] min-h-[48px] border border-[#10B981] bg-[#F0FDF4]"
                          >
                            <InputField
                              value={customerName}
                              className="w-full text-[14px] text-[#000000] min-h-[48px] px-4 py-3 font-manropesemibold"
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
                  </VStack>
                </Animated.View>
              )}
            </VStack>
          </Box>
        </ScrollView>

        {/* FIXED BOTTOM BUTTON */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-4 pt-4"
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <Button
            className="rounded-full bg-[#132939] h-[48px] w-full"
            size="xl"
            disabled={isPurchasingElectricity}
            onPress={handleContinue}
          >
            <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
              Continue
            </ButtonText>
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* PROVIDER SELECTION DRAWER */}
      <Drawer
        className="border-t-0"
        isOpen={showProviderDrawer}
        size="lg"
        anchor="bottom"
        onClose={() => setShowProviderDrawer(false)}
      >
        <DrawerBackdrop
          style={{
            backgroundColor: "#24242440",
            opacity: 1,
          }}
        />
        <DrawerContent
          className="rounded-t-[30px] pt-[24px] bg-[#FFFFFF]"
          style={{
            borderTopWidth: 0,
            borderColor: "transparent",
            shadowOpacity: 0,
            elevation: 0,
            // paddingBottom: Platform.OS === "ios" ? 34 : 16,
            paddingBottom: insets.bottom || 16,
          }}
        >
          <DrawerHeader className="border-b-0 pb-4 px6">
            <VStack className="w-full">
              <Heading className="font-manropesemibold text-center text-[18px] text-[#000000] mb-4">
                Select Electricity Provider
              </Heading>

              {/* Search Input */}
              <Input
                variant="outline"
                size="md"
                className="w-full rounded-[12px] border border-[#D0D5DD] mb-4"
              >
                <View className="pl-3">
                  <Search size={18} color="#717680" />
                </View>
                <InputField
                  placeholder="Search all company"
                  className="text-[14px] text-[#717680] px-2"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </Input>
            </VStack>

            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody className="px4 pb-6">
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            >
              <VStack space="xs">
                {filteredProviders.length > 0 ? (
                  <>
                    <Text className="text-[12px] font-manropesemibold text-[#6B7280] mb-2 px-2">
                      All Companies
                    </Text>
                    {filteredProviders.map((provider) => (
                      <TouchableOpacity
                        key={provider.id}
                        onPress={() => {
                          setValue("company", provider.value, {
                            shouldValidate: true,
                          });
                          setShowProviderDrawer(false);
                          setSearchQuery("");
                        }}
                        className="flex-row items-center justify-between py-3 px-2 border-b border-[#F3F4F6]"
                      >
                        <HStack space="sm" className="items-center">
                          <View className="w-[32px] h-[32px] rounded-full bg-[#F0F9FF] items-center justify-center">
                            <Text className="text-[16px]">{provider.icon}</Text>
                          </View>
                          <Text className="text-[14px] font-manropesemibold text-[#000000]">
                            {provider.name}
                          </Text>
                        </HStack>
                        <ChevronDownIcon
                          size={20}
                          color="#717680"
                          style={{ transform: [{ rotate: "-90deg" }] }}
                        />
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  <Text className="text-[14px] text-[#6B7280] text-center py-8">
                    No providers found
                  </Text>
                )}
              </VStack>
            </ScrollView>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <ConfirmationDrawer
        isOpen={showConfirmDrawer}
        onClose={() => setShowConfirmDrawer(false)}
        onConfirm={handleContinueToPin}
        title="Confirm Transaction"
        subtitle="Please review details carefully. Transactions are irreversible."
        amount={amountValue}
        showAmount={true}
        amountClassName="text-[28px] font-medium text-center mt-[18px] font-manropebold text-[#000000]"
        sections={[
          {
            containerClassName: "rounded-[20px] border-[#E5E7EF] border px-4",
            details: [
              {
                label: "Recipient",
                value: customerName,
              },
              {
                label: "Meter Number",
                value: meterNumberValue,
              },
              {
                label: "Company",
        value: selectedCompany?.name || "",
              },
              {
                label: "Amount",
                value: `₦${formatAmount(amountValue)}`,
              },
              {
                label: "Meter Type",
                value: meterTypeValue === "prepaid" ? "Prepaid" : "Postpaid",
              },
            ],
          },
          {
            containerClassName: "px-4",
            details: [
              {
                label: "Wallet Balance",
                value: "₦50,000",
                icon: <Wallet size={16} color="#FF8D28" />,
              },
              {
                label: "Cashback",
                value: "+₦500",
                icon: <Gift size={16} color="#CB30E0" />,
                valueClassName:
                  "text-[12px] font-medium leading-[100%] font-manropesemibold text-[#10B981]",
              },
            ],
          },
        ]}
      />

      {/* PIN DRAWER */}
      <PinDrawer
        isOpen={showPinDrawer}
        onClose={() => setShowPinDrawer(false)}
        onSubmit={handlePinSubmit}
        title="Enter PIN"
         isSubmitting={isSubmitting || isPurchasingElectricity} 
        loadingText="Processing transaction..."
      />
    </SafeAreaView>
  );
}
