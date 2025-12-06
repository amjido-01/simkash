// @/hooks/use-verify-simkash-account.ts
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

interface VerifySimkashAccountRequest {
  account: string;
}

interface VerifySimkashAccountResponse {
  name: string;
  // Add other fields based on your actual API response
}

export const useVerifySimkashAccount = () => {
  return useMutation({
    mutationFn: async (data: VerifySimkashAccountRequest): Promise<VerifySimkashAccountResponse> => {
      const response = await apiClient<VerifySimkashAccountResponse>(
        "/payment/verify/simkash",
        {
          method: "POST",
          data,
        }
      );
      return response;
    },
  });
};