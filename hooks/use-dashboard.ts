// hooks/useDashboard.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios"; // ← UPDATE THIS PATH to match where your axios file is
import { DashboardData } from "@/types";

// Query Keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  info: () => [...dashboardKeys.all, "info"] as const,
};

export const useDashboard = () => {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: dashboardKeys.info(),
    queryFn: async (): Promise<DashboardData> => {
      // Using apiClient which automatically extracts responseBody
      const data = await apiClient<DashboardData>("/user/dashboard", {
        method: "GET",
      });
      return data;
    },
    retry: 2, // Matches your global config
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cache time)
  });

  // Helper function to parse transaction metadata
  const parseTransactionMetadata = (metadataString: string) => {
    try {
      return JSON.parse(metadataString);
    } catch {
      return {};
    }
  };

  // Get parsed transactions with metadata
  const parsedTransactions = dashboardQuery.data?.transaction.map(
    (transaction) => ({
      ...transaction,
      metadata: parseTransactionMetadata(transaction.metadata),
    })
  );

  return {
    // Dashboard data
    dashboard: dashboardQuery.data,
    userDetails: dashboardQuery.data?.userDetails,
    userProfile: dashboardQuery.data?.userProfile,
    wallet: dashboardQuery.data?.wallet,
    transactions: dashboardQuery.data?.transaction,
    parsedTransactions,
    isAgent: dashboardQuery.data?.isAgent,
    isSubscribed: dashboardQuery.data?.isSubscribed,
    isStateCordinator: dashboardQuery.data?.isStateCordinator,

    // Query states
    isLoading: dashboardQuery.isLoading,
    isFetching: dashboardQuery.isFetching,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,

    // Query actions
    refetch: dashboardQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() }),
  };
};