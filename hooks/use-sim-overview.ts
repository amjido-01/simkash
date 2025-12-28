// hooks/use-sim-overview.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

// Type definition for SIM Overview
export interface SimOverview {
  simActivated: number;
  activeSims: number;
  pendingActivation: number;
}

// Query keys for better cache management
export const simKeys = {
  all: ["sim"] as const,
  overview: () => [...simKeys.all, "overview"] as const,
};

export const useSimOverview = () => {
  const simOverviewQuery = useQuery({
    queryKey: simKeys.overview(),
    queryFn: async (): Promise<SimOverview> => {
      // apiClient already extracts responseBody, so it returns SimOverview directly
      const overview = await apiClient<SimOverview>(
        "/user/sim/overview",
        {
          method: "GET",
        }
      );
      return overview;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes (SIM data changes moderately)
    retry: 2,
  });

  return {
    simOverview: simOverviewQuery.data, // data is SimOverview or undefined
    simActivated: simOverviewQuery.data?.simActivated ?? 0,
    activeSims: simOverviewQuery.data?.activeSims ?? 0,
    pendingActivation: simOverviewQuery.data?.pendingActivation ?? 0,
    isLoading: simOverviewQuery.isLoading,
    isError: simOverviewQuery.isError,
    error: simOverviewQuery.error,
    refetch: simOverviewQuery.refetch,
    isFetching: simOverviewQuery.isFetching,
  };
};