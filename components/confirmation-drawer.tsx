import React, { ReactNode } from "react";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { View, ViewStyle, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export interface ConfirmationDetail {
  label: string;
  value: string;
  icon?: ReactNode;
  valueClassName?: string;
  labelClassName?: string;
}

export interface ConfirmationSection {
  details: ConfirmationDetail[];
  className?: string;
  containerClassName?: string;
  showDividers?: boolean;
}

interface ConfirmationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  subtitle?: string;
  amount?: string;
  showAmount?: boolean;
  sections?: ConfirmationSection[];
  confirmButtonText?: string;
  confirmButtonClassName?: string;
  // NEW PROPS
  scrollable?: boolean;
  confirmButtonFixed?: boolean;
  scrollViewClassName?: string;
  // Style props
  drawerClassName?: string;
  drawerStyle?: ViewStyle;
  headerClassName?: string;
  headerStyle?: ViewStyle;
  bodyClassName?: string;
  bodyStyle?: ViewStyle;
  footerClassName?: string;
  footerStyle?: ViewStyle;
  contentClassName?: string;
  contentStyle?: ViewStyle;
  backdropClassName?: string;
  backdropStyle?: ViewStyle;
  amountClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export const ConfirmationDrawer: React.FC<ConfirmationDrawerProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Purchase",
  subtitle = "Please review details carefully. Transactions are irreversible.",
  amount,
  showAmount = true,
  sections = [],
  confirmButtonText = "Continue",
  confirmButtonClassName,
  // NEW PROPS
  scrollable = false,
  confirmButtonFixed = false,
  scrollViewClassName,
  // Style props
  drawerClassName = "",
  drawerStyle,
  headerClassName = "",
  headerStyle,
  bodyClassName = "",
  bodyStyle,
  footerClassName = "",
  footerStyle,
  contentClassName = "",
  contentStyle,
  backdropClassName,
  backdropStyle,
  amountClassName,
  titleClassName,
  subtitleClassName,
}) => {
  const insets = useSafeAreaInsets();


  const formatAmount = (amt: string) => {
    if (!amt) return "0";
    const num = Number(amt);
    return num.toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  return (
    <Drawer
      className={`border-t-0 ${drawerClassName}`}
      style={drawerStyle}
      isOpen={isOpen}
      size="lg"
      anchor="bottom"
      onClose={onClose}
    >
      <DrawerBackdrop
        className={backdropClassName}
        style={{
          backgroundColor: "#24242440",
          opacity: 1,
          ...backdropStyle,
        }}
      />
      <DrawerContent
        className={`rounded-t-[30px] pt-[28px] bg-[#FFFFFF] flex-1 max-h[85%] ${contentClassName}`}
        style={{
          borderTopWidth: 0,
          borderColor: "transparent",
          shadowOpacity: 0,
          elevation: 0,
          paddingBottom: confirmButtonFixed ? 0 : insets.bottom || 16,
          ...contentStyle,
        }}
      >
        <View className="flex-1">
          <DrawerHeader
            className={`border-b-0 pb-2 px6 ${headerClassName}`}
            style={headerStyle}
          >
            <VStack className="flex-1">
              <VStack>
                <Heading
                  className={
                    titleClassName ||
                    "font-manropesemibold text-center text-[18px] text-[#000000] mb-2"
                  }
                >
                  {title}
                </Heading>
                {subtitle && (
                  <Text
                    className={
                      subtitleClassName ||
                      "text-center text-[12px] font-manroperegular text-[#6B7280] px-2"
                    }
                  >
                    {subtitle}
                  </Text>
                )}
              </VStack>
              {showAmount && amount && (
                <Heading
                  className={
                    amountClassName ||
                    "text-[28px] font-medium text-center mt-[20px] font-manropebold text-[#000000]"
                  }
                >
                  ₦{formatAmount(amount)}
                </Heading>
              )}
            </VStack>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody
            className={`pt-4 px1 flex-1 ${bodyClassName}`}
            style={bodyStyle}
          >
            {scrollable ? (
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                  paddingBottom: confirmButtonFixed ? 100 : 24,
                  paddingHorizontal: 12,
                }}
              >
                <VStack space="md" className="pb-4">
                  {sections.map((section, sectionIndex) => (
                    <View
                      key={sectionIndex}
                      className={
                        section.containerClassName ||
                        "rounded-[20px] border-[#E5E7EF] border px-4 py-2"
                      }
                    >
                      <VStack space="sm" className={section.className}>
                        {section.details.map((detail, detailIndex) => (
                          <React.Fragment key={detailIndex}>
                            <HStack className="justify-between items-center py-3">
                              <HStack
                                space="sm"
                                className="items-center flex-1"
                              >
                                {detail.icon}
                                <Text
                                  className={
                                    detail.labelClassName ||
                                    "text-[12px] font-manroperegular text-[#303237] flex-1"
                                  }
                                  numberOfLines={2}
                                  ellipsizeMode="tail"
                                >
                                  {detail.label}
                                </Text>
                              </HStack>
                              <View className="flex-shrink-0 ml-3">
                                <Text
                                  className={
                                    detail.valueClassName ||
                                    "text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316] text-right"
                                  }
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                >
                                  {detail.value}
                                </Text>
                              </View>
                            </HStack>

                            {section.showDividers !== false &&
                              detailIndex < section.details.length - 1 && (
                                <View className="h-[1px] bg-[#E5E7EB]" />
                              )}
                          </React.Fragment>
                        ))}
                      </VStack>
                    </View>
                  ))}
                </VStack>
              </ScrollView>
            ) : (
              <View className="flex-1">
                <VStack space="md">
                  {sections.map((section, sectionIndex) => (
                    <View
                      key={sectionIndex}
                      className={
                        section.containerClassName ||
                        "rounded-[20px] border-[#E5E7EF] border px-4 py-2"
                      }
                    >
                      <VStack space="sm" className={section.className}>
                        {section.details.map((detail, detailIndex) => (
                          <React.Fragment key={detailIndex}>
                            <HStack className="justify-between items-center py-3">
                              <HStack space="sm" className="items-center">
                                {detail.icon}
                                <Text
                                  className={
                                    detail.labelClassName ||
                                    "text-[12px] font-manroperegular text-[#303237]"
                                  }
                                >
                                  {detail.label}
                                </Text>
                              </HStack>
                              <Text
                                className={
                                  detail.valueClassName ||
                                  "text-[12px] font-medium leading-[100%] font-manropesemibold text-[#141316]"
                                }
                              >
                                {detail.value}
                              </Text>
                            </HStack>

                            {section.showDividers !== false &&
                              detailIndex < section.details.length - 1 && (
                                <View className="h-[1px] bg-[#E5E7EB]" />
                              )}
                          </React.Fragment>
                        ))}
                      </VStack>
                    </View>
                  ))}
                </VStack>
              </View>
            )}
          </DrawerBody>

          {/* Conditional button rendering */}
          {!confirmButtonFixed ? (
            <DrawerFooter
              className={`px-4 pt-4 pb-0 ${footerClassName}`}
              style={footerStyle}
            >
              <Button
                className={
                  confirmButtonClassName ||
                  "rounded-full bg-[#132939] h-[48px] w-full"
                }
                size="xl"
                onPress={onConfirm}
              >
                <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                  {confirmButtonText}
                </ButtonText>
              </Button>
            </DrawerFooter>
          ) : (
            <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4 border-t border-gray-100">
              <Button
                className={
                  confirmButtonClassName ||
                  "rounded-full bg-[#132939] h-[52px] w-full shadow"
                }
                size="xl"
                onPress={onConfirm}
              >
                <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                  {confirmButtonText}
                </ButtonText>
              </Button>
            </View>
          )}
        </View>
      </DrawerContent>
    </Drawer>
  );
};
