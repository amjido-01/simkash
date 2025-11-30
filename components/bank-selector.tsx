import React, { useState, useMemo } from "react";
import {
  Modal,
  TouchableOpacity,
  ScrollView,
  View,
  Text,
  TextInput,
  Platform,
} from "react-native";
import { ChevronDownIcon, Search, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Bank {
  value: string;
  label: string;
}

interface BankSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  banks: Bank[];
  placeholder: string;
  error?: boolean;
}

const BankSelector = ({
  value,
  onValueChange,
  banks,
  placeholder,
  error,
}: BankSelectorProps) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedBank = banks.find((bank) => bank.value === value);

  // Filter banks based on search query
  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) return banks;

    const query = searchQuery.toLowerCase();
    return banks.filter((bank) => bank.label.toLowerCase().includes(query));
  }, [banks, searchQuery]);

  const handleSelectBank = (bankValue: string) => {
    onValueChange(bankValue);
    setShowModal(false);
    setSearchQuery("");
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchQuery("");
  };

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
            selectedBank ? "text-[#000000]" : "text-[#717680]"
          }`}
          numberOfLines={1}
        >
          {selectedBank ? selectedBank.label : placeholder}
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
                Select Bank
              </Text>
            </View>

            {/* Search Bar */}
            <View className="px-4 py-3 border-b border-[#F3F4F6]">
              <View className="flex-row items-center bg-[#F9FAFB] rounded-[16px] px-4 border border-[#E5E7EB]">
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-[14px] text-[#000000]"
                  placeholder="Search all Banks"
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
            <View className="px-4 py-3 bg-[#F9FAFB]">
              <Text className="text-[12px] font-medium text-[#6B7280] uppercase">
                All Institutions
              </Text>
            </View>

            {/* Banks List */}
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filteredBanks.length > 0 ? (
                filteredBanks.map((bank, index) => (
                  <TouchableOpacity
                    key={bank.value}
                    onPress={() => handleSelectBank(bank.value)}
                    className={`px-4 py-4 flex-row items-center justify-between border-b border-[#F3F4F6] ${
                      value === bank.value ? "bg-[#F0FDF4]" : "bg-white"
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center flex-1">
                      {/* Bank Icon Placeholder */}
                      <View className="w-10 h-10 rounded-full bg-[#4F46E5] items-center justify-center mr-3">
                        <Text className="text-white text-[16px] font-semibold">
                          {bank.label.charAt(0)}
                        </Text>
                      </View>

                      <Text
                        className={`text-[14px] flex-1 ${
                          value === bank.value
                            ? "font-semibold text-[#059669]"
                            : "text-[#000000]"
                        }`}
                        numberOfLines={1}
                      >
                        {bank.label}
                      </Text>
                    </View>

                    {value === bank.value && (
                      <View className="w-5 h-5 rounded-full bg-[#10B981] items-center justify-center">
                        <Text className="text-white text-[12px]">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View className="py-20 items-center justify-center">
                  <Text className="text-[14px] text-[#9CA3AF] text-center">
                    No banks found matching {searchQuery}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default BankSelector;
