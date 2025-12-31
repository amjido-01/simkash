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
import React, { useRef, useState, useCallback, useEffect } from "react";
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
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ACCOUNT_VERIFICATION_DELAY, PIN_LENGTH } from "@/constants/menu";
import { useGetBanks } from "@/hooks/use-banks";
import BankSelector from "@/components/bank-selector";
import { useVerifyAccount } from "@/hooks/use-verify-account";
import { useSendMoney } from "@/hooks/use-send-money";
import { PinDrawer } from "@/components/pin-drawer";
import {
  ConfirmationDrawer,
  ConfirmationSection,
} from "@/components/confirmation-drawer";

// Validation schema
const schema = yup.object().shape({
  phone: yup
    .string()
    .required("Account number is required")
    .matches(/^[0-9]+$/, "Account number must contain only digits")
    .length(10, "Account number must be exactly 10 digits"),
  bank: yup.string().required("Please select a bank"),
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

type Stage = "account" | "amount";

export default function ToBank() {
  // State management
  const insets = useSafeAreaInsets();
  const { banks, isLoading } = useGetBanks();
  const { sendMoney, isLoading: isSendingMoney } = useSendMoney();
  const { mutateAsync: verifyAccount, isPending: isVerifyingAccount } =
    useVerifyAccount();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [stage, setStage] = useState<Stage>("account");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: "onChange",
    defaultValues: {
      phone: "",
      bank: "",
      amount: "",
      narration: "",
    },
  });

  const phoneValue = watch("phone");
  const bankValue = watch("bank");
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
  const handlePhoneBlur = useCallback(() => {
    // Clear previous timeout
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }

    // Reset verification state
    setAccountName("");
    setPhoneVerified(false);

    if (phoneValue && phoneValue.length === 10 && bankValue) {
      // Debounce the API call
      verificationTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await verifyAccount({
            account_number: phoneValue,
            bank_code: bankValue,
          });

          setAccountName(response.account_name);
          setPhoneVerified(true);
        } catch (error: any) {
          console.error("Account verification error:", error);

          Alert.alert(
            "Verification Failed",
            error?.message ||
              "Unable to verify account. Please check the account number and try again."
          );
          setAccountName("");
          setPhoneVerified(false);
        }
      }, ACCOUNT_VERIFICATION_DELAY);
    }
  }, [phoneValue, bankValue, verifyAccount]);

  // Re-verify when bank changes
  useEffect(() => {
    if (phoneValue && phoneValue.length === 10 && bankValue) {
      handlePhoneBlur();
    } else {
      setAccountName("");
      setPhoneVerified(false);
    }
  }, [bankValue, phoneValue, handlePhoneBlur]);

  // Form submission
  const submitForm = useCallback((data: FormData) => {
    console.log("✔ Valid form:", data);
    setShowDrawer(true);
  }, []);

  // Continue to PIN entry
  const handleContinueToPin = useCallback(() => {
    setShowDrawer(false);
    // Small delay for smooth transition
    setTimeout(() => {
      setShowPinDrawer(true);
    }, 300);
  }, []);

  const handlePinSubmit = useCallback(
    async (pinToSubmit?: string) => {
      const finalPin = pinToSubmit || pin;

      if (finalPin.length !== PIN_LENGTH) {
        setPinError("Please enter your 4-digit PIN");
        return;
      }

      setIsSubmitting(true);

      const payload = {
        amount: parseInt(amountValue, 10),
        account_number: phoneValue,
        bank_code: bankValue,
        pin: parseInt(finalPin, 10),
        narration: narrationValue || undefined,
      };

      console.log(payload, "transfer");

      try {
        const response = await sendMoney(payload);

        console.log("Transfer successful:", response);

        // Close drawers first
        setShowPinDrawer(false);
        setShowDrawer(false);
        setPin("");
        reset();

        await new Promise((resolve) => setTimeout(resolve, 300));

        router.push({
          pathname: "/transaction-success",
          params: {
            amount: amountValue,
            recipient: accountName,
            phoneNumber: phoneValue,
            narration: narrationValue || "",
            reference: response.data.data.reference,
            transferCode: response.data.data.transfer_code,
            status: response.data.data.status,
            updatedBalance: response.updatedBalance.toString(),
            message: response.data.message,
          },
        });
      } catch (error: any) {
        console.error("Transfer error:", error);

        let errorMessage =
          error?.message ||
          error?.responseMessage ||
          "Transaction failed. Please try again.";

        setPinError(errorMessage);
        setPin("");

        if (otpRef.current) otpRef.current.clear();
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      pin,
      amountValue,
      accountName,
      phoneValue,
      narrationValue,
      bankValue,
      reset,
      sendMoney,
    ]
  );

  // Continue button handler
  const handleContinue = useCallback(async () => {
    if (stage === "account") {
      const valid = await trigger(["phone", "bank"]);

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

      setStage("amount");
      return;
    }

    if (stage === "amount") {
      handleSubmit(submitForm)();
    }
  }, [stage, trigger, phoneVerified, handleSubmit, submitForm]);

  // Back navigation handler
  const handleBack = useCallback(() => {
    if (stage === "amount") {
      setStage("account");
    } else {
      // Confirm before leaving if form has data
      if (phoneValue || bankValue || amountValue) {
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
  }, [stage, phoneValue, bankValue, amountValue]);

  // Format amount for display
  const formatAmount = useCallback((amount: string) => {
    if (!amount) return "";
    return parseInt(amount, 10).toLocaleString();
  }, []);

  const selectedBankName =
    banks.find((b) => b.code === bankValue)?.name || bankValue;

  // Prepare sections for ConfirmationDrawer
  const confirmationSections: ConfirmationSection[] = [
    {
      details: [
        { label: "Recipient", value: accountName },
        { label: "Account Number", value: phoneValue },
        { label: "Bank", value: selectedBankName },
        { label: "Amount", value: `₦${formatAmount(amountValue)}` },
        ...(narrationValue
          ? [{ label: "Narration", value: narrationValue }]
          : []),
      ],
      showDividers: true,
    },
    {
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
      containerClassName: "px-4",
      showDividers: true,
    },
  ];

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
            Simkash to Bank Account
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
              {/* ACCOUNT STAGE */}
              {stage === "account" && (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  style={{ flex: 1 }}
                >
                  <VStack space="lg" className="flex1">
                    {/* RECIPIENT ACCOUNT NUMBER */}
                    <FormControl isInvalid={Boolean(errors.phone)}>
                      <FormControlLabel>
                        <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                          Recipient Account Number
                        </FormControlLabelText>
                      </FormControlLabel>

                      <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <Input
                            variant="outline"
                            size="xl"
                            className={`w-full p-2 rounded-[99px] focus:border-2 focus:border-[#D0D5DD] min-h-[48px] ${
                              errors.phone
                                ? "border-2 border-red-500"
                                : "border border-[#D0D5DD]"
                            }`}
                          >
                            <InputField
                              placeholder="Enter 10-digit account number"
                              className="w-full text-[14px] text-[#717680] min-h-[48px] px-4 py-3"
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
                                <ActivityIndicator
                                  size="small"
                                  color="#132939"
                                />
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

                    {/* BANK SELECTION */}
                    <FormControl isInvalid={Boolean(errors.bank)}>
                      <FormControlLabel>
                        <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                          Bank
                        </FormControlLabelText>
                      </FormControlLabel>

                      <Controller
                        control={control}
                        name="bank"
                        render={({ field: { onChange, value } }) => (
                          <BankSelector
                            value={value}
                            onValueChange={onChange}
                            banks={banks}
                            placeholder="Select bank"
                            error={Boolean(errors.bank)}
                          />
                        )}
                      />

                      {errors.bank && (
                        <FormControlError>
                          <FormControlErrorIcon
                            className="text-red-500"
                            as={AlertCircleIcon}
                          />
                          <FormControlErrorText className="text-red-500">
                            {errors.bank?.message}
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
                            className="w-full p-2 rounded-[16px] min-h-[48px] border border-[#10B981] bg-[#F0FDF4]"
                          >
                            <InputField
                              value={accountName}
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
                </Animated.View>
              )}

              {/* AMOUNT STAGE */}
              {stage === "amount" && (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  style={{ flex: 1 }}
                >
                  <VStack space="lg" className="flex-1">
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
                              <Text className="text-[14px] font-manropesemibold text-center mt-4 text-[#000000]">
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
            onPress={handleContinue}
          >
            <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
              Continue
            </ButtonText>
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* CONFIRMATION DRAWER - Now using reusable component */}
      <ConfirmationDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        onConfirm={handleContinueToPin}
        title="Confirm Transaction"
        subtitle="Please review details carefully. Transactions are irreversible."
        amount={amountValue}
        showAmount={true}
        sections={confirmationSections}
        confirmButtonText="Continue"
      />

      {/* PIN DRAWER */}
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
