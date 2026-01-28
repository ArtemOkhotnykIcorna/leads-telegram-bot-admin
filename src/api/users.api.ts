import api from "./axios";
import type {
  User,
  UsersListResponse,
  UsersStats,
  UsersQueryParams,
  AdminUpdateUserDto,
  AdminActivateSubscriptionDto,
  DeleteUserResponse,
} from "@/types/user.types";

export const usersApi = {
  // Получить список пользователей
  getAll: async (params?: UsersQueryParams): Promise<UsersListResponse> => {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.status) queryParams.status = params.status;
    if (params?.search) queryParams.search = params.search;
    if (params?.isActiveOnly) queryParams.isActiveOnly = params.isActiveOnly;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;
    if (params?.hasTributeSubscription !== undefined) {
      queryParams.hasTributeSubscription = params.hasTributeSubscription;
    }

    const { data } = await api.get<UsersListResponse>("/admin/users", {
      params: queryParams,
    });
    return data;
  },

  // Получить статистику пользователей
  getStats: async (): Promise<UsersStats> => {
    const { data } = await api.get<UsersStats>("/admin/users/stats");
    return data;
  },

  // Получить пользователя по ID
  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/admin/users/${id}`);
    return data;
  },

  // Получить пользователя по Telegram ID
  getByTelegramId: async (telegramId: number): Promise<User> => {
    const { data } = await api.get<User>(`/admin/users/telegram/${telegramId}`);
    return data;
  },

  // Обновить данные пользователя
  update: async (id: string, dto: AdminUpdateUserDto): Promise<User> => {
    const { data } = await api.put<User>(`/admin/users/${id}`, dto);
    return data;
  },

  // Активировать подписку пользователю
  activateSubscription: async (
    id: string,
    dto: AdminActivateSubscriptionDto,
  ): Promise<User> => {
    const { data } = await api.post<User>(`/admin/users/${id}/activate`, dto);
    return data;
  },

  // Заблокировать пользователя
  block: async (id: string): Promise<User> => {
    const { data } = await api.post<User>(`/admin/users/${id}/block`);
    return data;
  },

  // Разблокировать пользователя
  unblock: async (id: string): Promise<User> => {
    const { data } = await api.post<User>(`/admin/users/${id}/unblock`);
    return data;
  },

  // Удалить пользователя по ID
  delete: async (id: string): Promise<DeleteUserResponse> => {
    const { data } = await api.delete<DeleteUserResponse>(`/admin/users/${id}`);
    return data;
  },

  // Удалить пользователя по Telegram ID
  deleteByTelegramId: async (
    telegramId: number,
  ): Promise<DeleteUserResponse> => {
    const { data } = await api.delete<DeleteUserResponse>(
      `/admin/users/telegram/${telegramId}`,
    );
    return data;
  },
};
