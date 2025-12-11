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

interface Package {
  id: string;
  name: string;
  price: number;
}

interface PackageSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  packages: Package[];
  placeholder: string;
  error?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

const PackageSelector = ({
  value,
  onValueChange,
  packages,
  placeholder,
  error,
  isLoading = false,
  disabled = false,
}: PackageSelectorProps) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  console.log("rendered")

  const selectedPackage = packages.find((pkg) => pkg.id === value);

  // Filter packages based on search query
  const filteredPackages = useMemo(() => {
    if (!searchQuery.trim()) return packages;
    const query = searchQuery.toLowerCase();
    return packages.filter((pkg) => pkg.name.toLowerCase().includes(query));
  }, [packages, searchQuery]);

  const handleSelectPackage = (packageId: string) => {
    onValueChange(packageId);
    setShowModal(false);
    setSearchQuery("");
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchQuery("");
  };

  const renderPackageItem = ({ item }: { item: Package }) => (
    <TouchableOpacity
      onPress={() => handleSelectPackage(item.id)}
      className={`px-8 py-4 flex-row items-center justify-between border-b border-[#F3F4F6] ${
        value === item.id ? "bg-[#F0FDF4]" : "bg-white"
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-1 mr-3">
        <Text
          className={`text-[14px] font-medium mb-1 ${
            value === item.id
              ? "font-semibold text-[#059669]"
              : "text-[#000000]"
          }`}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        {/* <Text className="text-[12px] text-[#6B7280]">
          ₦{item.price.toLocaleString()}
        </Text> */}
      </View>

      {value === item.id && (
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
        onPress={() => !disabled && !isLoading && setShowModal(true)}
        activeOpacity={0.7}
        disabled={disabled || isLoading}
        className={`w-full rounded-[99px] border min-h-[48px] flex-row items-center justify-between px-4 ${
          error ? "border-2 border-red-500" : "border border-[#D0D5DD]"
        } ${disabled || isLoading ? "opacity-50" : ""}`}
      >
        {isLoading ? (
          <View className="flex-row items-center flex-1">
            <ActivityIndicator size="small" color="#132939" className="mr-2" />
            <Text className="text-[14px] text-[#717680]">
              Loading packages...
            </Text>
          </View>
        ) : selectedPackage ? (
          <View className="flex-1">
            <Text className="text-[14px] text-[#000000]" numberOfLines={1}>
              {selectedPackage.name}
            </Text>
            {/* <Text className="text-[12px] text-[#6B7280] mt-1">
              ₦{selectedPackage.price.toLocaleString()}
            </Text> */}
          </View>
        ) : (
          <Text className="text-[14px] text-[#717680]">{placeholder}</Text>
        )}
        {!isLoading && <ChevronDownIcon size={20} color="#717680" />}
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
                Select Package
              </Text>
            </View>

            {/* Search Bar */}
            <View className="px-4 py-3 border-b border-[#F3F4F6]">
              <View className="flex-row items-center bg-[#F9FAFB] rounded-[16px] px-4 border border-[#E5E7EB]">
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-[14px] text-[#000000]"
                  placeholder="Search packages"
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
                Available Packages
              </Text>
            </View>

            {/* Packages List using FlatList */}
            <FlatList
              data={filteredPackages}
              renderItem={renderPackageItem}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
            />

            {filteredPackages.length === 0 && (
              <View className="py-20 items-center justify-center">
                <Text className="text-[14px] text-[#9CA3AF] text-center">
                  {searchQuery
                    ? `No packages found matching "${searchQuery}"`
                    : "No packages available"}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default PackageSelector;