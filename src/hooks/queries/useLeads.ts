import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/api";
import type { LeadsFilter } from "@/types";
import toast from "react-hot-toast";

const QUERY_KEY = ["leads"];

// Получить список лидов с фильтрацией
export function useLeads(filter?: LeadsFilter) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => leadsApi.getAll(filter),
    // Автообновление каждые 30 сек для статуса processing
    refetchInterval: filter?.status === "processing" ? 30000 : false,
  });
}

// Получить лид по ID
export function useLead(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => leadsApi.getById(id),
    enabled: !!id,
  });
}

// Получить статистику
export function useLeadStats() {
  return useQuery({
    queryKey: [...QUERY_KEY, "stats"],
    queryFn: leadsApi.getStats,
    refetchInterval: 60000, // Обновлять каждую минуту
  });
}

// Повторить публикацию лида
export function useRetryLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsApi.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Лид отправлен на повторную публикацию");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(
        error.response?.data?.message || "Ошибка повторной публикации",
      );
    },
  });
}

// Alias для совместимости
export const useResendLead = useRetryLead;
