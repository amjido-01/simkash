import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

// Type definition for Electricity Provider
export interface ElectricityProvider {
  name: string;
  serviceID: string;
}

export const useGetElectricity = () => {
  const electricityQuery = useQuery({
    queryKey: ["electricity"],
    queryFn: async (): Promise<ElectricityProvider[]> => {
      // apiClient already extracts responseBody, so it returns ElectricityProvider[] directly
      const providers = await apiClient<ElectricityProvider[]>(
        "/billpayment/electricity/service",
        {
          method: "GET",
        }
      );
      return providers;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes (electricity providers rarely change)
    retry: 2,
  });

  return {
    electricityProviders: electricityQuery.data ?? [], // data is already ElectricityProvider[]
    isLoading: electricityQuery.isLoading,
    isError: electricityQuery.isError,
    error: electricityQuery.error,
    refetch: electricityQuery.refetch,
    isFetching: electricityQuery.isFetching,
  };
};