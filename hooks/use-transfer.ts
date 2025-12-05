import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

export interface TransferPayload {
  account: string;
  amount: number;
  pin: string;
  narration?: string;
}

export interface TransferResponseBody {
  amount: number;
  send_to: string;
  reference: string;
  date: string;
}

export interface TransferResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody: TransferResponseBody;
}

export const useTransfer = () => {
  const transferMutation = useMutation({
    mutationFn: async (payload: TransferPayload): Promise<TransferResponse> => {
      const response = await apiClient<TransferResponse>("/payment/transfer/simkash", {
        method: "POST",
        data: {
        ...payload,
        pin: payload.pin.toString(), // FIX
      },
      });
      console.log(response)
      return response;
    },
  });

  return {
    transfer: transferMutation.mutateAsync,

    isLoading: transferMutation.isPending,
    isError: transferMutation.isError,
    error: transferMutation.error,
    isSuccess: transferMutation.isSuccess,
    data: transferMutation.data,
  };
};
