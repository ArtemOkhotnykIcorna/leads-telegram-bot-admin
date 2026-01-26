import api from "./axios";
import type { RoutingRule, CreateRoutingDto, UpdateRoutingDto } from "@/types";

export const routingApi = {
  getAll: async (): Promise<RoutingRule[]> => {
    const { data } = await api.get<RoutingRule[]>("/admin/routing");
    return data;
  },

  getActive: async (): Promise<RoutingRule[]> => {
    const { data } = await api.get<RoutingRule[]>("/admin/routing/active");
    return data;
  },

  getById: async (id: string): Promise<RoutingRule> => {
    const { data } = await api.get<RoutingRule>(`/admin/routing/${id}`);
    return data;
  },

  create: async (dto: CreateRoutingDto): Promise<RoutingRule> => {
    const { data } = await api.post<RoutingRule>("/admin/routing", dto);
    return data;
  },

  update: async (id: string, dto: UpdateRoutingDto): Promise<RoutingRule> => {
    const { data } = await api.put<RoutingRule>(`/admin/routing/${id}`, dto);
    return data;
  },

  toggle: async (id: string): Promise<RoutingRule> => {
    const { data } = await api.patch<RoutingRule>(
      `/admin/routing/${id}/toggle`,
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/routing/${id}`);
  },
};
