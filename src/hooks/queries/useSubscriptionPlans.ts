import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionPlansApi } from "@/api/subscription-plans.api";
import type {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  QuerySubscriptionPlansDto,
} from "@/types";

const QUERY_KEY = ["subscription-plans"];

// Получить все планы
export function useSubscriptionPlans(filters?: QuerySubscriptionPlansDto) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => subscriptionPlansApi.getAll(filters),
  });
}

// Получить доступные планы
export function useAvailablePlans() {
  return useQuery({
    queryKey: [...QUERY_KEY, "available"],
    queryFn: () => subscriptionPlansApi.getAvailable(),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

// Получить план по ID
export function useSubscriptionPlan(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => subscriptionPlansApi.getById(id),
    enabled: !!id,
  });
}

// Получить план по коду
export function useSubscriptionPlanByCode(code: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, "code", code],
    queryFn: () => subscriptionPlansApi.getByCode(code),
    enabled: !!code,
  });
}

// Создать план
export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSubscriptionPlanDto) =>
      subscriptionPlansApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// Обновить план
export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSubscriptionPlanDto;
    }) => subscriptionPlansApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, variables.id],
      });
    },
  });
}

// Удалить план
export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionPlansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// Seed планов
export function useSeedPlans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionPlansApi.seed(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// Обновить кэш
export function useRefreshPlanCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionPlansApi.refreshCache(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
