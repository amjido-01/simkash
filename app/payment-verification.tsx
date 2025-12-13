import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { useVerifyPayment } from '@/hooks/use-paystack-deposit';
import { CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// These are the possible states our verification can be in
type VerificationStatus = 'verifying' | 'success' | 'failed' | 'pending';

export default function PaymentVerification() {
  // Get the reference from the URL params
  // When we navigate here, we pass: { reference: "SMK_123", amount: "5000" }
  const { reference, amount } = useLocalSearchParams<{ 
    reference: string;
    amount?: string;
  }>();
  
  const { verifyPayment } = useVerifyPayment();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [verifiedAmount, setVerifiedAmount] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);

  // This runs when the screen loads
  useEffect(() => {
    if (reference) {
      console.log("Starting verification for reference:", reference);
      verifyPaymentStatus();
    } else {
      console.error("No reference provided!");
      setStatus('failed');
    }
  }, [reference]);

  // This function checks if the payment was successful
  const verifyPaymentStatus = async (retry = 0) => {
    const MAX_RETRIES = 3; // Try up to 3 times
    const RETRY_DELAY = 3000; // Wait 3 seconds between retries

    try {
      setStatus('verifying');
      console.log(`Verification attempt ${retry + 1}/${MAX_RETRIES}`);
      
      // IMPORTANT: Wait 2 seconds before checking
      // Why? The backend needs time to process the webhook from Paystack
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call our verification API
      const verifyResponse = await verifyPayment(reference);
      console.log("Verification response:", verifyResponse);
      
      // Check the status from backend
      if (verifyResponse?.data?.status === 'success') {
        // Payment successful! 🎉
        console.log("Payment successful!");
        setStatus('success');
        setVerifiedAmount(verifyResponse.data.amount);
        
      } else if (verifyResponse?.data?.status === 'pending') {
        // Payment is still processing
        console.log("Payment still pending...");
        
        if (retry < MAX_RETRIES) {
          // Try again after waiting
          setStatus('pending');
          setRetryCount(retry + 1);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          await verifyPaymentStatus(retry + 1);
        } else {
          // Tried 3 times, still pending
          console.log("Max retries reached, payment still pending");
          setStatus('pending');
        }
        
      } else {
        // Payment failed
        console.log("Payment failed");
        setStatus('failed');
      }
      
    } catch (error: any) {
      console.error('Verification error:', error);
      
      // If verification API call failed, retry
      if (retry < MAX_RETRIES) {
        console.log(`Retrying... (${retry + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        await verifyPaymentStatus(retry + 1);
      } else {
        console.log("Max retries reached, verification failed");
        setStatus('failed');
      }
    }
  };

  // Button handlers
  const handleContinue = () => {
    router.replace('/(tabs)'); // Go back to home
  };

  const handleRetry = () => {
    setRetryCount(0);
    verifyPaymentStatus();
  };

  const handleViewTransactions = () => {
    router.replace('/transactions'); // Adjust to your transactions route
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        
        {/* VERIFYING STATE - Shows spinner */}
        {status === 'verifying' && (
          <>
            <ActivityIndicator size="large" color="#244155" />
            <Text className="mt-4 font-manropesemibold text-[18px] text-[#000000] text-center">
              Verifying Payment...
            </Text>
            <Text className="mt-2 font-manroperegular text-[14px] text-[#6B7280] text-center">
              Please wait while we confirm your payment
            </Text>
            {retryCount > 0 && (
              <Text className="mt-2 font-manroperegular text-[12px] text-[#9CA3AF] text-center">
                Retry attempt {retryCount} of 3
              </Text>
            )}
          </>
        )}

        {/* SUCCESS STATE - Shows checkmark */}
        {status === 'success' && (
          <>
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <CheckCircle size={48} color="#10B981" />
            </View>
            <Text className="font-manropebold text-[24px] text-[#000000] text-center mb-2">
              Payment Successful!
            </Text>
            <Text className="font-manroperegular text-[16px] text-[#6B7280] text-center mb-1">
              ₦{verifiedAmount.toLocaleString()} has been added to your wallet
            </Text>
            <Text className="font-manroperegular text-[14px] text-[#9CA3AF] text-center mb-8">
              Reference: {reference}
            </Text>
            
            <Button
              onPress={handleContinue}
              className="rounded-full bg-[#244155] h-[50px] w-full"
            >
              <ButtonText className="text-white text-[16px] font-medium">
                Continue
              </ButtonText>
            </Button>
          </>
        )}

        {/* FAILED STATE - Shows X icon */}
        {status === 'failed' && (
          <>
            <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
              <XCircle size={48} color="#EF4444" />
            </View>
            <Text className="font-manropebold text-[24px] text-[#000000] text-center mb-2">
              Verification Failed
            </Text>
            <Text className="font-manroperegular text-[16px] text-[#6B7280] text-center mb-8">
              We couldn&apos;t verify your payment. Please check your transaction history or try again.
            </Text>
            
            <View className="w-full gap-3">
              <Button
                onPress={handleRetry}
                className="rounded-full bg-[#244155] h-[50px] w-full"
              >
                <ButtonText className="text-white text-[16px] font-medium">
                  Try Again
                </ButtonText>
              </Button>
              
              <Button
                onPress={handleViewTransactions}
                className="rounded-full bg-white border border-[#E5E7EB] h-[50px] w-full"
              >
                <ButtonText className="text-[#244155] text-[16px] font-medium">
                  View Transactions
                </ButtonText>
              </Button>
              
              <Button
                onPress={handleContinue}
                className="rounded-full bg-white h-[50px] w-full"
              >
                <ButtonText className="text-[#6B7280] text-[16px] font-medium">
                  Back to Home
                </ButtonText>
              </Button>
            </View>
          </>
        )}

        {/* PENDING STATE - Shows clock icon */}
        {status === 'pending' && (
          <>
            <View className="w-20 h-20 bg-yellow-100 rounded-full items-center justify-center mb-4">
              <Clock size={48} color="#F59E0B" />
            </View>
            <Text className="font-manropebold text-[24px] text-[#000000] text-center mb-2">
              Payment Processing
            </Text>
            <Text className="font-manroperegular text-[16px] text-[#6B7280] text-center mb-8">
              Your payment is still being processed. This may take a few moments.
            </Text>
            
            <View className="w-full gap-3">
              <Button
                onPress={handleRetry}
                className="rounded-full bg-[#244155] h-[50px] w-full"
              >
                <ButtonText className="text-white text-[16px] font-medium">
                  Check Again
                </ButtonText>
              </Button>
              
              <Button
                onPress={handleViewTransactions}
                className="rounded-full bg-white border border-[#E5E7EB] h-[50px] w-full"
              >
                <ButtonText className="text-[#244155] text-[16px] font-medium">
                  View Transactions
                </ButtonText>
              </Button>
            </View>
          </>
        )}
        
      </View>
    </SafeAreaView>
  );
}