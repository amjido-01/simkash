import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Heading } from "./ui/heading";

interface CableService {
  name: string;
  serviceID: string;
}

interface CableServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cableServices: CableService[];
  isLoading: boolean;
  isError: boolean;
  selectedProviderId: string | null;
  onSelectProvider: (providerId: string) => void;
}


const CableServiceDrawer: React.FC<CableServiceDrawerProps> = ({
  isOpen,
  onClose,
  cableServices,
  isLoading,
  isError,
  selectedProviderId,
  onSelectProvider,
}) => {
  const handleProviderSelect = (providerId: string) => {
    onSelectProvider(providerId);
    onClose();
  };


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
        className="rounded-t-[30px] pt-[29px] bg-[#FFFFFF]"
        style={{
          borderTopWidth: 0,
          borderColor: "transparent",
          shadowOpacity: 0,
          elevation: 0,
          paddingBottom: 16, // or insets.bottom if you have insets
        }}
      >
        <DrawerHeader className="border-b-0 pb-4 px-6">
          <Heading className="font-manropesemibold text-center text-[18px] text-[#000000] mb-2">
            Select Cable Service
          </Heading>
          <DrawerCloseButton />
        </DrawerHeader>

        <DrawerBody className="px6 pb-8">
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" color="#132939" />
              <Text className="text-[14px] text-[#6B7280] mt-4">
                Loading cable services...
              </Text>
            </View>
          ) : isError ? (
            <View className="flex-1 justify-center items-center py-12">
              <Text className="text-[16px] text-[#DC2626] font-manropesemibold mb-2">
                Failed to load services
              </Text>
              <Text className="text-[14px] text-[#6B7280] text-center">
                Please check your connection and try again
              </Text>
            </View>
          ) : cableServices.length === 0 ? (
            <View className="flex-1 justify-center items-center py-12">
              <Text className="text-[16px] text-[#6B7280] font-manropesemibold mb-2">
                No services available
              </Text>
              <Text className="text-[14px] text-[#9CA3AF] text-center">
                Cable services are currently unavailable
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <VStack space="sm">
                {cableServices.map((provider) => (
                  <TouchableOpacity
                    key={provider.serviceID}
                    onPress={() =>
                      handleProviderSelect(provider.serviceID)
                    }
                    className={`
          flex-row justify-between items-center p-4 
          rounded-[16px] border-b border-[#E5E7EB] 
          ${
            selectedProviderId === (provider.serviceID || provider.serviceID)
              ? "bg-[#F0F7FF]"
              : "bg-white"
          }
        `}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center flex-1">
                    

                      <View className="flex-1">
                        <Text className="text-[14px] font-medium leading-[100%] font-manropesemibold text-[#141316]">
                          {provider.name}
                        </Text>
                                             </View>

                      {selectedProviderId ===
                      (provider.serviceID || provider.serviceID) ? (
                        <View className="w-6 h-6 rounded-full bg-[#132939] items-center justify-center ml-2">
                          <Text className="text-white text-[12px] font-bold">
                            ✓
                          </Text>
                        </View>
                      ) : (
                        <ChevronRight
                         size={20} color="#000000"
                          className="ml-2"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </VStack>

              {/* <View className="mt-6 pt-4 border-t border-[#E5E7EB]">
              </View> */}
            </ScrollView>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default CableServiceDrawer;
