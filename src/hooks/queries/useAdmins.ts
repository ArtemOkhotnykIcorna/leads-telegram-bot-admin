import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminsApi } from "@/api";
import type {
  CreateAdminDto,
  UpdateAdminDto,
  UpdatePermissionsDto,
} from "@/types";
import toast from "react-hot-toast";

const QUERY_KEY = ["admins"];

export function useAdmins() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: adminsApi.getAll,
  });
}

export function useAdmin(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => adminsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateAdminDto) => adminsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Администратор создан");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка создания");
    },
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAdminDto }) =>
      adminsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Администратор обновлён");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка обновления");
    },
  });
}

export function useUpdateAdminPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePermissionsDto }) =>
      adminsApi.updatePermissions(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Права обновлены");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка обновления прав");
    },
  });
}

export function useChangeAdminPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      adminsApi.changePassword(id, { password }),
    onSuccess: () => {
      toast.success("Пароль изменён");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка смены пароля");
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Администратор удалён");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка удаления");
    },
  });
}
