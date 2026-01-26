import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/api";
import type { CreateGroupDto, UpdateGroupDto } from "@/types";
import toast from "react-hot-toast";

const QUERY_KEY = ["groups"];

export function useGroups() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: groupsApi.getAll,
  });
}

export function useActiveGroups() {
  return useQuery({
    queryKey: [...QUERY_KEY, "active"],
    queryFn: groupsApi.getActive,
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
