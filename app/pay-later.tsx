import { useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "@/components/page-header";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { router } from "expo-router";
import {
  Banknote,
  WalletCards,
  ClockFading,
  Gift,
  Wallet,
} from "lucide-react-native";
import BNPLTermsDrawer from "@/components/bnpl-terms-drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WalletBalance } from "@/components/wallet-balance";
import { PinDrawer } from "@/components/pin-drawer";
import { ConfirmationDrawer } from "@/components/confirmation-drawer";
import { useDashboard } from "@/hooks/use-dashboard";
import { usePayLaterDashboard } from "@/hooks/use-paylater-dashboard";
import { SkeletonLoader } from "@/components/paylater-skeleton-loader";
import { paymentCategories, PaymentCategory } from "@/constants/menu";
import { usePayLaterCredits } from "@/hooks/use-paylater-credits";
import { usePayLaterRepay } from "@/hooks/use-paylater-repay";

const TERMS_ACCEPTED_KEY = "@bnpl_terms_accepted";

export default function BuyNowPayLater() {
  const {
    balance,
    availableLimit,
    creditLimit,
    repayment,
    hasOutstandingLoan,
    hasAvailableCredit,
    isLoading: isLoadingPayLater,
    isError,
    refetch,
  } = usePayLaterDashboard();
  const {
    unpaidCredits,
    totalAmountDue,
    // hasUnpaidCredits,
    formatAmount: formatCreditAmount,
    formatDate: formatCreditDate,
    // isOverdue,
  } = usePayLaterCredits();
  const { wallet } = useDashboard();
  const { repay, isRepaying } = usePayLaterRepay();

  const [showTermsDrawer, setShowTermsDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isLoadingTerms, setIsLoadingTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false); 
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  // ✅ Get the FIRST unpaid credit (oldest due date)
  const currentCredit = unpaidCredits[0];
  console.log(unpaidCredits, "unpaidCredits");

  // ✅ Show total unpaid in the main screen
  const showUnpaidSummary = unpaidCredits.length > 1;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => {
      setRefreshing(false);
    });
  }, [refetch]);

  // Calculate countdown if repayment exists
  useEffect(() => {
    if (!repayment?.dueDate || balance <= 0) return;

    const calculateCountdown = () => {
      const now = new Date().getTime();
      const dueTime = new Date(repayment.dueDate!).getTime();
      const diff = dueTime - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown({ days, hours, minutes });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);

    return () => clearInterval(interval);
  }, [repayment?.dueDate, balance]);

  // Check terms status
  useEffect(() => {
    if (!isLoadingPayLater) {
      checkTermsStatus();
    }
  }, [isLoadingPayLater, balance]);

  const checkTermsStatus = async () => {
    try {
      const termsAccepted = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);

      if (!termsAccepted && balance === 0) {
        setShowTermsDrawer(true);
        setHasAcceptedTerms(false);
      } else {
        setHasAcceptedTerms(true);
      }
    } catch (error) {
      console.error("Error checking terms status:", error);
    } finally {
      setIsLoadingTerms(false);
    }
  };

  const handleTermsAccepted = async () => {
    try {
      await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, "true");
      setHasAcceptedTerms(true);
      setShowTermsDrawer(false);

      Alert.alert(
        "Terms Accepted",
        "You can now use Buy Now, Pay Later services."
      );
    } catch (error) {
      console.error("Error saving terms acceptance:", error);
    }
  };

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)");
    }
  }, []);

const handleCategoryPress = (category: PaymentCategory) => {
  if (!hasAcceptedTerms) {
    setShowTermsDrawer(true);
    return;
  }

  if (!hasAvailableCredit) {
    Alert.alert(
      "No Credit Available",
      "You have reached your credit limit. Please repay existing loans to continue."
    );
    return;
  }

  // Navigate using route + params
  if (category.params) {
    router.push({
      pathname: category.route as any,
      params: category.params,
    });
  } else {
    router.push(category.route as any);
  }
};


  const handleRepayNow = () => {
    if (!hasOutstandingLoan) {
      Alert.alert("No Outstanding Loan", "You have no loans to repay.");
      return;
    }
    setShowConfirmDrawer(true);
  };

  const handleContinueToPin = () => {
    setShowConfirmDrawer(true);
    setTimeout(() => {
      setShowPinDrawer(true);
    }, 300);
  };

