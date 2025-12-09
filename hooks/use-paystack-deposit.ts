// hooks/use-paystack-deposit.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "./use-dashboard";

// Types - These represent the EXTRACTED responseBody (not the full API response)
export interface DepositPayload {
  amount: number;
  // Add any other fields your backend requires
}

// This is what apiClient returns (already extracted responseBody)
export interface DepositResponseBody {
  authorization_url: string;
  access_code: string;
  reference: string;
}

// This is what apiClient returns for verify (already extracted responseBody)
export interface VerifyPaymentResponseBody {
  data: {
    id: number;
    user_id: number;
    amount: number;
    method: string;
    reference: string;
    status: "success" | "failed" | "pending";
    transaction_date: string;
    payment_gateway_id: number;
    request_id: string | null;
    updatedAt: string;
    createdAt: string;
  };
}

// Initiate Deposit Hook
export const useInitiateDeposit = () => {
  const depositMutation = useMutation({
    mutationFn: async (payload: DepositPayload): Promise<DepositResponseBody> => {
      // apiClient already extracts responseBody, so we get the data directly
      const response = await apiClient<DepositResponseBody>("/payment/deposit", {
        method: "POST",
        data: payload,
      });
      console.log("Deposit initiated:", response);
      return response;
    },
  });

  return {
    initiateDeposit: depositMutation.mutateAsync,
    isLoading: depositMutation.isPending,
    isError: depositMutation.isError,
    error: depositMutation.error,
    isSuccess: depositMutation.isSuccess,
    data: depositMutation.data,
  };
};

// Verify Payment Hook
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: async (reference: string): Promise<VerifyPaymentResponseBody> => {
      // apiClient already extracts responseBody, so we get the data directly
      const response = await apiClient<VerifyPaymentResponseBody>(
        `/payment/verify/${reference}`,
        {
          method: "GET",
        }
      );
      console.log("Payment verification:", response);
      return response;
    },
    onSuccess: (data) => {
      // Only invalidate if payment was successful
      if (data.data.status === "success") {
        // Invalidate dashboard query to refresh wallet balance
        queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
        
        // If you have a separate account detail query, invalidate it too
        // queryClient.invalidateQueries({ queryKey: ["account-detail"] });
      }
    },
  });

  return {
    verifyPayment: verifyMutation.mutateAsync,
    isLoading: verifyMutation.isPending,
    isError: verifyMutation.isError,
    error: verifyMutation.error,
    isSuccess: verifyMutation.isSuccess,
    data: verifyMutation.data,
  };
};