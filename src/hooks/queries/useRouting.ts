import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routingApi } from "@/api";
import type { CreateRoutingDto, UpdateRoutingDto } from "@/types";
import toast from "react-hot-toast";

const QUERY_KEY = ["routing"];

export function useRouting() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: routingApi.getAll,
  });
}

export function useActiveRouting() {
  return useQuery({
    queryKey: [...QUERY_KEY, "active"],
    queryFn: routingApi.getActive,
  });
}

export function useRoutingRule(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => routingApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRouting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateRoutingDto) => routingApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Правило маршрутизации создано");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка создания");
    },
  });
}

export function useUpdateRouting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoutingDto }) =>
      routingApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Правило маршрутизации обновлено");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка обновления");
    },
  });
}

export function useToggleRouting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routingApi.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка изменения статуса");
    },
  });
}

export function useDeleteRouting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Правило маршрутизации удалено");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка удаления");
    },
  });
}

// Aliases for RoutingPage/RoutingForm compatibility
export const useRoutingRules = useRouting;
export const useCreateRoutingRule = useCreateRouting;
export const useUpdateRoutingRule = useUpdateRouting;
export const useDeleteRoutingRule = useDeleteRouting;
export const useToggleRoutingRule = useToggleRouting;
