import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sourcesApi } from "@/api";
import type {
  CreateSourceDto,
  UpdateSourceDto,
  LinkPendingSourceDto,
} from "@/types";
import toast from "react-hot-toast";

const QUERY_KEY = ["sources"];

// Шаблоны парсинга
export function useParsingTemplates() {
  return useQuery({
    queryKey: [...QUERY_KEY, "parsing-templates"],
    queryFn: sourcesApi.getParsingTemplates,
    staleTime: Infinity, // Шаблоны не меняются
  });
}

// Зарегистрированные источники
export function useSources(directionId?: string) {
  return useQuery({
    queryKey: directionId ? [...QUERY_KEY, { directionId }] : QUERY_KEY,
    queryFn: () => sourcesApi.getAll(directionId),
  });
}

export function useActiveSources(directionId?: string) {
  return useQuery({
    queryKey: directionId
      ? [...QUERY_KEY, "active", { directionId }]
      : [...QUERY_KEY, "active"],
    queryFn: () => sourcesApi.getActive(directionId),
  });
}

export function useSource(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => sourcesApi.getById(id),
    enabled: !!id,
  });
}

// Ожидающие источники
export function usePendingSources() {
  return useQuery({
    queryKey: [...QUERY_KEY, "pending"],
    queryFn: sourcesApi.getPending,
    refetchInterval: 30000, // Обновлять каждые 30 секунд
  });
}

// Мутации для зарегистрированных источников
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

// Мутации для pending источников
export function useLinkPendingSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: LinkPendingSourceDto }) =>
      sourcesApi.linkPending(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Источник подключен к направлениям");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка привязки источника");
    },
  });
}

export function useRejectPendingSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sourcesApi.rejectPending(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Источник отклонён");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка отклонения");
    },
  });
}
