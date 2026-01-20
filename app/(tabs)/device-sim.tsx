import { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "@/components/page-header";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { useSimOverview } from "@/hooks/use-sim-overview";
import { UserSim, useUserSims } from "@/components/use-user-sims";
import { ChevronRight, Plus, CheckCircle2, XCircle } from "lucide-react-native";
import { Button, ButtonIcon } from "@/components/ui/button";
import SimDetailsDrawer from "@/components/sim-details-drawer";

// Skeleton Loading Component
const SkeletonLoader = () => {
  return (
    <Box className="bg-white px-4 pt-[19px] pb-24 flex-1">
      {/* Overview Section Skeleton */}
      <VStack space="md" className="mb-6">
        {/* Title Skeleton */}
        <View className="h-7 w-32 bg-gray-200 rounded-md animate-pulse" />

        <HStack space="md" className="w-full">
          {/* Card Skeleton 1 */}
          <Box className="flex-1 p-6 rounded-[16px] bg-[#FAFAFA]">
            <View className="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse" />
            <View className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
          </Box>

          {/* Card Skeleton 2 */}
          <Box className="flex-1 p-6 rounded-[16px] bg-[#FAFAFA]">
            <View className="h-4 w-20 bg-gray-200 rounded mb-3 animate-pulse" />
            <View className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
          </Box>
        </HStack>
      </VStack>

      {/* My Device SIMs Section Skeleton */}
      <VStack space="md">
        {/* Title Skeleton */}
        <View className="h-7 w-40 bg-gray-200 rounded-md animate-pulse" />

        {/* SIM Cards List Skeleton */}
        <VStack space="sm">
          {[1, 2, 3, 4].map((item) => (
            <Box key={item} className="bg-[#FAFAFA] rounded-[16px] p-4">
              <HStack className="items-center justify-between">
                <HStack space="md" className="flex-1 items-center">
                  {/* Icon Skeleton */}
                  <View className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />

                  {/* Text Skeleton */}
                  <VStack className="flex-1" space="xs">
                    <View className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                    <View className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </VStack>
                </HStack>

                {/* Arrow Skeleton */}
                <View className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};


export default function DeviceSimScreen() {
  const {
    sims,
    isLoading: isLoadingSims,
    isError: isSimsError,
    refetch: refetchSims,
  } = useUserSims();
  const {
    simActivated,
    activeSims,
    pendingActivation,
    isLoading: isLoadingOverview,
    isError: isOverviewError,
    refetch: refetchOverview,
  } = useSimOverview();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedSim, setSelectedSim] = useState<UserSim | null>(null);
  const [showSimDrawer, setShowSimDrawer] = useState(false);

  const isLoading = isLoadingOverview || isLoadingSims;
  const isError = isOverviewError || isSimsError;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchOverview(), refetchSims()]);
    setRefreshing(false);
  };

const handleSimPress = (sim: UserSim) => {
    setSelectedSim(sim);
    setShowSimDrawer(true);
  };

  const handleAddSim = () => {
    // Navigate to add SIM flow
    router.push("/buy-sim"); // Create this route
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <PageHeader
        title="Device SIM"
        onBack={handleBack}
        showBackButton={true}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Show Skeleton while loading */}
        {isLoading ? (
          <SkeletonLoader />
        ) : isError ? (
          // Error State
          <Box className="flex-1 items-center justify-center px-4 py-12">
            <Text className="text-[16px] font-manropesemibold text-red-500 text-center mb-4">
              Failed to load SIM data
            </Text>
            <Button
              onPress={() => {
                refetchOverview();
                refetchSims();
              }}
              className="rounded-full bg-[#132939] h-[48px] px-6"
            >
              <Text className="text-white text-[14px] font-manropesemibold">
                Try Again
              </Text>
            </Button>
          </Box>
        ) : (
          // Actual Content
          <Box className="bg-white px-4 pt-[19px] pb-24 flex-1">
            {/* Overview Section */}
            <VStack space="md" className="mb-6">
              <Text className="text-[18px] font-medium font-manropesemibold text-[#303237]">
                Overview
              </Text>

              <HStack space="md" className="w-full">
                {/* Total SIMs Card */}
                <Box className="flex-1 p-6 rounded-[16px] bg-[#FAFAFA]">
                  <Text className="text-[12px] font-manroperegular text-[#000000] mb-[12px]">
                    Total SIMs Added
                  </Text>
                  <Text className="text-[24px] font-normal font-manropebold text-[#000000]">
                    {simActivated}
                  </Text>
                </Box>

                {/* Active SIMs Card */}
                <Box className="flex-1 p-6 rounded-[16px] bg-[#FAFAFA]">
                  <Text className="text-[12px] font-manroperegular text-[#000000] mb-[12px]">
                    Active SIMs
                  </Text>
                  <Text className="text-[24px] font-normal font-manropebold text-[#000000]">
                    {activeSims}
                  </Text>
                </Box>
              </HStack>
            </VStack>

            {/* My Device SIMs Section */}
            <VStack space="md">
              <Text className="text-[18px] font-manropesemibold text-[#303237] font-medium leading-[28px]">
                My Device SIMs
              </Text>

              {sims.length > 0 ? (
                <VStack space="sm">
                  {sims.map((sim) => (
                    <TouchableOpacity
                      key={sim.id}
                      activeOpacity={0.7}
                      onPress={() => handleSimPress(sim)}
                      className="bg-[#FAFAFA] rounded-[16px] p-4"
                    >
                      <HStack className="items-center justify-between">
                        {/* Left Side */}
                        <HStack space="md" className="flex-1 items-center">
                          {/* SIM Icon */}
                          <View className="w-10 h-10 bg-[#ffffff] rounded-full items-center justify-center">
                            <MaterialCommunityIcons
                              name="sim-outline"
                              size={14}
                              color="#132939"
                            />
                          </View>

                          {/* SIM Info */}
                          <VStack className="flex-1">
                            <HStack space="sm" className="items-center mb-1">
                              <Text className="text-[16px] font-normal font-manropesemibold text-[#132939]">
                                {sim.batch.batch_name}
                              </Text>
                              {sim.status.toLowerCase() === "active" ? (
                                <HStack
                                  space="xs"
                                  className="items-center bg-[#ECFDF5] px-2 py-1 rounded-full"
                                >
                                  <CheckCircle2 size={12} color="#10B981" />
                                  <Text className="text-[11px] font-manropesemibold text-[#10B981]">
                                    Active
                                  </Text>
                                </HStack>
                              ) : (
                                <HStack
                                  space="xs"
                                  className="items-center bg-[#FEF2F2] px-2 py-1 rounded-full"
                                >
                                  <XCircle size={12} color="#EF4444" />
                                  <Text className="text-[11px] font-manropesemibold text-[#EF4444]">
                                    {sim.status}
                                  </Text>
                                </HStack>
                              )}
                            </HStack>
                            <Text className="text-[12px] font-manroperegular text-[#6B7280]">
                              {sim.sim_number} • {sim.network}
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Right Side - Arrow */}
                        <ChevronRight size={20} color="#000000" />
                      </HStack>
                    </TouchableOpacity>
                  ))}
                </VStack>
              ) : (
                // Empty State
                <Box className="items-center justify-center py-12">
                  <MaterialCommunityIcons
                    name="sim-outline"
                    size={48}
                    color="#9CA3AF"
                  />
                  <Text className="text-[16px] font-manropesemibold text-[#6B7280] mt-4 text-center">
                    No SIMs added yet
                  </Text>
                  <Text className="text-[14px] font-manroperegular text-[#9CA3AF] mt-2 text-center">
                    Tap the + button to add your first SIM
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <View className="absolute bottom-6 right-6">
        <Button
          onPress={handleAddSim}
          className="w-14 h-14 rounded-full bg-[#132939] shadow-lg items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <ButtonIcon as={Plus} size="xl" className="text-white" />
        </Button>
      </View>

      {/* SIM Details Drawer */}
        {selectedSim && (
        <SimDetailsDrawer
          isOpen={showSimDrawer}
          onClose={() => setShowSimDrawer(false)}
          sim={selectedSim}
        />
      )}
    </SafeAreaView>
  );
}
