import { useState, useCallback, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "@/components/page-header";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { router } from "expo-router";
import {
  Zap,
  PhoneMissed,
  Wifi,
  Tv,
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

// Mock BNPL data - replace with API hook
const bnplData = {
  loanBalance: 1000,
  availableLimit: 4500,
  totalCreditLimit: 5000,
  dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  service: "Airtime",
  dueAmount: 1100,
  fee: "10%",
};

const TERMS_ACCEPTED_KEY = "@bnpl_terms_accepted";

const paymentCategories = [
  {
    id: "airtime",
    name: "Airtime",
    icon: PhoneMissed,
    iconColor: "#EC4899",
  },
  {
    id: "data",
    name: "Data Bundle",
    icon: Wifi,
    iconColor: "#10B981",
  },
  {
    id: "electricity",
    name: "Electricity",
    icon: Zap,
    iconColor: "#F59E0B",
  },
  {
    id: "tv",
    name: "TV",
    icon: Tv,
    iconColor: "#3B82F6",
  },
];

export default function BuyNowPayLater() {
  const [showTermsDrawer, setShowTermsDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  const { wallet } = useDashboard();

  // Calculate countdown
  useEffect(() => {
    if (bnplData.loanBalance <= 0) return;

    const calculateCountdown = () => {
      const now = new Date().getTime();
      const dueTime = bnplData.dueDate.getTime();
      const diff = dueTime - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown({ days, hours, minutes });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Check terms status
  useEffect(() => {
    checkTermsStatus();
  }, []);

  const checkTermsStatus = async () => {
    try {
      const termsAccepted = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);

      if (!termsAccepted && bnplData.loanBalance === 0) {
        setShowTermsDrawer(true);
        setHasAcceptedTerms(false);
      } else {
        setHasAcceptedTerms(true);
      }
    } catch (error) {
      console.error("Error checking terms status:", error);
    } finally {
      setIsLoading(false);
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

  const handleCategoryPress = (categoryId: string) => {
    if (!hasAcceptedTerms) {
      setShowTermsDrawer(true);
      return;
    }

    if (bnplData.availableLimit <= 0) {
      Alert.alert(
        "No Credit Available",
        "You have reached your credit limit. Please repay existing loans to continue."
      );
      return;
    }

    // router.push({
    //   pathname: "/bnpl-repayment",
    //   params: { category: categoryId },
    // });
  };

  const handleRepayNow = () => {
    if (bnplData.loanBalance <= 0) {
      Alert.alert("No Outstanding Loan", "You have no loans to repay.");
      return;
    }
    // Show confirmation drawer
    setShowConfirmDrawer(true);
  };

   const handleContinueToPin = () => {
    setShowConfirmDrawer(false);
    setTimeout(() => {
      setShowPinDrawer(true);
    }, 300);
  };

  const handlePinSubmit = async (pin: string) => {
    setIsSubmitting(true);

    try {
      // API call will go here
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowPinDrawer(false);

      router.push({
        pathname: "/bnpl-repayment-success",
        params: {
          amount: bnplData.loanBalance.toString(),
          dueDate: formatDate(bnplData.dueDate),
          dueAmount: bnplData.dueAmount.toString(),
          fee: bnplData.fee,
          service: bnplData.service,
        },
      });
    } catch (error: any) {
      throw new Error("Repayment failed. Please try again.");
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <PageHeader
          title="Buy Now, Pay Later"
          onBack={handleBack}
          showBackButton={true}
        />
        <View className="flex-1 items-center justify-center">
          <Text className="text-[14px] font-manroperegular text-[#6B7280]">
            Loading...
          </Text>
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
      >
        <Box className="bg-white px-4 pt6 pb-24 flex-1">
          <VStack space="lg">
            {/* Loan Balance Card */}
            <Box className="mb-[32px] bg-[#FFFFFF] rounded-[16px]">
              <VStack className="w-full py-[20px] items-center bg-[#F9FAFB] rounded-[20px]">
                <Text className="font-manroperegular text-[16px] text-[#6B7280] mb-3">
                  Loan Balance
                </Text>
                <WalletBalance balance={bnplData.loanBalance} size="lg" />
              </VStack>

              {/* Show repay button if loanBalance > 0 */}
              {bnplData.loanBalance > 0 && (
                <Box className="px-4 my-3">
                  {/* Warning Message */}
                  <View className="rounded-[14px]">
                    <Text className="text-[14px] font-manroperegular mb-3 text-red-500 text-center leading-[20px]">
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
                  <Box className="bg-white rounded-[12px] p-4 border-[#E5E7EB]">
                    <HStack className="items-center justify-center gap-8">
                      {/* Days */}
                      <VStack className="items-center">
                        <Text className="text-[32px] p-1 rounded-[16px] bg-[#F8F8F8] font-manropebold text-[#000000] leading-[40px]">
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
                        <Text className="text-[32px] p-1 rounded-[16px] bg-[#F8F8F8] font-manropebold text-[#000000] leading-[40px]">
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
                        <Text className="text-[32px] p-1 rounded-[16px] bg-[#F8F8F8] font-manropebold text-[#000000] leading-[40px]]">
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
                  {formatCurrency(bnplData.availableLimit)}
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
                  {formatCurrency(bnplData.totalCreditLimit)}
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
                      onPress={() => handleCategoryPress(category.id)}
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
        subtitle=""
        amount={bnplData.dueAmount.toString()}
        showAmount={true}
        amountClassName="text-[32px] font-manropebold text-[#000000] text-center mt-4"
        sections={[
          {
            containerClassName:
              "rounded-[16px] border-[#E5E7EF] border px-4 py-2 bg-white",
            details: [
              { label: "Service", value: bnplData.service },
              { label: "Due Date", value: formatDate(bnplData.dueDate) },
              {
                label: "Due Amount",
                value: `N${bnplData.dueAmount.toLocaleString()}`,
              },
              { label: "Fee", value: bnplData.fee },
            ],
          },
          {
            containerClassName: "px-0 py-2",
            details: [
              {
                label: "Wallet Balance",
                value: formatCurrency(Number(wallet?.balance) || 50000),
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
        loadingText="Processing repayment..."
      />
    </SafeAreaView>
  );
}