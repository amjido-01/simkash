// hooks/use-countries.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

export interface Country {
  id: number;
  name: string;
  isoCode: string;
  phoneCode?: string;
  flag?: string;
}

export const useGetCountry = () => {
  const countriesQuery = useQuery({
    queryKey: ["countries"],
    queryFn: async (): Promise<Country[]> => {
      const countries = await apiClient<Country[]>("/auth/countries", {
        method: "GET",
      });
      return countries;
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    retry: 2,
  });

  return {
    countries: countriesQuery.data ?? [],
    isLoading: countriesQuery.isLoading,
    isError: countriesQuery.isError,
    error: countriesQuery.error,
    refetch: countriesQuery.refetch,
    isFetching: countriesQuery.isFetching,
  };
};