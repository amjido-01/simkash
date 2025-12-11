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
    enabled: !!serviceID, // Only run query if serviceID exists
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
  });
};