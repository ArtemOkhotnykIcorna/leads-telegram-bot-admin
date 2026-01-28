import api from "./axios";
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  QuerySubscriptionPlansDto,
} from "@/types";

export const subscriptionPlansApi = {
  // Получить все планы с фильтрацией
  getAll: async (
    query?: QuerySubscriptionPlansDto,
  ): Promise<SubscriptionPlan[]> => {
    const { data } = await api.get<SubscriptionPlan[]>("/subscription-plans", {
      params: query,
    });
    return data;
  },

  // Получить доступные для покупки планы
  getAvailable: async (): Promise<SubscriptionPlan[]> => {
    const { data } = await api.get<SubscriptionPlan[]>(
      "/subscription-plans/available",
    );
    return data;
  },

  // Получить план по ID
  getById: async (id: string): Promise<SubscriptionPlan> => {
    const { data } = await api.get<SubscriptionPlan>(
      `/subscription-plans/${id}`,
    );
    return data;
  },

  // Получить план по коду
  getByCode: async (code: string): Promise<SubscriptionPlan> => {
    const { data } = await api.get<SubscriptionPlan>(
      `/subscription-plans/code/${code}`,
    );
    return data;
  },

  // Создать план
  create: async (dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> => {
    const { data } = await api.post<SubscriptionPlan>(
      "/subscription-plans",
      dto,
    );
    return data;
  },

  // Обновить план по ID
  update: async (
    id: string,
    dto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> => {
    const { data } = await api.put<SubscriptionPlan>(
      `/subscription-plans/${id}`,
      dto,
    );
    return data;
  },

  // Обновить план по коду
  updateByCode: async (
    code: string,
    dto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> => {
    const { data } = await api.put<SubscriptionPlan>(
      `/subscription-plans/code/${code}`,
      dto,
    );
    return data;
  },

  // Удалить план по ID
  delete: async (id: string): Promise<void> => {
    await api.delete(`/subscription-plans/${id}`);
  },

  // Удалить план по коду
  deleteByCode: async (code: string): Promise<void> => {
    await api.delete(`/subscription-plans/code/${code}`);
  },

  // Seed базовых планов
  seed: async (): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>(
      "/subscription-plans/seed",
    );
    return data;
  },

  // Обновить кэш
  refreshCache: async (): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>(
      "/subscription-plans/refresh-cache",
    );
    return data;
  },
};
