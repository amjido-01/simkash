import React, { useState, useMemo } from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { ChevronDownIcon, Search, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CountryPickerItem } from "@/types";

interface CountrySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  countries: CountryPickerItem[];
  placeholder: string;
  error?: boolean;
  loading?: boolean;
  onRetry?: () => void;
}

const CountrySelector = ({
  value,
  onValueChange,
  countries,
  placeholder,
  error,
  loading,
  onRetry,
}: CountrySelectorProps) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCountry = countries.find((country) => country.value === value);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    const query = searchQuery.toLowerCase();
    return countries.filter((country) =>
      country.label.toLowerCase().includes(query)
    );
  }, [countries, searchQuery]);

  const handleSelectCountry = (countryCode: string) => {
    onValueChange(countryCode);
    setShowModal(false);
    setSearchQuery("");
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchQuery("");
  };

  const renderCountryItem = ({ item }: { item: CountryPickerItem }) => (
    <TouchableOpacity
      onPress={() => handleSelectCountry(item.value)}
      className={`px-4 py-4 flex-row items-center justify-between border-b border-[#F3F4F6] ${
        value === item.value ? "bg-[#F0FDF4]" : "bg-white"
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        {/* Country Flag */}
        <Text className="text-[24px] mr-3">{item.flag}</Text>

        <Text
          className={`text-[14px] flex-1 ${
            value === item.value
              ? "font-semibold text-[#059669]"
              : "text-[#000000]"
          }`}
          numberOfLines={1}
        >
          {item.flag ? item.label.replace(item.flag, "").trim() : item.label}
        </Text>
      </View>

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
        disabled={loading}
        className={`w-full rounded-[99px] border min-h-[48px] flex-row items-center justify-between px-4 ${
          error ? "border-2 border-red-500" : "border border-[#D0D5DD]"
        }`}
      >
        {loading ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#132939" />
            <Text className="ml-2 text-[14px] text-[#717680]">
              Loading countries...
            </Text>
          </View>
        ) : (
          <>
            <Text
              className={`text-[14px] flex-1 ${
                selectedCountry ? "text-[#000000]" : "text-[#717680]"
              }`}
              numberOfLines={1}
            >
              {selectedCountry
                ? selectedCountry.label
                : placeholder}
            </Text>
            <ChevronDownIcon size={20} color="#717680" />
          </>
        )}
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
                Select Country
              </Text>
            </View>

            {/* Search Bar */}
            <View className="px-4 py-3 border-b border-[#F3F4F6]">
              <View className="flex-row items-center bg-[#F9FAFB] rounded-[16px] px-4 border border-[#E5E7EB]">
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-[14px] text-[#000000] h-[44px]"
                  placeholder="Search countries"
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
                All Countries
              </Text>
            </View>

            {/* Countries List */}
            <FlatList
              data={filteredCountries}
              renderItem={renderCountryItem}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
            />

            {filteredCountries.length === 0 && (
              <View className="py-20 items-center justify-center">
                <Text className="text-[14px] text-[#9CA3AF] text-center">
                  No countries found matching {searchQuery}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default CountrySelector;