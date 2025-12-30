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
  ChevronLeft,
  ChevronDown,
  Gift,
  Wallet,
} from "lucide-react-native";
import React, { useCallback, useRef, useState, useMemo } from "react";
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
import { PIN_LENGTH } from "@/constants/menu";
import { useWaecVariations } from "@/hooks/use-waec-variations";
import { usePurchaseWaec } from "@/hooks/use-purchase-waec";
import { PageHeader } from "@/components/page-header";

// Quantities
const QUANTITIES = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

// Validation schema
// Update validation schema
const schema = yup.object().shape({
  serviceType: yup.string().required("Please select a service type"),
  quantity: yup.string().required("Please select quantity"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(11, "Phone number must be exactly 11 digits"),
});

type FormData = yup.InferType<typeof schema>;

export default function WaecPurchase() {
  // State management
  const insets = useSafeAreaInsets();
  const {
    data: waecData,
    isLoading: isLoadingVariations,
    isError: isVariationsError,
    error: variationsError,
  } = useWaecVariations();
  const { purchaseWaec, isLoading: isPurchasing } = usePurchaseWaec();
  const [showServiceDrawer, setShowServiceDrawer] = useState(false);
  const [showQuantityDrawer, setShowQuantityDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpRef = useRef<any>(null);

  // In your component, update the serviceTypes memo:
  const serviceTypes = useMemo(() => {
    if (!waecData) {
      console.log("No WAEC data available");
      return [];
    }

    console.log("WAEC Data received:", waecData);

    // Try variations first, then varations (with typo)
    const variations = waecData.variations || waecData.varations || [];

    console.log("Extracted variations:", {
      hasVariations: !!waecData.variations,
      hasVarations: !!waecData.varations,
      variationsCount: variations.length,
      variationsData: variations,
    });

    return variations.map((variation) => ({
      id: variation.variation_code,
      name: variation.name,
      price: variation.variation_amount,
    }));
  }, [waecData]);

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
      serviceType: "",
      quantity: "",
      phoneNumber: "",
    },
  });

  const serviceTypeValue = watch("serviceType");
  const quantityValue = watch("quantity");
  const phoneNumberValue = watch("phoneNumber");

  // Get selected items
  const selectedService = useMemo(() => {
    return serviceTypes.find((s) => s.id === serviceTypeValue);
  }, [serviceTypes, serviceTypeValue]);
  const selectedQuantity = QUANTITIES.find((q) => q.value === quantityValue);

  // With this:
  const totalAmount = useMemo(() => {
    if (!selectedService || !selectedQuantity) return "0";

    const price = parseFloat(selectedService.price); // Use parseFloat for decimal values
    const quantity = parseInt(selectedQuantity.value);

    // Calculate total and format to 2 decimal places
    const total = (price * quantity).toFixed(2);
    return total;
  }, [selectedService, selectedQuantity]);

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
      setPinError("");

      try {
        // Get selected service details
        const selectedService = serviceTypes.find(
          (s) => s.id === serviceTypeValue
        );

        if (!selectedService) {
          throw new Error("Please select a service type");
        }

        if (!quantityValue) {
          throw new Error("Please select quantity");
        }

        if (!phoneNumberValue) {
          throw new Error("Phone number is required");
        }

        // Prepare payload for API
        const payload = {
          serviceID: "waec",
          variation_code: serviceTypeValue,
          amount: totalAmount,
          quantity: parseInt(quantityValue),
          phone: phoneNumberValue,
          pin: finalPin,
        };

        console.log(payload, "payload");

        // Call the API
        const result = await purchaseWaec(payload);

        // Check if successful
        if (result.responseSuccessful) {
          // Success - close drawers and navigate
          setShowPinDrawer(false);
          setShowConfirmDrawer(false);
          setPin("");
          reset();

          // Navigate to success screen with PINs/serials
          router.push({
            pathname: "/transaction-success",
            params: {
              amount: totalAmount,
              recipient: phoneNumberValue,
              phoneNumber: phoneNumberValue,
              transactionType: "waec",
              serviceType: selectedService?.name,
              quantity: quantityValue,
              commission: "10",
            },
          });
        } else {
          // Handle API error
          let errorMessage = result.responseMessage || "Transaction failed";

          if (errorMessage.toLowerCase().includes("pin")) {
            errorMessage = "Incorrect PIN. Please try again.";
            setPin("");
            setTimeout(() => {
              if (otpRef.current) otpRef.current.clear();
            }, 100);
          }

          setPinError(errorMessage);
        }
      } catch (error: any) {
        console.error("WAEC purchase error:", error);

        let errorMessage = "Transaction failed. Please try again.";

        // Handle network/API errors
        if (
          error?.response?.status === 400 ||
          error?.response?.status === 404
        ) {
          const apiError = error.response?.data?.responseMessage;
          if (apiError?.toLowerCase().includes("pin")) {
            errorMessage = "Incorrect PIN. Please try again.";
            setPin("");
            setTimeout(() => {
              if (otpRef.current) otpRef.current.clear();
            }, 100);
          } else {
            errorMessage = apiError || errorMessage;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }

        setPinError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      pin,
      serviceTypeValue,
      quantityValue,
      phoneNumberValue,
      totalAmount,
      serviceTypes,
      purchaseWaec,
      reset,
    ]
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
    if (phoneNumberValue || serviceTypeValue) {
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
      router.back();
    }
  }, [phoneNumberValue, serviceTypeValue]);

  // Format amount for display
  const formatAmount = useCallback((amount: string) => {
    if (!amount) return "";
    return parseInt(amount, 10).toLocaleString();
  }, []);

  // Handle service type selection
  const handleServiceSelect = useCallback(
    (serviceId: string) => {
      setValue("serviceType", serviceId, { shouldValidate: true });
      setShowServiceDrawer(false);
    },
    [setValue]
  );

  // Handle quantity selection
  const handleQuantitySelect = useCallback(
    (qty: string) => {
      setValue("quantity", qty, { shouldValidate: true });
      setShowQuantityDrawer(false);
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
        <PageHeader title="WAEC" onBack={handleBack} showBackButton={true} />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Box className="bg-white px-4 pt-6 pb-24 flex-1">
            <VStack space="lg" className="flex-1">
              {/* SERVICE TYPE */}
              <FormControl isInvalid={Boolean(errors.serviceType)}>
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Service Type
                  </FormControlLabelText>
                </FormControlLabel>

                {isLoadingVariations ? (
                  <View className="w-full rounded-[99px] border border-[#D0D5DD] min-h-[48px] flex-row items-center px-4">
                    <ActivityIndicator size="small" color="#132939" />
                    <Text className="text-black ml-3">Loading...</Text>
                  </View>
                ) : isVariationsError ? (
                  <View className="w-full rounded-[99px] border border-red-500 min-h-[48px] flex items-center justify-center px-4">
                    <Text className="text-[12px] text-red-500">
                      Failed to load service types. Please try again.
                    </Text>
                  </View>
                ) : serviceTypes.length > 0 ? (
                  <Controller
                    control={control}
                    name="serviceType"
                    render={({ field: { value } }) => (
                      <TouchableOpacity
                        onPress={() => setShowServiceDrawer(true)}
                        className={`w-full rounded-[99px] min-h-[48px] flex-row items-center justify-between px-4 ${
                          errors.serviceType
                            ? "border-2 border-red-500"
                            : "border border-[#D0D5DD]"
                        }`}
                      >
                        <Text
                          className={`text-[14px] ${
                            value ? "text-[#000000]" : "text-[#717680]"
                          }`}
                        >
                          {serviceTypes.find((s) => s.id === value)?.name ||
                            "Select service type"}
                        </Text>
                        <ChevronDown size={20} color="#717680" />
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <View className="w-full rounded-[99px] border border-red-500 min-h-[48px] flex items-center justify-center px-4">
                    <Text className="text-[12px] text-red-500">
                      No service types available
                    </Text>
                  </View>
                )}

                {errors.serviceType && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.serviceType?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* QUANTITY */}
              {serviceTypeValue && (
                <VStack space="lg">
                  <FormControl isInvalid={Boolean(errors.quantity)}>
                    <FormControlLabel>
                      <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                        Quantity
                      </FormControlLabelText>
                    </FormControlLabel>

                    <Controller
                      control={control}
                      name="quantity"
                      render={({ field: { value } }) => (
                        <TouchableOpacity
                          onPress={() => setShowQuantityDrawer(true)}
                          className={`w-full rounded-[99px] min-h-[48px] flex-row items-center justify-between px-4 ${
                            errors.quantity
                              ? "border-2 border-red-500"
                              : "border border-[#D0D5DD]"
                          }`}
                        >
                          <Text
                            className={`text-[14px] ${
                              value ? "text-[#000000]" : "text-[#717680]"
                            }`}
                          >
                            {value || "Select quantity"}
                          </Text>
                          <ChevronDown size={20} color="#717680" />
                        </TouchableOpacity>
                      )}
                    />

                    {errors.quantity && (
                      <FormControlError>
                        <FormControlErrorIcon
                          className="text-red-500"
                          as={AlertCircleIcon}
                        />
                        <FormControlErrorText className="text-red-500">
                          {errors.quantity?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormControlLabel>
                      <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                        Amount
                      </FormControlLabelText>
                    </FormControlLabel>

                    <Input
                      variant="outline"
                      size="xl"
                      isReadOnly={true}
                      className="w-full rounded-[99px] min-h-[48px] border border-[#D0D5DD] bg-[#F9FAFB]"
                    >
                      <InputField
                        value={`₦${formatAmount(totalAmount)}`}
                        className="text-[14px] text-[#000000] font-manropesemibold px-4 py-3"
                        editable={false}
                      />

                      {/* Optional: Show calculation breakdown */}
                      {selectedService && selectedQuantity && (
                        <View className="absolute right-4 top3">
                          <Text className="text-[10px] text-gray-500">
                            {selectedQuantity.value} × ₦
                            {parseFloat(selectedService.price).toLocaleString()}
                          </Text>
                        </View>
                      )}
                    </Input>
                  </FormControl>

                  <FormControl isInvalid={Boolean(errors.phoneNumber)}>
                    <FormControlLabel>
                      <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                        Phone Number
                      </FormControlLabelText>
                    </FormControlLabel>

                    <Controller
                      control={control}
                      name="phoneNumber"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          variant="outline"
                          size="xl"
                          className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] min-h-[48px] ${
                            errors.phoneNumber
                              ? "border-2 border-red-500"
                              : "border border-[#D0D5DD]"
                          }`}
                        >
                          <InputField
                            placeholder="Enter Phone Number"
                            className="text-[14px] text-[#717680] px-4 py-3"
                            value={value}
                            maxLength={11}
                            keyboardType="number-pad"
                            onChangeText={(text) => {
                              const cleaned = text.replace(/[^0-9]/g, "");
                              onChange(cleaned);
                            }}
                            onBlur={onBlur}
                            autoCapitalize="none"
                          />
                        </Input>
                      )}
                    />

                    {errors.phoneNumber && (
                      <FormControlError>
                        <FormControlErrorIcon
                          className="text-red-500"
                          as={AlertCircleIcon}
                        />
                        <FormControlErrorText className="text-red-500">
                          {errors.phoneNumber?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>
                </VStack>
              )}
            </VStack>
          </Box>
        </ScrollView>

        {/* TTOM BUTTON */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-4 pt-4"
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

      {/* SERVICE TYPE SELECTION DRAWER */}
      <Drawer
        className="border-t-0"
        isOpen={showServiceDrawer}
        size="sm"
        anchor="bottom"
        onClose={() => setShowServiceDrawer(false)}
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
            paddingBottom: insets.bottom || 16,
          }}
        >
          <DrawerHeader className="border-b-0 pb-4 px-6">
            <Heading className="font-manropesemibold text-center text-[18px] text-[#000000] mb2">
              Select Service Type
            </Heading>
            <DrawerCloseButton />
          </DrawerHeader>

          {/* SERVICE TYPE SELECTION DRAWER */}
          <DrawerBody className="px-6 pb-8">
            <VStack space="sm">
              {isLoadingVariations ? (
                <ActivityIndicator size="small" color="#132939" />
              ) : serviceTypes.length > 0 ? (
                serviceTypes.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    onPress={() => handleServiceSelect(service.id)}
                    className="flex-row justify-between items-center p-4 rounded-[16px] border-b border-[#E5E7EB] bg-white"
                  >
                    <Text className="text-[14px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      {service.name}
                    </Text>
                    <Text className="text-[14px] text-gray-500">
                      ₦{parseInt(service.price).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-center text-gray-500 py-4">
                  No service types available
                </Text>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* QUANTITY SELECTION DRAWER */}
      <Drawer
        className="border-t-0"
        isOpen={showQuantityDrawer}
        size="sm"
        anchor="bottom"
        onClose={() => setShowQuantityDrawer(false)}
      >
        <DrawerBackdrop
          style={{
            backgroundColor: "#24242440",
            opacity: 1,
          }}
        />
        <DrawerContent
          className="rounded-t-[30px] pt[29px] bg-[#FFFFFF]"
          style={{
            borderTopWidth: 0,
            borderColor: "transparent",
            shadowOpacity: 0,
            elevation: 0,
            paddingBottom: insets.bottom || 16,
          }}
        >
          <DrawerHeader className="border-b-0 pb4 px-6">
            <Heading className="font-manropesemibold text-center text-[18px] text-[#000000]">
              Select Quantity
            </Heading>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody className="px-6 pb4">
            <View className="flex-row flex-wrap justify-start">
              {QUANTITIES.map((qty) => (
                <TouchableOpacity
                  key={qty.value}
                  onPress={() => handleQuantitySelect(qty.value)}
                  className={`w-[30%] mr-[3.33%] mb-2 px-4 py-3 rounded-[12px] items-center justify-center border ${
                    quantityValue === qty.value
                      ? "border-[#132939] bg-[#F9FAFB]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                  style={{ marginRight: "3.33%" }}
                >
                  <Text
                    className={`text-[16px] font-semibold font-manropebold ${
                      quantityValue === qty.value
                        ? "text-[#132939]"
                        : "text-[#000000]"
                    }`}
                  >
                    {qty.label}
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
              <Heading className="text-[28px] font-medium text-center mt-[18px] font-manropebold text-[#000000]">
                ₦{formatAmount(totalAmount)}
              </Heading>
            </VStack>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody className="pt-2 px-1 pb2">
            <VStack space="md">
              {/* Transaction Details */}
              <View className="rounded-[20px] border-[#E5E7EF] border px-4 py2">
                <VStack space="sm">
                  <HStack className="justify-between items-center py-3">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Service Type
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      {selectedService?.name || ""}
                    </Text>
                  </HStack>

                  <View className="h-[1px] bg-[#E5E7EB]" />

                  <HStack className="justify-between items-center py-3">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Phone Number
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      {phoneNumberValue}
                    </Text>
                  </HStack>

                  <View className="h-[1px] bg-[#E5E7EB]" />

                  <HStack className="justify-between items-center py-3">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Quantity
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      {quantityValue}
                    </Text>
                  </HStack>

                  <View className="h-[1px] bg-[#E5E7EB]" />

                  <HStack className="justify-between items-center py-3">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Amount
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      ₦{formatAmount(totalAmount)}
                    </Text>
                  </HStack>
                </VStack>
              </View>

              {/* Wallet & Cashback */}
              <View className="px-4 py-2">
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

          <DrawerFooter className="px-4 pt-2 pb-0">
            <Button
              className="rounded-full bg-[#132939] h-[48px] w-full"
              size="xl"
              onPress={handleContinueToPin}
            >
              <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                Confirm
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
            paddingBottom: insets.bottom || 16,
          }}
        >
          <DrawerHeader className="border-b-0 pb-4 px-4">
            <Heading className="font-manropesemibold w-full text-center text-[18px] text-[#000000] mb-2">
              Enter PIN
            </Heading>
            {!isSubmitting && <DrawerCloseButton />}
          </DrawerHeader>

          <DrawerBody className="pt-2 px-2 pb-4">
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
