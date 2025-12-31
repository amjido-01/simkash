// hooks/use-paylater-repay.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { payLaterKeys } from "./use-paylater-dashboard";
import { payLaterCreditsKeys } from "./use-paylater-credits";
import { dashboardKeys } from "./use-dashboard";

// Type definitions
export interface RepayPayload {
  repaymentAmount: number;
  billId: number;
  paymentMethod: "wallet" | "card";
}

export interface RepayResponse {
  transactionId?: string;
  reference?: string;
  amount: number;
  status: string;
  message?: string;
  newBalance?: number;
  remainingCredit?: number;
}

export const usePayLaterRepay = () => {
  const queryClient = useQueryClient();

  const repayMutation = useMutation({
    mutationFn: async (payload: RepayPayload): Promise<RepayResponse> => {
      const response = await apiClient<RepayResponse>("/paylater/repay", {
        method: "POST",
        data: payload,
      });
      
      console.log("✅ Repayment successful:", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("🎉 Repayment completed, invalidating queries...");
      
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: payLaterKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: payLaterCreditsKeys.list() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
    },
    onError: (error: any) => {
      console.error("❌ Repayment failed:", error);
    },
  });

  return {
    repay: repayMutation.mutateAsync,
    repaySync: repayMutation.mutate,
    isRepaying: repayMutation.isPending,
    isError: repayMutation.isError,
    error: repayMutation.error,
    isSuccess: repayMutation.isSuccess,
    data: repayMutation.data,
    reset: repayMutation.reset,
  };
};