import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { TransferResponse, TransferPayload } from "@/types";
import { dashboardKeys } from "./use-dashboard";

export const useTransfer = () => {
  const queryClient = useQueryClient();

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
      onSuccess: () => {
          // Only invalidate the dashboard query - it contains everything
          queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
          
          // If you have a separate account detail query, invalidate it too
          queryClient.invalidateQueries({ queryKey: ["account-detail"] });
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
