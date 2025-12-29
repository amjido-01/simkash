// File: components/searchable-selector.tsx
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

export interface SelectorItem {
  id: string;
  name: string;
  subtitle?: string;
}

interface SearchableSelectorProps {
  value: string;
  onValueChange: (id: string, name: string) => void;
  items: SelectorItem[];
  placeholder: string;
  title: string;
  error?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
}

const SearchableSelector = ({
  value,
  onValueChange,
  items,
  placeholder,
  title,
  error,
  isLoading = false,
  disabled = false,
  searchPlaceholder = "Search...",
}: SearchableSelectorProps) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedItem = items.find((item) => item.id === value);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, searchQuery]);

  const handleSelectItem = (item: SelectorItem) => {
    onValueChange(item.id, item.name);
    setShowModal(false);
    setSearchQuery("");
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchQuery("");
  };

  const renderItem = ({ item }: { item: SelectorItem }) => (
    <TouchableOpacity
      onPress={() => handleSelectItem(item)}
      className={`px-4 py-4 flex-row items-center justify-between border-b border-[#F3F4F6] ${
        value === item.id ? "bg-[#F0FDF4]" : "bg-white"
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-1">
        <Text
          className={`text-[14px] ${
            value === item.id
              ? "font-manropesemibold text-[#059669]"
              : "font-manroperegular text-[#000000]"
          }`}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        {item.subtitle && (
          <Text
            className="text-[12px] text-[#6B7280] mt-1"
            numberOfLines={1}
          >
            {item.subtitle}
          </Text>
        )}
      </View>

      {value === item.id && (
        <View className="w-5 h-5 rounded-full bg-[#10B981] items-center justify-center ml-3">
          <Text className="text-white text-[12px]">✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={() => !disabled && !isLoading && setShowModal(true)}
        activeOpacity={0.7}
        disabled={disabled || isLoading}
        className={`w-full rounded-[99px] border min-h-[48px] flex-row items-center justify-between px-4 ${
          error ? "border-2 border-red-500" : "border border-[#D0D5DD]"
        } ${disabled || isLoading ? "opacity-50" : ""}`}
      >
        <View className="flex-row items-center gap-3 flex-1">
          {isLoading ? (
            <View className="flex-row items-center flex-1">
              <ActivityIndicator size="small" color="#132939" className="mr-3" />
              <Text className="text-[14px] text-[#717680]">Loading...</Text>
            </View>
          ) : selectedItem ? (
            <Text className="text-[14px] text-[#132939]" numberOfLines={1}>
              {selectedItem.name}
            </Text>
          ) : (
            <Text className="text-[14px] text-[#717680]">{placeholder}</Text>
          )}
        </View>
        {!isLoading && <ChevronDownIcon size={20} color="#6B7280" />}
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

              <Text className="text-[18px] font-manropesemibold text-[#000000] flex-1 text-center mr-8">
                {title}
              </Text>
            </View>

            {/* Search Bar */}
            <View className="px-4 py-3 border-b border-[#F3F4F6]">
              <View className="flex-row items-center bg-[#F9FAFB] rounded-[16px] px-4 py3 border border-[#E5E7EB]">
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-[14px] text-[#000000]"
                  placeholder={searchPlaceholder}
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

            {/* Items List using FlatList */}
            {isLoading ? (
              <View className="py-20 items-center justify-center">
                <ActivityIndicator size="large" color="#132939" />
                <Text className="text-[14px] text-[#6B7280] mt-4">
                  Loading...
                </Text>
              </View>
            ) : filteredItems.length === 0 ? (
              <View className="py-20 items-center justify-center">
                <Text className="text-[14px] text-[#9CA3AF] text-center">
                  {searchQuery
                    ? `No results found for "${searchQuery}"`
                    : "No items available"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default SearchableSelector;