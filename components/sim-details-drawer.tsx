// components/sim-details-drawer.tsx
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
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserSim } from "./use-user-sims";
import CountdownTimer from "./countdown-timer";

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
      size="md"
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
            </View>
          </DrawerBody>
        </View>
      </DrawerContent>
    </Drawer>
  );
}
