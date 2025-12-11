import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { useGetCableServices } from "@/hooks/use-cable-services";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { useVerifyCard } from "@/hooks/use-verify-card";
import PackageSelector from "@/components/package-selector";
import { useCableVariations } from "@/hooks/use-cable-variations";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { yupResolver } from "@hookform/resolvers/yup";
import Animated, { FadeIn } from "react-native-reanimated";
import {
  AlertCircleIcon,
  CheckCircle,
  ChevronDownIcon,
  Gift,
  Wallet,
} from "lucide-react-native";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as yup from "yup";
import { router } from "expo-router";
import { PinDrawer } from "@/components/pin-drawer";
import { ConfirmationDrawer } from "@/components/confirmation-drawer";
import { PageHeader } from "@/components/page-header";
import CableServiceDrawer from "@/components/cable-service-drawer";
import { ACCOUNT_VERIFICATION_DELAY } from "@/constants/menu";

// Validation schema
const schema = yup.object().shape({
  cableService: yup.string().required("Please select a cable service"),
  package: yup.string().required("Please select a package"),
  smartCardNumber: yup
    .string()
    .required("Smart card number is required")
    .matches(/^[0-9]+$/, "Smart card number must contain only digits")
    .min(10, "Smart card number must be at least 10 digits"),
  cardName: yup.string(),
});

type FormData = yup.InferType<typeof schema>;

