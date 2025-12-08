import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "./use-dashboard";

// Request payload type
export interface PurchaseElectricityPayload {
  serviceID: string; // e.g., "kano-electric", "ikeja-electric"
  billersCode: string; // Meter number
  variation_code: "prepaid" | "postpaid"; // Meter type
  amount: string | number; // Amount to purchase
  phone: string; // Phone number
  pin: number | string; // Transaction PIN
}

// Response type
export interface PurchaseElectricityResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody?: {
    transactionId?: string;
    reference?: string;
    amount?: number;
    meterNumber?: string;
    customerName?: string;
    token?: string; // Electricity token for prepaid
    units?: string; // Units purchased
    serviceID?: string;
    status?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export const usePurchaseElectricity = () => {
  const queryClient = useQueryClient();

  const purchaseElectricityMutation = useMutation({
    mutationFn: async (
      payload: PurchaseElectricityPayload
    ): Promise<PurchaseElectricityResponse> => {
      // Prepare the request body
      const requestBody = {
        serviceID: payload.serviceID,
        billersCode: payload.billersCode,
        variation_code: payload.variation_code,
        amount: payload.amount.toString(), // Ensure amount is a string
        phone: payload.phone,
        pin: typeof payload.pin === 'number' ? payload.pin : parseInt(payload.pin, 10), // Ensure PIN is a number
      };

      console.log("⚡ Purchasing electricity with payload:", requestBody);

      const response = await apiClient<PurchaseElectricityResponse>(
        "/billpayment/electricity/purchase",
        {
          method: "POST",
          data: requestBody,
        }
      );

      console.log("✅ Electricity purchase response:", response);

      // Check if the response was successful
      if (!response.responseSuccessful) {
        throw new Error(response.responseMessage || "Electricity purchase failed");
      }

      return response;
    },
    onSuccess: (data) => {
      console.log("✅ Electricity purchased successfully:", data);
      
      // Invalidate dashboard to refresh wallet balance
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
      
      // Invalidate transaction history to show new transaction
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
      
      // Optionally invalidate account details
      queryClient.invalidateQueries({ queryKey: ["account-detail"] });
    },
    onError: (error: any) => {
      console.error("❌ Electricity purchase failed:", error);
      
      // Log detailed error for debugging
      if (error?.response) {
        console.error("Error response:", error.response);
      }
    },
  });

  return {
    purchaseElectricity: purchaseElectricityMutation.mutateAsync,
    isLoading: purchaseElectricityMutation.isPending,
    isError: purchaseElectricityMutation.isError,
    error: purchaseElectricityMutation.error,
    isSuccess: purchaseElectricityMutation.isSuccess,
    data: purchaseElectricityMutation.data,
    reset: purchaseElectricityMutation.reset,
  };
};