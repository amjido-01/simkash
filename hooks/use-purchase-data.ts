// use-purchase-data.ts - FIXED VERSION
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "./use-dashboard";

export interface PurchaseDataPayload {
  serviceID: string;
  billersCode: string;
  variation_code: string;
  amount: number;
  phone: string | number;
  pin: number | string;
}

export interface PurchaseDataResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody?: {
    id?: number;
    wallet_id?: number;
    transaction_type?: string;
    amount?: number;
    transaction_reference?: string;
    status?: string; // ← Important: can be "success", "failed", "pending"
    processed_at?: string;
    description?: string;
    metadata?: string;
    updatedAt?: string;
    createdAt?: string;
    [key: string]: any;
  };
}

export const usePurchaseData = () => {
  const queryClient = useQueryClient();

  const purchaseDataMutation = useMutation({
    mutationFn: async (
      payload: PurchaseDataPayload
    ): Promise<PurchaseDataResponse> => {
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

      const response = await apiClient<PurchaseDataResponse>(
        "/billpayment/data/purchase",
        {
          method: "POST",
          data: formattedPayload,
        }
      );

      // ⚠️ CRITICAL FIX: Check if transaction actually succeeded
      // API returns 200 even for failed transactions, so we must check status
      if (response.responseBody?.status === "failed") {
        // Transaction failed - throw error to trigger catch block
        throw new Error(
          response.responseMessage ||
            "Transaction failed. Please try again or contact support."
        );
      }

      // Additional safety check: verify responseSuccessful flag
      if (response.responseSuccessful === false) {
        throw new Error(
          response.responseMessage || "Transaction could not be completed."
        );
      }

      return response;
    },

    onSuccess: (data) => {
      console.log("✅ Data purchased successfully:", data);

      // Only invalidate if transaction truly succeeded
      if (data.responseBody?.status === "success") {
        queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
      }
    },

    onError: (error: any) => {
      console.error("❌ Data purchase failed:", error);
    },
  });

  return {
    purchaseData: purchaseDataMutation.mutateAsync,
    isLoading: purchaseDataMutation.isPending,
    isError: purchaseDataMutation.isError,
    error: purchaseDataMutation.error,
    isSuccess: purchaseDataMutation.isSuccess,
    data: purchaseDataMutation.data,
    reset: purchaseDataMutation.reset,
  };
};
