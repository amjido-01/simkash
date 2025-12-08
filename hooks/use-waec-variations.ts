// hooks/use-waec-variations.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/app/api/axios';

export interface WaecVariation {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

export interface WaecVariationsResponse {
  ServiceName: string;
  serviceID: string;
  convinience_fee: string;
  variations: WaecVariation[];
  varations: WaecVariation[]; // Note: typo in API response
}

export const useWaecVariations = () => {
  return useQuery({
    queryKey: ['waec-variations'],
    queryFn: async (): Promise<WaecVariationsResponse> => {
      // apiClient already extracts responseBody, so it returns WaecVariationsResponse directly
      const response = await apiClient<WaecVariationsResponse>(
        '/billpayment/education/waec/variation?serviceID=waec'
      );
      console.log("WAEC Variations API Response:", response);
      return response;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
  });
};