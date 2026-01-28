import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/users.api";
import type {
  UsersQueryParams,
  AdminUpdateUserDto,
  AdminActivateSubscriptionDto,
} from "@/types/user.types";
import toast from "react-hot-toast";

const QUERY_KEY = ["users"];

// Получить список пользователей
export function useUsers(params?: UsersQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => usersApi.getAll(params),
  });
}

// Получить пользователя по ID
export function useUser(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

// Получить пользователя по Telegram ID
export function useUserByTelegramId(telegramId: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, "telegram", telegramId],
    queryFn: () => usersApi.getByTelegramId(telegramId),
    enabled: !!telegramId,
  });
}

// Получить статистику пользователей
export function useUsersStats() {
  return useQuery({
    queryKey: [...QUERY_KEY, "stats"],
    queryFn: usersApi.getStats,
    refetchInterval: 60000, // Обновлять каждую минуту
  });
}

// Обновить пользователя
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateUserDto }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Пользователь обновлён");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка обновления");
    },
  });
}

// Активировать подписку
export function useActivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: AdminActivateSubscriptionDto;
    }) => usersApi.activateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Подписка активирована");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка активации подписки");
    },
  });
}

// Заблокировать пользователя
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.block(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Пользователь заблокирован");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка блокировки");
    },
  });
}

// Разблокировать пользователя
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.unblock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Пользователь разблокирован");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка разблокировки");
    },
  });
}

// Удалить пользователя
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Пользователь удалён");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка удаления");
    },
  });
}
