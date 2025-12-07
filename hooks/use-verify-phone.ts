import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

interface VerifyPhoneRequest {
  phone: string;
}

interface VerifyPhoneResponse {
  mobile: string;
  country: string;
  name: string;      // e.g., "Airtel Nigeria"
  status: string;    // e.g., "ACTIVE"
  id: string;        // e.g., "airtel" - this is the network ID
}

export const useVerifyPhone = () => {
  return useMutation({
    mutationFn: async (data: VerifyPhoneRequest): Promise<VerifyPhoneResponse> => {
      const response = await apiClient<VerifyPhoneResponse>(
        "/billpayment/airtime/verify",
        {
          method: "POST",
          data,
        }
      );
      return response;
    },
  });
};