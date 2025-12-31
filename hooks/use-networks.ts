import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { Network } from "@/types";

export const useGetNetworks = () => {
  const networksQuery = useQuery({
    queryKey: ["networks"],
    queryFn: async (): Promise<Network[]> => {
      // apiClient already extracts responseBody, so it returns Network[] directly
      const networks = await apiClient<Network[]>("/billpayment/airtime/network", {
        method: "GET",
      });
      return networks;
    },
    staleTime: 1000 * 60 * 30, // Cache for 10 minutes
    retry: 2,
  });

  return {
    networks: networksQuery.data ?? [], // data is already Network[]
    isLoading: networksQuery.isLoading,
    isError: networksQuery.isError,
    error: networksQuery.error,
    refetch: networksQuery.refetch,
    isFetching: networksQuery.isFetching,
  };
};