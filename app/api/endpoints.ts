import { apiClient, authApi } from "./axios";
// import { tokenStorage } from "@/utils/tokenStorage";
import { useAuthStore } from "@/store/auth-store";
import {
  LoginResponse,
  RefreshResponse,
  RegisterPayload,
  ApiResponse,
  RegisterResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  ResendOtpPayload,
  ProfileSetupPayload,
  Country,
  CountryAPIResponse,
  CountryPickerItem,
  CountryCodePickerItem,
  ProfileSetupResponse,
  ApiError,
} from "@/types";
import { userStorage } from "@/utils/userStorage";
import { queryClient } from "../_layout";

/**
 * Auth endpoints
 */
export const authEndpoints = {
  // Register
  register: async (payload: RegisterPayload) => {
    try {
      const response = await authApi.post<RegisterResponse>(
        "/auth/send-otp",
        payload
      );

      if (response.data.responseSuccessful) {
        return response.data.responseMessage;
      }

      throw new Error(response.data.responseMessage || "Registration failed");
    } catch (error: any) {
      const message =
        error?.response?.data?.responseMessage ??
        error?.response?.data?.message ??
        error?.message ??
        "Registration failed";

      throw new Error(message);
    }
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    try {
      const res = await authApi.post<ApiResponse<VerifyOtpResponse>>(
        "/auth/verify-otp",
        payload
      );

      const data = res.data;

      if (!data.responseSuccessful) {
        throw new Error(data.responseMessage || "OTP verification failed");
      }

      const { accessToken, refreshToken, user } = data.responseBody;

      // ✅ Validate tokens before storing
      if (!accessToken || !refreshToken) {
        throw new Error("Invalid tokens received from server");
      }

      // Store tokens
      // await tokenStorage.setTokens(accessToken, refreshToken);
      await useAuthStore.getState().setAuth(user, accessToken, refreshToken);

      return data.responseBody;
    } catch (error: any) {
      const message =
        error?.response?.data?.responseMessage ??
        error?.response?.data?.message ??
        error?.message ??
        "OTP verification failed";

      throw new Error(message);
    }
  },

  // Resend OTP
  resendOtp: async (payload: ResendOtpPayload): Promise<string> => {
    try {
      const res = await authApi.post<ApiResponse<null>>(
        "/auth/resend-otp",
        payload
      );

      const data = res.data;

      if (!data.responseSuccessful) {
        throw new Error(data.responseMessage || "Failed to resend OTP");
      }

      // Return backend message (e.g., "OTP resent successfully")
      return data.responseMessage;
    } catch (error: any) {
      const message =
        error?.response?.data?.responseMessage ??
        error?.response?.data?.message ??
        error?.message ??
        "Failed to resend OTP";

      throw new Error(message);
    }
  },

  profileSetup: async (
    payload: ProfileSetupPayload
  ): Promise<ProfileSetupResponse> => {
    try {
      console.log("📤 Sending profile setup (WITH AUTH):", payload);

      // ✅ Use apiClient - it will attach the auth token automatically
      const result = await apiClient<ProfileSetupResponse>(
        "/user/profile-setup",
        {
          method: "PUT",
          data: payload,
        }
      );

      console.log("✅ Profile setup successful:", result);

      // apiClient already extracts responseBody, so result has user and userProfile
      return result;
    } catch (error: any) {
      console.error("❌ Profile setup API error:", error);

      let message = "Profile setup failed";

      if (error instanceof ApiError) {
        message = error.message;
        console.error("ApiError details:", {
          message: error.message,
          status: error.status,
          data: error.data,
        });
      } else if (error?.response?.data?.responseMessage) {
        message = error.response.data.responseMessage;
      } else if (error?.message) {
        message = error.message;
      }

      throw new Error(message);
    }
  },

  login: async (email: string, password: string) => {
    try {
      // clear old user info on new login attempt
      await userStorage.clearUserInfo();

      // Clear any existing query cache
      queryClient.clear();

      const response = await authApi.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        { email, password }
      );

      if (response.data.responseSuccessful) {
        const { accessToken, refreshToken, user } = response.data.responseBody;
        console.log("🔐 Login successful for user:", response.data);
        // Store tokens
        await useAuthStore.getState().setAuth(user, accessToken, refreshToken);

        return response.data.responseBody;
      }

      throw new Error(response.data.responseMessage || "Login failed");
    } catch (error: any) {
      const message =
        error?.response?.data?.responseMessage ??
        error?.response?.data?.message ??
        error?.message ??
        "Login failed";

      throw new Error(message);
    }
  },

  // Quick login with saved email (password only)
  quickLogin: async (password: string): Promise<LoginResponse> => {
    try {
      // Get saved email
      const savedEmail = await userStorage.getEmail();

      if (!savedEmail) {
        throw new Error("No saved email found. Please enter your email.");
      }

      // Use regular login with saved email
      // return await authEndpoints.login("engrbuhari1@gmail.com", password);
      return await authEndpoints.login(savedEmail, password);
    } catch (error: any) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      console.log("🔓 Logging out user...");

      // Clear authentication tokens
      await useAuthStore.getState().signOut();

      // ✅ Keep email and name for quick login next time
      // Only clear tokens, not user info

      console.log("✅ Logout successful - tokens cleared, user info preserved");
    } catch (error) {
      console.error("❌ Error during logout:", error);
      // Still clear tokens even if something goes wrong
      await useAuthStore.getState().signOut();
    }
  },

  // Refresh token (called automatically by interceptor)
  refresh: async (refreshToken: string) => {
    const response = await authApi.post<ApiResponse<RefreshResponse>>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data.responseBody;
  },
};

/**
 * Country endpoints
 */
export const countryEndpoints = {
  // Get all countries
  getCountries: async (): Promise<Country[]> => {
    try {
      const response = await authApi.get<CountryAPIResponse>("/auth/countries");

      if (response.data.responseSuccessful) {
        return response.data.responseBody;
      }

      throw new Error(
        response.data.responseMessage || "Failed to fetch countries"
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.responseMessage ??
        error?.response?.data?.message ??
        error?.message ??
        "Failed to fetch countries";

      throw new Error(message);
    }
  },

  // Get countries formatted for Picker (by country name)
  getCountriesForPicker: async (): Promise<CountryPickerItem[]> => {
    try {
      const countries = await countryEndpoints.getCountries();

      return countries
        .map((country) => ({
          label: `${country.flag} ${country.name}`,
          value: country.isoCode,
          flag: country.flag,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
      throw error;
    }
  },

  // Get country codes formatted for Picker (by phone code)
  getCountryCodesForPicker: async (): Promise<CountryCodePickerItem[]> => {
    try {
      const countries = await countryEndpoints.getCountries();

      return countries
        .map((country) => ({
          label: `${country.flag} +${country.phonecode}`,
          callingCode: country.phonecode,
          country: country.name,
          flag: country.flag,
        }))
        .sort((a, b) => a.country.localeCompare(b.country));
    } catch (error) {
      throw error;
    }
  },
};
