import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Phone,
  Wifi,
  Smartphone,
  ShoppingCart,
  Banknote,
  ArrowUp,
  Tv,
  Zap,
  Package,
  User,
  Clock,
  BookOpen,
  Cpu,
  Home as HomeIcon,
  MonitorSmartphone,
  Gift,
  UserCircle,
} from "lucide-react-native";

import Header from "@/components/header";
import { Pressable } from "@/components/ui/pressable";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Heading } from "@/components/ui/heading";

// Service action data - EXACTLY as shown in screenshot
export interface ServiceOption {
  id: number;
  icon: any;
  label: string;
  iconColor?: string;
  route?: string;
}

// Services in the EXACT order from screenshot
export const servicesGrid: ServiceOption[][] = [
  [
    {
      id: 1,
      icon: Phone,
      label: "Airtime",
      iconColor: "#D257E5",
      route: "/airtime",
    },
    {
      id: 2,
      icon: Wifi,
      label: "Data Bundle",
      iconColor: "#00C53E",
      route: "/data",
    },
    {
      id: 3,
      icon: Smartphone,
      label: "Request SIM",
      iconColor: "#D4BF00",
      route: "/request-sim",
    },
  ],
  [
    {
      id: 4,
      icon: ShoppingCart,
      label: "Request POS",
      iconColor: "#D98014",
      route: "/request-pos",
    },
    {
      id: 5,
      icon: Banknote,
      label: "Data2Cash",
      iconColor: "#1400C5",
      route: "/data2cash",
    },
    {
      id: 6,
      icon: ArrowUp,
      label: "Airtime2Cash",
      iconColor: "#006AB1",
      route: "/airtime2cash",
    },
  ],
  [
    {
      id: 7,
      icon: Tv,
      label: "Cable Tv",
      iconColor: "#8B5CF6",
      route: "/cable-tv",
    },
    {
      id: 8,
      icon: Zap,
      label: "Electricity",
      iconColor: "#F59E0B",
      route: "/electricity",
    },
    {
      id: 9,
      icon: Package,
      label: "Bulk Airtime",
      iconColor: "#10B981",
      route: "/bulk-airtime",
    },
  ],
  [
    {
      id: 10,
      icon: Package,
      label: "Bulk Data",
      iconColor: "#3B82F6",
      route: "/bulk-data",
    },
    {
      id: 11,
      icon: User,
      label: "Virtual Number",
      iconColor: "#EC4899",
      route: "/virtual-number",
    },
    {
      id: 12,
      icon: Clock,
      label: "Pay Later",
      iconColor: "#6366F1",
      route: "/pay-later",
    },
  ],
  [
    {
      id: 13,
      icon: BookOpen,
      label: "Waec",
      iconColor: "#8B5CF6",
      route: "/waec",
    },
    {
      id: 14,
      icon: BookOpen,
      label: "Jamb",
      iconColor: "#EF4444",
      route: "/jamb",
    },
    {
      id: 15,
      icon: Cpu,
      label: "5G Wireless",
      iconColor: "#06B6D4",
      route: "/5g-wireless",
    },
  ],
];


export default function ServicesScreen() {
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(
    null
  );
  const [showServiceDrawer, setShowServiceDrawer] = useState(false);

  const handleServicePress = (service: ServiceOption) => {
    if (service.route) {
      router.push(service.route as any);
    } else {
      setSelectedService(service);
      setShowServiceDrawer(true);
    }
  };

  const handleBottomTabPress = (tab: any) => {
    if (tab.route) {
      router.push(tab.route as any);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]" edges={["top"]}>

      <View className="flex-1">
        {/* Page Title */}
        <View className="px-4 pt-2 pb-4">
          <Text className="font-manropesemibold text-[20px] text-[#000000]">
            Services
          </Text>
        </View>

        {/* Services Grid - EXACT layout as screenshot */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {servicesGrid.map((row, rowIndex) => (
            <HStack key={rowIndex} className="gap-3 mb-6">
              {row.map((service) => (
                <Pressable
                  key={service.id}
                  className="flex-1 items-center"
                  onPress={() => handleServicePress(service)}
                >
                  <View
                    className="w-full aspect-square rounded-[12px] bg-[#FAFAFA] items-center justify-center mb-2"
                    // style={{ backgroundColor: `${service.iconColor}15` }}
                  >
                    <service.icon
                      size={24}
                      color={service.iconColor || "#022742"}
                    />
                  </View>
                  <Text
                    className="font-manroperegular text-[12px] text-[#141316] font-medium text-center"
                    numberOfLines={1}
                  >
                    {service.label}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          ))}
        </ScrollView>

   
      </View>

      {/* Service Details Drawer */}
      <Drawer
        className="border-t-0"
        isOpen={showServiceDrawer}
        size="md"
        anchor="bottom"
        onClose={() => {
          setShowServiceDrawer(false);
          setSelectedService(null);
        }}
      >
        <DrawerBackdrop
          style={{
            backgroundColor: "#24242440",
            opacity: 1,
          }}
        />
        <DrawerContent
          className="rounded-t-[30px] pt-[39px] bg-white"
          style={{
            borderTopWidth: 0,
            borderColor: "transparent",
            shadowOpacity: 0,
            elevation: 0,
            paddingBottom: Platform.OS === "ios" ? 20 : 8,
          }}
        >
          <DrawerHeader className="border-b-0 mb-[28px] pb-2">
            <HStack className="items-center gap-3">
              <View
                className="w-12 h-12 items-center justify-center rounded-[12px]"
                style={{
                  backgroundColor: `${selectedService?.iconColor}20`,
                }}
              >
                {selectedService && (
                  <selectedService.icon
                    size={24}
                    color={selectedService.iconColor}
                  />
                )}
              </View>
              <VStack className="flex-1">
                <Heading
                  size="lg"
                  className="font-manropesemibold text-[18px] text-[#000000]"
                >
                  {selectedService?.label}
                </Heading>
              </VStack>
            </HStack>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody className="pt-4">
            {selectedService && (
              <VStack className="gap-4">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (selectedService.route) {
                      setShowServiceDrawer(false);
                      router.push(selectedService.route as any);
                    }
                  }}
                  className="bg-[#006AB1] py-4 rounded-[12px] items-center"
                >
                  <Text className="font-manropesemibold text-[16px] text-white">
                    Continue to {selectedService.label}
                  </Text>
                </TouchableOpacity>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}