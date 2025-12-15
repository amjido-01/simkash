import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

export interface DataPlan {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

export interface DataPlansResponseBody {
  ServiceName: string;
  serviceID: string;
  convinience_fee: string;
  variations: DataPlan[];
  varations?: DataPlan[]; // API typo fallback
}

export const dataPlansKeys = {
  all: ["data-plans"] as const,
  byNetwork: (networkId: string) => ["data-plans", networkId] as const,
};
export const useGetAllDataPlans = (networkId: string, enabled: boolean = true) => {
  console.log("Fetching ALL data plans for networkId:", networkId);
  
  const query = useQuery({
    queryKey: dataPlansKeys.byNetwork(networkId),
    queryFn: async (): Promise<DataPlansResponseBody> => {
      if (!networkId) {
        throw new Error("Network ID is required");
      }
      
      // apiClient already extracts responseBody automatically
      const response = await apiClient<DataPlansResponseBody>(
        `/billpayment/data/plans?serviceID=${networkId}-data`,
        {
          method: "GET",
        }
      );
      console.log("All plans API Response:", response);
      return response;
    },
    enabled: enabled && !!networkId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Extract ALL variations from response body
  // Handle both 'variations' and 'varations' (API typo)
  const dataPlans = query.data?.variations || 
                    query.data?.varations || 
                    [];

  return {
    dataPlans, // Return ALL plans (no filtering or slicing)
    serviceName: query.data?.ServiceName,
    serviceID: query.data?.serviceID,
    convenienceFee: query.data?.convinience_fee,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
};