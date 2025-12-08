// hooks/use-purchase-waec.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/api/axios';
import { dashboardKeys } from './use-dashboard';

export interface PurchaseWaecPayload {
  serviceID: string;
  variation_code: string;
  amount: string;
  quantity: number;
  phone: string;
  pin: string | number;
}

export interface PurchaseWaecResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody?: {
    transactionId?: string;
    reference?: string;
    amount?: number;
    pins?: string[]; // Array of WAEC PINs
    serials?: string[]; // Array of WAEC serials
    [key: string]: any;
  };
}

export const usePurchaseWaec = () => {
  const queryClient = useQueryClient();

  const purchaseWaecMutation = useMutation({
    mutationFn: async (payload: PurchaseWaecPayload): Promise<PurchaseWaecResponse> => {
      const response = await apiClient<PurchaseWaecResponse>(
        '/billpayment/education/waec/purchase',
        {
          method: 'POST',
          data: {
            ...payload,
            pin: payload.pin.toString(),
            amount: payload.amount.toString(),
          },
        }
      );
      
      return response;
    },
    onSuccess: (data) => {
      if (data.responseSuccessful) {
        queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      }
    },
  });

  return {
    purchaseWaec: purchaseWaecMutation.mutateAsync,
    isLoading: purchaseWaecMutation.isPending,
    isError: purchaseWaecMutation.isError,
    error: purchaseWaecMutation.error,
    data: purchaseWaecMutation.data,
  };
};