import React, { useState, useMemo } from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  FlatList,
} from "react-native";
import { ChevronDownIcon, Search, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CountryCodePickerItem } from "@/types";

interface PhoneCodeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  countryCodes: CountryCodePickerItem[];
  error?: boolean;
  loading?: boolean;
}

const PhoneCodeSelector = ({
  value,
  onValueChange,
  countryCodes,
  error,
  loading,
}: PhoneCodeSelectorProps) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCode = countryCodes.find((code) => code.callingCode === value);

  const filteredCodes = useMemo(() => {
    if (!searchQuery.trim()) return countryCodes;
    const query = searchQuery.toLowerCase();
    return countryCodes.filter(
      (code) =>
        code.country.toLowerCase().includes(query) ||
        code.callingCode.includes(query)
    );
  }, [countryCodes, searchQuery]);

  const handleSelectCode = (callingCode: string) => {
    onValueChange(callingCode);
    setShowModal(false);
    setSearchQuery("");
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchQuery("");
  };

  const renderCodeItem = ({ item }: { item: CountryCodePickerItem }) => (
    <TouchableOpacity
      onPress={() => handleSelectCode(item.callingCode)}
      className={`px-4 py-4 flex-row items-center justify-between border-b border-[#F3F4F6] ${
        value === item.callingCode ? "bg-[#F0FDF4]" : "bg-white"
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <Text className="text-[24px] mr-3">{item.flag}</Text>
        <View className="flex-1">
          <Text
            className={`text-[14px] ${
              value === item.callingCode
                ? "font-semibold text-[#059669]"
                : "text-[#000000]"
            }`}
            numberOfLines={1}
          >
            {item.country}
          </Text>
          <Text className="text-[12px] text-[#6B7280]">
            +{item.callingCode}
          </Text>
        </View>
      </View>

      {value === item.callingCode && (
        <View className="w-5 h-5 rounded-full bg-[#10B981] items-center justify-center">
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
        disabled={loading}
        className={`h-[48px] px-3 flex-row items-center justify-between border-r border-[#D0D5DD] ${
          error ? "border-red-500" : ""
        }`}
      >
        <Text className="text-[14px] text-[#303237]">
          {selectedCode ? `+${selectedCode.callingCode}` : "+234"}
        </Text>
        <ChevronDownIcon size={16} color="#717680" />
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
            <View className="px-4 py-4 border-b border-[#F3F4F6] flex-row items-center justify-between">
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="mr-3"
              >
                <X size={24} color="#000000" />
              </TouchableOpacity>

              <Text className="text-[18px] font-semibold text-[#000000] flex-1 text-center mr-8">
                Select Country Code
              </Text>
            </View>

            <View className="px-4 py-3 border-b border-[#F3F4F6]">
              <View className="flex-row items-center bg-[#F9FAFB] rounded-[16px] px-4 border border-[#E5E7EB]">
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-[14px] text-[#000000] h-[44px]"
                  placeholder="Search country or code"
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

            <View className="px-4 py-3 bg-[#F9FAFB]">
              <Text className="text-[12px] font-medium text-[#6B7280] uppercase">
                All Country Codes
              </Text>
            </View>

            <FlatList
              data={filteredCodes}
              renderItem={renderCodeItem}
              keyExtractor={(item, index) =>
                `${item.callingCode}-${item.country}-${index}`
              } // ✅ Use unique combination
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
            />

            {filteredCodes.length === 0 && (
              <View className="py-20 items-center justify-center">
                <Text className="text-[14px] text-[#9CA3AF] text-center">
                  No country codes found matching {searchQuery}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default PhoneCodeSelector;
