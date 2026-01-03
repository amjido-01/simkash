import React, { useState } from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  FlatList,
} from "react-native";
import { ChevronDownIcon, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface GenderOption {
  label: string;
  value: string;
}

interface GenderSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  genders: GenderOption[];
  placeholder: string;
  error?: boolean;
}

const GenderSelector = ({
  value,
  onValueChange,
  genders,
  placeholder,
  error,
}: GenderSelectorProps) => {
  const [showModal, setShowModal] = useState(false);

  const selectedGender = genders.find((gender) => gender.value === value);

  const handleSelectGender = (genderValue: string) => {
    onValueChange(genderValue);
    setShowModal(false);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const renderGenderItem = ({ item }: { item: GenderOption }) => (
    <TouchableOpacity
      onPress={() => handleSelectGender(item.value)}
      className={`px-4 py-4 flex-row items-center justify-between border-b border-[#F3F4F6] ${
        value === item.value ? "bg-[#F0FDF4]" : "bg-white"
      }`}
      activeOpacity={0.7}
    >
      <Text
        className={`text-[14px] flex-1 ${
          value === item.value
            ? "font-semibold text-[#059669]"
            : "text-[#000000]"
        }`}
      >
        {item.label}
      </Text>

      {value === item.value && (
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
        className={`w-full rounded-[99px] border min-h-[48px] flex-row items-center justify-between px-4 ${
          error ? "border-2 border-red-500" : "border border-[#D0D5DD]"
        }`}
      >
        <Text
          className={`text-[14px] flex-1 ${
            selectedGender ? "text-[#000000]" : "text-[#717680]"
          }`}
          numberOfLines={1}
        >
          {selectedGender ? selectedGender.label : placeholder}
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
                Select Gender
              </Text>
            </View>

            {/* Section Header */}
            <View className="px-4 py-3 bg-[#F9FAFB]">
              <Text className="text-[12px] font-medium text-[#6B7280] uppercase">
                Select Your Gender
              </Text>
            </View>

            {/* Genders List */}
            <FlatList
              data={genders}
              renderItem={renderGenderItem}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default GenderSelector;