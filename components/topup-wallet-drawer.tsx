import { Button, ButtonText } from "@/components/ui/button";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ChevronRight, Copy, ArrowLeft, AlertCircle } from "lucide-react-native";
import { Platform, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useState, useEffect, useRef } from "react";
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { useInitiateDeposit, useVerifyPayment } from "@/hooks/use-paystack-deposit";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

// Validation schema
const schema = yup.object().shape({
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

interface TopUpWalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hasCompletedKYC?: boolean;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
}

type DrawerView = 'main' | 'amountInput' | 'processing';

export default function TopUpWalletDrawer({
  isOpen,
  onClose,
  hasCompletedKYC = false,
  accountNumber = "9325678767",
  accountName = "SIMKASH/ADAM BABA YUSUF",
  bankName = "WEMA BANK",
}: TopUpWalletDrawerProps) {
  const toast = useToast();
  const [toastId, setToastId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  
  // State for drawer views
  const [currentView, setCurrentView] = useState<DrawerView>('main');

   // ✅ NEW - Works for both React Native and Node.js
const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paymentReferenceRef = useRef<string | null>(null);
  const deepLinkHandledRef = useRef(false);

   useEffect(() => {
    return () => {
      stopPaymentPolling();
    };
  }, []);
  
  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      amount: "",
    },
  });

  // Watch amount for conditional rendering
  const amountValue = watch("amount");

  // Use the custom hooks
  const { initiateDeposit, isLoading: isInitiating } = useInitiateDeposit();
  const { verifyPayment, isLoading: isVerifying } = useVerifyPayment();

  const handleCopyAccountNumber = async () => {
    await Clipboard.setStringAsync(accountNumber.toString());

    if (!toastId || !toast.isActive(toastId)) {
      const newId = Math.random().toString();
      setToastId(newId);
      toast.show({
        id: newId,
        placement: 'bottom',
        duration: 3000,
        render: ({ id }) => (
          <Toast nativeID={'toast-' + id} variant="solid" action="muted">
            <ToastTitle>Copied!</ToastTitle>
            <ToastDescription>Account number copied to clipboard</ToastDescription>
          </Toast>
        ),
      });
    }
  };

  const handleUnlockAccount = () => {
    onClose();
    router.push("/kyc");
  };

  const handleSecurePaymentClick = () => {
    // Switch to amount input view
    setCurrentView('amountInput');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    reset(); // Reset form
  };

//  const handleInitiatePayment = async (data: FormData) => {
//   const amountNum = parseInt(data.amount, 10);
  
//   try {
//     setCurrentView('processing');
    
//     // Initiate deposit using the hook with user-entered amount
//     const response = await initiateDeposit({
//       amount: amountNum,
//     });
    
//     console.log("Initiate deposit response:", response);
    
//     // response is already the responseBody (extracted by apiClient)
//     if (response?.authorization_url) {
//       // Open Paystack checkout in in-app browser (don't close drawer yet)
//       const result = await WebBrowser.openBrowserAsync(
//         response.authorization_url,
//         {
//           // iOS specific options
//           dismissButtonStyle: "close",
//           presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
//           controlsColor: "#244155",
//           // Android specific options
//           toolbarColor: "#244155",
//           showTitle: true,
//           enableBarCollapsing: false,
//         }
//       );
      
//       // Handle the browser result
//       if (result.type === "cancel") {
//         Alert.alert(
//           "Payment Cancelled",
//           "You cancelled the payment process",
//           [
//             {
//               text: "OK",
//               onPress: () => setCurrentView('amountInput')
//             }
//           ]
//         );
//       } else if (result.type === "dismiss") {
//         // Show processing state while verifying
//         setCurrentView('processing');
//         console.log("hellllllo")
        
//         // Verify payment status using the hook
//         try {
//           const verifyResponse = await verifyPayment(response.reference);
//           console.log(verifyPayment, "lllll")
          
//           console.log("Verify payment response:", verifyResponse);
          
//           // verifyResponse is already the responseBody (extracted by apiClient)
//           if (verifyResponse?.data?.status === "success") {
//             // Close drawer and reset
//             onClose();
//             reset();
//             setCurrentView('main');
            