const handlePinSubmit = async (pin: string) => {
  setIsSubmitting(true);

  try {
    console.log("🔐 PIN entered, processing repayment...");

    // Validate current credit exists
    if (!currentCredit) {
      throw new Error("No unpaid credit found. Please refresh and try again.");
    }

    // Validate wallet balance
    const walletBalance = Number(wallet?.balance) || 0;
    const amountDue = parseFloat(currentCredit.amount_due);

    if (walletBalance < amountDue) {
      throw new Error(
        `Insufficient balance. You need ₦${amountDue.toLocaleString()} but have ₦${walletBalance.toLocaleString()}.`
      );
    }

    // Call the repay API
    const repaymentResult = await repay({
      repaymentAmount: amountDue,
      billId: currentCredit.bill_id,
      paymentMethod: "wallet",
    });

    console.log("✅ Repayment successful:", repaymentResult);

    // Close PIN drawer
    setShowPinDrawer(false);

    // Small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Navigate to success screen
    router.push({
      pathname: "/bnpl-repayment-success",
      params: {
        amount: currentCredit.amount_due,
        dueDate: formatCreditDate(currentCredit.due_date),
        dueAmount: currentCredit.amount_due,
        fee: repayment?.fee || "0%",
        service: repayment?.service || "Pay Later",
        transactionId: repaymentResult.transactionId || "",
        reference: repaymentResult.reference || "",
        billId: currentCredit.bill_id.toString(),
        message: repaymentResult.message || "Repayment successful!",
        newBalance: repaymentResult.newBalance?.toString() || "",
        remainingCredits: (unpaidCredits.length - 1).toString(),
      },
    });
  } catch (error: any) {
    console.error("❌ Repayment error:", error);

    // Extract and format error message
    let errorMessage = "Repayment failed. Please try again.";

    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.response?.data?.responseMessage) {
      errorMessage = error.response.data.responseMessage;
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    // Handle specific error types
    if (errorMessage.toLowerCase().includes("insufficient")) {
      errorMessage = "Insufficient wallet balance. Please top up your wallet.";
    } else if (errorMessage.toLowerCase().includes("pin")) {
      errorMessage = "Invalid PIN. Please try again.";
    } else if (errorMessage.toLowerCase().includes("bill")) {
      errorMessage = "Invalid bill. Please refresh and try again.";
    }

    // Throw error to be caught by PinDrawer
    throw new Error(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleInfoPress = () => {
    setShowTermsDrawer(true);
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  // Show skeleton loader
  if (isLoadingPayLater || isLoadingTerms) {
    return (
      <SafeAreaView className="flex-1 bg-[#fafafa]" edges={["top"]}>
        <PageHeader
          title="Buy Now, Pay Later"
          onBack={handleBack}
          showBackButton={true}
        />
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <SkeletonLoader />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show error state
  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <PageHeader
          title="Buy Now, Pay Later"
          onBack={handleBack}
          showBackButton={true}
        />
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-[16px] font-manropesemibold text-red-500 text-center mb-4">
            Failed to load Pay Later data
          </Text>
          <Button
            onPress={() => refetch()}
            className="rounded-full bg-[#132939] h-[48px] px-6"
          >
            <ButtonText className="text-white text-[14px] font-manropesemibold">
              Try Again
            </ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]" edges={["top"]}>
      <PageHeader
        title="Buy Now, Pay Later"
        onBack={handleBack}
        showBackButton={true}
        rightComponent={
          <TouchableOpacity onPress={handleInfoPress}>
            <ClockFading size={24} color="#6B7280" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#244155"
            colors={["#244155"]}
          />
        }
      >
        <Box className="bg-white px-4 pt-6 pb-24 flex-1">
          <VStack space="lg">
            {/* Loan Balance Card */}
            <Box className="mb-[32px] bg-[#FFFFFF] rounded-[16px]">
              <VStack className="w-full py-[20px] items-center bg-[#F9FAFB] rounded-[20px]">
                <Text className="font-manroperegular text-[16px] text-[#6B7280] mb-3">
                  Loan Balance
                </Text>
                <WalletBalance balance={balance} size="lg" />

                {showUnpaidSummary && (
                  <Text className="text-[12px] font-manroperegular text-[#6B7280] mt-2">
                    {unpaidCredits.length} unpaid bills
                  </Text>
                )}
              </VStack>

              {/* Show repay button if loanBalance > 0 */}
              {balance > 0 && (
                <Box className="px-4 my-3">
                  {/* Warning Message */}
                  <View className="rounded-[14px] mb-3">
                    <Text className="text-[14px] font-manroperegular text-red-500 text-center leading-[20px]">
                      Seriously overdue would affect your credit Score
                    </Text>
                  </View>

                  {/* Repay Button */}
                  <Button
                    onPress={handleRepayNow}
                    className="rounded-full bg-[#132939] h-[48px] w-1/2 mx-auto mb-4"
                  >
                    <ButtonText className="text-white text-[16px] font-manropesemibold leading-[24px]">
                      Repay Now
                    </ButtonText>
                  </Button>

                  {/* Countdown Timer */}
                  <Box className="bg-white rounded-[12px] p-4">
                    <HStack className="items-center justify-center gap-8">
                      {/* Days */}
                      <VStack className="items-center">
                        <Text className="text-[32px] px-3 py-1 rounded-[16px] bg-[#F8F8F8] font-manropebold text-[#000000] leading-[40px]">
                          {String(countdown.days).padStart(2, "0")}
                        </Text>
                        <Text className="text-[12px] font-manroperegular text-[#000000] mt-1">
                          Days
                        </Text>
                      </VStack>

                      <Text className="text-[32px] font-manropebold text-[#D1D5DB] leading-[40px]">
                        :
                      </Text>

                      {/* Hours */}
                      <VStack className="items-center">
                        <Text className="text-[32px] px-3 py-1 rounded-[16px] bg-[#F8F8F8] font-manropebold text-[#000000] leading-[40px]">
                          {String(countdown.hours).padStart(2, "0")}
                        </Text>
                        <Text className="text-[12px] font-manroperegular text-[#000000] mt-1">
                          Hours
                        </Text>
                      </VStack>

                      <Text className="text-[32px] font-manropebold text-[#D1D5DB] leading-[40px]">
                        :
                      </Text>

                      {/* Minutes */}
                      <VStack className="items-center">
                        <Text className="text-[32px] px-3 py-1 rounded-[16px] bg-[#F8F8F8] font-manropebold text-[#000000] leading-[40px]">
                          {String(countdown.minutes).padStart(2, "0")}
                        </Text>
                        <Text className="text-[12px] font-manroperegular text-[#000000] mt-1">
                          Mins
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Credit Limits */}
            <VStack className="bg-[#ffffff] rounded-[16px] py-3" space="md">
              {/* Available Limit */}
              <HStack className="items-center border-t border-[#E5E7EF] justify-between py-4 px-4 rounded-[12px]">
                <HStack space="sm" className="items-center">
                  <Banknote size={18} color="#066042" />
                  <Text className="text-[16px] font-manroperegular text-[#000000]">
                    Available Limit
                  </Text>
                </HStack>
                <Text className="text-[16px] font-manropesemibold text-[#000000]">
                  {formatCurrency(availableLimit)}
                </Text>
              </HStack>

              {/* Total Credit Limit */}
              <HStack className="items-center border-t border-[#E5E7EF] justify-between py-4 px-4 rounded-[12px]">
                <HStack space="sm" className="items-center">
                  <WalletCards size={18} color="#066042" />
                  <Text className="text-[16px] font-manroperegular text-[#000000]">
                    Total Credit Limit
                  </Text>
                </HStack>
                <Text className="text-[16px] font-manropesemibold text-[#000000]">
                  {formatCurrency(creditLimit)}
                </Text>
              </HStack>
            </VStack>

            {/* Payments Section */}
            <VStack space="md" className="mt-4">
              <Text className="text-[16px] font-manropesemibold text-[#565C69]">
                Payments
              </Text>

              {/* Payment Categories Grid */}
              <View className="flex-row flex-wrap gap-3">
                {paymentCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => handleCategoryPress(category)}
                      activeOpacity={0.7}
                      className="items-center justify-center bg-[#FAFAFA] rounded-[16px] p-4"
                      style={{ width: "22%" }}
                    >
                      <VStack space="xs" className="items-center">
                        <View className="w-12 h-12 rounded-[12px] items-center justify-center">
                          <IconComponent size={20} color={category.iconColor} />
                        </View>
                        <Text className="text-[12px] font-manroperegular text-[#000000] text-center">
                          {category.name}
                        </Text>
                      </VStack>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </VStack>
          </VStack>
        </Box>
      </ScrollView>

      {/* Terms & Conditions Drawer */}
      <BNPLTermsDrawer
        isOpen={showTermsDrawer}
        onClose={() => {
          if (hasAcceptedTerms) {
            setShowTermsDrawer(false);
          } else {
            Alert.alert(
              "Terms Required",
              "You must accept the terms and conditions to use Buy Now, Pay Later.",
              [
                {
                  text: "Go Back",
                  onPress: () => {
                    setShowTermsDrawer(false);
                    router.back();
                  },
                },
                {
                  text: "Review Terms",
                  style: "cancel",
                },
              ]
            );
          }
        }}
        onAccept={handleTermsAccepted}
        isRequired={!hasAcceptedTerms}
      />

      {/* Confirmation Drawer */}
      <ConfirmationDrawer
        isOpen={showConfirmDrawer}
        onClose={() => setShowConfirmDrawer(false)}
        onConfirm={handleContinueToPin}
        title="Confirm Repayment"
        subtitle={
          showUnpaidSummary
            ? `Paying 1 of ${unpaidCredits.length} bills • ${formatCreditAmount(totalAmountDue - parseFloat(currentCredit?.amount_due || "0"))} remaining`
            : ""
        }
        amount={currentCredit?.amount_due || balance.toString()}
        showAmount={true}
        amountClassName="text-[32px] font-manropebold text-[#000000] text-center mt-4"
        sections={[
          {
            containerClassName:
              "rounded-[16px] border-[#E5E7EF] border px-4 py-2 bg-white",
            details: [
              {
                label: "Bill ID",
                value: currentCredit ? `${currentCredit.bill_id}` : "N/A",
              },
              { label: "Service", value: repayment?.service || "Pay Later" },
              {
                label: "Due Date",
                value: currentCredit
                  ? formatCreditDate(currentCredit.due_date)
                  : "N/A",
              },
              {
                label: "Amount Due",
                value: currentCredit
                  ? formatCreditAmount(currentCredit.amount_due)
                  : `₦${balance.toLocaleString()}`,
              },
              { label: "Fee", value: repayment?.fee || "0%" },
            ],
          },
          {
            containerClassName: "px-0 py-2",
            details: [
              {
                label: "Wallet Balance",
                value: formatCreditAmount(Number(wallet?.balance) || 0),
                icon: <Wallet size={16} color="#FF8D28" />,
              },
              {
                label: "Cashback",
                value: "+₦500",
                icon: <Gift size={16} color="#CB30E0" />,
                valueClassName:
                  "text-[12px] font-medium font-manropesemibold text-[#10B981]",
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
        isSubmitting={isSubmitting || isRepaying}
        loadingText="Processing repayment..."
      />
    </SafeAreaView>
  );
}
