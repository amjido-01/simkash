import React from "react";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import { Text } from "@/components/ui/text";

export interface QuickAmount {
  label: string;
  value: string;
}

interface QuickAmountSelectorProps {
  amounts: QuickAmount[];
  selectedAmount?: string;
  onSelect: (amount: string) => void;
  // Style customization
  containerClassName?: string;
  containerStyle?: ViewStyle;
  buttonClassName?: string;
  selectedButtonClassName?: string;
  unselectedButtonClassName?: string;
  textClassName?: string;
  selectedTextClassName?: string;
  unselectedTextClassName?: string;
  // Layout
  columns?: 2 | 3 | 4 | 5 | 6;
  spacing?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export const QuickAmountSelector: React.FC<QuickAmountSelectorProps> = ({
  amounts,
  selectedAmount,
  onSelect,
  containerClassName = "",
  containerStyle,
  buttonClassName,
  selectedButtonClassName,
  unselectedButtonClassName,
  textClassName,
  selectedTextClassName,
  unselectedTextClassName,
  columns = 4,
  spacing = "md",
  disabled = false,
}) => {
  // Calculate width based on columns
  const getWidthClass = () => {
    switch (columns) {
      case 2:
        return "w-1/2";
      case 3:
        return "w-1/3";
      case 4:
        return "w-1/4";
      case 5:
        return "w-1/5";
      case 6:
        return "w-1/6";
      default:
        return "w-1/4";
    }
  };

  // Get spacing class
  const getSpacingClass = () => {
    switch (spacing) {
      case "sm":
        return "-mx-1";
      case "md":
        return "-mx-2";
      case "lg":
        return "-mx-3";
      default:
        return "-mx-2";
    }
  };

  const getPaddingClass = () => {
    switch (spacing) {
      case "sm":
        return "px-1";
      case "md":
        return "px-1";
      case "lg":
        return "px-2";
      default:
        return "px-1";
    }
  };

  return (
    <View className={`mt-4 ${containerClassName}`} style={containerStyle}>
      <View className={`flex-row flex-wrap ${getSpacingClass()}`}>
        {amounts.map((amount) => {
          const isSelected = selectedAmount === amount.value;

          return (
            <TouchableOpacity
              key={amount.value}
              onPress={() => !disabled && onSelect(amount.value)}
              className={`${getWidthClass()} ${getPaddingClass()} mb-6 ${
                buttonClassName ||
                `h-[40px] rounded-[12px] items-center justify-center ${
                  isSelected
                    ? selectedButtonClassName || "bg-[#132939] border-[#132939]"
                    : unselectedButtonClassName || "bg-white border-[#E5E7EB]"
                }`
              }`}
              activeOpacity={disabled ? 1 : 0.7}
              disabled={disabled}
            >
              <Text
                className={
                  textClassName ||
                  `text-[14px] font-medium font-manropesemibold ${
                    isSelected
                      ? selectedTextClassName || "text-white"
                      : unselectedTextClassName || "text-[#717680]"
                  }`
                }
              >
                {amount.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};