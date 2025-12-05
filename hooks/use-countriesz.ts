// hooks/use-countries.ts - SIMPLIFIED VERSION
import { useState, useEffect, useRef } from 'react';
import { countryEndpoints } from '@/app/api/endpoints';
import { Country, CountryPickerItem, CountryCodePickerItem } from '@/types';

// ✅ Simple global cache - load once, use everywhere
let globalCache: {
  countries: Country[];
  countriesForPicker: CountryPickerItem[];
  countryCodesForPicker: CountryCodePickerItem[];
} | null = null;

let loadingPromise: Promise<void> | null = null;

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>(globalCache?.countries || []);
  const [countriesForPicker, setCountriesForPicker] = useState<CountryPickerItem[]>(
    globalCache?.countriesForPicker || []
  );
  const [countryCodesForPicker, setCountryCodesForPicker] = useState<CountryCodePickerItem[]>(
    globalCache?.countryCodesForPicker || []
  );
  const [loading, setLoading] = useState<boolean>(!globalCache);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // If cached, use it immediately
    if (globalCache) {
      console.log('✅ useCountries: Using cached data');
      setLoading(false);
      return;
    }

    // Otherwise load
    loadCountries();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCountries = async () => {
    // If already loading, wait for that promise
    if (loadingPromise) {
      console.log('⏳ useCountries: Waiting for existing load');
      try {
        await loadingPromise;
        if (isMountedRef.current && globalCache) {
          setCountries(globalCache.countries);
          setCountriesForPicker(globalCache.countriesForPicker);
          setCountryCodesForPicker(globalCache.countryCodesForPicker);
          setLoading(false);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load countries');
          setLoading(false);
        }
      }
      return;
    }

    // Start new load
    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    loadingPromise = (async () => {
      try {
        console.log('🌍 useCountries: Fetching from API...');

        const countriesData = await countryEndpoints.getCountries();

        if (!Array.isArray(countriesData) || countriesData.length === 0) {
          throw new Error('No countries received');
        }

        // Format data
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

        // Store in cache
        globalCache = {
          countries: countriesData,
          countriesForPicker: countriesPickerData,
          countryCodesForPicker: countryCodesPickerData,
        };

        console.log('✅ useCountries: Data cached successfully');

        // Update state if mounted
        if (isMountedRef.current) {
          setCountries(globalCache.countries);
          setCountriesForPicker(globalCache.countriesForPicker);
          setCountryCodesForPicker(globalCache.countryCodesForPicker);
        }
      } catch (err) {
        console.error('❌ useCountries: Error:', err);
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load countries');
        }
      } finally {
        loadingPromise = null;
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    })();

    await loadingPromise;
  };

  const refetch = async () => {
    console.log('🔄 useCountries: Manual refetch');
    globalCache = null;
    await loadCountries();
  };

  return {
    countries,
    countriesForPicker,
    countryCodesForPicker,
    loading,
    error,
    refetch,
  };
}

// Helper to clear cache (useful for logout)
export function clearCountriesCache() {
  globalCache = null;
  loadingPromise = null;
}