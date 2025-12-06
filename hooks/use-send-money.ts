// @/hooks/use-send-money.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "@/hooks/use-dashboard";

export interface SendMoneyPayload {
  amount: number;
  account_number: string;
  bank_code: string;
  pin: number | string;
  narration?: string;
}

interface PaystackTransferData {
  amount: number;
  createdAt: string;
  currency: string;
  domain: string;
  failures: any;
  id: number;
  integration: number;
  reason: string;
  recipient: number;
  reference: string;
  request: number;
  source: string;
  source_details: any;
  status: string;
  titan_code: any;
  transfer_code: string;
  transferred_at: string | null;
  transfersessionid: any[];
  transfertrials: any[];
  updatedAt: string;
}

interface TransferDataResponse {
  data: PaystackTransferData;
  message: string;
  status: boolean;
}

export interface SendMoneyResponse {
  data: TransferDataResponse;
  updatedBalance: number;
}

export const useSendMoney = () => {
      const queryClient = useQueryClient();

  const sendMoneyMutation = useMutation({
    mutationFn: async (payload: SendMoneyPayload): Promise<SendMoneyResponse> => {
      const response = await apiClient<SendMoneyResponse>("/payment/transfer", {
        method: "POST",
        data: {
          ...payload,
          pin: payload.pin.toString(), // Convert pin to string
        },
      });
      console.log("Send Money Response:", response);
      return response;
    },
    onSuccess: () => {
      // Only invalidate the dashboard query - it contains everything
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
      
      // If you have a separate account detail query, invalidate it too
      queryClient.invalidateQueries({ queryKey: ["account-detail"] });
    },
  });

  return {
    sendMoney: sendMoneyMutation.mutateAsync,
    isLoading: sendMoneyMutation.isPending,
    isError: sendMoneyMutation.isError,
    error: sendMoneyMutation.error,
    isSuccess: sendMoneyMutation.isSuccess,
    data: sendMoneyMutation.data,
    reset: sendMoneyMutation.reset,
  };
};