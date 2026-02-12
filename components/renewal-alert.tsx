import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Info } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { UserSim } from "./use-user-sims";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
}

const calculateTimeRemaining = (expiryDate: Date): TimeRemaining => {
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
};

const formatNumber = (num: number): string => {
  return num.toString().padStart(2, "0");
};

const CountdownUnit = ({ expiryDate }: { expiryDate: Date }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(expiryDate),
  );

  useEffect(() => {
    setTimeRemaining(calculateTimeRemaining(expiryDate));
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(expiryDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  const renderDigit = (digit: string) => (
    <View className="bg-[#fcfcfc] border border-[#f5f5f5] rounded-md w-7 h-10 items-center justify-center">
      <Text className="text-[20px] font-manropebold text-[#000000]">
        {digit}
      </Text>
    </View>
  );

  const renderUnit = (value: number, label: string) => (
    <VStack space="xs" className="items-center">
      <HStack space="xs">
        {renderDigit(formatNumber(value)[0])}
        {renderDigit(formatNumber(value)[1])}
      </HStack>
      <Text className="text-[10px] font-manroperegular text-[#6B7280]">
        {label}
      </Text>
    </VStack>
  );

  return (
    <HStack space="sm">
      {renderUnit(timeRemaining.days, "Days")}
      {renderUnit(timeRemaining.hours, "Hours")}
      {renderUnit(timeRemaining.minutes, "Mins")}
    </HStack>
  );
};

interface RenewalAlertProps {
  sim: UserSim;
  onRenew: (sim: UserSim) => void;
}

export const RenewalAlert = ({ sim, onRenew }: RenewalAlertProps) => {
  const getExpiryDateObject = (createdDate: string) => {
    const date = new Date(createdDate);
    date.setFullYear(date.getFullYear() + 1);
    return date;
  };

  return (
    <Box className="bg-white rounded-[20px] p-4 mb-6">
      <HStack space="sm" className="items-center mb-4">
        <Info size={16} color="#FFB800" />
        <Text className="text-[14px] font-manropesemibold text-[#303237]">
          Your {sim.batch.batch_name} will expire on:
        </Text>
      </HStack>

      <HStack className="items-center justify-between">
        <HStack space="md">
          <CountdownUnit expiryDate={getExpiryDateObject(sim.createdAt)} />
        </HStack>

        <TouchableOpacity
          onPress={() => onRenew(sim)}
          className="bg-[#132939] px-4 py-2 rounded-full"
        >
          <Text className="text-white text-[14px] font-manropesemibold">
            Renew Now
          </Text>
        </TouchableOpacity>
      </HStack>
    </Box>
  );
};
