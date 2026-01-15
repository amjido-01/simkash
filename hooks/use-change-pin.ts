import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "./use-dashboard";

// Request payload type
export interface ChangePinPayload {
  old_pin: string;  // Changed from old_pin to old_password
  new_pin: string;  // Changed from new_pin to new_password
  confirm_new_pin: string;  // Changed from confirm_new_pin to confirm_new_password
}

// User type from response
export interface User {
  id: number;
  username: string | null;
  email: string;
  phone: string;
  password: string;
  status: "active" | "inactive" | "suspended"; // extend if needed
  pin: string;
  isProfileComplete: boolean;
  isVerified: boolean;
  isCompany: boolean;
  source: "app" | "web" | string;
  fmcToken: string | null;
  refereshToken: string | null;
  lastLogin: string;   // ISO date string
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
}


// Response type
export interface ChangePinResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody: User;
}

export const useChangePin = () => {
  const queryClient = useQueryClient();

  const changePinMutation = useMutation({
    mutationFn: async (
      payload: ChangePinPayload
    ): Promise<ChangePinResponse> => {
      const response = await apiClient<ChangePinResponse>(
        "/user/pin",
        {
          method: "PUT",
          data: payload,
        }
      );
      return response;
    },
    onSuccess: (data) => {
      
      // Invalidate dashboard to refresh user data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
    },
    onError: (error: any) => {
      console.error("❌ PIN change failed:", error);
    },
  });

  return {
    changePin: changePinMutation.mutateAsync,
    isLoading: changePinMutation.isPending,
    isError: changePinMutation.isError,
    error: changePinMutation.error,
    isSuccess: changePinMutation.isSuccess,
    data: changePinMutation.data,
    reset: changePinMutation.reset,
  };
};