import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

export interface State {
  name: string;
  isoCode: string;
  countryCode: string;
  latitude?: string;
  longitude?: string;
}

export const useGetStates = (countryCode: string) => {
  const statesQuery = useQuery({
    queryKey: ["states", countryCode],
    queryFn: async (): Promise<State[]> => {
      const states = await apiClient<State[]>(
        `/auth/states?countryCode=${countryCode}`,
        {
          method: "GET",
        }
      );
      console.log("Fetched states for", countryCode, ":", states);
      console.log(states, "jjjj")
      return states;
    },
    enabled: !!countryCode, // Only run if countryCode is provided
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    retry: 2,
  });

  return {
    states: statesQuery.data ?? [],
    isLoading: statesQuery.isLoading,
    isError: statesQuery.isError,
    error: statesQuery.error,
    refetch: statesQuery.refetch,
    isFetching: statesQuery.isFetching,
  };
};