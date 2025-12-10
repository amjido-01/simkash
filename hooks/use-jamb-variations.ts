// hooks/use-waec-variations.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/app/api/axios';

export interface JambVariation {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

export interface JambVariationsResponse {
  ServiceName: string;
  serviceID: string;
  convinience_fee: string;
  variations: JambVariation[];
  varations: JambVariation[]; // Note: typo in API response
}

export const useJambVariations = () => {
  return useQuery({
    queryKey: ['waec-variations'],
    queryFn: async (): Promise<JambVariationsResponse> => {
      // apiClient already extracts responseBody, so it returns WaecVariationsResponse directly
      const response = await apiClient<JambVariationsResponse>(
        '/billpayment/education/jamb/variation?serviceID=jamb'
      );
      console.log("Jamb Variations API Response:", response);
      return response;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
  });
};