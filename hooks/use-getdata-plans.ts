import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

// Type definitions based on your API response
export interface DataPlan {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

export interface DataPlansResponse {
  ServiceName: string;
  serviceID: string;
  convinience_fee: string;
  variations: DataPlan[];
}

export type PlanDuration = "all" | "daily" | "weekly" | "monthly";

export const useGetDataPlans = (serviceID: string, enabled: boolean = true) => {
  
  const dataPlansQuery = useQuery({
    queryKey: ["dataPlans", serviceID],
    queryFn: async (): Promise<DataPlansResponse> => {
      const response = await apiClient<DataPlansResponse>(
        `/billpayment/data/plans?serviceID=${serviceID}-data`,
        {
          method: "GET",
        }
      );
      return response;
    },
    enabled: enabled && !!serviceID,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });

  // Filter out unwanted plans
  const getFilteredPlans = (): DataPlan[] => {
    if (!dataPlansQuery.data?.variations) return [];
    
    return dataPlansQuery.data.variations.filter((plan) => {
      const name = plan.name.toLowerCase();
      return !name.includes('tv') && 
             !name.includes('campus') && 
             !name.includes('social') && 
             !name.includes('mega') &&
             !name.includes('night') &&
             !name.includes('weekend') &&
             !name.includes('broadband') &&
             !name.includes('hynetflex') &&
             !name.includes('router');
    });
  };

  // Categorize plans by duration
  const getPlansByDuration = (duration: PlanDuration): DataPlan[] => {
    const filtered = getFilteredPlans();
    
    if (duration === "all") {
      return filtered.slice(0, 10); // Show top 10 for "All"
    }

    return filtered.filter((plan) => {
      const name = plan.name.toLowerCase();
      
      switch (duration) {
        case "daily":
          return name.includes("daily") || name.includes("day)") || name.includes("1 day") || name.includes("2 days");
        case "weekly":
          return name.includes("weekly") || name.includes("week") || name.includes("7 days");
        case "monthly":
          return name.includes("monthly") || name.includes("month") || name.includes("30 days") || name.includes("30days");
        default:
          return false;
      }
    });
  };

  // Helper function to get popular plans (backwards compatibility)
  const getPopularPlans = (): DataPlan[] => {
    return getFilteredPlans().slice(0, 5);
  };

  return {
    dataPlans: dataPlansQuery.data?.variations ?? [],
    popularPlans: getPopularPlans(),
    getPlansByDuration,
    serviceName: dataPlansQuery.data?.ServiceName ?? "",
    serviceID: dataPlansQuery.data?.serviceID ?? "",
    convenienceFee: dataPlansQuery.data?.convinience_fee ?? "0 %",
    isLoading: dataPlansQuery.isLoading,
    isError: dataPlansQuery.isError,
    error: dataPlansQuery.error,
    refetch: dataPlansQuery.refetch,
    isFetching: dataPlansQuery.isFetching,
  };
};