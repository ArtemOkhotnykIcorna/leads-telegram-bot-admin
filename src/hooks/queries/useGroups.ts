import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/api";
import type {
  CreateGroupDto,
  UpdateGroupDto,
  LinkPendingGroupDto,
} from "@/types";
import toast from "react-hot-toast";

const QUERY_KEY = ["groups"];
const PENDING_QUERY_KEY = ["groups", "pending"];

// === Зарегистрированные группы ===

export function useGroups(directionId?: string) {
  return useQuery({
    queryKey: directionId ? [...QUERY_KEY, { directionId }] : QUERY_KEY,
    queryFn: () => groupsApi.getAll(directionId),
  });
}

export function useActiveGroups(directionId?: string) {
  return useQuery({
    queryKey: directionId
      ? [...QUERY_KEY, "active", { directionId }]
      : [...QUERY_KEY, "active"],
    queryFn: () => groupsApi.getActive(directionId),
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => groupsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateGroupDto) => groupsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Группа создана");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка создания");
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateGroupDto }) =>
      groupsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Группа обновлена");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка обновления");
    },
  });
}

export function useToggleGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => groupsApi.toggle(id),
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

export function useRegenerateDeepLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => groupsApi.regenerateDeepLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Deep link обновлён");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(
        error.response?.data?.message || "Ошибка обновления deep link",
      );
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => groupsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Группа удалена");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка удаления");
    },
  });
}

// === Ожидающие группы (PendingGroup) ===

export function usePendingGroups() {
  return useQuery({
    queryKey: PENDING_QUERY_KEY,
    queryFn: groupsApi.getPending,
    refetchInterval: 30000, // Обновлять каждые 30 сек
  });
}

export function useLinkPendingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: LinkPendingGroupDto }) =>
      groupsApi.linkPending(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PENDING_QUERY_KEY });
      toast.success("Группа привязана к направлению");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка привязки группы");
    },
  });
}

export function useRejectPendingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => groupsApi.rejectPending(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_QUERY_KEY });
      toast.success("Группа отклонена");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка отклонения группы");
    },
  });
}
