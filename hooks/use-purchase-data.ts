import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "./use-dashboard";

// Request payload type
export interface PurchaseDataPayload {
  serviceID: string; // e.g., "airtel-data", "mtn-data", "glo-data"
  billersCode: string; // Phone number as string (11 digits)
  variation_code: string; // Data plan code e.g., "airtel-50", "mtn-1gb"
  amount: number; // Amount in naira
  phone: string; // Phone number (can be string or number, we'll handle both)
  pin: string | number; // Transaction PIN
}

// Response type
export interface PurchaseDataResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody?: {
    transactionId?: string;
    reference?: string;
    amount?: number;
    phone?: string;
    network?: string;
    dataBundle?: string;
    variation_code?: string;
    status?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export const usePurchaseData = () => {
  const queryClient = useQueryClient();

  const purchaseDataMutation = useMutation({
    mutationFn: async (
      payload: PurchaseDataPayload
    ): Promise<PurchaseDataResponse> => {
      // Prepare the request body
      const requestBody = {
        serviceID: payload.serviceID,
        billersCode: payload.billersCode,
        variation_code: payload.variation_code,
        amount: payload.amount,
        phone: typeof payload.phone === 'string' 
          ? parseInt(payload.phone.replace(/\D/g, ''), 10) 
          : payload.phone,
        pin: payload.pin.toString(), // Ensure PIN is a string
      };

      console.log(requestBody, "from dt")

      console.log("📱 Purchasing data with payload:", requestBody);

      const response = await apiClient<PurchaseDataResponse>(
        "/billpayment/data/purchase",
        {
          method: "POST",
          data: requestBody,
        }
      );

      console.log("✅ Data purchase response:", response);

      // Check if the response was successful
      if (!response.responseSuccessful) {
        throw new Error(response.responseMessage || "Data purchase failed");
      }
      console.log("✅ Data purchased successfully:", response);
      return response;
    },
    onSuccess: (data) => {
     console.log("✅ SUCCESS CALLBACK - Data purchased:", data);
      
      // Invalidate dashboard to refresh wallet balance
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
      
      // Invalidate transaction history to show new transaction
    //   queryClient.invalidateQueries({ queryKey: ["transactions"] });
    //   queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
      
    //   // Optionally invalidate account details
    //   queryClient.invalidateQueries({ queryKey: ["account-detail"] });
    },
    onError: (error: any) => {
      console.error("❌ Data purchase failed:", error);
      
      // Log detailed error for debugging
      if (error?.response) {
        console.error("Error response:", error.response);
      }
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