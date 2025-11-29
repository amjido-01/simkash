import Header from "@/components/header";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  // DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Pressable } from "@/components/ui/pressable";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Eye, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { quickActions, paymentOptions, moreServices, MenuOption } from "@/constants/menu";
import { transactions, transferOptions } from "@/utils/mock";

export default function HomeScreen() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showQuickActionDrawer, setShowQuickActionDrawer] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState<any>(null);

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

  const handleQuickActionPress = (action: any) => {
    console.log("hello quick action");
    setSelectedQuickAction(action);
    setShowQuickActionDrawer(true);
  };

  const handleTransferOptionPress = (option: any) => {
    if (option === 'toSimkash') {
       setShowQuickActionDrawer(false);
      router.push("/to-simkash")
    }else {
      setShowQuickActionDrawer(false);
      router.push("/to-bank")
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Wallet Balance Section */}
        <View className="mt-[22px] px-4">
          <VStack className="w-full mb-[32px] py-[32px] items-center bg-[#F9FAFB] rounded-[20px]">
            <Text className="font-manroperegular text-[14px] text-[#6B7280] mb-2">
              Wallet Balance
            </Text>
            <HStack className="items-center gap-3">
              <Heading className="text-[#141316] font-manropesemibold text-[38px]">
                ₦50,000<Text className="text-[#9CA3AF]">.00</Text>
              </Heading>
              <TouchableOpacity className="p-2">
                <Eye size={24} color="#6B7280" />
              </TouchableOpacity>
            </HStack>
          </VStack>

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
                <View className="w-12 h-12 items-center justify-center rounded-full mb-2">
                  <action.icon size={24} color={action.color} />
                </View>
                <Text className="font-manroperegular font-medium text-[12px] text-[#141316]">
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </HStack>

          {/* Payments Section */}
          <View className="mb-10 p-[14px]">
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
                    className="w-[60px] h-[60px] items-center justify-center mb-2"
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
          <View className="mb-6 p-[14px]">
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
              {transactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  className="flex-row items-center justify-between p-4 bg-[#F9FAFB] rounded-full"
                  activeOpacity={0.7}
                >
                  <HStack className="items-center gap-3 flex-1">
                    <View className="w-12 h-12 bg-[#EFF9FF] items-center justify-center rounded-[99%]">
                      <transaction.icon size={20} color="#022742" />
                    </View>
                    <VStack className="flex-1">
                      <Text className="font-manropesemibold font-medium text-[14px] text-[#000000]">
                        {transaction.type}
                      </Text>
                      <Text className="font-manroperegular font-medium text-[12px] text-[#5A5A5A]">
                        {transaction.date}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text className="font-manropesemibold text-[16px] text-[#141316]">
                    {transaction.amount}
                  </Text>
                </TouchableOpacity>
              ))}
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

      {/* Quick Action Drawer (Top Up / Send) */}
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
             <DrawerBody className="pt-4 px-2">
            {selectedQuickAction?.label === "Send" ? (
              // Render transfer options for Send
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
            ) : selectedQuickAction?.label === "Top Up" ? (
              // Render top up form
              <Text className="font-manroperegular text-[14px] text-[#6B7280]">
                Top Up form content will go here
              </Text>
            ) : null}
          </DrawerBody>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}
