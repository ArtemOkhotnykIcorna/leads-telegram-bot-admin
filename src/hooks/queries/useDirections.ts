import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directionsApi } from "@/api";
import type { CreateDirectionDto, UpdateDirectionDto } from "@/types";
import toast from "react-hot-toast";

const QUERY_KEY = ["directions"];

export function useDirections(countryId?: string) {
  return useQuery({
    queryKey: countryId ? [...QUERY_KEY, { countryId }] : QUERY_KEY,
    queryFn: () => directionsApi.getAll(countryId),
  });
}

export function useActiveDirections() {
  return useQuery({
    queryKey: [...QUERY_KEY, "active"],
    queryFn: directionsApi.getActive,
  });
}

export function useDirection(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => directionsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDirection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateDirectionDto) => directionsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Направление создано");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка создания");
    },
  });
}

export function useUpdateDirection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDirectionDto }) =>
      directionsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Направление обновлено");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка обновления");
    },
  });
}

export function useToggleDirection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => directionsApi.toggle(id),
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

export function useDeleteDirection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => directionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Направление удалено");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка удаления");
    },
  });
}
