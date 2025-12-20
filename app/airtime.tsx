import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { useVerifyPhone } from "@/hooks/use-verify-phone";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AlertCircleIcon,
  ChevronDownIcon,
  Gift,
  Wallet,
} from "lucide-react-native";
import { useGetNetworks } from "@/hooks/use-networks";
import React, { useCallback, useRef, useEffect, useState } from "react";
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
import * as yup from "yup";
import { router } from "expo-router";
import { QUICK_AMOUNTS } from "@/constants/menu";
import { PinDrawer } from "@/components/pin-drawer";
import { ConfirmationDrawer } from "@/components/confirmation-drawer";
import { PageHeader } from "@/components/page-header";
import { QuickAmountSelector } from "@/components/quick-amount-selector";
import { usePurchaseAirtime } from "@/hooks/use-buy-airtime";
import { NetworkSelectionDrawer } from "@/components/network-selection-drawer";
import { useDashboard } from "@/hooks/use-dashboard";
// Validation schema
const schema = yup.object().shape({
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(11, "Phone number must be exactly 11 digits"),
  network: yup.string().required("Please select a network"),
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

export default function Airtime() {
  // State management
  const insets = useSafeAreaInsets();
  const { networks, isLoading, isError } = useGetNetworks();
  const verifyPhoneMutation = useVerifyPhone();
  const { purchaseAirtime, isLoading: isPurchasing } = usePurchaseAirtime();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState("");
  const [showNetworkDrawer, setShowNetworkDrawer] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [hasSetDefaultNetwork, setHasSetDefaultNetwork] = useState(false);
  const lastVerifiedPhone = useRef<string>("");
  const {
    wallet, // Wallet balance data
  } = useDashboard();

  console.log(wallet);

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
      amount: "",
    },
  });

  const phoneValue = watch("phoneNumber");
  const networkValue = watch("network");
  const amountValue = watch("amount");

  // Set MTN as default when networks finish loading (ONLY ONCE)
  useEffect(() => {
    if (!isLoading && networks.length > 0 && !hasSetDefaultNetwork) {
      // Find MTN network
      const mtnNetwork = networks.find(
        (network) =>
          network.serviceID?.toLowerCase() === "mtn" ||
          network.name?.toLowerCase() === "mtn"
      );

      if (mtnNetwork) {
        setValue("network", mtnNetwork.serviceID, { shouldValidate: false });
      } else {
        // Fallback to first network if MTN not found
        setValue("network", networks[0].serviceID, { shouldValidate: false });
      }

      setHasSetDefaultNetwork(true);
    }
  }, [isLoading, networks, hasSetDefaultNetwork, setValue]);

  // Verify phone number and auto-detect network
  const verifyAndSetNetwork = useCallback(
    async (phone: string) => {
      // Only verify if we have 11 digits and haven't verified this number yet
      if (phone.length !== 11 || phone === lastVerifiedPhone.current) {
        return;
      }

      // Prevent duplicate calls
      lastVerifiedPhone.current = phone;
      setIsVerifyingPhone(true);

      try {
        const response = await verifyPhoneMutation.mutateAsync({ phone });
        // The API returns an ARRAY: [{ id: "airtel", name: "Airtel Nigeria", status: "ACTIVE" }]
        // Extract the first item from the array
        const networkData = Array.isArray(response) ? response[0] : response;

        if (!networkData) {
          console.warn("⚠️ No network data in response");
          return;
        }

        // Match with your networks using serviceID
        const detectedNetwork = networks.find((network) => {
          const apiId = networkData.id?.toLowerCase();
          const serviceId = network.serviceID?.toLowerCase();

          // Direct match
          if (serviceId === apiId) return true;

          // Handle 9mobile/etisalat case
          if (apiId === "9mobile" && serviceId === "etisalat") return true;
          if (apiId === "etisalat" && serviceId === "etisalat") return true;

          // Fallback: check if API id is contained in serviceID or name
          return (
            serviceId?.includes(apiId) ||
            network.name?.toLowerCase().includes(apiId)
          );
        });

        if (detectedNetwork) {
          setValue("network", detectedNetwork.serviceID, {
            shouldValidate: true,
          });
        } else {
          console.warn("⚠️ Could not match network. API ID:", networkData.id);
          console.warn(
            "Available networks:",
            networks.map((n) => ({ id: n.id, serviceID: n.serviceID }))
          );
        }
      } catch (error: any) {
        console.error("❌ Phone verification failed:", error);
        // Reset the last verified phone so user can retry
        lastVerifiedPhone.current = "";
      } finally {
        setIsVerifyingPhone(false);
      }
    },
    [networks, setValue, verifyPhoneMutation]
  );

  // Watch for phone number changes and verify when complete
  useEffect(() => {
    if (
      phoneValue &&
      phoneValue.length === 11 &&
      phoneValue !== lastVerifiedPhone.current
    ) {
      // Debounce the verification to avoid too many API calls
      const timeoutId = setTimeout(() => {
        verifyAndSetNetwork(phoneValue);
      }, 800); // Increased to 800ms for better debouncing

      return () => clearTimeout(timeoutId);
    }

    // Reset verification tracking if phone number is cleared or changed
    if (phoneValue.length < 11) {
      lastVerifiedPhone.current = "";
    }
  }, [phoneValue, verifyAndSetNetwork]); // Remove verifyAndSetNetwork from dependencies to prevent loop

  // Form submission
  const submitForm = useCallback((data: FormData) => {
    setShowDrawer(true);
  }, []);

  // Continue to PIN entry
  const handleContinueToPin = useCallback(() => {
    setShowDrawer(true);
    setTimeout(() => {
      setShowPinDrawer(true);
    }, 300);
  }, []);

  // PIN submission with API call
  const handlePinSubmit = useCallback(
    async (pin: string) => {
      setIsSubmitting(true);

      try {
        // Get the selected network data
        const selectedNetworkData = networks.find(
          (n) => n.serviceID === networkValue
        );

        if (!selectedNetworkData) {
          throw new Error("Network not found. Please select a network.");
        }

        const payload = {
          phone: phoneValue,
          amount: Number(amountValue),
          network: selectedNetworkData?.serviceID,
          pin: pin,
        };
        console.log(payload, "from airtime");
        // Call the purchase airtime API
        const result = await purchaseAirtime(payload);

        // Success - close drawers and navigate
        setShowPinDrawer(false);
        setShowDrawer(false);
        reset();

        await new Promise((resolve) => setTimeout(resolve, 300));

        // Reset tracking
        setHasSetDefaultNetwork(false);
        lastVerifiedPhone.current = "";

        router.push({
          pathname: "/transaction-success",
          params: {
            amount: amountValue,
            recipient: phoneValue,
            phoneNumber: phoneValue,
            transactionType: "airtime",
            network: selectedNetworkData.name,
            transactionId: result.responseBody?.transactionId || "",
            reference: result.responseBody?.reference || "",
            message: result.responseMessage || "Airtime purchased successfully",
          },
        });
      } catch (error: any) {
        console.error("Airtime purchase error:", error);

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
        }

        // Throw error to be caught by PinDrawer component
        throw new Error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [amountValue, phoneValue, networkValue, networks, purchaseAirtime, reset]
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
    if (phoneValue || amountValue) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to go back? All entered information will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              lastVerifiedPhone.current = "";
              setHasSetDefaultNetwork(false);
              router.push("/(tabs)");
            },
          },
        ]
      );
    } else {
      lastVerifiedPhone.current = "";
      setHasSetDefaultNetwork(false);
      router.back();
    }
  }, [phoneValue, amountValue]);

  // Handle quick amount selection
  const handleQuickAmountSelect = useCallback(
    (amount: string) => {
      setValue("amount", amount);
      setSelectedAmount(amount);
    },
    [setValue]
  );

  // Format amount for display
  const formatAmount = useCallback((amount: string) => {
    if (!amount) return "";
    return parseInt(amount, 10).toLocaleString();
  }, []);

  const formatCurrency = (value?: string) => {
    if (!value) return "₦0.00";

    const num = Number(value);
    if (isNaN(num)) return "₦0.00";

    return `₦ ${num.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleNetworkSelect = useCallback(
    (serviceID: string) => {
      setValue("network", serviceID);
    },
    [setValue]
  );

  // Get selected network details
  const selectedNetwork = networks.find((n) => n.serviceID === networkValue);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <PageHeader
          title="Buy Airtime"
          onBack={handleBack}
          showBackButton={true}
        />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Box className="bg-white px-4 pt-6 pb-24 flex-1">
            <VStack space="lg" className="flex-1">
              <FormControl
                isInvalid={Boolean(errors.phoneNumber || errors.network)}
              >
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
                        errors.phoneNumber || errors.network
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      }`}
                    >
                      {/* Network Selector Button */}
                      <TouchableOpacity
                        onPress={() => setShowNetworkDrawer(true)}
                        className="w-[70px] h-full items-center justify-center flex-row"
                        disabled={isLoading || isVerifyingPhone}
                      >
                        {isLoading || isVerifyingPhone ? (
                          <ActivityIndicator size="small" color="#132939" />
                        ) : selectedNetwork?.image ? (
                          <Image
                            source={{ uri: selectedNetwork.image }}
                            alt="network images"
                            className="h-8 w-8 rounded-full"
                            resizeMode="contain"
                          />
                        ) : (
                          <Text className="text-[20px]">📱</Text>
                        )}
                        <ChevronDownIcon size={16} color="#6B7280" />
                      </TouchableOpacity>

                      {/* Phone Number Input */}
                      <InputField
                        placeholder="Enter your phone number"
                        className="text-[14px] text-[#717680] px-2 py-3 flex-1"
                        value={value}
                        maxLength={11}
                        keyboardType="number-pad"
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9]/g, "");
                          onChange(cleaned);
                        }}
                        onBlur={onBlur}
                        editable={!isVerifyingPhone}
                      />
                    </Input>
                  )}
                />

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

                {/* Show verification status */}
                {isVerifyingPhone && (
                  <Text className="text-[11px] text-[#6B7280] mt-1 ml-2">
                    Verifying number...
                  </Text>
                )}
              </FormControl>

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
                      <View className="absolute left-4 border-r pr-2 border-gray-200 h-full top[12px] z-10">
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
                          setSelectedAmount(cleaned);
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

              {/* Quick Amount Selection */}
              <QuickAmountSelector
                amounts={QUICK_AMOUNTS}
                selectedAmount={selectedAmount || amountValue}
                onSelect={handleQuickAmountSelect}
                columns={4}
                spacing="md"
              />
            </VStack>
          </Box>
        </ScrollView>

        {/* FIXED BOTTOM BUTTON */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4"
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
            paddingTop: 16,
            zIndex: 1,
          }}
        >
          <Button
            className="rounded-full bg-[#132939] h-[48px] w-full"
            size="xl"
            onPress={handleContinue}
            disabled={isVerifyingPhone}
          >
            <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
              Continue
            </ButtonText>
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* NETWORK SELECTION DRAWER */}
      <NetworkSelectionDrawer
        isOpen={showNetworkDrawer}
        onClose={() => setShowNetworkDrawer(false)}
        networks={networks}
        selectedNetworkId={networkValue}
        onSelectNetwork={handleNetworkSelect}
        isLoading={isLoading}
        isError={isError}
        title="Choose network Provider"
      />

      {/* CONFIRMATION DRAWER */}
      <ConfirmationDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        onConfirm={handleContinueToPin}
        title="Confirm Purchase"
        subtitle="Please review details carefully. Transactions are irreversible."
        amount={amountValue}
        sections={[
          {
            containerClassName:
              "rounded-[20px] border-[#E5E7EF] border px-4 py-2",
            details: [
              { label: "Phone Number", value: phoneValue },
              { label: "Network", value: selectedNetwork?.name || "" },
              { label: "Amount", value: `₦${formatAmount(amountValue)}` },
            ],
          },
          {
            containerClassName: "p-4",
            details: [
              {
                label: "Wallet Balance",
                value: formatCurrency(wallet?.balance),
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
        isSubmitting={isSubmitting || isPurchasing}
        loadingText="Processing transaction..."
      />
    </SafeAreaView>
  );
}
