// KEY CHANGES SUMMARY:
// 1. Removed DATA_BUNDLES import
// 2. Added useGetDataPlans hook
// 3. Updated bundle ID from 'id' to 'variation_code'
// 4. Updated bundle price from 'price' to 'variation_amount'
// 5. Removed 'validity' field (not in API response)
// 6. Added loading and error states for data plans
// 7. Only shows 5 popular plans (filtered in hook)

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
import { useGetDataPlans } from "@/hooks/use-getdata-plans";
import { PinDrawer } from "@/components/pin-drawer";
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as yup from "yup";
import { router, useLocalSearchParams } from "expo-router";
import { NetworkSelectionDrawer } from "@/components/network-selection-drawer";
import { useVerifyPhone } from "@/hooks/use-verify-phone";
import { PageHeader } from "@/components/page-header";
import { ConfirmationDrawer } from "@/components/confirmation-drawer";
import { usePurchaseData } from "@/hooks/use-purchase-data";
import { useDashboard } from "@/hooks/use-dashboard";
import { usePayLaterDashboard } from "@/hooks/use-paylater-dashboard";
import { usePurchaseDataPayLater } from "@/hooks/use-purchase-data-paylater";

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
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const mode = (params.mode as "normal" | "paylater") || "normal";
  const isPayLater = mode === "paylater";
  const { networks, isLoading, isError } = useGetNetworks();
  const {
    wallet, // Wallet balance data
  } = useDashboard();
  const { availableLimit } = usePayLaterDashboard();
  const verifyPhoneMutation = useVerifyPhone();
  const { purchaseData, isLoading: isPurchasingData } = usePurchaseData();
  const { purchaseDataPayLater, isLoading: isPurchasingDataPayLater } =
    usePurchaseDataPayLater();
  const [showNetworkDrawer, setShowNetworkDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [hasSetDefaultNetwork, setHasSetDefaultNetwork] = useState(false);
  const lastVerifiedPhone = useRef<string>("");

  const isPurchasingDataLoading = isPayLater
    ? isPurchasingDataPayLater
    : isPurchasingData;

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

  // NEW: Fetch data plans hook
  const {
    popularPlans,
    isLoading: isLoadingPlans,
    isError: isPlansError,
  } = useGetDataPlans(networkValue, !!networkValue);

  // Set MTN as default
  useEffect(() => {
    if (!isLoading && networks.length > 0 && !hasSetDefaultNetwork) {
      const mtnNetwork = networks.find(
        (network) =>
          network.serviceID?.toLowerCase() === "mtn" ||
          network.name?.toLowerCase() === "mtn"
      );

      if (mtnNetwork) {
        setValue("network", mtnNetwork.serviceID, { shouldValidate: false });
      } else {
        setValue("network", networks[0].serviceID, { shouldValidate: false });
      }

      setHasSetDefaultNetwork(true);
    }
  }, [isLoading, networks, hasSetDefaultNetwork, setValue]);

  // Verify phone and auto-detect network
  const verifyAndSetNetwork = useCallback(
    async (phone: string) => {
      if (phone.length !== 11 || phone === lastVerifiedPhone.current) {
        return;
      }

      lastVerifiedPhone.current = phone;
      setIsVerifyingPhone(true);

      try {
        const response = await verifyPhoneMutation.mutateAsync({ phone });
        const networkData = Array.isArray(response) ? response[0] : response;

        if (!networkData) return;

        const detectedNetwork = networks.find((network) => {
          const apiId = networkData.id?.toLowerCase();
          const serviceId = network.serviceID?.toLowerCase();

          if (serviceId === apiId) return true;
          if (apiId === "9mobile" && serviceId === "etisalat") return true;
          if (apiId === "etisalat" && serviceId === "etisalat") return true;

          return (
            serviceId?.includes(apiId) ||
            network.name?.toLowerCase().includes(apiId)
          );
        });

        if (detectedNetwork) {
          setValue("network", detectedNetwork.serviceID, {
            shouldValidate: true,
          });
        }
      } catch (error) {
        lastVerifiedPhone.current = "";
      } finally {
        setIsVerifyingPhone(false);
      }
    },
    [networks, setValue, verifyPhoneMutation]
  );

  useEffect(() => {
    if (
      phoneValue &&
      phoneValue.length === 11 &&
      phoneValue !== lastVerifiedPhone.current
    ) {
      const timeoutId = setTimeout(() => {
        verifyAndSetNetwork(phoneValue);
      }, 800);

      return () => clearTimeout(timeoutId);
    }

    if (phoneValue.length < 11) {
      lastVerifiedPhone.current = "";
    }
  }, [phoneValue, verifyAndSetNetwork]);

  const selectedNetwork = networks.find((n) => n.serviceID === networkValue);
  const selectedBundle = popularPlans.find(
    (b) => b.variation_code === dataBundleValue
  );

  const submitForm = useCallback((data: FormData) => {
    setShowConfirmDrawer(true);
  }, []);

  const handleContinueToPin = useCallback(() => {
    setShowConfirmDrawer(true);
    setTimeout(() => {
      setShowPinDrawer(true);
    }, 300);
  }, []);

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

        if (!selectedBundle) {
          throw new Error("No data bundle selected. Please select a bundle.");
        }

        const serviceID = `${networkValue}-data`;
        const payload = {
          serviceID: serviceID,
          billersCode: phoneValue,
          variation_code: selectedBundle.variation_code,
          amount: Number(selectedBundle.variation_amount),
          phone: phoneValue,
          pin: pin,
        };

        const result = isPayLater
          ? await purchaseDataPayLater(payload)
          : await purchaseData(payload);

        // Success - close drawers and navigate
        setShowPinDrawer(false);
        setShowConfirmDrawer(false);
        reset();

        await new Promise((resolve) => setTimeout(resolve, 300));

        // Reset tracking
        setHasSetDefaultNetwork(false);
        lastVerifiedPhone.current = "";

        router.push({
          pathname: "/transaction-success",
          params: {
            amount: selectedBundle.variation_amount,
            recipient: phoneValue,
            phoneNumber: phoneValue,
            transactionType: "data",
            network: selectedNetworkData.name,
            dataBundle: selectedBundle.name,
            transactionId: result.responseBody?.transactionId || "",
            reference: result.responseBody?.reference || "",
            message: result.responseMessage || "Data purchased successfully",
          },
        });
      } catch (error: any) {
        console.error("❌ Data purchase error:", error);

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
    [
      phoneValue,
      networkValue,
      selectedBundle,
      networks,
      purchaseData,
      purchaseDataPayLater,
      isPayLater,
      reset,
    ]
  );
  const handleContinue = useCallback(async () => {
    const valid = await trigger();

    if (!valid) {
      return;
    }

    // Check credit limit for pay later
    if (isPayLater) {
      const amount = Number(selectedBundle?.variation_amount || 0);
      if (amount > availableLimit) {
        Alert.alert(
          "Insufficient Credit",
          `Your available credit limit is ₦${availableLimit.toLocaleString()}. Please choose a lower amount or repay existing loans.`
        );
        return;
      }
    }

    handleSubmit(submitForm)();
  }, [
    trigger,
    isPayLater,
    handleSubmit,
    submitForm,
    selectedBundle?.variation_amount,
    availableLimit,
  ]);

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
  }, [phoneValue, dataBundleValue]);

  const formatAmount = useCallback((amount: string) => {
    if (!amount) return "";
    return parseInt(amount, 10).toLocaleString();
  }, []);

  const handleNetworkSelect = useCallback(
    (networkVal: string) => {
      setValue("network", networkVal, { shouldValidate: true });
      // Clear selected bundle when network changes
      setValue("dataBundle", "", { shouldValidate: false });
    },
    [setValue]
  );

  const handleBundleSelect = useCallback(
    (bundleCode: string) => {
      setValue("dataBundle", bundleCode, { shouldValidate: true });
    },
    [setValue]
  );

  const formatCurrency = (value?: string | number) => {
    if (!value) return "₦0.00";

    const num = Number(value);
    if (isNaN(num)) return "₦0.00";

    return `₦ ${num.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const balanceToDisplay = isPayLater ? availableLimit : wallet?.balance || 0;
  const balanceLabel = isPayLater ? "Available Credit" : "Wallet Balance";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <PageHeader
          title={isPayLater ? "Buy Airtime (Pay Later)" : "Buy Airtime"}
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
                            alt="network"
                            className="h-8 w-8 rounded-full"
                            resizeMode="contain"
                          />
                        ) : (
                          <Text className="text-[20px]">📱</Text>
                        )}
                        <ChevronDownIcon size={16} color="#6B7280" />
                      </TouchableOpacity>

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

                {isVerifyingPhone && (
                  <Text className="text-[11px] text-[#6B7280] mt-1 ml-2">
                    Verifying number...
                  </Text>
                )}
              </FormControl>

              {/* Data Bundle Selection - NEW VERSION */}
              {networkValue && (
                <FormControl
                  className="mt-[32px]"
                  isInvalid={Boolean(errors.dataBundle)}
                >
                  <FormControlLabel>
                    <FormControlLabelText className="text-[14px] text-[#414651] mb-[6px]">
                      Popular Data Bundles
                    </FormControlLabelText>
                  </FormControlLabel>

                  <Controller
                    control={control}
                    name="dataBundle"
                    render={({ field: { value } }) => (
                      <VStack space="sm">
                        {isLoadingPlans && (
                          <View className="py-8 items-center">
                            <ActivityIndicator size="large" color="#132939" />
                            <Text className="text-[14px] text-[#6B7280] mt-4">
                              Loading data plans...
                            </Text>
                          </View>
                        )}

                        {isPlansError && !isLoadingPlans && (
                          <View className="py-4 px-4 bg-red-50 rounded-[16px]">
                            <Text className="text-[14px] text-red-500 text-center">
                              Failed to load data plans. Please try again.
                            </Text>
                          </View>
                        )}

                        {!isLoadingPlans &&
                          !isPlansError &&
                          popularPlans.map((bundle) => (
                            <TouchableOpacity
                              key={bundle.variation_code}
                              onPress={() =>
                                handleBundleSelect(bundle.variation_code)
                              }
                              className={`flex-row justify-between items-center p-4 rounded-[16px] border ${
                                value === bundle.variation_code
                                  ? "border-[#132939] bg-[#F9FAFB]"
                                  : "border-[#E5E7EB] bg-white"
                              }`}
                            >
                              <View className="flex-1 pr-4">
                                <Text className="text-[14px] font-medium font-manropesemibold text-[#000000]">
                                  {bundle.name}
                                </Text>
                              </View>
                              <Text className="text-[16px] font-semibold font-manropebold text-[#132939]">
                                ₦{formatAmount(bundle.variation_amount)}
                              </Text>
                            </TouchableOpacity>
                          ))}

                        {!isLoadingPlans &&
                          !isPlansError &&
                          popularPlans.length === 0 && (
                            <View className="py-8 px-4">
                              <Text className="text-[14px] text-[#6B7280] text-center">
                                No data plans available for this network.
                              </Text>
                            </View>
                          )}
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

        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-4 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Button
            className="rounded-full bg-[#132939] h-[48px] w-full"
            size="xl"
            onPress={handleContinue}
            disabled={
              isSubmitting ||
              isPurchasingData ||
              isVerifyingPhone ||
              isLoadingPlans
            }
          >
            <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
              Continue
            </ButtonText>
          </Button>
        </View>
      </KeyboardAvoidingView>

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

      <ConfirmationDrawer
        isOpen={showConfirmDrawer}
        onClose={() => setShowConfirmDrawer(false)}
        onConfirm={handleContinueToPin}
        title="Confirm Transaction"
        subtitle="Please review details carefully. Transactions are irreversible."
        amount={selectedBundle?.variation_amount}
        showAmount={true}
        amountClassName="text-[24px] font-medium text-center mt-[18px] font-manropebold text-[#000000]"
        sections={[
          {
            containerClassName:
              "rounded-[20px] border-[#E5E7EF] border px-4 py-2",
            details: [
              { label: "Phone Number", value: phoneValue },
              { label: "Network", value: selectedNetwork?.name || "" },
              { label: "Data Plan", value: selectedBundle?.name || "" },
              {
                label: "Amount",
                value: `₦${formatAmount(selectedBundle?.variation_amount || "0")}`,
              },
            ],
          },
          {
            containerClassName: "px-4 py-2",
            details: [
              {
                label: balanceLabel,
                value: formatCurrency(balanceToDisplay),
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

      <PinDrawer
        isOpen={showPinDrawer}
        onClose={() => setShowPinDrawer(false)}
        onSubmit={handlePinSubmit}
        title="Enter PIN"
        isSubmitting={isSubmitting || isPurchasingDataLoading}
        loadingText="Processing transaction..."
      />
    </SafeAreaView>
  );
}
