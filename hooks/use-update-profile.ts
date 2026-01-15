// @/hooks/use-update-profile.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";
import { dashboardKeys } from "@/hooks/use-dashboard";

export interface UpdateProfilePayload {
  fullname: string;
  phone: string;
  gender: string;
  country: string;
}

interface User {
  id: number;
  username: string | null;
  email: string;
  phone: string;
  password: string;
  status: string;
  pin: string | null;
  isVerified: boolean;
  source: string;
  fmcToken: string | null;
  refereshToken: string | null;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  id: number;
  user_id: number;
  fullname: string;
  gender: string;
  country: string;
  currency: string;
  profile_picture: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody: {
    user: User;
    userProfile: UserProfile;
  };
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
      const response = await apiClient<UpdateProfileResponse>("/user/profile", {
        method: "PATCH", // or "PATCH" depending on your API
        data: payload,
      });
      console.log("Update Profile Response:", response);
      return response;
    },
    onSuccess: () => {
      // Invalidate the dashboard query to refresh user profile data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.info() });
    },
  });

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    isLoading: updateProfileMutation.isPending,
    isError: updateProfileMutation.isError,
    error: updateProfileMutation.error,
    isSuccess: updateProfileMutation.isSuccess,
    data: updateProfileMutation.data,
    reset: updateProfileMutation.reset,
  };
};