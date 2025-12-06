import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { Bank } from "@/types";


export const useGetBanks = () => {
  const banksQuery = useQuery({
    queryKey: ["banks"],
    queryFn: async (): Promise<Bank[]> => {
      // apiClient already extracts responseBody, so it returns Bank[] directly
      const banks = await apiClient<Bank[]>("/payment/banks", {
        method: "GET",
      });
      return banks;
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  return {
    banks: banksQuery.data ?? [], // data is already Bank[]
    isLoading: banksQuery.isLoading,
    isError: banksQuery.isError,
    error: banksQuery.error,
    refetch: banksQuery.refetch,
    isFetching: banksQuery.isFetching,
  };
};