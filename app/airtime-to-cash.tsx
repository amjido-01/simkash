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
import { Image } from "@/components/ui/image";
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
  CheckCircle,
  ChevronDownIcon,
  Gift,
  Wallet,
} from "lucide-react-native";
import { useVerifyPhone } from "@/hooks/use-verify-phone";
import { PageHeader } from "@/components/page-header";
import Animated, { FadeIn } from "react-native-reanimated";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { useGetNetworks } from "@/hooks/use-networks";
import * as yup from "yup";
import { router } from "expo-router";
import { QUICK_AMOUNTS, PIN_LENGTH } from "@/constants/menu";
import { NetworkSelectionDrawer } from "@/components/network-selection-drawer";

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
  sharePin: yup
    .string()
    .required("Share PIN is required")
    .matches(/^[0-9]+$/, "Share PIN must contain only digits"),
});

type FormData = yup.InferType<typeof schema>;

const OTP_LENGTH = 6;

export default function AirtimeToCash() {
  // State management
  const insets = useSafeAreaInsets();
   const verifyPhoneMutation = useVerifyPhone();
    const { networks, isLoading, isError } = useGetNetworks();
  const [showOtpDrawer, setShowOtpDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
    const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
      const [showNetworkDrawer, setShowNetworkDrawer] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState("");
    const [hasSetDefaultNetwork, setHasSetDefaultNetwork] = useState(false);
     const lastVerifiedPhone = useRef<string>("");

  const otpInputRef = useRef<any>(null);
  const pinRef = useRef<any>(null);

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
      sharePin: "",
    },
  });

  const phoneValue = watch("phoneNumber");
  const networkValue = watch("network");
  const amountValue = watch("amount");
  const sharePinValue = watch("sharePin");

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
          console.log("✅ Default network set to MTN:", mtnNetwork.serviceID);
        } else {
          // Fallback to first network if MTN not found
          setValue("network", networks[0].serviceID, { shouldValidate: false });
          console.log("⚠️ MTN not found, using first network:", networks[0].name);
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
  
          console.log("✅ Phone verified:", response);
  
          // The API returns an ARRAY: [{ id: "airtel", name: "Airtel Nigeria", status: "ACTIVE" }]
          // Extract the first item from the array
          const networkData = Array.isArray(response) ? response[0] : response;
          
          if (!networkData) {
            console.warn("⚠️ No network data in response");
            return;
          }
  
          console.log("📱 Network data extracted:", networkData);
  
          // Match with your networks using serviceID
          const detectedNetwork = networks.find(
            (network) => {
              const apiId = networkData.id?.toLowerCase();
              const serviceId = network.serviceID?.toLowerCase();
              
              console.log(`Comparing: API ID="${apiId}" vs Service ID="${serviceId}"`);
              
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
            }
          );
  
          if (detectedNetwork) {
            setValue("network", detectedNetwork.serviceID, { shouldValidate: true });
            console.log("✅ Network auto-detected:", detectedNetwork.name);
          } else {
            console.warn("⚠️ Could not match network. API ID:", networkData.id);
            console.warn("Available networks:", networks.map(n => ({ id: n.id, serviceID: n.serviceID })));
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
      if (phoneValue && phoneValue.length === 11 && phoneValue !== lastVerifiedPhone.current) {
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
  

  // Calculate amount to receive (90% conversion rate for demo)
  const calculateReceiveAmount = useCallback((amount: string) => {
    if (!amount) return "";
    const numAmount = parseInt(amount, 10);
    const receiveAmount = Math.floor(numAmount * 0.9);
    return receiveAmount.toString();
  }, []);

  const amountToReceive = calculateReceiveAmount(amountValue);

  // Form submission - goes to OTP
  const submitForm = useCallback((data: FormData) => {
    console.log("✔ Valid form:", data);
    setShowOtpDrawer(true);
  }, []);

  // OTP verification
  const handleVerifyOtp = useCallback(async () => {
    if (otp.length !== OTP_LENGTH) {
      setOtpError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      console.log("OTP entered:", otp);

      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success - move to confirmation
      setShowOtpDrawer(false);
      setOtp("");
      setTimeout(() => {
        setShowConfirmDrawer(true);
      }, 300);
    } catch (error) {
      setOtpError("Invalid OTP. Please try again.");
      setOtp("");
      if (otpInputRef.current) {
        otpInputRef.current.clear();
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [otp]);

  // Continue to PIN entry
  const handleContinueToPin = useCallback(() => {
    setShowConfirmDrawer(true);
    // Small delay for smooth transition
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

        // Update OTP input
        if (pinRef.current) {
          pinRef.current.setValue(newPin);
        }

        // Auto-submit when complete
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

      if (pinRef.current) {
        pinRef.current.setValue(newPin);
      }
    }
  }, [pin]);

  // PIN change handler
  const handlePinChange = useCallback((text: string) => {
    setPin(text);
    setPinError("");
  }, []);

 const handleOtpChange = useCallback((text: string) => {
    setOtp(text);
    setOtpError("");

    // Auto-verify when complete
    if (text.length === OTP_LENGTH) {
      setTimeout(() => {
        handleVerifyOtpWithText(text);
      }, 300);
    }
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

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Success - close drawers and navigate
        setShowPinDrawer(false);
        setShowConfirmDrawer(false);
        setPin("");
        reset();

        router.push({
          pathname: "/transaction-success",
          params: {
            amount: amountToReceive,
            recipient: phoneValue,
            phoneNumber: phoneValue,
            transactionType: "airtime-to-cash",
            network: networkValue,
          },
        });
      } catch (error) {
        setPinError("Invalid PIN. Please try again.");
        setPin("");
        if (pinRef.current) {
          pinRef.current.clear();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [pin, amountToReceive, phoneValue, networkValue, reset]
  );

  // Continue button handler
  const handleContinue = useCallback(async () => {
    const valid = await trigger();

    if (!valid) {
      return;
    }

    handleSubmit(submitForm)();
  }, [trigger, handleSubmit, submitForm]);

  const handleVerifyOtpWithText = useCallback(async (otpText: string) => {
    if (otpText.length !== OTP_LENGTH) {
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      console.log("OTP entered:", otpText);

      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success - move to confirmation
      setShowOtpDrawer(false);
      setOtp("");
      setTimeout(() => {
        setShowConfirmDrawer(true);
      }, 300);
    } catch (error) {
      setOtpError("Invalid OTP. Please try again.");
      setOtp("");
      if (otpInputRef.current) {
        otpInputRef.current.clear();
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  }, []);

  // Back navigation handler
  const handleBack = useCallback(() => {
    // Confirm before leaving if form has data
    if (phoneValue || amountValue || networkValue || sharePinValue) {
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
  }, [phoneValue, amountValue, networkValue, sharePinValue]);

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
       <PageHeader title=" Airtime to Cash" onBack={handleBack} showBackButton={true} />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Box className="bg-white px-4 pt-6 pb-24 flex-1">
            <VStack space="xl" className="flex-1">
              {/* Phone Number with Network Selector */}
               <FormControl isInvalid={Boolean(errors.phoneNumber || errors.network)}>
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
                    <FormControlErrorIcon className="text-red-500" as={AlertCircleIcon} />
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
              <View className="mt-4">
                <View className="flex-row flex-wrap -mx-2">
                  {QUICK_AMOUNTS.map((quickAmount) => (
                    <TouchableOpacity
                      key={quickAmount.value}
                      onPress={() => handleQuickAmountSelect(quickAmount.value)}
                      className={`w-1/4 px-1 mb-6 h-[40px] rounded-[12px] items-center justify-center ${
                        selectedAmount === quickAmount.value ||
                        amountValue === quickAmount.value
                          ? "bg-[#132939] border-[#132939]"
                          : "bg-white border-[#E5E7EB]"
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-[14px] font-medium font-manropesemibold ${
                          selectedAmount === quickAmount.value ||
                          amountValue === quickAmount.value
                            ? "text-white"
                            : "text-[#717680]"
                        }`}
                      >
                        {quickAmount.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Amount You'll Receive */}
              {amountValue && phoneValue && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <FormControl>
                    <FormControlLabel>
                      <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                        Amount you&apos;ll receive
                      </FormControlLabelText>
                    </FormControlLabel>

                    <Input
                      variant="outline"
                      size="xl"
                      isReadOnly={true}
                      className="w-full rounded-[16px] min-h-[48px] border border-[#D0D5DD]"
                    >
                      <InputField
                        value={formatAmount(amountToReceive)}
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

              {/* Share PIN */}
              <FormControl isInvalid={Boolean(errors.sharePin)}>
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Share Pin
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="sharePin"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      variant="outline"
                      size="xl"
                      className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] min-h-[48px] ${
                        errors.sharePin
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      }`}
                    >
                      <InputField
                        placeholder="Enter Number share PIN"
                        className="text-[14px] text-[#717680] px-4 py-3"
                        value={value}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9]/g, "");
                          onChange(cleaned);
                        }}
                        onBlur={onBlur}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        maxLength={6}
                      />
                    </Input>
                  )}
                />

                {errors.sharePin && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.sharePin?.message}
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
            paddingTop: 16,
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

      {/* OTP VERIFICATION DRAWER */}
      <Drawer
        className="border-t-0"
        isOpen={showOtpDrawer}
        size="full"
        anchor="bottom"
        onClose={() => {
          if (!isVerifyingOtp) {
            setShowOtpDrawer(false);
            setOtp("");
            setOtpError("");
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
          className="rounded-t-[30px] pt-[28px] bg-[#FFFFFF]"
          style={{
            borderTopWidth: 0,
            borderColor: "transparent",
            shadowOpacity: 0,
            elevation: 0,
            paddingBottom: insets.bottom || 16,
          }}
        >
          <DrawerHeader className="border-b-0 mt-[100px] pb-6 px-4">
            <VStack>
              <Heading className="font-manropesemibold w-full text-center text-[18px] text-[#000000] mb-2">
                OTP Verification
              </Heading>
              <Text className="text-center text-[12px] font-manroperegular text-[#6B7280] px-2">
                We&apos;ve sent a 6-digit code to {phoneValue}. Please enter it
                to proceed.
              </Text>
            </VStack>
            {!isVerifyingOtp && <DrawerCloseButton />}
          </DrawerHeader>

          <DrawerBody className="pt-2 px-2 pb-8">
            <VStack space="lg" className="items-center">
              {/* OTP Input */}
              <View className="mb-6">
                <OtpInput
                  ref={otpInputRef}
                  numberOfDigits={OTP_LENGTH}
                  focusColor="transparent"
                  type="numeric"
                  disabled={isVerifyingOtp}
                  autoFocus={true}
                  onTextChange={handleOtpChange}
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
                      borderColor: otpError ? "#EF4444" : "#E5E7EB",
                      backgroundColor: "#FFFFFF",
                      marginHorizontal: 4,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                    focusedPinCodeContainerStyle: {
                      borderColor: otpError ? "#EF4444" : "#132939",
                    },
                    pinCodeTextStyle: {
                      color: "#000000",
                      fontSize: 24,
                      fontWeight: "600",
                    },
                    filledPinCodeContainerStyle: {
                      borderColor: otpError ? "#EF4444" : "#10B981",
                    },
                  }}
                />
              </View>

              {/* Error or Loading */}
              {otpError && !isVerifyingOtp && (
                <Text className="text-red-500 text-[12px] font-manroperegular text-center mb-2">
                  {otpError}
                </Text>
              )}

              {isVerifyingOtp && (
                <View className="mb-4">
                  <ActivityIndicator size="small" color="#132939" />
                  <Text className="text-[12px] font-manroperegular text-[#6B7280] text-center mt-2">
                    Verifying OTP...
                  </Text>
                </View>
              )}

              {/* Resend Code */}
              {!isVerifyingOtp && (
                <Text className="text-[12px] font-manroperegular text-[#6B7280] text-center">
                  Resend code in 32s
                </Text>
              )}
            </VStack>
          </DrawerBody>

        </DrawerContent>
      </Drawer>

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
      <Drawer
        className="border-t-0"
        isOpen={showConfirmDrawer}
        size="md"
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
          className="rounded-t-[30px] pt[28px] bg-[#FFFFFF]"
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
              <Heading className="text-[28px] font-medium text-center mt-[10px] font-manropebold text-[#000000]">
                ₦{formatAmount(amountToReceive)}
              </Heading>
            </VStack>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody className="pt4 px-1 pb6">
            <VStack space="md">
              {/* Transaction Details */}
              <View className="rounded-[20px] border-[#E5E7EF] border px-4 py-2">
                <VStack space="sm">
                  <HStack className="justify-between items-center py-3">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Airtime Amount
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      ₦{formatAmount(amountValue)}
                    </Text>
                  </HStack>

                  <View className="h-[1px] bg-[#E5E7EB]" />

                  <HStack className="justify-between items-center py-2">
                    <Text className="text-[12px] font-manroperegular text-[#303237]">
                      Amount you&apos;ll Receive
                    </Text>
                    <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                      ₦{formatAmount(amountToReceive)}
                    </Text>
                  </HStack>
                </VStack>
              </View>

              {/* Wallet & Cashback */}
              <View className="p-4">
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

          <DrawerFooter className="px-4 pt4 pb-0">
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
                  ref={pinRef}
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
                          // Implement biometric auth
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
                    // Implement forgot PIN flow
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
