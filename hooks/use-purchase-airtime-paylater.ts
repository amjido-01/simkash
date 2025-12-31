import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "./use-dashboard";
import { payLaterCreditsKeys } from "./use-paylater-credits";
import { payLaterKeys } from "./use-paylater-dashboard";

// Request payload type (same shape)
export interface PurchaseAirtimePayLaterPayload {
  phone: string;
  amount: number;
  network: string;
  pin: number | string;
}

// Response type (same shape)
export interface PurchaseAirtimePayLaterResponse {
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

export const usePurchaseAirtimePayLater = () => {
  const queryClient = useQueryClient();

  const purchaseAirtimePayLaterMutation = useMutation({
    mutationFn: async (
      payload: PurchaseAirtimePayLaterPayload
    ): Promise<PurchaseAirtimePayLaterResponse> => {
      const response = await apiClient<PurchaseAirtimePayLaterResponse>(
        "/paylater/airtime/purchase",
        {
          method: "POST",
          data: {
            ...payload,
            pin: payload.pin.toString(), // ensure pin is string
          },
        }
      );

      console.log("✅ Pay-Later Airtime response:", response);

      return response;
    },
    onSuccess: (data) => {
      console.log("✅ Pay-Later Airtime successful:", data);

      // Refresh dashboard (wallet, limits, etc.)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
      queryClient.invalidateQueries({ queryKey: payLaterKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: payLaterCreditsKeys.list() });
    },
    onError: (error: any) => {
      console.error("❌ Pay-Later Airtime failed:", error);
    },
  });

  return {
    purchaseAirtimePayLater: purchaseAirtimePayLaterMutation.mutateAsync,
    isLoading: purchaseAirtimePayLaterMutation.isPending,
    isError: purchaseAirtimePayLaterMutation.isError,
    error: purchaseAirtimePayLaterMutation.error,
    isSuccess: purchaseAirtimePayLaterMutation.isSuccess,
    data: purchaseAirtimePayLaterMutation.data,
    reset: purchaseAirtimePayLaterMutation.reset,
  };
};
