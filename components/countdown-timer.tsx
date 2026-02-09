import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

interface CountdownTimerProps {
  expiryDate: string | Date;
}

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

export default function CountdownTimer({ expiryDate }: CountdownTimerProps) {
  const expiry =
    typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(expiry),
  );

  useEffect(() => {
    // Initial calculation
    setTimeRemaining(calculateTimeRemaining(expiry));

    // Update every minute (60 seconds)
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(expiry));
    }, 60000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [expiryDate]);

  const renderTimeUnit = (value: number, label: string) => (
    <VStack className="items-center" space="xs">
      <HStack space="xs" className="items-center bg-[#F8F8F8] rounded-[6px] py-4 px-2">
        <Text className="text-[32px] font-medium font-manropebold text-[#000000]">
          {formatNumber(value)[0]}
        </Text>
        <Text className="text-[32px] font-medium font-manropebold text-[#000000]">
          {formatNumber(value)[1]}
        </Text>
      </HStack>
      <Text className="text-[12px] font-manroperegular font-medium text-[#000000]">
        {label}
      </Text>
    </VStack>
  );

  return (
    <View className="mb-2">
      <HStack className="justify-center gap-24 items-center">
        {renderTimeUnit(timeRemaining.days, "Days")}
        {renderTimeUnit(timeRemaining.hours, "Hours")}
        {renderTimeUnit(timeRemaining.minutes, "Mins")}
      </HStack>
    </View>
  );
}
