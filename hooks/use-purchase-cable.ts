import { apiClient } from "@/app/api/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "./use-dashboard";

// Request payload type for cable purchase
export interface PurchaseCablePayload {
  serviceID: string; // e.g., "gotv", "dstv"
  billersCode: string; // Subscriber/customer id
  packageName: string; // e.g., "GOtv Lite N410"
  variation_code: string; // e.g., "gotv-lite"
  amount: string | number; // e.g., "410.00" or 410
  phone: string | number; // buyer phone number
  pin: number | string; // transaction PIN
}

// Response type
export interface PurchaseCableResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody?: {
    transactionId?: string;
    reference?: string;
    amount?: number;
    status?: string;
    [key: string]: any;
  };
}

// Helper: normalize phone numbers to local format e.g. +234803... or 234803... -> 0803...
const normalizePhone = (phone?: string | number) => {
  if (!phone) return "";
  let digits = typeof phone === "number" ? String(phone) : phone.replace(/\D/g, "");

  // If international prefix 234, convert to leading 0
  if (digits.startsWith("234") && digits.length >= 12) {
    return `0${digits.slice(3)}`;
  }

  // If already local starting with 0 and 11 digits
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits;
  }

  // If 10 digits, assume missing leading zero
  if (digits.length === 10) {
    return `0${digits}`;
  }

  // Fallback: return digits as is
  return digits;
};

export const usePurchaseCable = () => {
  const queryClient = useQueryClient();

  const purchaseCableMutation = useMutation({
    mutationFn: async (
      payload: PurchaseCablePayload
    ): Promise<PurchaseCableResponse> => {
      const requestBody = {
        serviceID: payload.serviceID,
        billersCode: payload.billersCode,
        packageName: payload.packageName,
        variation_code: payload.variation_code,
        amount: payload.amount.toString(),
        phone: normalizePhone(payload.phone),
        pin: payload.pin.toString(),
      };

      console.log("📺 Cable purchase payload:", requestBody);

      const response = await apiClient<PurchaseCableResponse>(
        "/billpayment/cable/purchase",
        {
          method: "POST",
          data: requestBody,
        }
      );

      console.log("✅ Cable purchase response:", response);

      return response;
    },
    onSuccess: (data) => {
      if (data.responseSuccessful) {
        console.log("✅ Cable purchased successfully:", data);
        queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
        // Optionally invalidate transactions or other caches
        // queryClient.invalidateQueries({ queryKey: ['transactions'] });
      } else {
        console.log("❌ Cable purchase failed:", data.responseMessage);
      }
    },
    onError: (error: any) => {
      console.error("❌ Cable purchase request failed:", error);
    },
  });

  return {
    purchaseCable: purchaseCableMutation.mutateAsync,
    isLoading: purchaseCableMutation.isPending,
    isError: purchaseCableMutation.isError,
    error: purchaseCableMutation.error,
    isSuccess: purchaseCableMutation.isSuccess,
    data: purchaseCableMutation.data,
    reset: purchaseCableMutation.reset,
  };
};
