import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "./use-dashboard";
import { payLaterCreditsKeys } from "./use-paylater-credits";
import { payLaterKeys } from "./use-paylater-dashboard";

// Request payload type (same as normal data purchase)
export interface PurchaseDataPayLaterPayload {
  serviceID: string; // e.g., "glo-data"
  billersCode: string; // Phone number as string
  variation_code: string; // e.g., "glo-dg-1600"
  amount: number;
  phone: string | number;
  pin: number | string;
}

// Response type (same structure)
export interface PurchaseDataPayLaterResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody?: {
    id?: number;
    wallet_id?: number;
    transaction_type?: string;
    amount?: number;
    transaction_reference?: string;
    status?: string;
    processed_at?: string;
    description?: string;
    metadata?: string;
    updatedAt?: string;
    createdAt?: string;
    [key: string]: any;
  };
}

export const usePurchaseDataPayLater = () => {
  const queryClient = useQueryClient();

  const purchaseDataPayLaterMutation = useMutation({
    mutationFn: async (
      payload: PurchaseDataPayLaterPayload
    ): Promise<PurchaseDataPayLaterResponse> => {
      // Prepare payload exactly as Pay-Later API expects
      const formattedPayload = {
        serviceID: payload.serviceID,
        billersCode: payload.billersCode,
        variation_code: payload.variation_code,
        amount: payload.amount,
        phone:
          typeof payload.phone === "string"
            ? parseInt(payload.phone.replace(/\D/g, ""), 10)
            : payload.phone,
        pin: payload.pin.toString(),
      };

      console.log("📱 Pay-Later Data purchase payload:", formattedPayload);

      const response = await apiClient<PurchaseDataPayLaterResponse>(
        "/paylater/data/purchase",
        {
          method: "POST",
          data: formattedPayload,
        }
      );

      console.log("✅ Pay-Later Data purchase response:", response);

      return response;
    },
    onSuccess: (data) => {
      console.log("✅ Pay-Later Data purchased successfully:", data);

      // Refresh dashboard (credit, wallet, limits)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
      queryClient.invalidateQueries({ queryKey: payLaterKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: payLaterCreditsKeys.list() });
    },
    onError: (error: any) => {
      console.error("❌ Pay-Later Data purchase failed:", error);
    },
  });

  return {
    purchaseDataPayLater: purchaseDataPayLaterMutation.mutateAsync,
    isLoading: purchaseDataPayLaterMutation.isPending,
    isError: purchaseDataPayLaterMutation.isError,
    error: purchaseDataPayLaterMutation.error,
    isSuccess: purchaseDataPayLaterMutation.isSuccess,
    data: purchaseDataPayLaterMutation.data,
    reset: purchaseDataPayLaterMutation.reset,
  };
};
