import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sourcesApi } from "@/api";
import type { CreateSourceDto, UpdateSourceDto } from "@/types";
import toast from "react-hot-toast";

const QUERY_KEY = ["sources"];

export function useSources() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: sourcesApi.getAll,
  });
}

export function useActiveSources() {
  return useQuery({
    queryKey: [...QUERY_KEY, "active"],
    queryFn: sourcesApi.getActive,
  });
}

export function useSource(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => sourcesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSourceDto) => sourcesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Источник создан");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка создания");
    },
  });
}

export function useUpdateSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSourceDto }) =>
      sourcesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Источник обновлён");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка обновления");
    },
  });
}

export function useToggleSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sourcesApi.toggle(id),
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

export function useRegenerateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sourcesApi.regenerateApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("API ключ обновлён");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(
        error.response?.data?.message || "Ошибка обновления API ключа",
      );
    },
  });
}

export function useDeleteSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sourcesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Источник удалён");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка удаления");
    },
  });
}
