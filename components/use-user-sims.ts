// hooks/use-user-sims.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

// Type definition for User SIM
export interface UserSim {
  id: number;
  agent_id: number;
  user_id: number;
  batch_id: number;
  network: string;
  sim_number: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  batch: {
    batch_name: string;
  };
}

// Query keys for better cache management
export const userSimKeys = {
  all: ["user-sims"] as const,
  list: () => [...userSimKeys.all, "list"] as const,
};

export const useUserSims = () => {
  const userSimsQuery = useQuery({
    queryKey: userSimKeys.list(),
    queryFn: async (): Promise<UserSim[]> => {
      // apiClient already extracts responseBody, so it returns UserSim[] directly
      const sims = await apiClient<UserSim[]>(
        "/user/sim",
        {
          method: "GET",
        }
      );
      return sims;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });

  return {
    sims: userSimsQuery.data ?? [], // data is UserSim[] or empty array
    isLoading: userSimsQuery.isLoading,
    isError: userSimsQuery.isError,
    error: userSimsQuery.error,
    refetch: userSimsQuery.refetch,
    isFetching: userSimsQuery.isFetching,
  };
};