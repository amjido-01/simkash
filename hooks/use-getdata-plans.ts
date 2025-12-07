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

export const useGetDataPlans = (serviceID: string, enabled: boolean = true) => {
    console.log("Fetching data plans for serviceID:", `${serviceID}-data`);
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
    enabled: enabled && !!serviceID, // Only run if serviceID exists and enabled is true
   staleTime: 1000 * 60 * 30, // 30 minutes 
    retry: 2,
  });

  // Helper function to get popular plans (first 5)
  const getPopularPlans = (): DataPlan[] => {
    if (!dataPlansQuery.data?.variations) return [];
    
    // Filter out special plans and get the most commonly used ones
    // You can customize this logic based on your business requirements
    const popularPlans = dataPlansQuery.data.variations
      .filter((plan) => {
        // Filter out TV, campus, social bundles, and mega plans
        const name = plan.name.toLowerCase();
        return !name.includes('tv') && 
               !name.includes('campus') && 
               !name.includes('social') && 
               !name.includes('mega') &&
               !name.includes('night') &&
               !name.includes('weekend');
      })
      .slice(0, 5); // Get first 5 plans

    return popularPlans;
  };

  return {
    dataPlans: dataPlansQuery.data?.variations ?? [],
    popularPlans: getPopularPlans(),
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