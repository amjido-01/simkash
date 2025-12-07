import React from "react";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Network {
  id: string;
  serviceID: string;
  name: string;
  image: string;
}

interface NetworkSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  networks: Network[];
  selectedNetworkId?: string;
  onSelectNetwork: (serviceID: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  title?: string;
}

export const NetworkSelectionDrawer: React.FC<NetworkSelectionDrawerProps> = ({
  isOpen,
  onClose,
  networks,
  selectedNetworkId,
  onSelectNetwork,
  isLoading = false,
  isError = false,
  title = "Choose network Provider",
}) => {
  const insets = useSafeAreaInsets();

  const handleNetworkSelect = (serviceID: string) => {
    onSelectNetwork(serviceID);
    onClose();
  };

  return (
    <Drawer
      className="border-t-0"
      isOpen={isOpen}
      size="sm"
      anchor="bottom"
      onClose={onClose}
    >
      <DrawerBackdrop style={{ backgroundColor: "#24242440", opacity: 1 }} />
      <DrawerContent
        className="rounded-t-[30px] pt-[28px] bg-[#FFFFFF]"
        style={{
          borderTopWidth: 0,
          borderColor: "transparent",
          shadowOpacity: 0,
          elevation: 0,
          paddingBottom: insets.bottom || 16,
        }}
      >
        <DrawerHeader className="border-b-0 pb-6 px-6">
          <Heading className="font-manropesemibold text-left text-[20px] text-[#000000]">
            {title}
          </Heading>
          <DrawerCloseButton />
        </DrawerHeader>

        <DrawerBody className="pt-2 px-6 pb-8">
          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#132939" />
              <Text className="text-[14px] text-[#6B7280] mt-4">
                Loading networks...
              </Text>
            </View>
          ) : isError ? (
            <View className="py-8 px-4">
              <Text className="text-[14px] text-red-500 text-center">
                Failed to load networks. Please try again.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {networks.map((network) => (
                <TouchableOpacity
                  key={network.id}
                  onPress={() => handleNetworkSelect(network.serviceID)}
                  className="w-[22%] items-center mb-6"
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-[40px] h-[40px] rounded-full items-center justify-center mb-2 ${
                      selectedNetworkId === network.serviceID
                        ? "border-2 border-[#132939]"
                        : "border border-[#E5E7EB]"
                    }`}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <Image
                      source={{ uri: network.image }}
                      className="rounded-full h-full w-full"
                      alt={`${network.name} logo`}
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    className={`text-[12px] font-medium text-center ${
                      selectedNetworkId === network.serviceID
                        ? "font-manropesemibold text-[#000000]"
                        : "font-manroperegular text-[#6B7280]"
                    }`}
                  >
                    {network.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};