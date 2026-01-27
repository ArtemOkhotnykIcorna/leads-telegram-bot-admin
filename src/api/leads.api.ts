import api from "./axios";
import type { Lead, LeadsResponse, LeadsFilter, LeadStats } from "@/types";

export const leadsApi = {
  // Получить список лидов с фильтрацией
  getAll: async (filter?: LeadsFilter): Promise<LeadsResponse> => {
    const params: Record<string, string | number> = {};
    if (filter?.page) params.page = filter.page;
    if (filter?.limit) params.limit = filter.limit;
    if (filter?.status) params.status = filter.status;
    if (filter?.sourceId) params.sourceId = filter.sourceId;
    if (filter?.directionId) params.directionId = filter.directionId;

    const { data } = await api.get<LeadsResponse>("/admin/leads", { params });
    return data;
  },

  // Получить лид по ID
  getById: async (id: string): Promise<Lead> => {
    const { data } = await api.get<Lead>(`/admin/leads/${id}`);
    return data;
  },

  // Получить статистику
  getStats: async (): Promise<LeadStats> => {
    const { data } = await api.get<LeadStats>("/admin/leads/stats");
    return data;
  },

  // Повторить публикацию
  retry: async (id: string): Promise<Lead> => {
    const { data } = await api.post<Lead>(`/admin/leads/${id}/retry`);
    return data;
  },
};
