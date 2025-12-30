// hooks/use-locations.ts
// Convenience hook that combines all three
import { useGetCountry } from "./use-country";
import { useGetStates } from "./use-states";
import { useGetCities } from "./use-cities";

export const useLocations = (countryCode?: string, stateCode?: string) => {
  const countriesData = useGetCountry();
  const statesData = useGetStates(countryCode || "");
  const citiesData = useGetCities(stateCode || "", countryCode || "");

  return {
    countries: {
      data: countriesData.countries,
      isLoading: countriesData.isLoading,
      isError: countriesData.isError,
      error: countriesData.error,
      refetch: countriesData.refetch,
      isFetching: countriesData.isFetching,
    },
    states: {
      data: statesData.states,
      isLoading: statesData.isLoading,
      isError: statesData.isError,
      error: statesData.error,
      refetch: statesData.refetch,
      isFetching: statesData.isFetching,
    },
    cities: {
      data: citiesData.cities,
      isLoading: citiesData.isLoading,
      isError: citiesData.isError,
      error: citiesData.error,
      refetch: citiesData.refetch,
      isFetching: citiesData.isFetching,
    },
  };
};