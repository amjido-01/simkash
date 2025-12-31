import { apiClient } from "@/app/api/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "./use-dashboard";
import { payLaterCreditsKeys } from "./use-paylater-credits";
import { payLaterKeys } from "./use-paylater-dashboard";

// Request payload type for cable paylater
export interface PurchaseCablePayLaterPayload {
  serviceID: string; // e.g., "gotv"
  billersCode: string; // Subscriber id
  packageName: string; // e.g., "GOtv Lite N410"
  variation_code: string; // e.g., "gotv-lite"
  amount: string | number; // e.g., "410.00"
  phone: string | number;
  pin: number | string;
}

// Response type
export interface PurchaseCablePayLaterResponse {
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

export const usePurchaseCablePayLater = () => {
  const queryClient = useQueryClient();

  const purchaseCableMutation = useMutation({
    mutationFn: async (
      payload: PurchaseCablePayLaterPayload
    ): Promise<PurchaseCablePayLaterResponse> => {
      const requestBody = {
        serviceID: payload.serviceID,
        billersCode: payload.billersCode,
        packageName: payload.packageName,
        variation_code: payload.variation_code,
        amount: payload.amount.toString(),
        phone: normalizePhone(payload.phone),
        pin: payload.pin.toString(),
      };

      console.log("📺 Pay-Later Cable purchase payload:", requestBody);

      const response = await apiClient<PurchaseCablePayLaterResponse>(
        "/paylater/cable/purchase",
        {
          method: "POST",
          data: requestBody,
        }
      );

      console.log("✅ Pay-Later Cable purchase response:", response);

      return response;
    },
    onSuccess: (data) => {
      if (data.responseSuccessful) {
        console.log("✅ Pay-Later Cable purchased successfully:", data);
        // Refresh dashboard and paylater caches
        queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
        queryClient.invalidateQueries({ queryKey: payLaterKeys.dashboard() });
        queryClient.invalidateQueries({ queryKey: payLaterCreditsKeys.list() });
      } else {
        console.log("❌ Pay-Later Cable purchase failed:", data.responseMessage);
      }
    },
    onError: (error: any) => {
      console.error("❌ Pay-Later Cable purchase request failed:", error);
    },
  });

  return {
    purchaseCablePayLater: purchaseCableMutation.mutateAsync,
    isLoading: purchaseCableMutation.isPending,
    isError: purchaseCableMutation.isError,
    error: purchaseCableMutation.error,
    isSuccess: purchaseCableMutation.isSuccess,
    data: purchaseCableMutation.data,
    reset: purchaseCableMutation.reset,
  };
};
