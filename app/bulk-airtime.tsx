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
  Trash2,
  Plus,
  RadioTower,
} from "lucide-react-native";
import { useGetNetworks } from "@/hooks/use-networks";
import React, { useCallback, useRef, useEffect, useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
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
import { usePurchaseBulkAirtime } from "@/hooks/use-purchase-bulk-airtime";
import { NetworkSelectionDrawer } from "@/components/network-selection-drawer";

// Validation schema for recipients
const recipientSchema = yup.object().shape({
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(11, "Phone number must be exactly 11 digits"),
  network: yup.string().when("$amountOption", {
    is: "different",
    then: (schema) => schema.required("Network is required"),
    otherwise: (schema) => schema.notRequired(), // ✅ Not required in "same" mode
  }),
  amount: yup.string().when("$amountOption", {
    is: "different",
    then: (schema) =>
      schema
        .required("Amount is required")
        .matches(/^[0-9]+$/, "Amount must contain only numbers")
        .test("min-amount", "Minimum amount is ₦100", (value) => {
          if (!value) return false;
          return parseInt(value, 10) >= 100;
        })
        .test("max-amount", "Maximum amount is ₦500,000", (value) => {
          if (!value) return false;
          return parseInt(value, 10) <= 500000;
        }),
    otherwise: (schema) => schema.notRequired(), // ✅ Not required in "same" mode
  }),
});

// Main form schema with network validation
const schema = yup.object().shape({
  amountOption: yup.string().oneOf(["same", "different"]).required(),
  network: yup.string().when("amountOption", {
    is: "same",
    then: (schema) => schema.required("Please select a network"),
    otherwise: (schema) => schema.notRequired(),
  }),
  sameAmount: yup.string().when("amountOption", {
    is: "same",
    then: (schema) =>
      schema
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
    otherwise: (schema) => schema.notRequired(),
  }),
  recipients: yup
    .array()
    .of(recipientSchema)
    .min(1, "Add at least one recipient"),
});

type FormData = yup.InferType<typeof schema>;

export default function BulkAirtime() {
  const insets = useSafeAreaInsets();
  const { networks, isLoading, isError } = useGetNetworks();
  const verifyPhoneMutation = useVerifyPhone();
  const { purchaseBulkAirtime, isLoading: isPurchasing } =
    usePurchaseBulkAirtime();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState("");
  const [showNetworkDrawer, setShowNetworkDrawer] = useState(false);
  const [hasSetDefaultNetwork, setHasSetDefaultNetwork] = useState(false);
  const [verifyingRecipients, setVerifyingRecipients] = useState<Set<number>>(
    new Set()
  );
  const [recipientNetworkDrawerIndex, setRecipientNetworkDrawerIndex] =
    useState<number | null>(null);
  const verifyingPhones = useRef<Set<number>>(new Set());

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
      amountOption: "same",
      network: "",
      sameAmount: "",
      recipients: [{ phoneNumber: "", amount: "", network: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipients",
  });

  const amountOption = watch("amountOption");
  const networkValue = watch("network");
  const sameAmount = watch("sameAmount");
  const recipients = watch("recipients") || [];

  // Set MTN as default when networks finish loading
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

  // Verify phone number and set network per recipient
  const verifyAndSetNetwork = useCallback(
    async (phone: string, index: number) => {
      if (phone.length !== 11 || verifyingPhones.current.has(index)) {
        return;
      }

      verifyingPhones.current.add(index);
      setVerifyingRecipients((prev) => new Set(prev).add(index));

      try {
        const response = await verifyPhoneMutation.mutateAsync({ phone });
        const networkData = Array.isArray(response) ? response[0] : response;

        if (!networkData) {
          console.warn("⚠️ No network data in response");
          return;
        }

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
          const currentAmountOption = watch("amountOption");

          if (currentAmountOption === "different") {
            // Different mode: set network per recipient
            setValue(`recipients.${index}.network`, detectedNetwork.serviceID, {
              shouldValidate: true,
            });
          } else {
            // Same mode: set global network for first recipient or validate consistency
            const currentGlobalNetwork = watch("network");

            if (!currentGlobalNetwork || index === 0) {
              setValue("network", detectedNetwork.serviceID, {
                shouldValidate: true,
              });
            } else if (detectedNetwork.serviceID !== currentGlobalNetwork) {
              Alert.alert(
                "Different Network Detected",
                `This number is on ${detectedNetwork.name}, but you've selected ${networks.find((n) => n.serviceID === currentGlobalNetwork)?.name}. In "Same amount" mode, all numbers must be on the same network.`,
                [{ text: "OK" }]
              );
            }
          }
        } else {
          console.warn("⚠️ Could not match network");
        }
      } catch (error: any) {
        console.error("❌ Phone verification failed:", error);
      } finally {
        verifyingPhones.current.delete(index);
        setVerifyingRecipients((prev) => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }
    },
    [networks, setValue, verifyPhoneMutation, watch]
  );

  const handleAddRecipient = useCallback(() => {
    append({ phoneNumber: "", amount: "", network: "" });
  }, [append]);

  const handleRemoveRecipient = useCallback(
    (index: number) => {
      if (fields.length > 1) {
        remove(index);
      }
    },
    [remove, fields.length]
  );

  const submitForm = useCallback((data: FormData) => {
    setShowDrawer(true);
  }, []);

  const handleContinueToPin = useCallback(() => {
    setShowDrawer(true);
    setTimeout(() => {
      setShowPinDrawer(true);
    }, 300);
  }, []);

  const calculateTotalAmount = useCallback(() => {
    if (amountOption === "same") {
      const amount = parseInt(sameAmount || "0", 10);
      return amount * recipients.length;
    } else {
      return recipients.reduce((total, recipient) => {
        return total + parseInt(recipient.amount || "0", 10);
      }, 0);
    }
  }, [amountOption, sameAmount, recipients]);

  const handlePinSubmit = useCallback(
    async (pin: string) => {
      setIsSubmitting(true);

      try {
        if (!recipients || recipients.length === 0) {
          throw new Error("Please add at least one recipient.");
        }

        let payload;

        if (amountOption === "same") {
          // For "same" mode, use global network
          const selectedNetworkData = networks.find(
            (n) => n.serviceID === networkValue
          );

          if (!selectedNetworkData) {
            throw new Error("Network not found. Please select a network.");
          }

          payload = {
            type: "same" as const,
            network: selectedNetworkData.serviceID,
            amount: Number(sameAmount),
            recipients: recipients.map((r) => r.phoneNumber),
            pin: pin,
          };
        } else {
          // For "different" mode, validate all recipients have networks
          const invalidRecipients = recipients.filter((r) => !r.network);
          if (invalidRecipients.length > 0) {
            throw new Error(
              "Please ensure all phone numbers have networks selected."
            );
          }

          payload = {
            type: "different" as const,
            recipients: recipients.map((r) => ({
              network: r.network!,
              phone: r.phoneNumber,
              amount: Number(r.amount),
            })),
            pin: pin,
          };
        }

        const result = await purchaseBulkAirtime(payload);

        setShowPinDrawer(false);
        setShowDrawer(false);
        reset();

        await new Promise((resolve) => setTimeout(resolve, 300));

        setHasSetDefaultNetwork(false);
        verifyingPhones.current.clear();

        router.push({
          pathname: "/transaction-success",
          params: {
            amount: calculateTotalAmount().toString(),
            recipient: `${recipients.length} recipients`,
            transactionType: "bulk-airtime",
            network:
              amountOption === "same"
                ? networks.find((n) => n.serviceID === networkValue)?.name || ""
                : "Multiple Networks",
            message: `Bulk airtime purchase successful for ${recipients.length} recipients`,
          },
        });
      } catch (error: any) {
        console.error("Bulk airtime purchase error:", error);

        let errorMessage = "Transaction failed. Please try again.";

        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.responseMessage) {
          errorMessage = error.responseMessage;
        }

        if (errorMessage.toLowerCase().includes("pin")) {
          errorMessage = "Invalid PIN. Please try again.";
        } else if (errorMessage.toLowerCase().includes("insufficient")) {
          errorMessage = "Insufficient balance. Please fund your wallet.";
        } else if (errorMessage.toLowerCase().includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        }

        throw new Error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      amountOption,
      sameAmount,
      recipients,
      networkValue,
      networks,
      purchaseBulkAirtime,
      reset,
      calculateTotalAmount,
    ]
  );

  const handleContinue = useCallback(async () => {
    // Validation for different mode
    if (amountOption === "different") {
      const hasInvalidNetwork = recipients.some((r) => !r.network);
      if (hasInvalidNetwork) {
        Alert.alert(
          "Missing Network",
          "Please select a network for all recipients."
        );
        return;
      }
    }

    const valid = await trigger();

    if (!valid) {
      // Show alert to help debug
      Alert.alert("Validation Error", JSON.stringify(errors, null, 2));
      return;
    }

    handleSubmit(submitForm)();
  }, [trigger, handleSubmit, submitForm, amountOption, recipients, errors]);

  const handleBack = useCallback(() => {
    const hasData =
      recipients.some((r) => r.phoneNumber || r.amount) || sameAmount;

    if (hasData) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to go back? All entered information will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              verifyingPhones.current.clear();
              setHasSetDefaultNetwork(false);
              router.back();
            },
          },
        ]
      );
    } else {
      verifyingPhones.current.clear();
      setHasSetDefaultNetwork(false);
      router.back();
    }
  }, [recipients, sameAmount]);

  const handleQuickAmountSelect = useCallback(
    (amount: string) => {
      if (amountOption === "same") {
        setValue("sameAmount", amount);
        setSelectedAmount(amount);
      }
    },
    [setValue, amountOption]
  );

  const formatAmount = useCallback((amount: string | number) => {
    if (!amount) return "";
    return parseInt(amount.toString(), 10).toLocaleString();
  }, []);

  const handleRecipientNetworkSelect = useCallback(
    (index: number, serviceID: string) => {
      setValue(`recipients.${index}.network`, serviceID, {
        shouldValidate: true,
      });
      setRecipientNetworkDrawerIndex(null);
    },
    [setValue]
  );

  const handleNetworkSelect = useCallback(
    (serviceID: string) => {
      setValue("network", serviceID);
    },
    [setValue]
  );

  const selectedNetwork = networks.find((n) => n.serviceID === networkValue);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <PageHeader
          title="Bulk Airtime"
          onBack={handleBack}
          showBackButton={true}
        />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Box className="bg-white px-4 pb-32 flex-1">
            <VStack space="lg" className="flex-1">
              {/* Amount Option Selection */}
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] font-medium font-manroperegular text-[#414651] mb-[6px]">
                    Choose Amount Option
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="amountOption"
                  render={({ field: { onChange, value } }) => (
                    <VStack space="sm">
                      <TouchableOpacity
                        onPress={() => {
                          onChange("same");
                          // Clear individual recipient networks when switching to same
                          recipients.forEach((_, index) => {
                            setValue(`recipients.${index}.network`, "", {
                              shouldValidate: false,
                            });
                          });
                        }}
                        className="flex-row items-center py-3"
                      >
                        <View
                          className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                            value === "same"
                              ? "border-[#006AB1]"
                              : "border-[#D0D5DD]"
                          }`}
                        >
                          {value === "same" && (
                            <View className="w-3 h-3 rounded-full bg-[#006AB1]" />
                          )}
                        </View>
                        <Text className="text-[14px] font-medium font-manroperegular text-[#141316]">
                          Same amount to all numbers
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          onChange("different");
                          // Clear global network when switching to different
                          setValue("network", "", { shouldValidate: false });
                        }}
                        className="flex-row items-center py-3"
                      >
                        <View
                          className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                            value === "different"
                              ? "border-[#006AB1]"
                              : "border-[#D0D5DD]"
                          }`}
                        >
                          {value === "different" && (
                            <View className="w-3 h-3 rounded-full bg-[#006AB1]" />
                          )}
                        </View>
                        <Text className="text-[14px] font-medium font-manroperegular text-[#141316]">
                          Different amount per number
                        </Text>
                      </TouchableOpacity>
                    </VStack>
                  )}
                />
              </FormControl>

              {/* Network Provider - Only for "same" mode */}
              {amountOption === "same" && (
                <FormControl isInvalid={Boolean(errors.network)}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                      Network Provider
                    </FormControlLabelText>
                  </FormControlLabel>

                  <TouchableOpacity
                    onPress={() => setShowNetworkDrawer(true)}
                    className={`flex-row items-center justify-between rounded-[99px] px-4 py-3 border min-h-[48px] ${
                      errors.network ? "border-red-500" : "border-[#D0D5DD]"
                    }`}
                    disabled={isLoading}
                  >
                    <View className="flex-row items-center">
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#132939" />
                      ) : selectedNetwork?.image ? (
                        <Image
                          source={{ uri: selectedNetwork.image }}
                          alt="network"
                          className="h-8 w-8 rounded-full mr-2"
                          resizeMode="contain"
                        />
                      ) : (
                        <RadioTower size={20} color="#006AB1" />
                      )}
                      <Text className="text-[14px] text-[#414651]">
                        {selectedNetwork?.name || "Select Network"}
                      </Text>
                    </View>
                    <ChevronDownIcon size={20} color="#6B7280" />
                  </TouchableOpacity>

                  {errors.network && (
                    <FormControlError>
                      <FormControlErrorIcon
                        className="text-red-500"
                        as={AlertCircleIcon}
                      />
                      <FormControlErrorText className="text-red-500">
                        {errors.network?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>
              )}

              {/* Recipients Section */}
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Recipient Number
                  </FormControlLabelText>
                </FormControlLabel>

                <VStack space="md">
                  {fields.map((field, index) => (
                    <View key={field.id} className="relative my-2">
                      <View className="flex-row items-start space-x-2">
                        {/* Network Icon - Clickable only in "different" mode */}
                        {amountOption === "different" ? (
                          <TouchableOpacity
                            onPress={() =>
                              setRecipientNetworkDrawerIndex(index)
                            }
                            className="w-12 h-12 rounded-full border border-[#D0D5DD] items-center justify-center bg-white"
                          >
                            {verifyingRecipients.has(index) ? (
                              <ActivityIndicator size="small" color="#006AB1" />
                            ) : (
                              (() => {
                                const currentRecipient = recipients[index];
                                const recipientNetwork =
                                  currentRecipient?.network
                                    ? networks.find(
                                        (n) =>
                                          n.serviceID ===
                                          currentRecipient.network
                                      )
                                    : null;

                                return recipientNetwork?.image ? (
                                  <Image
                                    source={{ uri: recipientNetwork.image }}
                                    alt="network"
                                    className="h-8 w-8 rounded-full"
                                    resizeMode="contain"
                                  />
                                ) : (
                                  <RadioTower size={20} color="#006AB1" />
                                );
                              })()
                            )}
                          </TouchableOpacity>
                        ) : (
                          <View className="w-12 h-12 rounded-full border border-[#D0D5DD] items-center justify-center">
                            {verifyingRecipients.has(index) ? (
                              <ActivityIndicator size="small" color="#006AB1" />
                            ) : selectedNetwork?.image ? (
                              <Image
                                source={{ uri: selectedNetwork.image }}
                                alt="network"
                                className="h-8 w-8 rounded-full"
                                resizeMode="contain"
                              />
                            ) : (
                              <RadioTower size={20} color="#006AB1" />
                            )}
                          </View>
                        )}

                        {/* Phone Number Input */}
                        <View className="flex-1">
                          <Controller
                            control={control}
                            name={`recipients.${index}.phoneNumber`}
                            render={({
                              field: { onChange, onBlur, value },
                            }) => (
                              <Input
                                variant="outline"
                                size="xl"
                                className={`w-full rounded-[99px] min-h-[48px] ${
                                  errors.recipients?.[index]?.phoneNumber
                                    ? "border-2 border-red-500"
                                    : "border border-[#D0D5DD]"
                                }`}
                              >
                                <InputField
                                  placeholder="Enter phone number"
                                  className="text-[14px] text-[#717680] px-4 py-3"
                                  value={value}
                                  maxLength={11}
                                  keyboardType="number-pad"
                                  onChangeText={(text) => {
                                    const cleaned = text.replace(/[^0-9]/g, "");
                                    onChange(cleaned);
                                    if (cleaned.length === 11) {
                                      verifyAndSetNetwork(cleaned, index);
                                    }
                                  }}
                                  onBlur={onBlur}
                                />
                              </Input>
                            )}
                          />
                          {errors.recipients?.[index]?.phoneNumber && (
                            <Text className="text-[11px] text-red-500 mt-1 ml-2">
                              {errors.recipients[index]?.phoneNumber?.message}
                            </Text>
                          )}
                          {amountOption === "different" &&
                            errors.recipients?.[index]?.network && (
                              <Text className="text-[11px] text-red-500 mt-1 ml-2">
                                {errors.recipients[index]?.network?.message}
                              </Text>
                            )}
                        </View>

                        {/* Delete Button */}
                        {fields.length > 1 && (
                          <TouchableOpacity
                            onPress={() => handleRemoveRecipient(index)}
                            className="w-12 h-12 items-center justify-center"
                          >
                            <Trash2 size={20} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Amount Input for Different Amounts */}
                      {amountOption === "different" && (
                        <View className="ml-14 mt-[16px]">
                          <Controller
                            control={control}
                            name={`recipients.${index}.amount`}
                            render={({
                              field: { onChange, onBlur, value },
                            }) => (
                              <Input
                                variant="outline"
                                size="xl"
                                className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] min-h-[48px] ${
                                  errors.recipients?.[index]?.amount
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

                          {errors.recipients?.[index]?.amount && (
                            <FormControlError>
                              <FormControlErrorIcon
                                className="text-red-500"
                                as={AlertCircleIcon}
                              />
                              <FormControlErrorText className="text-red-500">
                                {errors.recipients[index]?.amount?.message}
                              </FormControlErrorText>
                            </FormControlError>
                          )}
                        </View>
                      )}
                    </View>
                  ))}

                  {/* Add Number Button */}
                  <Button
                    className="rounded-full mt-[16px] bg-[#132939] h-[48px] w-full"
                    size="xl"
                    onPress={handleAddRecipient}
                  >
                    <Plus size={20} color="white" />
                    <ButtonText className="text-white text-[16px] font-medium leading-[24px] ml-2">
                      Add Number
                    </ButtonText>
                  </Button>
                </VStack>
              </FormControl>

              {/* Same Amount Section */}
              {amountOption === "same" && (
                <>
                  <FormControl isInvalid={Boolean(errors.sameAmount)}>
                    <FormControlLabel>
                      <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                        Amount
                      </FormControlLabelText>
                    </FormControlLabel>

                    <Controller
                      control={control}
                      name="sameAmount"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          variant="outline"
                          size="xl"
                          className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] min-h-[48px] ${
                            errors.sameAmount
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

                    {errors.sameAmount && (
                      <FormControlError>
                        <FormControlErrorIcon
                          className="text-red-500"
                          as={AlertCircleIcon}
                        />
                        <FormControlErrorText className="text-red-500">
                          {errors.sameAmount?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>

                  {/* Quick Amount Selection */}
                  <QuickAmountSelector
                    amounts={QUICK_AMOUNTS}
                    selectedAmount={selectedAmount || sameAmount}
                    onSelect={handleQuickAmountSelect}
                    columns={4}
                    spacing="md"
                  />
                </>
              )}
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
          >
            <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
              Continue
            </ButtonText>
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* GLOBAL NETWORK DRAWER - for same mode */}
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

      {/* RECIPIENT NETWORK DRAWER - for different mode */}
      {recipientNetworkDrawerIndex !== null && (
        <NetworkSelectionDrawer
          isOpen={true}
          onClose={() => setRecipientNetworkDrawerIndex(null)}
          networks={networks}
          selectedNetworkId={
            recipients[recipientNetworkDrawerIndex]?.network || ""
          }
          onSelectNetwork={(serviceID) =>
            handleRecipientNetworkSelect(recipientNetworkDrawerIndex, serviceID)
          }
          isLoading={isLoading}
          isError={isError}
          title="Choose network Provider"
        />
      )}

      {/* CONFIRMATION DRAWER */}
      <ConfirmationDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        onConfirm={handleContinueToPin}
        title="Confirm Transaction"
        subtitle="Please review details carefully. Transactions are irreversible."
        amount={calculateTotalAmount().toString()}
        sections={[
          {
            containerClassName:
              "rounded-[20px] border-[#E5E7EF] border px-4 py-2",
            details: [
              {
                label: "Number of Beneficiary",
                value: recipients.length.toString(),
              },
              {
                label: "Service Type",
                value: "Airtime",
              },
              ...(amountOption === "same"
                ? [{ label: "Network", value: selectedNetwork?.name || "" }]
                : []),
              ...recipients.map((recipient) => {
                const network =
                  amountOption === "different"
                    ? networks.find((n) => n.serviceID === recipient.network)
                    : null;

                return {
                  label: `${recipient.phoneNumber}${
                    network ? ` (${network.name})` : ""
                  }`,
                  value: `₦${formatAmount(
                    amountOption === "same"
                      ? sameAmount || "0"
                      : recipient.amount || "0"
                  )}`,
                };
              }),
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
                label: "Commission Earned",
                value: "+₦10",
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
        loadingText="Processing bulk transaction..."
      />
    </SafeAreaView>
  );
}
