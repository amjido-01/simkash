import React from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { X, Wifi } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DataPlan {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

interface DataPlanSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dataPlans: DataPlan[];
  selectedPlanCode: string;
  onSelectPlan: (planCode: string) => void;
  networkName: string;
  isLoading?: boolean;
  title?: string;
}

const DataPlanSelectionDrawer = ({
  isOpen,
  onClose,
  dataPlans,
  selectedPlanCode,
  onSelectPlan,
  networkName,
  isLoading = false,
  title = "Choose Data Plan",
}: DataPlanSelectionDrawerProps) => {
  const handleSelectPlan = (planCode: string) => {
    onSelectPlan(planCode);
  };

  const formatAmount = (amount: string) => {
    if (!amount) return "0";
    return parseFloat(amount).toLocaleString();
  };

  const renderPlanItem = ({ item }: { item: DataPlan }) => (
    <TouchableOpacity
      onPress={() => handleSelectPlan(item.variation_code)}
      className={`px-4 py-4 flex-row items-center justify-between border-b border-[#F3F4F6] ${
        selectedPlanCode === item.variation_code ? "bg-[#F9FAFB]" : "bg-white"
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1 pr-4">
        {/* Plan Icon */}
        <View className="w-10 h-10 rounded-full bg-[#006AB1] items-center justify-center mr-3">
          <Wifi size={20} color="#FFFFFF" strokeWidth={2.5} />
        </View>

        {/* Plan Details */}
        <View className="flex-1">
          <Text
            className={`text-[14px] mb-1 ${
              selectedPlanCode === item.variation_code
                ? "font-semibold text-[#006AB1]"
                : "text-[#000000]"
            }`}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </View>
      </View>

      {/* Price and Selection Indicator */}
      <View className="items-end">
        <Text className="text-[16px] font-semibold text-[#132939] mb-1">
          ₦{formatAmount(item.variation_amount)}
        </Text>
        {selectedPlanCode === item.variation_code && (
          <View className="w-5 h-5 rounded-full bg-[#006AB1] items-center justify-center">
            <Text className="text-white text-[12px]">✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="px-4 py-4 border-b border-[#F3F4F6] flex-row items-center justify-between">
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="mr-3"
            >
              <X size={24} color="#000000" />
            </TouchableOpacity>

            <View className="flex-1 mr-8">
              <Text className="text-[18px] font-semibold text-[#000000] text-center">
                {title}
              </Text>
              <Text className="text-[12px] text-[#6B7280] text-center mt-1">
                {networkName}
              </Text>
            </View>
          </View>

          {/* Section Header */}
          <View className="px-4 py-3 bg-[#EFF6FF]">
            <Text className="text-[12px] font-medium text-[#1E40AF] uppercase">
              Available Data Plans ({dataPlans.length})
            </Text>
          </View>

          {/* Loading State */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#132939" />
              <Text className="text-[14px] text-[#6B7280] mt-4">
                Loading data plans...
              </Text>
            </View>
          ) : (
            <>
              {/* Data Plans List */}
              <FlatList
                data={dataPlans}
                renderItem={renderPlanItem}
                keyExtractor={(item) => item.variation_code}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 20,
                }}
                ListEmptyComponent={
                  <View className="py-20 items-center justify-center">
                    <Wifi size={48} color="#D1D5DB" strokeWidth={1.5} />
                    <Text className="text-[14px] text-[#9CA3AF] text-center mt-4">
                      No data plans available
                    </Text>
                  </View>
                }
              />
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default DataPlanSelectionDrawer;