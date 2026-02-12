// components/sim-details-drawer.tsx
import { Button } from "@/components/ui/button";
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
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useDashboard } from "@/hooks/use-dashboard";
import { router } from "expo-router";
import { Gift, Wallet } from "lucide-react-native";
import React, { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConfirmationDrawer } from "./confirmation-drawer";
import CountdownTimer from "./countdown-timer";
import { UserSim } from "./use-user-sims";

interface SimDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sim: UserSim;
}

export default function SimDetailsDrawer({
  isOpen,
  onClose,
  sim,
}: SimDetailsDrawerProps) {
  const insets = useSafeAreaInsets();
  const { wallet } = useDashboard();
  const [showConfirmationDrawer, setShowConfirmationDrawer] = useState(false);

  const SIM_PRICE = 8500;
  const CASHBACK = 500;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Calculate expiry date (1 year from created date)
  const getExpiryDate = (createdDate: string) => {
    const date = new Date(createdDate);
    date.setFullYear(date.getFullYear() + 1);
    return formatDate(date.toISOString());
  };

  // Get expiry date as Date object for countdown
  const getExpiryDateObject = (createdDate: string) => {
    const date = new Date(createdDate);
    date.setFullYear(date.getFullYear() + 1);
    return date;
  };

  const isExpired = (createdDate: string) => {
    const expiryDate = getExpiryDateObject(createdDate);
    return new Date() > expiryDate;
  };
  // const isExpired = (createdDate: string) => true;

  const handleRenew = () => {
    setShowConfirmationDrawer(true);
  };

  const handleConfirmRequest = async () => {
    // TODO: When the renewal endpoint is ready:
    // 1. Initiate API call here (e.g., await renewSim({ simId: sim.id, ... }))
    // 2. Wrap this in a try-catch for error handling
    // 3. Show a loading state on the button while processing

    // Navigate directly to success screen for now
    router.push({
      pathname: "/sim-request-success",
      params: {
        requestId: Math.floor(Math.random() * 1000000).toString(),
        amount: SIM_PRICE.toString(),
        partnerName: "SimKash Support",
        partnerPhone: "0800SIMKASH",
        partnerRole: "support",
      },
    });
    setShowConfirmationDrawer(false);
    onClose();
  };

  const formatCurrency = (value?: number | string) => {
    if (!value) return "₦0.00";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "₦0.00";
    return `₦${numValue.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const simDetails = [
    {
      label: "Phone Number",
      value: sim.sim_number,
    },
    {
      label: "Network Provider",
      value: sim.network,
    },
    {
      label: "Activated On",
      value: formatDate(sim.createdAt),
    },
    {
      label: "Expiry Date",
      value: getExpiryDate(sim.createdAt),
    },
    {
      label: "Data Plan",
      value: "Unlimited", // You can make this dynamic if available in your data
    },
  ];

  return (
    <Drawer
      className="border-t-0"
      isOpen={isOpen}
      size={isExpired(sim.createdAt) ? "lg" : "md"}
      anchor="bottom"
      onClose={onClose}
    >
      <DrawerBackdrop
        style={{
          backgroundColor: "#24242440",
          opacity: 1,
        }}
      />
      <DrawerContent
        className="rounded-t-[30px] pt-[28px] bg-[#FFFFFF] flex-1"
        style={{
          borderTopWidth: 0,
          borderColor: "transparent",
          shadowOpacity: 0,
          elevation: 0,
          paddingBottom: 0,
        }}
      >
        <View className="flex-1">
          <DrawerHeader className="border-b-0 pb-2 px6">
            <VStack className="flex-1">
              <Heading className="font-manropesemibold text-center text-[18px] text-[#000000]">
                My Device SIM
              </Heading>
            </VStack>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody className="pt-1 px1 flex-1">
            <View className="flex-1 px-3">
              {/* Countdown Timer */}
              <CountdownTimer expiryDate={getExpiryDateObject(sim.createdAt)} />

              <View className="rounded-[20px] border-[#E5E7EF] border px-4 py-2">
                <VStack space="sm">
                  {simDetails.map((detail, index) => (
                    <React.Fragment key={index}>
                      <HStack className="justify-between items-center py-3">
                        <Text className="text-[12px] font-manroperegular text-[#303237]">
                          {detail.label}
                        </Text>
                        <Text className="text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                          {detail.value}
                        </Text>
                      </HStack>

                      {index < simDetails.length - 1 && (
                        <View className="h-[1px] bg-[#E5E7EB]" />
                      )}
                    </React.Fragment>
                  ))}
                </VStack>
              </View>

              {isExpired(sim.createdAt) && (
                <Button
                  onPress={handleRenew}
                  className="mt-6 rounded-full bg-[#132939] h-[48px]"
                >
                  <Text className="text-white text-[14px] font-manropesemibold">
                    Renew SIM
                  </Text>
                </Button>
              )}
            </View>
          </DrawerBody>
        </View>
      </DrawerContent>

      {/* Confirmation Drawer */}
      <ConfirmationDrawer
        isOpen={showConfirmationDrawer}
        onClose={() => setShowConfirmationDrawer(false)}
        onConfirm={handleConfirmRequest}
        title="Need a SIM to Get Started?"
        subtitle="The SIM comes bundled with a 1-year data plan so you can start using it immediately after activation."
        amount={SIM_PRICE.toString()}
        sections={[
          {
            containerClassName:
              "rounded-[20px] border-[#E5E7EF] border px-4 py-2",
            details: [
              { label: "Phone Number", value: sim.sim_number },
              { label: "Network Provider", value: sim.network },
              { label: "Activated On", value: formatDate(sim.createdAt) },
              { label: "Expiry Date", value: getExpiryDate(sim.createdAt) },
              { label: "Data Plan", value: "Unlimited" },
            ],
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
                value: `+₦${CASHBACK}`,
                icon: <Gift size={16} color="#CB30E0" />,
                valueClassName:
                  "text-[12px] font-medium leading-[100%] font-manropesemibold text-[#10B981]",
              },
            ],
          },
        ]}
        confirmButtonText="Confirm Renewal"
      />
    </Drawer>
  );
}
