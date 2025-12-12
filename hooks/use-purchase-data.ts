import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "./use-dashboard";

// Request payload type - matches your exact data payload structure
export interface PurchaseDataPayload {
  serviceID: string; // e.g., "mtn-data", "airtel-data", "glo-data", "9mobile-data"
  billersCode: string; // Phone number as string
  variation_code: string; // Data plan code e.g., "mtn-10mb-100"
  amount: number;
  phone: string | number; // Can be string or number
  pin: number | string;
}

// Response type - matches your expected response structure
export interface PurchaseDataResponse {
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

export const usePurchaseData = () => {
  const queryClient = useQueryClient();

  const purchaseDataMutation = useMutation({
    mutationFn: async (
      payload: PurchaseDataPayload
    ): Promise<PurchaseDataResponse> => {
      // Prepare the payload exactly as your API expects
      const formattedPayload = {
        serviceID: payload.serviceID,
        billersCode: payload.billersCode,
        variation_code: payload.variation_code,
        amount: payload.amount,
        phone: typeof payload.phone === 'string' 
          ? parseInt(payload.phone.replace(/\D/g, ''), 10) // Convert string phone to number
          : payload.phone, // Keep as number if already a number
        pin: payload.pin.toString(), // Ensure PIN is a string
      };

      console.log("📱 Data purchase payload:", formattedPayload);

      const response = await apiClient<PurchaseDataResponse>(
        "/billpayment/data/purchase",
        {
          method: "POST",
          data: formattedPayload,
        }
      );

      console.log("✅ Data purchase response:", response);

      return response;
    },
    onSuccess: (data) => {
      console.log("✅ Data purchased successfully:", data);

      // Invalidate dashboard to refresh wallet balance
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });

      // Optional: Invalidate other queries if needed
      // queryClient.invalidateQueries({ queryKey: ["account-detail"] });
      // queryClient.invalidateQueries({ queryKey: ["transactions"] });
      // queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
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