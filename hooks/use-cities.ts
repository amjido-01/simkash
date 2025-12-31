// File: hooks/use-cities.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

export interface City {
  name: string;
}

export const useGetCities = (stateName: string) => {
  
  const citiesQuery = useQuery({
    queryKey: ["cities", stateName],
    queryFn: async (): Promise<City[]> => {
      // apiClient returns the unwrapped responseBody directly (just the array)
      const response = await apiClient<string[]>(
        `/auth/cities?stateName=${stateName}`,
        {
          method: "GET",
        }
      );
      
      
      // Response is already the array of city names
      if (!Array.isArray(response)) {
        console.error("Expected array but got:", response);
        return [];
      }
      
      // Convert string array to City objects
      const cities = response.map((cityName) => ({
        name: cityName,
      }));
      
      
      return cities;
    },
    enabled: !!stateName, // Only run if stateName is provided
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    retry: 2,
  });

  return {
    cities: citiesQuery.data ?? [],
    isLoading: citiesQuery.isLoading,
    isError: citiesQuery.isError,
    error: citiesQuery.error,
    refetch: citiesQuery.refetch,
    isFetching: citiesQuery.isFetching,
  };
};