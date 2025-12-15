import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "./use-dashboard";

// Update BulkDataRecipient to include amount
export interface BulkDataRecipient {
  network: string;
  phone: string;
  planCode: string;
  amount: number; // ADD THIS
}

// Update BulkDataSamePayload to include amount
export interface BulkDataSamePayload {
  type: "same";
  network: string;
  plan: string;
  amount: number; // ADD THIS
  recipients: string[];
  pin: number | string;
}
// Request payload type for "different" plans
export interface BulkDataDifferentPayload {
  type: "different";
  recipients: BulkDataRecipient[]; // Array of recipient objects
  pin: number | string;
}

// Union type for both payload types
export type BulkDataPayload = BulkDataSamePayload | BulkDataDifferentPayload;

// Response type
export interface BulkDataResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody?: {
    transactionId?: string;
    reference?: string;
    totalAmount?: number;
    successfulCount?: number;
    failedCount?: number;
    recipients?: {
      phone: string;
      network?: string;
      plan?: string;
      status: string;
      transactionId?: string;
      reference?: string;
    }[];
    timestamp?: string;
    [key: string]: any;
  };
}

export const usePurchaseBulkData = () => {
  const queryClient = useQueryClient();

  const purchaseBulkDataMutation = useMutation({
    mutationFn: async (payload: BulkDataPayload): Promise<BulkDataResponse> => {
      // Format the payload based on type
      let formattedPayload: any;

      if (payload.type === "same") {
        formattedPayload = {
          type: "same",
          network: payload.network,
          plan: payload.plan,
          amount: payload.amount, // ADD THIS
          recipients: payload.recipients,
          pin: payload.pin.toString(),
        };
      } else {
        formattedPayload = {
          type: "different",
          recipients: payload.recipients.map((recipient) => ({
            network: recipient.network,
            plan: recipient.planCode,
            phone: recipient.phone,
            amount: recipient.amount, // ADD THIS
          })),
          pin: payload.pin.toString(),
        };
      }

      console.log("📤 Bulk data purchase payload:", formattedPayload);

      const response = await apiClient<BulkDataResponse>(
        "/billpayment/data/bulk/purchase",
        {
          method: "POST",
          data: formattedPayload,
        }
      );

      console.log("✅ Bulk data purchase response:", response);

      return response;
    },
    onSuccess: (data) => {
      console.log("✅ Bulk data purchased successfully:", data);

      // Invalidate dashboard to refresh wallet balance
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });

      // Optionally invalidate transaction history
      // queryClient.invalidateQueries({ queryKey: ["transactions"] });
      // queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
    },
    onError: (error: any) => {
      console.error("❌ Bulk data purchase failed:", error);

      // Enhanced error logging
      if (error?.response?.data) {
        console.error("Error details:", error.response.data);
      }
    },
  });

  return {
    purchaseBulkData: purchaseBulkDataMutation.mutateAsync,
    isLoading: purchaseBulkDataMutation.isPending,
    isError: purchaseBulkDataMutation.isError,
    error: purchaseBulkDataMutation.error,
    isSuccess: purchaseBulkDataMutation.isSuccess,
    data: purchaseBulkDataMutation.data,
    reset: purchaseBulkDataMutation.reset,
  };
};
