import { View, ScrollView } from "react-native";
import Skeleton from "./Skeleton";

export default function DashboardSkeleton() {
  return (
    <ScrollView
      className="flex-1 px-4 mt-[22px]"
      showsVerticalScrollIndicator={false}
    >
      {/* Wallet Balance Skeleton */}
      <View className="w-full mb-[32px] py-[32px] items-center bg-[#F9FAFB] rounded-[20px]">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-10 w-40 mb-2" />
      </View>

      {/* Quick Actions Skeleton */}
      <View className="flex-row gap-4 mb-10">
        {[1, 2].map((i) => (
          <View key={i} className="flex-1 items-center">
            <Skeleton className="w-12 h-12 rounded-full mb-2" />
            <Skeleton className="w-10 h-3" />
          </View>
        ))}
      </View>

      {/* Payments Skeleton */}
      <View className="mb-10">
        <Skeleton className="h-5 w-24 mb-4" />

        <View className="flex-row flex-wrap gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} className="items-center" style={{ width: "30%" }}>
              <Skeleton className="w-[60px] h-[60px] rounded-2xl mb-2" />
              <Skeleton className="w-12 h-3" />
            </View>
          ))}
        </View>
      </View>

      {/* Transaction Header */}
      <View className="flex-row justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </View>

      {/* Transactions List Skeleton */}
      <View className="gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            className="flex-row items-center justify-between p-4 border rounded-xl border-[#E5E7EB]"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <Skeleton className="w-12 h-12 rounded-full" />
              <View className="flex-1">
                <Skeleton className="w-24 h-4 mb-2" />
                <Skeleton className="w-16 h-3" />
              </View>
            </View>
            <Skeleton className="w-12 h-4" />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
