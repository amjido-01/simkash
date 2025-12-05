// hooks/useAccountDetail.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { AccountDetail } from "@/types";

export const accountDetailKeys = {
  all: ["accountDetail"] as const,
  info: () => [...accountDetailKeys.all, "info"] as const,
};

export const useAccountDetail = () => {
  const queryClient = useQueryClient();

  const accountDetailQuery = useQuery({
    queryKey: accountDetailKeys.info(),
    queryFn: async (): Promise<AccountDetail> => {
      const data = await apiClient<AccountDetail>("/user/account", {
        method: "GET",
      });
      console.log("Fetched Account Detail:", data);
      return data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    accountDetail: accountDetailQuery.data,

    // States
    isLoading: accountDetailQuery.isLoading,
    isFetchingAccountDetail: accountDetailQuery.isFetching,
    isAccountDetailError: accountDetailQuery.isError,
    accountDetailError: accountDetailQuery.error,

    // Actions
    refetch: accountDetailQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({
        queryKey: accountDetailKeys.info(),
      }),
  };
};
