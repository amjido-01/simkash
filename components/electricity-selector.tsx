import React, { useState, useMemo } from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  FlatList,
} from "react-native";
import { ChevronDownIcon, Search, X, Zap } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ElectricityProvider } from "@/hooks/use-electricity";

interface ElectricitySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  providers: ElectricityProvider[];
  placeholder: string;
  error?: boolean;
}

const ElectricitySelector = ({
  value,
  onValueChange,
  providers,
  placeholder,
  error,
}: ElectricitySelectorProps) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedProvider = providers.find(
    (provider) => provider.serviceID === value
  );

  // Filter providers based on search query
  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;
    const query = searchQuery.toLowerCase();
    return providers.filter((provider) =>
      provider.name.toLowerCase().includes(query)
    );
  }, [providers, searchQuery]);

  const handleSelectProvider = (serviceID: string) => {
    onValueChange(serviceID);
    setShowModal(false);
    setSearchQuery("");
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchQuery("");
  };

  const renderProviderItem = ({ item }: { item: ElectricityProvider }) => (
    <TouchableOpacity
      onPress={() => handleSelectProvider(item.serviceID)}
      className={`px-4 py-4 flex-row items-center justify-between border-b border-[#F3F4F6] ${
        value === item.serviceID ? "bg-[#fff]" : "bg-white"
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        {/* Provider Icon */}
        <View className="w-10 h-10 rounded-[99px] bg-[#132939] items-center justify-center mr-3">
          <Zap size={20} color="#FFFFFF" strokeWidth={2.5} />
        </View>

        <Text
          className={`text-[14px] flex-1 ${
            value === item.serviceID
              ? "font-semibold text-[#D97706]"
              : "text-[#000000]"
          }`}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </View>

      {value === item.serviceID && (
        <View className="w-5 h-5 rounded-full bg-[#F59E0B] items-center justify-center">
          <Text className="text-white text-[12px]">✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
        className={`w-full rounded-[99px] border min-h-[48px] flex-row items-center justify-between px-4 ${
          error ? "border-2 border-red-500" : "border border-[#D0D5DD]"
        }`}
      >
        <Text
          className={`text-[14px] flex-1 ${
            selectedProvider ? "text-[#000000]" : "text-[#717680]"
          }`}
          numberOfLines={1}
        >
          {selectedProvider ? selectedProvider.name : placeholder}
        </Text>
        <ChevronDownIcon size={20} color="#717680" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <View className="flex-1 bg-white">
            {/* Header */}
            <View className="px-4 py-4 border-b border-[#F3F4F6] flex-row items-center justify-between">
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="mr-3"
              >
                <X size={24} color="#000000" />
              </TouchableOpacity>

              <Text className="text-[18px] font-semibold text-[#000000] flex-1 text-center mr-8">
                Select Electricity Provider
              </Text>
            </View>

            {/* Search Bar */}
            <View className="px-4 py-3 border-b border-[#F3F4F6]">
              <View className="flex-row items-center bg-[#F9FAFB] rounded-[16px] px-4 border border-[#E5E7EB]">
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-[14px] text-[#000000] py-3"
                  placeholder="Search electricity providers"
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Section Header */}
            <View className="px-4 py-3 bg-[#FEF3C7]">
              <Text className="text-[12px] font-medium text-[#92400E] uppercase">
                All Electricity Providers
              </Text>
            </View>

            {/* Providers List using FlatList */}
            <FlatList
              data={filteredProviders}
              renderItem={renderProviderItem}
              keyExtractor={(item) => item.serviceID}
              keyboardShouldPersistTaps="handled"
            />

            {filteredProviders.length === 0 && (
              <View className="py-20 items-center justify-center">
                <Text className="text-[14px] text-[#9CA3AF] text-center">
                  No providers found matching {searchQuery}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default ElectricitySelector;