export default function CableTV() {
  const insets = useSafeAreaInsets();
  const { cableServices, isLoading, isError } = useGetCableServices();
  const { mutateAsync: verifyCard, isPending: isVerifyingCard } =
    useVerifyCard();
  const [showServiceDrawer, setShowServiceDrawer] = useState(false);
  const [showConfirmationDrawer, setShowConfirmationDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [cardVerified, setCardVerified] = useState(false);
  const [cardName, setCardName] = useState("");

  const verificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

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
      cableService: "",
      package: "",
      smartCardNumber: "",
      cardName: "",
    },
  });

  const cableServiceValue = watch("cableService");
  const packageValue = watch("package");
  const smartCardValue = watch("smartCardNumber");
  const cardNameValue = watch("cardName");
  const { data: variationsData, isLoading: isLoadingVariations } =
    useCableVariations(cableServiceValue);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  // Card verification with debouncing
  const handleCardBlur = useCallback(() => {
    // Clear previous timeout
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }

    // Reset verification state
    setCardName("");
    setCardVerified(false);

    if (smartCardValue && smartCardValue.length === 10 && cableServiceValue) {
      // Debounce the API call
      verificationTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await verifyCard({
            serviceID: cableServiceValue,
            billersCode: smartCardValue,
          });

          setCardName(response.Customer_Name);
          setCardVerified(true);
        } catch (error: any) {
          console.error("Card verification error:", error);

          Alert.alert(
            "Verification Failed",
            error?.message ||
              "Unable to verify smart card. Please check the card number and try again."
          );
          setCardName("");
          setCardVerified(false);
        }
      }, ACCOUNT_VERIFICATION_DELAY);
    }
  }, [smartCardValue, cableServiceValue, verifyCard]);

  // Re-verify when service changes
  useEffect(() => {
    if (smartCardValue && smartCardValue.length === 10 && cableServiceValue) {
      handleCardBlur();
    } else {
      setCardName("");
      setCardVerified(false);
    }
  }, [cableServiceValue, smartCardValue, handleCardBlur]);

  const availablePackages =
    variationsData?.variations?.map((variation) => ({
      id: variation.variation_code,
      name: variation.name,
      price: parseFloat(variation.variation_amount),
    })) || [];

  const selectedPackage = availablePackages.find((p) => p.id === packageValue);
  const selectedProvider = cableServices.find(
    (p) => p.serviceID === cableServiceValue
  );

  const handleServiceSelect = useCallback(
    (serviceId: string) => {
      setValue("cableService", serviceId);
      setValue("package", ""); // Reset package when service changes
    },
    [setValue]
  );

  const handleContinue = useCallback(async () => {
    const valid = await trigger();
    if (!valid) return;

    if (!cardVerified) {
      Alert.alert(
        "Card Verification Required",
        "Please wait for card verification to complete."
      );
      return;
    }

    handleSubmit(() => {
      setShowConfirmationDrawer(true);
    })();
  }, [trigger, cardVerified, handleSubmit]);

  const handleContinueToPin = useCallback(() => {
    setShowConfirmationDrawer(false);
    setTimeout(() => {
      setShowPinDrawer(true);
    }, 300);
  }, []);

  const handlePinSubmit = useCallback(
    async (pin: string) => {
      setIsSubmitting(true);

      try {
        console.log("🔐 PIN entered, processing purchase...");

        // API call will go here
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setShowPinDrawer(false);
        reset();

        router.push({
          pathname: "/transaction-success",
          params: {
            amount: selectedPackage?.price.toString() || "0",
            recipient: smartCardValue,
            transactionType: "cable",
            network: selectedProvider?.name || "",
            package: selectedPackage?.name || "",
            cardName: cardNameValue,
            message: "Cable TV subscription successful",
          },
        });
      } catch (error: any) {
        throw new Error("Transaction failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedPackage, smartCardValue, selectedProvider, cardNameValue, reset]
  );

  const handleBack = useCallback(() => {
    if (smartCardValue || packageValue) {
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
  }, [smartCardValue, packageValue]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <PageHeader
          title="Cable Tv Payment"
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
              {/* Cable Service Selection */}
              <FormControl isInvalid={Boolean(errors.cableService)}>
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Cable Service
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="cableService"
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      onPress={() => !isLoading && setShowServiceDrawer(true)}
                      disabled={isLoading}
                      className={`w-full rounded-[99px] border min-h-[48px] flex-row items-center justify-between px-4 ${
                        errors.cableService
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      } ${isLoading ? "opacity-50" : ""}`}
                    >
                      <View className="flex-row items-center gap-3 flex-1">
                        {isLoading ? (
                          <View className="flex-row items-center flex-1">
                            <ActivityIndicator
                              size="small"
                              color="#132939"
                              className="mr-3"
                            />
                            <Text className="text-[14px] text-[#717680]">
                              Loading services...
                            </Text>
                          </View>
                        ) : selectedProvider ? (
                          <>
                            <Text className="text-[14px] text-[#132939]">
                              {selectedProvider.name}
                            </Text>
                          </>
                        ) : (
                          <Text className="text-[14px] text-[#717680]">
                            Select cable Service
                          </Text>
                        )}
                      </View>
                      {!isLoading && (
                        <ChevronDownIcon size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                  )}
                />

                {errors.cableService && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.cableService?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Package Selection */}
              <FormControl
                isInvalid={Boolean(errors.package)}
                isDisabled={!cableServiceValue}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Package
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="package"
                  render={({ field: { onChange, value } }) => (
                    <PackageSelector
                      value={value}
                      onValueChange={onChange}
                      packages={availablePackages}
                      placeholder="Select Package"
                      error={Boolean(errors.package)}
                      isLoading={isLoadingVariations}
                      disabled={!cableServiceValue}
                    />
                  )}
                />

                {errors.package && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.package?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Smart Card Number */}
              <FormControl isInvalid={Boolean(errors.smartCardNumber)}>
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Smart Card Number
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="smartCardNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      variant="outline"
                      size="xl"
                      className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] min-h-[48px] ${
                        errors.smartCardNumber
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      }`}
                    >
                      <InputField
                        placeholder="Enter Card Number"
                        className="text-[14px] text-[#717680] px-4 py-3"
                        value={value}
                        keyboardType="number-pad"
                        maxLength={10}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9]/g, "");
                          onChange(cleaned);
                        }}
                        onBlur={() => {
                          onBlur();
                          handleCardBlur();
                        }}
                        editable={!isVerifyingCard}
                      />
                      {isVerifyingCard && (
                        <View className="absolute right-4 top-3">
                          <ActivityIndicator size="small" color="#132939" />
                        </View>
                      )}
                    </Input>
                  )}
                />

                {errors.smartCardNumber && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.smartCardNumber?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {cardVerified && cardName && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <FormControl>
                    <FormControlLabel>
                      <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                        Card Name
                      </FormControlLabelText>
                    </FormControlLabel>

                    <Input
                      variant="outline"
                      size="xl"
                      isReadOnly={true}
                      className="w-full p-2 rounded-[16px] min-h-[48px] border border-[#10B981] bg-[#F0FDF4]"
                    >
                      <InputField
                        value={cardName}
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
            </VStack>
          </Box>
        </ScrollView>

        {/* Fixed Bottom Button */}
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
          >
            <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
              Continue
            </ButtonText>
          </Button>
        </View>
      </KeyboardAvoidingView>

      <CableServiceDrawer
        isOpen={showServiceDrawer}
        onClose={() => setShowServiceDrawer(false)}
        cableServices={cableServices}
        isLoading={isLoading}
        isError={isError}
        selectedProviderId={selectedServiceId}
        onSelectProvider={handleServiceSelect}
      />

      {/* Confirmation Drawer */}
      <ConfirmationDrawer
        isOpen={showConfirmationDrawer}
        onClose={() => setShowConfirmationDrawer(false)}
        onConfirm={handleContinueToPin}
        title="Confirm Transaction"
        subtitle="Please review details carefully. Transactions are irreversible."
        amount={selectedPackage?.price.toString() || "0"}
        sections={[
          {
            containerClassName:
              "rounded-[20px] border-[#E5E7EF] border px-4 py-2",
            details: [
              { label: "Cable Service", value: selectedProvider?.name || "" },
              { label: "Package", value: selectedPackage?.name || "" },
              { label: "Card Number", value: smartCardValue },
              { label: "Card Name", value: cardName },
              {
                label: "Amount",
                value: `₦${selectedPackage?.price.toLocaleString() || "0"}`,
              },
            ],
          },
          {
            containerClassName: "p-4",
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

      {/* PIN Drawer */}
      <PinDrawer
        isOpen={showPinDrawer}
        onClose={() => setShowPinDrawer(false)}
        onSubmit={handlePinSubmit}
        title="Enter PIN"
        isSubmitting={isSubmitting}
        loadingText="Processing transaction..."
      />
    </SafeAreaView>
  );
}