//             // Show success message with amount
//             Alert.alert(
//               "Payment Successful!", 
//               `₦${verifyResponse.data.amount.toLocaleString()} has been added to your wallet.`,
//               [
//                 { 
//                   text: "View Wallet",
//                   onPress: () => {
//                     // Navigate to wallet/transactions if needed
//                     // router.push("/wallet");
//                   }
//                 },
//                 { 
//                   text: "OK",
//                   style: "cancel"
//                 }
//               ]
//             );
//           } else if (verifyResponse?.data?.status === "pending") {
//             // Payment is still processing
//             onClose();
//             reset();
//             setCurrentView('main');
            
//             Alert.alert(
//               "Payment Pending", 
//               "Your payment is being processed. Please check your transaction history in a few moments.",
//               [
//                 {
//                   text: "View Transactions",
//                   onPress: () => {
//                     // Navigate to transactions page
//                     router.push("/(tabs)");
//                   }
//                 },
//                 {
//                   text: "OK",
//                   style: "cancel"
//                 }
//               ]
//             );
//           } else if (verifyResponse?.data?.status === "failed") {
//             // Payment failed
//             Alert.alert(
//               "Payment Failed", 
//               "The payment was not successful. Please try again or contact support if you were charged.",
//               [
//                 {
//                   text: "Retry",
//                   onPress: () => setCurrentView('amountInput')
//                 },
//                 {
//                   text: "Cancel",
//                   style: "cancel",
//                   onPress: () => {
//                     onClose();
//                     reset();
//                     setCurrentView('main');
//                   }
//                 }
//               ]
//             );
//           } else {
//             // Unknown status
//             onClose();
//             reset();
//             setCurrentView('main');
            
//             Alert.alert(
//               "Payment Status Unknown", 
//               "Please check your transaction history to confirm payment status.",
//               [
//                 {
//                   text: "View Transactions",
//                   onPress: () => {
//                     // Navigate to transactions page
//                     router.push("/(tabs)");
//                   }
//                 },
//                 {
//                   text: "OK",
//                   style: "cancel"
//                 }
//               ]
//             );
//           }
//         } catch (verifyError: any) {
//           console.error("Verification error:", verifyError);
          
//           // Extract error message from various possible error formats
//           const errorMessage = 
//             verifyError?.message || 
//             verifyError?.response?.data?.responseMessage ||
//             verifyError?.response?.data?.message ||
//             "Unable to verify payment. Please check your transaction history.";
          
//           Alert.alert(
//             "Verification Error", 
//             errorMessage,
//             [
//               {
//                 text: "View Transactions",
//                 onPress: () => {
//                   onClose();
//                   reset();
//                   setCurrentView('main');
//                   // Navigate to transactions page
//                   router.push("/(tabs)");
//                 }
//               },
//               {
//                 text: "Retry Verification",
//                 onPress: async () => {
//                   // Retry verification
//                   try {
//                     const retryResponse = await verifyPayment(response.reference);
//                     if (retryResponse?.data?.status === "success") {
//                       onClose();
//                       reset();
//                       setCurrentView('main');
//                       Alert.alert(
//                         "Payment Successful!", 
//                         `₦${retryResponse.data.amount.toLocaleString()} has been added to your wallet.`
//                       );
//                     } else {
//                       setCurrentView('main');
//                       Alert.alert(
//                         "Payment Status", 
//                         "Please check your transaction history."
//                       );
//                     }
//                   } catch (retryError) {
//                     setCurrentView('main');
//                     Alert.alert(
//                       "Error", 
//                       "Still unable to verify. Please check transactions later."
//                     );
//                   }
//                 }
//               },
//               {
//                 text: "OK",
//                 style: "cancel",
//                 onPress: () => {
//                   onClose();
//                   reset();
//                   setCurrentView('main');
//                 }
//               }
//             ]
//           );
//         }
//       }
//     } else {
//       Alert.alert(
//         "Error",
//         "Failed to get payment URL. Please try again.",
//         [
//           {
//             text: "OK",
//             onPress: () => setCurrentView('amountInput')
//           }
//         ]
//       );
//     }
//   } catch (error: any) {
//     console.error("Payment initiation error:", error);
    
//     // Extract error message
//     const errorMessage = 
//       error?.message || 
//       error?.response?.data?.responseMessage ||
//       error?.response?.data?.message ||
//       "Failed to initiate payment. Please try again.";
    
