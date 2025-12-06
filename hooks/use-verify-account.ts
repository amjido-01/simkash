// @/hooks/use-verify-account.ts
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

interface VerifyAccountRequest {
  account_number: string;
  bank_code: string;
}

interface VerifyAccountResponse {
  account_name: string;
  account_number: string;
  bank_code: string;
}

export const useVerifyAccount = () => {
  return useMutation({
    mutationFn: async (data: VerifyAccountRequest): Promise<VerifyAccountResponse> => {
      const response = await apiClient<VerifyAccountResponse>(
        "/payment/verify-account",
        {
          method: "POST",
          data,
        }
      );
      return response;
    },
  });
};