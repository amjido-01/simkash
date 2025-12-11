// hooks/use-cable-variations.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/app/api/axios';

export interface CableVariation {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

export interface CableVariationsResponse {
  ServiceName: string;
  serviceID: string;
  convinience_fee: string;
  variations: CableVariation[];
  varations: CableVariation[]; // Note: typo in API response
}

export const useCableVariations = (serviceID: string | null) => {
  return useQuery({
    queryKey: ['cable-variations', serviceID],
    queryFn: async (): Promise<CableVariationsResponse> => {
      if (!serviceID) throw new Error('Service ID is required');
      
      const response = await apiClient<CableVariationsResponse>(
        `/billpayment/cable/variation?serviceID=${serviceID}`
      );
      console.log("Cable Variations API Response:", response);
      return response;
    },
    enabled: !!serviceID,
    staleTime: 1000 * 60 * 30, // Already have this
    gcTime: 1000 * 60 * 60, // Add this - keeps cached data for 1 hour
    retry: 2,
  });
};

// Optional: Hook for multiple cable providers at once
export const useAllCableVariations = (serviceIDs: string[]) => {
  return useQuery({
    queryKey: ['all-cable-variations', serviceIDs],
    queryFn: async (): Promise<Record<string, CableVariationsResponse>> => {
      const results: Record<string, CableVariationsResponse> = {};
      
      // Fetch all variations in parallel
      const promises = serviceIDs.map(async (serviceID) => {
        const response = await apiClient<CableVariationsResponse>(
          `/billpayment/cable/variation?serviceID=${serviceID}`
        );
        return { serviceID, response };
      });

      const responses = await Promise.all(promises);
      
      responses.forEach(({ serviceID, response }) => {
        results[serviceID] = response;
      });

      console.log("All Cable Variations:", results);
      return results;
    },
    enabled: serviceIDs.length > 0,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
  });
};