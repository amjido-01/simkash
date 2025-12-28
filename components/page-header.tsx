import React from "react";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ChevronLeft } from "lucide-react-native";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  backButtonColor?: string;
  titleClassName?: string;
  containerClassName?: string;
  containerStyle?: ViewStyle;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  onBack,
  showBackButton = true,
  backButtonColor = "#000000",
  titleClassName,
  containerClassName = "",
  containerStyle,
  leftComponent,
  rightComponent,
}) => {
  return (
    <HStack
      className={`px-4 mb-[40px] mt-2 py-3 items-center justify-center border-b border-[#F3F4F6] ${containerClassName}`}
      style={containerStyle}
    >
      {/* Left Side - Back Button or Custom Component */}
      {showBackButton && onBack && !leftComponent && (
        <TouchableOpacity
          className="absolute left-4"
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={backButtonColor} />
        </TouchableOpacity>
      )}
      
      {leftComponent && (
        <View className="absolute left-4">{leftComponent}</View>
      )}

      {/* Title */}
      <Text
        className={
          titleClassName ||
          "text-[16px] font-semibold font-manropesemibold text-[#000000]"
        }
      >
        {title}
      </Text>

      {/* Right Side - Custom Component */}
      {rightComponent && (
        <div className="absolute right-4">{rightComponent}</div>
      )}
    </HStack>
  );
};