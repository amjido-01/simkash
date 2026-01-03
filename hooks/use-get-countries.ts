import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/app/api/axios";
import { Country, CountryPickerItem, CountryCodePickerItem, ApiResponse } from "@/types";
import { useMemo } from "react";

export const useGetCountries = () => {
  const countriesQuery = useQuery({
    queryKey: ["countries"],
    queryFn: async (): Promise<Country[]> => {
      // Use authApi since the endpoint is /auth/countries
      const response = await authApi.get<ApiResponse<Country[]>>("/auth/countries");
      
      if (!response.data.responseSuccessful) {
        throw new Error(response.data.responseMessage || "Failed to fetch countries");
      }
      
      return response.data.responseBody;
    },
    staleTime: 1000 * 60 * 60, // 1 hour - countries don't change often
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache
    retry: 2,
  });

  // Memoize formatted data to prevent unnecessary recalculations
  const countriesForPicker = useMemo((): CountryPickerItem[] => {
    if (!countriesQuery.data) return [];
    
    return countriesQuery.data
      .map((country) => ({
        label: `${country.flag} ${country.name}`,
        value: country.isoCode,
        flag: country.flag,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [countriesQuery.data]);

  const countryCodesForPicker = useMemo((): CountryCodePickerItem[] => {
    if (!countriesQuery.data) return [];
    
    return countriesQuery.data
      .map((country) => ({
        label: `${country.flag} +${country.phonecode}`,
        callingCode: country.phonecode,
        country: country.name,
        flag: country.flag,
      }))
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [countriesQuery.data]);

  return {
    countries: countriesQuery.data ?? [],
    countriesForPicker,
    countryCodesForPicker,
    isLoading: countriesQuery.isLoading,
    isError: countriesQuery.isError,
    error: countriesQuery.error,
    refetch: countriesQuery.refetch,
    isFetching: countriesQuery.isFetching,
  };
};