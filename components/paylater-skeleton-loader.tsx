import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { View } from "react-native";

export const SkeletonLoader = () => {
  return (
    <Box className="bg-white px-4 pt-6 pb-24 flex-1">
      <VStack space="lg">
        {/* Loan Balance Card Skeleton */}
        <Box className="mb-[32px] bg-[#FFFFFF] rounded-[16px]">
          <VStack className="w-full py-[20px] items-center bg-[#F9FAFB] rounded-[20px]">
            <View className="h-5 w-32 bg-gray-200 rounded mb-3 animate-pulse" />
            <View className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
          </VStack>
        </Box>

        {/* Credit Limits Skeleton */}
        <VStack className="bg-[#ffffff] rounded-[16px] py-3" space="md">
          <HStack className="items-center border-t border-[#E5E7EF] justify-between py-4 px-4">
            <HStack space="sm" className="items-center">
              <View className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <View className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </HStack>
            <View className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </HStack>

          <HStack className="items-center border-t border-[#E5E7EF] justify-between py-4 px-4">
            <HStack space="sm" className="items-center">
              <View className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <View className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </HStack>
            <View className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </HStack>
        </VStack>

        {/* Payments Section Skeleton */}
        <VStack space="md" className="mt-4">
          <View className="h-5 w-24 bg-gray-200 rounded animate-pulse" />

          <View className="flex-row flex-wrap gap-3">
            {[1, 2, 3, 4].map((item) => (
              <View
                key={item}
                className="bg-[#FAFAFA] rounded-[16px] p-4"
                style={{ width: "22%" }}
              >
                <VStack space="xs" className="items-center">
                  <View className="w-12 h-12 bg-gray-200 rounded-[12px] animate-pulse" />
                  <View className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </VStack>
              </View>
            ))}
          </View>
        </VStack>
      </VStack>
    </Box>
  );
};