//     Alert.alert(
//       "Payment Error", 
//       errorMessage,
//       [
//         {
//           text: "Retry",
//           onPress: () => setCurrentView('amountInput')
//         },
//         {
//           text: "Cancel",
//           style: "cancel",
//           onPress: () => {
//             onClose();
//             reset();
//             setCurrentView('main');
//           }
//         }
//       ]
//     );
//   }
// };

  const handleInitiatePayment = async (data: FormData) => {
    const amountNum = parseInt(data.amount, 10);
    
    try {
      setCurrentView('processing');
      
      const response = await initiateDeposit({ amount: amountNum });
      
      if (response?.authorization_url) {
        // Store reference for polling
        paymentReferenceRef.current = response.reference;
        deepLinkHandledRef.current = false;
        
        // Start polling (fallback mechanism)
        startPaymentPolling(response.reference, amountNum);
        
        // Open Paystack checkout
        const result = await WebBrowser.openBrowserAsync(
          response.authorization_url,
          {
            dismissButtonStyle: "close",
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
            controlsColor: "#244155",
            toolbarColor: "#244155",
            showTitle: true,
            enableBarCollapsing: false,
          }
        );
        
        
        // Browser closed - stop polling
        stopPaymentPolling();
        
        // If deep link already handled payment (deepLinkHandledRef will be true)
        // then we don't need to do anything
        if (!deepLinkHandledRef.current && paymentReferenceRef.current) {
          console.log('🔗 Deep link did not handle, navigating manually');
          // Deep link didn't work, navigate manually to verification
          router.push({
            pathname: '/payment-verification',
            params: { reference: paymentReferenceRef.current }
          });
        } else {
          console.log('✅ Deep link handled the navigation');
        }
        
        // Reset drawer state
        onClose();
        reset();
        setCurrentView('main');
        
      } else {
        console.error('❌ No authorization URL received');
        Alert.alert("Error", "Failed to get payment URL. Please try again.");
        setCurrentView('amountInput');
      }
    } catch (error: any) {
      stopPaymentPolling();
      console.error("❌ Payment initiation error:", error);
      
      const errorMessage = 
        error?.message || 
        error?.response?.data?.responseMessage ||
        "Failed to initiate payment. Please try again.";
      
      Alert.alert("Payment Error", errorMessage);
      setCurrentView('amountInput');
    }
  };

  const startPaymentPolling = (reference: string, amount: number) => {
    console.log('🔄 Payment polling started for:', reference);
    
    let pollCount = 0;
    const MAX_POLLS = 60; // Poll for up to 3 minutes (60 * 3 seconds)
    
    pollingIntervalRef.current = setInterval(async () => {
      pollCount++;
      console.log(`📡 Polling attempt ${pollCount}/${MAX_POLLS}`);
      
      try {
        const verifyResponse = await verifyPayment(reference);
        console.log('📋 Polling result:', verifyResponse?.data?.status);
        
        if (verifyResponse?.data?.status === 'success') {
          console.log('🎉 Payment successful during polling!');
          
          // Stop polling
          stopPaymentPolling();
          
          // Mark as handled by polling
          deepLinkHandledRef.current = true;
          paymentReferenceRef.current = null;
          
          // Close drawer
          onClose();
          reset();
          setCurrentView('main');
          
          // Show success alert
          Alert.alert(
            "Payment Successful!",
            `₦${verifyResponse.data.amount.toLocaleString()} has been added to your wallet.`,
            [
              {
                text: "OK",
                onPress: () => {
                  router.push('/(tabs)');
                }
              }
            ]
          );
          
        } else if (verifyResponse?.data?.status === 'failed') {
          console.log('❌ Payment failed during polling');
          stopPaymentPolling();
          deepLinkHandledRef.current = true;
          paymentReferenceRef.current = null;
          
          Alert.alert("Payment Failed", "The payment was not successful.");
          setCurrentView('amountInput');
        }
        // If pending, continue polling
        
      } catch (error) {
        console.error('❌ Polling error:', error);
        // Continue polling even if there's an error
      }
      
      // Stop polling after max attempts
      if (pollCount >= MAX_POLLS) {
        console.log('⏰ Max polling attempts reached');
        stopPaymentPolling();
      }
      
    }, 3000); // Poll every 3 seconds
  };

  const stopPaymentPolling = () => {
    if (pollingIntervalRef.current) {
      console.log('⏹️ Stopping payment polling');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

const isProcessing = isInitiating || isVerifying;

  const renderMainView = () => (
    <VStack space="lg">
      {/* Personal Account Section */}
      {!hasCompletedKYC ? (
        // Blurred account with unlock button
        <View className="relative rounded-[16px] border border-[#E5E7EB] overflow-hidden">
          <View className="p-4">
            <HStack className="items-center gap-3 mb-4">
              {/* Avatar with Badge */}
              <View className="relative">
                <View className="w-12 h-12 bg-[#3B82F6] rounded-full items-center justify-center">
                  <Text className="text-white text-[18px] font-manropesemibold">
                    A
                  </Text>
                </View>
                <View className="absolute -top-1 -right-1 w-6 h-6 bg-[#3B82F6] rounded-full items-center justify-center border-2 border-white">
                  <Text className="text-white text-[10px]">👤</Text>
                </View>
              </View>

              <VStack className="flex-1">
                <Text className="text-[16px] font-manropesemibold text-[#000000] mb-1">
                  ••••• •••• •
                </Text>
                <Text className="text-[12px] font-manroperegular text-[#6B7280]">
                  Your dedicated account number
                </Text>
              </VStack>
            </HStack>

            <Button
              className="rounded-full z-10 bg-[#132939] h-[44px] w-full"
              size="lg"
              onPress={handleUnlockAccount}
            >
              <ButtonText className="text-white text-[14px] font-medium">
                Unlock Personal Account
              </ButtonText>
            </Button>
          </View>

          {/* Blur overlay */}
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={10}
              tint="light"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
            />
          )}
        </View>
      ) : (
        // Unlocked account with details
        <View className="rounded-[16px] border border-[#E5E7EB] p-4">
          <HStack className="items-center justify-between mb-2">
            <HStack className="items-center gap-2 flex-1">
              <Text className="text-[16px] font-bold font-manropebold text-[#000000]">
                {accountNumber}
              </Text>
              <TouchableOpacity
                onPress={handleCopyAccountNumber}
                className="p-1"
                activeOpacity={0.7}
              >
                <Copy size={18} color="#1E1E1E" />
              </TouchableOpacity>
            </HStack>
          </HStack>

          <HStack className="items-center gap-2">
            <Text className="text-[10px] font-bold font-manropesemibold text-[#000000]">
              {accountName}
            </Text>
            <View className="w-1 h-1 rounded-full bg-[#6B7280]" />
            <Text className="text-[12px] font-bold font-manropesemibold text-[#000000]">
              {bankName}
            </Text>
          </HStack>
        </View>
      )}

      {/* OR Divider */}
      <Text className="text-[14px] text-center font-semibold font-manroperegular text-[#000000]">
        OR
      </Text>

      {/* Secure Payment Channels */}
      <TouchableOpacity
        onPress={handleSecurePaymentClick}
        activeOpacity={0.7}
        className="flex-row items-center border border-[#E5E7EF] px-4 justify-between py-4 rounded-[16px]"
      >
        <VStack className="flex-1">
          <Text className="font-manropesemibold text-[14px] leading-[100%] font-bold text-[#000000] mb-1">
            Secure Payment Channels
          </Text>
          <Text className="font-manroperegular font-medium text-[12px] text-[#303237]">
            Top up using cards, USSD and more
          </Text>
        </VStack>
        <ChevronRight size={20} color="#000000" />
      </TouchableOpacity>
    </VStack>
  );

  const renderAmountInputView = () => (
    <VStack className="border2" space="lg">
      {/* Back Button */}
    

      {/* Amount Input Section */}
      <View>
        <Text className="font-manropesemibold text-[16px] text-[#000000] mb-2">
          Enter Amount
        </Text>
        <Text className="font-manroperegular text-[14px] text-[#6B7280] mb-4">
          Enter the amount you want to add to your wallet
        </Text>
        
        {/* Amount Input using InputField */}
        <FormControl isInvalid={Boolean(errors.amount)}>
          <FormControlLabel>
            <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
              Amount (₦)
            </FormControlLabelText>
          </FormControlLabel>

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                variant="outline"
                size="xl"
                className={`w-full rounded-[12px] focus:border-2 focus:border-[#244155] min-h-[56px] ${
                  errors.amount
                    ? "border-2 border-red-500"
                    : "border border-[#E5E7EB]"
                }`}
              >
                <View className="absolute left-4 pr-2 h-full justify-center z-10">
                  <Text className="text-[16px] font-manropesemibold text-[#244155]">
                    ₦
                  </Text>
                </View>
                <InputField
                  placeholder="0.00"
                  className="text-[18px] placeholder:text-[16px] placeholder:text-[#9CA3AF] text-[#000000] pl-12 pr-4 py-3"
                  value={value}
                  onChangeText={(text) => {
                    // Remove non-numeric characters
                    const cleaned = text.replace(/[^0-9]/g, "");
                    onChange(cleaned);
                  }}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  autoFocus={true}
                  autoCapitalize="none"
                  editable={!isProcessing}
                />
              </Input>
            )}
          />

          {errors.amount && (
            <FormControlError>
              <FormControlErrorIcon
                className="text-red-500"
                as={AlertCircle}
              />
              <FormControlErrorText className="text-red-500 text-[12px]">
                {errors.amount?.message}
              </FormControlErrorText>
            </FormControlError>
          )}
          
          {/* Helper text */}
          <Text className="text-[#6B7280] text-[12px] font-manroperegular mt-2">
            Minimum: ₦100.00 • Maximum: ₦500,000.00
          </Text>
        </FormControl>

        {/* Format display if amount is entered */}
        {amountValue && !errors.amount && (
          <View className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Text className="font-manropesemibold text-[14px] text-[#1E40AF]">
              You are adding:
            </Text>
            <Text className="font-manropebold text-[20px] text-[#1E3A8A] mt-1">
              ₦{parseInt(amountValue).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Continue Button */}
      <Button
        onPress={handleSubmit(handleInitiatePayment)}
        disabled={!isValid || isProcessing}
        className={`rounded-full h-[50px] mt-4 ${
          !isValid || isProcessing
            ? "bg-gray-300"
            : "bg-[#244155]"
        }`}
        size="lg"
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <ButtonText className="text-white text-[16px] font-medium">
            Continue to Payment
          </ButtonText>
        )}
      </Button>
    </VStack>
  );

  const renderProcessingView = () => (
    <View className="items-center justify-center py-12">
      <ActivityIndicator size="large" color="#244155" />
      <Text className="mt-4 font-manropesemibold text-[16px] text-[#000000]">
        Processing Payment...
      </Text>
      <Text className="mt-2 font-manroperegular text-[14px] text-[#6B7280] text-center">
        Please wait while we prepare your payment
      </Text>
    </View>
  );

  const getDrawerTitle = () => {
    switch (currentView) {
      case 'amountInput':
        return 'Enter Amount';
      case 'processing':
        return 'Processing';
      default:
        return 'Top Up Wallet';
    }
  };

  const showCloseButton = currentView === 'main';

  return (
    <Drawer
      className="border-t-0"
      isOpen={isOpen}
      size="md"
      anchor="bottom"
      onClose={() => {
        // Reset to main view when closing
        setCurrentView('main');
        reset();
        onClose();
      }}
    >
      <DrawerBackdrop
        style={{
          backgroundColor: "#24242440",
          opacity: 1,
        }}
      />
      <DrawerContent
        className="rounded-t-[30px] pt-[28px] px-4 bg-[#FFFFFF]"
        style={{
          borderTopWidth: 0,
          borderColor: "transparent",
          shadowOpacity: 0,
          elevation: 0,
          paddingBottom: insets.bottom || 16,
        }}
      >
       <DrawerHeader className="pb2 flex-row items-center justify-between">
  <Heading className="font-manropesemibold text-center text-[18px] text-[#000000] mb2 flex-1">
    {getDrawerTitle()}
  </Heading>
  
  {/* Show close button in main view */}
  {showCloseButton && <DrawerCloseButton />}
  
  {/* Show back button in amountInput view */}
  {currentView === 'amountInput' && (
      <TouchableOpacity
        onPress={handleBackToMain}
        className="flex-row items-center border2 mb-4"
        activeOpacity={0.7}
      >
        <ArrowLeft size={20} color="#000000" />
        <Text className="ml-2 font-manropesemibold text-[16px] text-[#000000]">
          Back
        </Text>
      </TouchableOpacity>
  )}
</DrawerHeader>

        <DrawerBody className="pt-4 px-4">
          {currentView === 'main' && renderMainView()}
          {currentView === 'amountInput' && renderAmountInputView()}
          {currentView === 'processing' && renderProcessingView()}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}