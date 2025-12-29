// hooks/use-sim-request.ts
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

export interface SimRequestPayload {
  country: string;
  state: string;
  lga: string;
  posType?: string;
}

// The actual response from the API is the agent object
export interface AgentResponse {
  id: number;
  user_id: number;
  fullname: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  country: string;
  state: string;
  lga: string;
  idCard: string | null;
  reason: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const useSimRequest = () => {
  return useMutation({
    mutationFn: async (
      payload: SimRequestPayload
    ): Promise<AgentResponse> => {
      console.log("SIM request payload:", payload);
      
      const response = await apiClient<AgentResponse>(
        "/user/sim/request",
        {
          method: "POST",
          data: payload,
        }
      );
      
      console.log("SIM request response:", response);
      return response;
    },
  });
};