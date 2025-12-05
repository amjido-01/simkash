import { useState, useEffect } from 'react';
import { countryEndpoints } from '@/app/api/endpoints';
import { Country, CountryPickerItem, CountryCodePickerItem } from '@/types';

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesForPicker, setCountriesForPicker] = useState<CountryPickerItem[]>([]);
  const [countryCodesForPicker, setCountryCodesForPicker] = useState<CountryCodePickerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCountries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch countries
      const countriesData = await countryEndpoints.getCountries();
      setCountries(countriesData);

      // Format for pickers
      const countriesPickerData = countriesData
        .map((country) => ({
          label: `${country.flag} ${country.name}`,
          value: country.isoCode,
          flag: country.flag,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      const countryCodesPickerData = countriesData
        .map((country) => ({
          label: `${country.flag} +${country.phonecode}`,
          callingCode: country.phonecode,
          country: country.name,
          flag: country.flag,
        }))
        .sort((a, b) => a.country.localeCompare(b.country));

      setCountriesForPicker(countriesPickerData);
      setCountryCodesForPicker(countryCodesPickerData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load countries';
      setError(errorMessage);
      console.error('Error loading countries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  return {
    countries,
    countriesForPicker,
    countryCodesForPicker,
    loading,
    error,
    refetch: loadCountries,
  };
}