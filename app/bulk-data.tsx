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
  ChevronRight,
} from "lucide-react-native";
import { useGetNetworks } from "@/hooks/use-networks";
import React, {
  useCallback,
  useRef,
  useEffect,
  useState,
  useMemo,
} from "react";
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
import { PinDrawer } from "@/components/pin-drawer";
import { ConfirmationDrawer } from "@/components/confirmation-drawer";
import { PageHeader } from "@/components/page-header";
import { usePurchaseBulkData, BulkDataPayload } from "@/hooks/use-purchase-bulk-data";
import { NetworkSelectionDrawer } from "@/components/network-selection-drawer";
import DataPlanSelectionDrawer from "@/components/data-plan-selection-drawer";
import { useGetDataPlans } from "@/hooks/use-getdata-plans"; // For "same" mode - returns top 5
import { useGetAllDataPlans } from "@/hooks/use-get-data-plans"; // For "different" mode - returns all

// Validation schema for recipients
const recipientSchema = yup.object().shape({
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(11, "Phone number must be exactly 11 digits"),
  network: yup.string().when("$planOption", {
    is: "different",
    then: (schema) => schema.required("Network is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  dataPlan: yup.string().when("$planOption", {
    is: "different",
    then: (schema) => schema.required("Data plan is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  dataPlanName: yup.string().notRequired(), // Store plan name for display
});

// Main form schema
const schema = yup.object().shape({
  planOption: yup.string().oneOf(["same", "different"]).required(),
  network: yup.string().when("planOption", {
    is: "same",
    then: (schema) => schema.required("Please select a network"),
    otherwise: (schema) => schema.notRequired(),
  }),
  samePlan: yup.string().when("planOption", {
    is: "same",
    then: (schema) => schema.required("Please select a data plan"),
    otherwise: (schema) => schema.notRequired(),
  }),
  recipients: yup
    .array()
    .of(recipientSchema)
    .min(1, "Add at least one recipient"),
});

type FormData = yup.InferType<typeof schema>;

export default function BulkData() {
  const insets = useSafeAreaInsets();
  const { networks, isLoading, isError } = useGetNetworks();
  const verifyPhoneMutation = useVerifyPhone();
  const { purchaseBulkData, isLoading: isPurchasing } = usePurchaseBulkData();

  const [showDrawer, setShowDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNetworkDrawer, setShowNetworkDrawer] = useState(false);
  const [showPlanDrawer, setShowPlanDrawer] = useState(false);
  const [hasSetDefaultNetwork, setHasSetDefaultNetwork] = useState(false);
  const [verifyingRecipients, setVerifyingRecipients] = useState<Set<number>>(
    new Set()
  );
  const [recipientNetworkDrawerIndex, setRecipientNetworkDrawerIndex] =
    useState<number | null>(null);
  const [recipientPlanDrawerIndex, setRecipientPlanDrawerIndex] = useState<
    number | null
  >(null);
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
      planOption: "same",
      network: "",
      samePlan: "",
      recipients: [
        { phoneNumber: "", dataPlan: "", network: "", dataPlanName: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipients",
  });

  const planOption = watch("planOption");
  const networkValue = watch("network");
  const samePlan = watch("samePlan");
  const recipientsWatch = watch("recipients");
  const recipients = useMemo(() => recipientsWatch || [], [recipientsWatch]);

  // Fetch top 5 data plans for "same" mode
  const { popularPlans: sameModePopularPlans, isLoading: isLoadingSamePlans } =
    useGetDataPlans(
      networkValue || "",
      planOption === "same" && !!networkValue
    );

  // Fetch ALL data plans for "different" mode
 const currentRecipientNetwork = recipientPlanDrawerIndex !== null 
    ? recipients[recipientPlanDrawerIndex]?.network 
    : "";
    
  const { 
    dataPlans: differentModeAllPlans, 
    isLoading: isLoadingDifferentPlans 
  } = useGetAllDataPlans(
    currentRecipientNetwork || "",
    planOption === "different" && !!currentRecipientNetwork
  );

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

  // Verify phone number and set network
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
          const currentPlanOption = watch("planOption");

          if (currentPlanOption === "different") {
            setValue(`recipients.${index}.network`, detectedNetwork.serviceID, {
              shouldValidate: true,
            });
          } else {
            const currentGlobalNetwork = watch("network");

            if (!currentGlobalNetwork || index === 0) {
              setValue("network", detectedNetwork.serviceID, {
                shouldValidate: true,
              });
            } else if (detectedNetwork.serviceID !== currentGlobalNetwork) {
              Alert.alert(
                "Different Network Detected",
                `This number is on ${detectedNetwork.name}, but you've selected ${networks.find((n) => n.serviceID === currentGlobalNetwork)?.name}. In "Same plan" mode, all numbers must be on the same network.`,
                [{ text: "OK" }]
              );
            }
          }
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
    append({ phoneNumber: "", dataPlan: "", network: "", dataPlanName: "" });
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
    if (planOption === "same") {
      const plan = sameModePopularPlans.find(
        (p) => p.variation_code === samePlan
      );
      const amount = plan ? parseFloat(plan.variation_amount) : 0;
      return amount * recipients.length;
    } else {
      return recipients.reduce((total, recipient) => {
        // For different mode, we need to find the plan from the recipient's network
        // Since we can't fetch all networks at once, we'll use a placeholder
        // In reality, you'd need to store the plan amounts when they're selected
        return total;
      }, 0);
    }
  }, [planOption, samePlan, recipients, sameModePopularPlans]);

 const handlePinSubmit = useCallback(
    async (pin: string) => {
      setIsSubmitting(true);

      try {
        if (!recipients || recipients.length === 0) {
          throw new Error("Please add at least one recipient.");
        }

        let payload: BulkDataPayload;

        if (planOption === "same") {
          const selectedNetworkData = networks.find(
            (n) => n.serviceID === networkValue
          );

          if (!selectedNetworkData) {
            throw new Error("Network not found. Please select a network.");
          }

          if (!samePlan) {
            throw new Error("Please select a data plan.");
          }

          const selectedPlan = sameModePopularPlans.find((p) => p.variation_code === samePlan);
          if (!selectedPlan) {
            throw new Error("Data plan not found.");
          }

          payload = {
            type: "same" as const,
            network: selectedNetworkData.serviceID,
            plan: samePlan,
            recipients: recipients.map((r) => r.phoneNumber),
            pin: pin,
          };
        } else {
          const invalidRecipients = recipients.filter((r) => !r.network || !r.dataPlan);
          if (invalidRecipients.length > 0) {
            throw new Error(
              "Please ensure all phone numbers have networks and data plans selected."
            );
          }

          payload = {
            type: "different" as const,
            recipients: recipients.map((r) => ({
              network: r.network!,
              phone: r.phoneNumber,
              planCode: r.dataPlan!,
            })),
            pin: pin,
          };
        }

        const result = await purchaseBulkData(payload);

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
            transactionType: "bulk-data",
            network:
              planOption === "same"
                ? networks.find((n) => n.serviceID === networkValue)?.name || ""
                : "Multiple Networks",
            message: `Bulk data purchase successful for ${recipients.length} recipients`,
          },
        });
      } catch (error: any) {
        console.error("Bulk data purchase error:", error);

        let errorMessage = "Transaction failed. Please try again.";

        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.responseMessage) {
          errorMessage = error.responseMessage;
        }

        throw new Error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      planOption,
      samePlan,
      recipients,
      networkValue,
      networks,
      sameModePopularPlans,
      purchaseBulkData,
      reset,
      calculateTotalAmount,
    ]
  );
  const handleContinue = useCallback(async () => {
    if (planOption === "different") {
      const hasInvalidData = recipients.some((r) => !r.network || !r.dataPlan);
      if (hasInvalidData) {
        Alert.alert(
          "Missing Information",
          "Please ensure all recipients have a network and data plan selected."
        );
        return;
      }
    }

    const valid = await trigger();

    if (!valid) {
      return;
    }

    handleSubmit(submitForm)();
  }, [trigger, handleSubmit, submitForm, planOption, recipients]);

  const handleBack = useCallback(() => {
    const hasData =
      recipients.some((r) => r.phoneNumber || r.dataPlan) || samePlan;

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
  }, [recipients, samePlan]);

  const formatAmount = useCallback((amount: string | number) => {
    if (!amount) return "0";
    return parseFloat(amount.toString()).toLocaleString();
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
      setValue("samePlan", ""); // Reset plan when network changes
    },
    [setValue]
  );

  const handlePlanSelect = useCallback(
    (planCode: string) => {
      setValue("samePlan", planCode);
      setShowPlanDrawer(false);
    },
    [setValue]
  );

  const handleRecipientPlanSelect = useCallback(
    (index: number, planCode: string) => {
      // Find the plan details to store the name
      const selectedPlan = differentModeAllPlans.find(
        (p) => p.variation_code === planCode
      );

      setValue(`recipients.${index}.dataPlan`, planCode, {
        shouldValidate: true,
      });

      // Store the plan name for display
      if (selectedPlan) {
        setValue(`recipients.${index}.dataPlanName`, selectedPlan.name, {
          shouldValidate: false,
        });
      }

      setRecipientPlanDrawerIndex(null);
    },
    [setValue, differentModeAllPlans]
  );

  const handleRecipientPlanClick = useCallback(
    (index: number) => {
      const currentRecipient = recipients[index];

      if (!currentRecipient.network) {
        Alert.alert(
          "Network Required",
          "Please verify the phone number first to detect the network."
        );
        return;
      }

      // Open the drawer - the hook will automatically fetch plans for this network
      setRecipientPlanDrawerIndex(index);
    },
    [recipients]
  );

  const selectedNetwork = networks.find((n) => n.serviceID === networkValue);
  const selectedPlan = sameModePopularPlans.find(
    (p) => p.variation_code === samePlan
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <PageHeader
          title="Bulk Data"
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
              {/* Plan Option Selection */}
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] font-medium font-manroperegular text-[#414651] mb-[6px]">
                    Choose Plan Option
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="planOption"
                  render={({ field: { onChange, value } }) => (
                    <VStack space="sm">
                      <TouchableOpacity
                        onPress={() => {
                          onChange("same");
                          recipients.forEach((_, index) => {
                            setValue(`recipients.${index}.network`, "", {
                              shouldValidate: false,
                            });
                            setValue(`recipients.${index}.dataPlan`, "", {
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
                          Same plan to all numbers
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          onChange("different");
                          setValue("network", "", { shouldValidate: false });
                          setValue("samePlan", "", { shouldValidate: false });
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
                          Different plan to all numbers
                        </Text>
                      </TouchableOpacity>
                    </VStack>
                  )}
                />
              </FormControl>

              {/* Network Provider - Only for "same" mode */}
              {planOption === "same" && (
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
                        {planOption === "different" ? (
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

                      {/* Choose Plan Button - Only in "different" mode */}
                      {planOption === "different" && (
                        <View className="ml-14 mt-[16px]">
                          <Controller
                            control={control}
                            name={`recipients.${index}.dataPlanName`}
                            render={({ field: { value } }) => {
                              const currentRecipient = recipients[index];
                              const recipientNetwork = currentRecipient?.network
                                ? networks.find(
                                    (n) =>
                                      n.serviceID === currentRecipient.network
                                  )
                                : null;

                              // Use the stored plan name directly from the field value
                              const displayName = value || "Choose Plan";

                              return (
                                <TouchableOpacity
                                  onPress={() =>
                                    handleRecipientPlanClick(index)
                                  }
                                  className={`flex-row items-center justify-between rounded-[99px] px-4 py-3 border min-h-[48px] ${
                                    errors.recipients?.[index]?.dataPlan
                                      ? "border-red-500"
                                      : "border-[#D0D5DD]"
                                  }`}
                                >
                                  <Text className="text-[14px] text-[#717680] flex-1">
                                    {displayName}
                                  </Text>
                                  <ChevronRight size={20} color="#6B7280" />
                                </TouchableOpacity>
                              );
                            }}
                          />
                          {errors.recipients?.[index]?.dataPlan && (
                            <Text className="text-[11px] text-red-500 mt-1 ml-2">
                              {errors.recipients[index]?.dataPlan?.message}
                            </Text>
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

              {/* Choose Plan Section - Only for "same" mode - Shows top 5 */}
              {planOption === "same" && networkValue && (
                <FormControl isInvalid={Boolean(errors.samePlan)}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                      Choose Plan (Popular)
                    </FormControlLabelText>
                  </FormControlLabel>

                  {isLoadingSamePlans ? (
                    <View className="py-8 items-center">
                      <ActivityIndicator size="large" color="#132939" />
                      <Text className="text-[14px] text-[#6B7280] mt-4">
                        Loading popular plans...
                      </Text>
                    </View>
                  ) : (
                    <VStack space="sm">
                      {sameModePopularPlans.map((plan) => (
                        <TouchableOpacity
                          key={plan.variation_code}
                          onPress={() => handlePlanSelect(plan.variation_code)}
                          className={`flex-row justify-between items-center p-4 rounded-[16px] border ${
                            samePlan === plan.variation_code
                              ? "border-[#132939] bg-[#F9FAFB]"
                              : "border-[#E5E7EB] bg-white"
                          }`}
                        >
                          <View className="flex-1 pr-4">
                            <Text className="text-[14px] font-medium font-manropesemibold text-[#000000]">
                              {plan.name}
                            </Text>
                          </View>
                          <Text className="text-[16px] font-semibold font-manropebold text-[#132939]">
                            ₦{formatAmount(plan.variation_amount)}
                          </Text>
                        </TouchableOpacity>
                      ))}

                      {sameModePopularPlans.length === 0 && (
                        <View className="py-8 px-4">
                          <Text className="text-[14px] text-[#6B7280] text-center">
                            No data plans available for this network.
                          </Text>
                        </View>
                      )}
                    </VStack>
                  )}

                  {errors.samePlan && (
                    <FormControlError>
                      <FormControlErrorIcon
                        className="text-red-500"
                        as={AlertCircleIcon}
                      />
                      <FormControlErrorText className="text-red-500">
                        {errors.samePlan?.message}
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

      {/* RECIPIENT PLAN DRAWER - for different mode - Shows ALL plans */}
      {recipientPlanDrawerIndex !== null &&
        (() => {
          const currentRecipient = recipients[recipientPlanDrawerIndex];
          const recipientNetwork = currentRecipient?.network
            ? networks.find((n) => n.serviceID === currentRecipient.network)
            : null;

          return recipientNetwork ? (
            <DataPlanSelectionDrawer
              isOpen={true}
              onClose={() => setRecipientPlanDrawerIndex(null)}
              dataPlans={differentModeAllPlans}
              selectedPlanCode={currentRecipient?.dataPlan || ""}
              onSelectPlan={(planCode) =>
                handleRecipientPlanSelect(recipientPlanDrawerIndex, planCode)
              }
              networkName={recipientNetwork.name}
              isLoading={isLoadingDifferentPlans}
              title="Choose Data Plan"
            />
          ) : null;
        })()}

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
                value: "Data",
              },
              ...(planOption === "same"
                ? [
                    { label: "Network", value: selectedNetwork?.name || "" },
                    { label: "Data Plan", value: selectedPlan?.name || "" },
                  ]
                : []),
              ...recipients.map((recipient) => {
                if (planOption === "different") {
                  const network = networks.find(
                    (n) => n.serviceID === recipient.network
                  );
                  // Use stored plan name instead of searching
                  const planName = recipient.dataPlanName || "N/A";

                  return {
                    label: `${recipient.phoneNumber}${network ? ` (${network.name})` : ""}`,
                    value: planName,
                  };
                } else {
                  return {
                    label: recipient.phoneNumber,
                    value: selectedPlan
                      ? `₦${formatAmount(selectedPlan.variation_amount)}`
                      : "N/A",
                  };
                }
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
