import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/api";
import type { LeadsFilter } from "@/types";
import toast from "react-hot-toast";

const QUERY_KEY = ["leads"];

export function useLeads(filter?: LeadsFilter) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => leadsApi.getAll(filter),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => leadsApi.getById(id),
    enabled: !!id,
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: [...QUERY_KEY, "stats"],
    queryFn: leadsApi.getStats,
  });
}

export function useRetryLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsApi.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Лід відправлено на повторну обробку");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(
        error.response?.data?.message || "Помилка повторної відправки",
      );
    },
  });
}

// Alias for LeadsPage/LeadDetails compatibility
export const useResendLead = useRetryLead;
