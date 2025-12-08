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
        amount: payload.amount.toString(),
        phone: payload.phone,
        pin: payload.pin.toString(),
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

      // Return the response regardless of success/failure
      // Let the component handle the error messages
      return response;
    },
    onSuccess: (data) => {
      if (data.responseSuccessful) {
        console.log("✅ Electricity purchased successfully:", data);
        
        // Invalidate dashboard to refresh wallet balance
        queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
        
        // Invalidate transaction history to show new transaction
        // queryClient.invalidateQueries({ queryKey: ["transactions"] });
        // queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
        
        // // Optionally invalidate account details
        // queryClient.invalidateQueries({ queryKey: ["account-detail"] });
      } else {
        console.log("❌ Electricity purchase failed:", data.responseMessage);
        // Don't throw here, let the component handle it
      }
    },
    onError: (error: any) => {
      console.error("❌ Electricity purchase request failed:", error);
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