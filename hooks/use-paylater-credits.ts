// hooks/use-paylater-credits.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/api/axios";

// Type definition for Pay Later Credit
export interface PayLaterCredit {
  bill_id: number;
  amount_due: string;
  status: string;
  created_at: string;
  due_date: string;
}

// Query keys for better cache management
export const payLaterCreditsKeys = {
  all: ["paylater-credits"] as const,
  list: () => [...payLaterCreditsKeys.all, "list"] as const,
};

export const usePayLaterCredits = () => {
  const queryClient = useQueryClient();

  const creditsQuery = useQuery({
    queryKey: payLaterCreditsKeys.list(),
    queryFn: async (): Promise<PayLaterCredit[]> => {
      const data = await apiClient<PayLaterCredit[]>("/paylater/credits", {
        method: "GET",
      });
      return data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Garbage collection after 10 minutes
  });

  // Helper to get unpaid credits
  const unpaidCredits = creditsQuery.data?.filter(
    (credit) => credit.status.toLowerCase() === "pending"
  ) || [];

  // Helper to get total amount due
  const totalAmountDue = unpaidCredits.reduce(
    (sum, credit) => sum + parseFloat(credit.amount_due),
    0
  );

  // Helper to check if user has any unpaid credits
  const hasUnpaidCredits = unpaidCredits.length > 0;

  // Helper to get next due date
  const nextDueDate = unpaidCredits.length > 0
    ? unpaidCredits.sort((a, b) => 
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )[0].due_date
    : null;

  // Helper to format amount
  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₦${num.toLocaleString()}`;
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Helper to check if credit is overdue
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate).getTime() < new Date().getTime();
  };

  return {
    credits: creditsQuery.data || [],
    unpaidCredits,
    totalAmountDue,
    hasUnpaidCredits,
    nextDueDate,
    formatAmount,
    formatDate,
    isOverdue,
    isLoading: creditsQuery.isLoading,
    isFetching: creditsQuery.isFetching,
    isError: creditsQuery.isError,
    error: creditsQuery.error,
    refetch: creditsQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: payLaterCreditsKeys.list() }),
  };
};