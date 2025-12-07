import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "./use-dashboard";

// Request payload type
export interface PurchaseAirtimePayload {
  phone: string;
  amount: number;
  network: string; // Network ID (1=MTN, 2=Airtel, 3=9mobile, 4=GLO)
  pin: number | string;
}

// Response type
export interface PurchaseAirtimeResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody?: {
    transactionId?: string;
    reference?: string;
    amount?: number;
    phone?: string;
    network?: string;
    status?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export const usePurchaseAirtime = () => {
  const queryClient = useQueryClient();

  const purchaseAirtimeMutation = useMutation({
    mutationFn: async (
      payload: PurchaseAirtimePayload
    ): Promise<PurchaseAirtimeResponse> => {
      const response = await apiClient<PurchaseAirtimeResponse>(
        "/billpayment/airtime/purchase",
        {
          method: "POST",
          data: {
            ...payload,
            pin: payload.pin.toString(), // Ensure PIN is a string
          },
        }
      );

      console.log("✅ Airtime purchase response:", response);

      return response;
    },
    onSuccess: (data) => {
      console.log("✅ Airtime purchased successfully:", data);

      // Invalidate dashboard to refresh wallet balance
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });

    //   // Invalidate account details if you have it
    //   queryClient.invalidateQueries({ queryKey: ["account-detail"] });

    //   // Optionally invalidate transaction history
    //   queryClient.invalidateQueries({ queryKey: ["transactions"] });
    //   queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
    },
    onError: (error: any) => {
      console.error("❌ Airtime purchase failed:", error);
    },
  });

  return {
    purchaseAirtime: purchaseAirtimeMutation.mutateAsync,
    isLoading: purchaseAirtimeMutation.isPending,
    isError: purchaseAirtimeMutation.isError,
    error: purchaseAirtimeMutation.error,
    isSuccess: purchaseAirtimeMutation.isSuccess,
    data: purchaseAirtimeMutation.data,
    reset: purchaseAirtimeMutation.reset,
  };
};