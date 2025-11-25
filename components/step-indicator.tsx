import React from "react";
import { View } from "react-native";

export const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <View className="flex-row gap-1 my-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className={`h-1 flex-1 rounded-full ${
            index < currentStep ? "bg-[#132939]" : "bg-[#E4E7EC]"
          }`}
        />
      ))}
    </View>
  );
};
