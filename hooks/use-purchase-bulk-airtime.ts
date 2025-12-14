import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "./use-dashboard";

// Recipient type for "different" amounts
export interface BulkRecipient {
  network: string;
  phone: string;
  amount: number;
}

// Request payload type for "same" amount
export interface BulkAirtimeSamePayload {
  type: "same";
  network: string;
  amount: number;
  recipients: string[]; // Array of phone numbers
  pin: number | string;
}

// Request payload type for "different" amounts
export interface BulkAirtimeDifferentPayload {
  type: "different";
  recipients: BulkRecipient[]; // Array of recipient objects
  pin: number | string;
}

// Union type for both payload types
export type BulkAirtimePayload =
  | BulkAirtimeSamePayload
  | BulkAirtimeDifferentPayload;

// Response type
export interface BulkAirtimeResponse {
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
      amount: number;
      status: string;
      transactionId?: string;
      reference?: string;
    }[];
    timestamp?: string;
    [key: string]: any;
  };
}

export const usePurchaseBulkAirtime = () => {
  const queryClient = useQueryClient();

  const purchaseBulkAirtimeMutation = useMutation({
    mutationFn: async (
      payload: BulkAirtimePayload
    ): Promise<BulkAirtimeResponse> => {
      // Format the payload based on type
      let formattedPayload: any;

      if (payload.type === "same") {
        formattedPayload = {
          type: "same",
          network: payload.network,
          amount: payload.amount,
          recipients: payload.recipients, // Array of phone numbers
          pin: payload.pin.toString(),
        };
      } else {
        formattedPayload = {
          type: "different",
          recipients: payload.recipients.map((recipient) => ({
            network: recipient.network,
            phone: recipient.phone,
            amount: recipient.amount,
          })),
          pin: payload.pin.toString(),
        };
      }

      console.log("📤 Bulk airtime purchase payload:", formattedPayload);

      const response = await apiClient<BulkAirtimeResponse>(
        "/billpayment/airtime/bulk/purchase",
        {
          method: "POST",
          data: formattedPayload,
        }
      );

      console.log("✅ Bulk airtime purchase response:", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("✅ Bulk airtime purchased successfully:", data);

      // Invalidate dashboard to refresh wallet balance
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });

      // Optionally invalidate transaction history
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
    },
    onError: (error: any) => {
      console.error("❌ Bulk airtime purchase failed:", error);

      // Enhanced error logging
      if (error?.response?.data) {
        console.error("Error details:", error.response.data);
      }
    },
  });

  return {
    purchaseBulkAirtime: purchaseBulkAirtimeMutation.mutateAsync,
    isLoading: purchaseBulkAirtimeMutation.isPending,
    isError: purchaseBulkAirtimeMutation.isError,
    error: purchaseBulkAirtimeMutation.error,
    isSuccess: purchaseBulkAirtimeMutation.isSuccess,
    data: purchaseBulkAirtimeMutation.data,
    reset: purchaseBulkAirtimeMutation.reset,
  };
};
