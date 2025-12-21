import DashboardSkeleton from "@/components/dashboard-skeleton";
import Header from "@/components/header";
import TopUpWalletDrawer from "@/components/topup-wallet-drawer";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  // DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { VStack } from "@/components/ui/vstack";
import { WalletBalance } from "@/components/wallet-balance";
import {
  MenuOption,
  moreServices,
  paymentOptions,
  quickActions,
} from "@/constants/menu";
import { useAccountDetail } from "@/hooks/use-account";
import { useDashboard } from "@/hooks/use-dashboard";
import { formatAmount } from "@/utils/formatAmount.helper";
import { formatDate } from "@/utils/formatDate.helper";
import { transferOptions } from "@/utils/mock";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const {
    wallet, // Wallet balance data
    parsedTransactions, // Transactions with parsed metadata
    // userProfile,         // User profile info
    // dashboard,           // Full dashboard data
    isLoading, // Initial loading state
    isFetching, // Refetching state
    // isError,            // Error state
    // error,              // Error object
    refetch, // Manual refetch function
  } = useDashboard();
  const {
    accountDetail,
    isFetchingAccountDetail,
    isAccountDetailError,
    accountDetailError,
  } = useAccountDetail();
  const [refreshing, setRefreshing] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showQuickActionDrawer, setShowQuickActionDrawer] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState<any>(null);
  const [showTopUpDrawer, setShowTopUpDrawer] = useState(false);
  // const [hasCompletedKYC, setHasCompletedKYC] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => {
      setRefreshing(false);
    });
  }, [refetch]);

  const handlePaymentOptionPress = (option: MenuOption | any) => {
    if (option.label === "More") {
      setShowDrawer(true);
    } else {
      if (option.route) {
        setShowDrawer(false);
        router.push(option.route);
      } else {
        console.log("Selected:", option.label);
      }
    }
  };

  // FIXED HANDLER
  const handleQuickActionPress = (action: any) => {
    if (action.label === "Top Up") {
      // open only the real top up drawer
      setShowTopUpDrawer(true);
      return;
    }

    // For SEND
    setSelectedQuickAction(action);
    setShowQuickActionDrawer(true);
  };

  const handleTransferOptionPress = (option: any) => {
    if (option === "toSimkash") {
      setShowQuickActionDrawer(false);
      router.push("/to-simkash");
    } else {
      setShowQuickActionDrawer(false);
      router.push("/to-bank");
    }
  };

  if (isLoading || isFetching) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header />
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]" edges={["top", "bottom"]}>
      <Header />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 pb-[20px]"
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
        {/* Wallet Balance Section */}
        <View className="mt-[22px] px-4">
          <Box className="mb-[32px] bg-[#FFFFFF] rounded-[16px]">
            <VStack className="w-full  py-[32px] items-center bg[#F9FAFB] rounded-[20px]">
              <Text className="font-manroperegular text-[14px] text-[#6B7280] mb-2">
                Wallet Balance
              </Text>
              <WalletBalance balance={wallet?.balance} size="lg" />
            </VStack>
          </Box>

          {/* Quick Actions - Top Up & Send */}
          <HStack className="gap-4 mb-10">
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                className="flex-1 items-center justify-center"
                // activeOpacity={0.7}
                onPress={() => {
                  console.log("PRESSED:", action.label);
                  handleQuickActionPress(action);
                }}
              >
                <View className="h12 bg-[#FFFFFF] w-full py-[13px] px-[30px] rounded-[16px] items-center justify-center roundedfull mb-2">
                  <action.icon size={24} color={action.color} />
                </View>
                <Text className="font-manroperegular font-medium text-[12px] text-[#141316]">
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </HStack>

          {/* <Button
            onPress={() => {
              Linking.openURL(
                "simkash://payment-verification?reference=TEST_123&status=success"
              );
            }}
          >
            <ButtonText>Test Deep Link</ButtonText>
          </Button> */}

          {/* Payments Section */}
          <View className="mb-10 px-[16px] py-[20px] rounded-[16px] bg-[#ffffff]">
            <Text className="font-manropesemibold font-medium text-[14px] text-[#565C69] mb-6">
              Payments
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {paymentOptions.map((option) => (
                <Pressable
                  key={option.id}
                  className="items-center"
                  style={{ width: "30%" }}
                  onPress={() => handlePaymentOptionPress(option)}
                >
                  <View
                    className="w[60px] w-full py-[16px] px-[30px] h-[60px] bg-[#FAFAFA] rounded-[16px] items-center justify-center mb-2"
                    // style={{ backgroundColor: option.bgColor }}
                  >
                    <option.icon size={24} color={option.iconColor} />
                  </View>
                  <Text
                    className="font-manroperegular font-medium text-[12px] text-[#000000] text-center"
                    numberOfLines={2}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Transactions Section */}
          <View className="mb-6 px-[16px] py-[20px] bg-[#ffffff] rounded-[16px]">
            <HStack className="justify-between items-center mb-4">
              <Text className="font-manropesemibold font-medium text-[14px] text-[#565C69] mb4">
                Transactions
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="font-manropesemibold fontbold text-[14px] text-[#022742]">
                  View More
                </Text>
              </TouchableOpacity>
            </HStack>

            {/* Transaction List */}
            <VStack className="gap-3">
              {parsedTransactions && parsedTransactions.length > 0 ? (
                parsedTransactions.slice(0, 4).map((transaction) => {
                  const isCommission = transaction.transaction_type
                    .toLowerCase()
                    .includes("commission");
                  const metadata = transaction.metadata;

                  return (
                    <TouchableOpacity
                      key={transaction.id}
                      className="flex-row items-center justify-between p-4 bg[#F9FAFB] rounded-[12px]"
                      activeOpacity={0.7}
                      onPress={() => {
                        // Navigate to transaction details if you have that screen
                        console.log("Transaction:", transaction.id);
                      }}
                    >
                      <HStack className="items-center gap-3 flex-1">
                        <View
                          className="w-12 h-12 items-center justify-center rounded-[99px]"
                          style={{
                            backgroundColor: isCommission
                              ? "#D1FAE5"
                              : "#EFF9FF",
                          }}
                        >
                          <Text
                            className="font-manropesemibold text-[16px]"
                            style={{
                              color: isCommission ? "#022742" : "#022742",
                            }}
                          >
                            {transaction.transaction_type
                              .charAt(0)
                              .toUpperCase()}
                          </Text>
                        </View>
                        <VStack className="flex-1">
                          <Text className="font-manropesemibold font-medium text-[14px] text-[#000000]">
                            {transaction.transaction_type}
                          </Text>
                          <Text className="font-manroperegular font-medium text-[12px] text-[#5A5A5A]">
                            {formatDate(transaction.processed_at)}
                          </Text>
                          {metadata?.network && (
                            <Text className="font-manroperegular text-[11px] text-[#6B7280]">
                              {metadata.network}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      <VStack className="items-end">
                        <Text
                          className="font-manropesemibold text-[16px]"
                          style={{
                            color: isCommission ? "#10B981" : "#141316",
                          }}
                        >
                          {formatAmount(transaction.amount, isCommission)}
                        </Text>
                        <View
                          className="mt-1 px-2 py-1 rounded-[4px]"
                          style={{
                            backgroundColor:
                              transaction.status === "success"
                                ? "#D1FAE5"
                                : "#FEE2E2",
                          }}
                        >
                          <Text
                            className="font-manroperegular text-[10px]"
                            style={{
                              color:
                                transaction.status === "success"
                                  ? "#10B981"
                                  : "#DC2626",
                            }}
                          >
                            {transaction.status.toUpperCase()}
                          </Text>
                        </View>
                      </VStack>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View className="items-center justify-center py-8">
                  <Text className="font-manroperegular text-[14px] text-[#6B7280]">
                    No transactions yet
                  </Text>
                </View>
              )}
            </VStack>
          </View>
        </View>
      </ScrollView>

      {/* More Services Drawer */}
      <Drawer
        className="border-t-0"
        isOpen={showDrawer}
        size="md"
        anchor="bottom"
        onClose={() => {
          setShowDrawer(false);
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
            paddingBottom: Platform.OS === "ios" ? 20 : 8,
          }}
        >
          <DrawerHeader className="border-b-0 mb-[28px] pb-2">
            <Heading
              size="lg"
              className="font-manropesemibold text-[18px] text-[#000000]"
            >
              More Services
            </Heading>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody className="pt4">
            <View className="flex-row flex-wrap gap-4">
              {moreServices.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  className="items-center"
                  style={{ width: "30%" }}
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log("Selected service:", service.label);
                    setShowDrawer(false);
                    if (service.route) {
                      // Cast to any to avoid expo-router path literal typing constraints
                      router.push(service.route as any);
                    }
                  }}
                >
                  <View className="w-[60px] h-[60px] items-center justify-center rounded-2xl mb-2">
                    <service.icon size={26} color={service.iconColor} />
                  </View>
                  <Text
                    className="font-manroperegular font-medium text-[12px] text-[#000000] text-center"
                    numberOfLines={2}
                  >
                    {service.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Quick Action Drawer ( Send) */}
      <Drawer
        className="border-t-0"
        isOpen={showQuickActionDrawer}
        size="md"
        anchor="bottom"
        onClose={() => {
          setShowQuickActionDrawer(false);
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
            paddingBottom: Platform.OS === "ios" ? 20 : 8,
          }}
        >
          <DrawerHeader className="border-b-0 pb-2">
            <Heading
              size="lg"
              className="font-manropesemibold text-[18px] text-[#000000]"
            >
              {selectedQuickAction?.heading}
            </Heading>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody className="pt-4">
            <VStack className="gap-[18px]">
              {transferOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.7}
                  onPress={() => handleTransferOptionPress(option?.to)}
                  className="flex-row items-center border border-[#E5E7EF] px-2 justify-between py-4 rounded-[16px]"
                >
                  <HStack className="items-center gap-2 flex-1">
                    <View className="w-12 h-12 bg-white items-center justify-center rounded-[12px]">
                      <option.icon size={24} color="#000000" />
                    </View>
                    <VStack className="flex-1">
                      <Text className="font-manropesemibold text-[14px] leading-[100%] font-bold text-[#000000] mb-1">
                        {option.title}
                      </Text>
                      <Text className="font-manroperegular font-medium text-[12px] text-[#303237]">
                        {option.description}
                      </Text>
                    </VStack>
                  </HStack>
                  <ChevronRight size={20} color="#000000" />
                </TouchableOpacity>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <TopUpWalletDrawer
        isOpen={showTopUpDrawer}
        onClose={() => setShowTopUpDrawer(false)}
        hasCompletedKYC={true}
        accountNumber={accountDetail?.account_number || ""}
        accountName={accountDetail?.account_name || ""}
        bankName={accountDetail?.bank_name || ""}
      />
    </SafeAreaView>
  );
}
