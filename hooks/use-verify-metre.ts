import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

interface VerifyMeterRequest {
  serviceID: string; // e.g., "kano-electric", "ikeja-electric"
  billersCode: string; // Meter number
  type: "prepaid" | "postpaid"; // Meter type
}

interface CommissionDetails {
  amount: number | null;
  rate: string;
  rate_type: string;
  computation_type: string;
  capped_at: number | null;
}

interface VerifyMeterResponse {
  Customer_Name: string;
  Address: string;
  Meter_Number: string;
  Customer_Arrears: string;
  Minimum_Amount: string;
  Min_Purchase_Amount: number;
  Meter_Type: string;
  Customer_Account_Type: string;
  WrongBillersCode: boolean;
  MeterNumber: string;
  Outstanding: number;
  commission_details: CommissionDetails;
}

export const useVerifyMeter = () => {
  return useMutation({
    mutationFn: async (
      data: VerifyMeterRequest
    ): Promise<VerifyMeterResponse> => {
      console.log("🔍 Verifying meter:", data);

      const response = await apiClient<VerifyMeterResponse>(
        "/billpayment/electricity/verify",
        {
          method: "POST",
          data,
        }
      );

      console.log("✅ Meter verification response:", response);

      // Check if meter number is wrong
      if (response.WrongBillersCode) {
        throw new Error("Invalid meter number. Please check and try again.");
      }

      return response;
    },
    onSuccess: (data) => {
      console.log("✅ Meter verified successfully:", data.Customer_Name);
    },
    onError: (error: any) => {
      console.error("❌ Meter verification failed:", error);
    },
  });
};