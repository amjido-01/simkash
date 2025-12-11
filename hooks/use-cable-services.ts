// hooks/use-cable-services.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

export interface CableService {
  name: string;
  serviceID: string;
}

export const useGetCableServices = () => {
  const cableServicesQuery = useQuery({
    queryKey: ["cable-services"],
    queryFn: async (): Promise<CableService[]> => {
      // apiClient already extracts responseBody, so it returns CableService[] directly
      const services = await apiClient<CableService[]>("/billpayment/cable/service", {
        method: "GET",
      });
      console.log("Fetched cable services:", services);
      return services;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
  });

  return {
    cableServices: cableServicesQuery.data ?? [], // data is already CableService[]
    isLoading: cableServicesQuery.isLoading,
    isError: cableServicesQuery.isError,
    error: cableServicesQuery.error,
    refetch: cableServicesQuery.refetch,
    isFetching: cableServicesQuery.isFetching,
  };
};