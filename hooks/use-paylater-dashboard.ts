// hooks/use-paylater-dashboard.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

// Type definition for Pay Later Dashboard
export interface PayLaterDashboard {
  title: string;
  balance: number;
  availableLimit: number;
  creditLimit: string;
  repayment: {
    dueDate?: string;
    dueAmount?: number;
    service?: string;
    fee?: string;
  } | null;
}

// Query keys for better cache management
export const payLaterKeys = {
  all: ["paylater"] as const,
  dashboard: () => [...payLaterKeys.all, "dashboard"] as const,
};

export const usePayLaterDashboard = () => {
  const queryClient = useQueryClient();

  const payLaterQuery = useQuery({
    queryKey: payLaterKeys.dashboard(),
    queryFn: async (): Promise<PayLaterDashboard> => {
      const data = await apiClient<PayLaterDashboard>("/paylater/dashboard", {
        method: "GET",
      });
      return data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Garbage collection after 10 minutes
  });

  // Helper to check if user has outstanding loan
  const hasOutstandingLoan = payLaterQuery.data?.balance 
    ? payLaterQuery.data.balance > 0 
    : false;

  // Helper to calculate total credit limit as number
  const totalCreditLimit = payLaterQuery.data?.creditLimit
    ? parseFloat(payLaterQuery.data.creditLimit)
    : 0;

  // Helper to check if user has available credit
  const hasAvailableCredit = payLaterQuery.data?.availableLimit 
    ? payLaterQuery.data.availableLimit > 0 
    : false;

  return {
    payLaterDashboard: payLaterQuery.data,
    title: payLaterQuery.data?.title || "Pay Later Credit Limit",
    balance: payLaterQuery.data?.balance || 0,
    availableLimit: payLaterQuery.data?.availableLimit || 0,
    creditLimit: totalCreditLimit,
    repayment: payLaterQuery.data?.repayment || null,
    hasOutstandingLoan,
    hasAvailableCredit,
    totalCreditLimit,
    isLoading: payLaterQuery.isLoading,
    isFetching: payLaterQuery.isFetching,
    isError: payLaterQuery.isError,
    error: payLaterQuery.error,
    refetch: payLaterQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: payLaterKeys.dashboard() }),
  };
};