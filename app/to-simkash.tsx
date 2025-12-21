import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
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
import React, { useCallback, useState, useEffect } from "react";
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
import { PinDrawer } from "@/components/pin-drawer";
import { ConfirmationDrawer } from "@/components/confirmation-drawer";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as yup from "yup";
import { router } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { ACCOUNT_VERIFICATION_DELAY } from "@/constants/menu";
import { useTransfer } from "@/hooks/use-transfer";
import { useVerifySimkashAccount } from "@/hooks/use-verify-simkash-account";
import { useDashboard } from "@/hooks/use-dashboard";

// Validation schema
const schema = yup.object().shape({
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(10, "Phone number must be exactly 10 digits"),
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
  narration: yup
    .string()
    .optional()
    .max(200, "Narration must not exceed 200 characters"),
});

type FormData = yup.InferType<typeof schema>;

export default function ToSimkash() {
  // State management
  const insets = useSafeAreaInsets();
    const {
      wallet, // Wallet balance data
    } = useDashboard();
  const { mutateAsync: verifySimkashAccount, isPending: isVerifyingAccount } =
    useVerifySimkashAccount();
  const { transfer, isLoading: isTransferring } = useTransfer();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const verificationTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: "onChange",
    defaultValues: {
      phone: "",
      amount: "",
      narration: "",
    },
  });

  const phoneValue = watch("phone");
  const amountValue = watch("amount");
  const narrationValue = watch("narration");

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  // Account verification with debouncing
  const handlePhoneBlur = useCallback(async () => {
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }

    setAccountName("");
    setPhoneVerified(false);

    if (phoneValue && phoneValue.length === 10) {
      verificationTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await verifySimkashAccount({
            account: phoneValue,
          });

          setAccountName(response.name);
          setPhoneVerified(true);
        } catch (error: any) {
          console.error("Account verification error:", error);

          Alert.alert(
            "Verification Failed",
            error?.message ||
              "Unable to verify Simkash account. Please check the account number and try again."
          );
          setAccountName("");
          setPhoneVerified(false);
        }
      }, ACCOUNT_VERIFICATION_DELAY);
    }
  }, [phoneValue, verifySimkashAccount]);

  // Re-verify when phone changes
  useEffect(() => {
    if (phoneValue && phoneValue.length === 10) {
      handlePhoneBlur();
    } else {
      setAccountName("");
      setPhoneVerified(false);
    }
  }, [phoneValue, handlePhoneBlur]);

  // Form submission
  const submitForm = useCallback((data: FormData) => {
    console.log("✔ Valid form:", data);
    setShowDrawer(true);
  }, []);

  // Continue to PIN entry
  const handleContinueToPin = useCallback(() => {
    setShowDrawer(true);
    setTimeout(() => {
      setShowPinDrawer(true);
    }, 300);
  }, []);

  // PIN submission
  const handlePinSubmit = useCallback(
    async (pin: string) => {
      try {
        const payload = {
          account: phoneValue,
          amount: Number(amountValue),
          pin: pin,
          narration: narrationValue || undefined,
        };

        const result = await transfer(payload);

        console.log("Transfer Success => ", result);

        // Close drawers and navigate
        setShowPinDrawer(false);
        setShowDrawer(false);
        reset();

        await new Promise((resolve) => setTimeout(resolve, 300));

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
      } catch (error: any) {
        console.error("Transfer error:", error);

        let errorMessage = "Transaction failed. Please try again.";

        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.responseMessage) {
          errorMessage = error.responseMessage;
        }

        throw new Error(errorMessage);
      }
    },
    [phoneValue, amountValue, narrationValue, transfer, reset, accountName]
  );

  // Continue button handler
  const handleContinue = useCallback(async () => {
    const valid = await trigger();

    if (!valid) {
      return;
    }

    if (!phoneVerified) {
      Alert.alert(
        "Account Verification Required",
        "Please wait for account verification to complete."
      );
      return;
    }

    if (isVerifyingAccount) {
      Alert.alert(
        "Verification In Progress",
        "Please wait while we verify the account details."
      );
      return;
    }

    handleSubmit(submitForm)();
  }, [trigger, phoneVerified, isVerifyingAccount, handleSubmit, submitForm]);

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
            onPress: () => router.push("/(tabs)"),
          },
        ]
      );
    } else {
      router.back();
    }
  }, [phoneValue, amountValue]);

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
                      className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] min-h-[48px] ${
                        errors.phone
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      }`}
                    >
                      <InputField
                        placeholder="Enter 10-digit phone number"
                        className="text-[14px] text-[#717680] px-4 py-3"
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
                        editable={!isVerifyingAccount}
                      />
                      {isVerifyingAccount && (
                        <View className="absolute right-4 top-3">
                          <ActivityIndicator size="small" color="#132939" />
                        </View>
                      )}
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

              {/* ACCOUNT NAME */}
              {phoneVerified && accountName && (
                <Animated.View entering={FadeIn.duration(300)}>
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
                      className="w-full rounded-[16px] min-h-[48px] border border-[#10B981] bg-[#F0FDF4]"
                    >
                      <InputField
                        value={accountName}
                        className="text-[14px] text-[#000000] font-manropesemibold px-4 py-3"
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

              {/* NARRATION */}
              <FormControl isInvalid={Boolean(errors.narration)}>
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Narration (Optional)
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="narration"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Textarea
                      size="md"
                      isReadOnly={false}
                      isInvalid={Boolean(errors.narration)}
                      isDisabled={false}
                      className="w-full min-h-[100px] rounded-[16px] border border-[#D0D5DD]"
                    >
                      <TextareaInput
                        placeholder="Enter description (optional)"
                        className="text-[14px] text-[#717680] p-3"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        maxLength={200}
                      />
                    </Textarea>
                  )}
                />

                {errors.narration && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.narration?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            </VStack>
          </Box>
        </ScrollView>

        {/* FIXED BOTTOM BUTTON */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4"
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

      {/* CONFIRMATION DRAWER */}
      <ConfirmationDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        onConfirm={handleContinueToPin}
        title="Confirm Transaction"
        subtitle="Please review details carefully. Transactions are irreversible."
        amount={amountValue}
        showAmount={true}
        confirmButtonText="Continue"
        sections={[
          {
            details: [
              { label: "Recipient", value: accountName },
              { label: "Phone Number", value: phoneValue },
               { label: "Amount", value: `₦${formatAmount(amountValue)}` },
              ...(narrationValue
                ? [{ label: "Narration", value: narrationValue }]
                : []),
            ],
            showDividers: true,
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
            showDividers: true,
          },
        ]}
      />

      <PinDrawer
        isOpen={showPinDrawer}
        onClose={() => setShowPinDrawer(false)}
        onSubmit={handlePinSubmit}
        title="Enter PIN"
        isSubmitting={isTransferring}
        loadingText="Processing transaction..."
      />
    </SafeAreaView>
  );
}