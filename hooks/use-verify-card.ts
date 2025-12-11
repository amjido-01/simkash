// hooks/use-verify-card.ts
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

interface VerifyCardRequest {
  serviceID: string; // e.g., "gotv", "dstv", "startimes", "showmax"
  billersCode: string; // Smart card number
}

interface VerifyCardResponse {
  Customer_Name: string;
  Status: string;
  Due_Date: string;
  Customer_Number: string;
  Current_Bouquet: string;
  Current_Bouquet_Code: string;
  Renewal_Amount: number;
  WrongBillersCode: boolean;
}

export const useVerifyCard = () => {
  return useMutation({
    mutationFn: async (
      data: VerifyCardRequest
    ): Promise<VerifyCardResponse> => {
      console.log("🔍 Verifying smart card:", data);
      
      const response = await apiClient<VerifyCardResponse>(
        "/billpayment/cable/verify",
        {
          method: "POST",
          data,
        }
      );
      
      console.log("✅ Card verification response:", response);
      
      // Check if card number is wrong
      if (response.WrongBillersCode) {
        throw new Error("Invalid smart card number. Please check and try again.");
      }
      
      return response;
    },
    onSuccess: (data) => {
      console.log("✅ Card verified successfully:", data.Customer_Name);
    },
    onError: (error: any) => {
      console.error("❌ Card verification failed:", error);
    },
  });
};