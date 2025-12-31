// hooks/useDashboard.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { DashboardData } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  info: () => [...dashboardKeys.all, "info"] as const,
};

export const useDashboard = () => {
  const queryClient = useQueryClient();
  const syncUserFromDashboard = useAuthStore((state) => state.syncUserFromDashboard);
  
  const dashboardQuery = useQuery({
    queryKey: dashboardKeys.info(),
    queryFn: async (): Promise<DashboardData> => {
      const data = await apiClient<DashboardData>("/user/dashboard", {
        method: "GET",
      });
      return data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Sync user data to auth store when dashboard loads
  useEffect(() => {
    if (dashboardQuery.data?.userDetails && dashboardQuery.data?.userProfile) {
      syncUserFromDashboard(
        dashboardQuery.data.userDetails,
        dashboardQuery.data.userProfile
      );
    }
  }, [dashboardQuery.data, syncUserFromDashboard]);

  // Helper function to parse transaction metadata
  const parseTransactionMetadata = (metadataString: string) => {
    try {
      return JSON.parse(metadataString);
    } catch {
      return {};
    }
  };

  const parsedTransactions = dashboardQuery.data?.transaction.map(
    (transaction) => ({
      ...transaction,
      metadata: parseTransactionMetadata(transaction.metadata),
    })
  );

  return {
    dashboard: dashboardQuery.data,
    userDetails: dashboardQuery.data?.userDetails,
    userProfile: dashboardQuery.data?.userProfile,
    wallet: dashboardQuery.data?.wallet,
    transactions: dashboardQuery.data?.transaction,
    parsedTransactions,
    isAgent: dashboardQuery.data?.isAgent,
    isSubscribed: dashboardQuery.data?.isSubscribed,
    isStateCordinator: dashboardQuery.data?.isStateCordinator,
    isLoading: dashboardQuery.isLoading,
    isFetching: dashboardQuery.isFetching,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() }),
  };
};