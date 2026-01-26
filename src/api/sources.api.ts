import api from "./axios";
import type { Source, CreateSourceDto, UpdateSourceDto } from "@/types";

export const sourcesApi = {
  getAll: async (): Promise<Source[]> => {
    const { data } = await api.get<Source[]>("/admin/sources");
    return data;
  },

  getActive: async (): Promise<Source[]> => {
    const { data } = await api.get<Source[]>("/admin/sources/active");
    return data;
  },

  getById: async (id: string): Promise<Source> => {
    const { data } = await api.get<Source>(`/admin/sources/${id}`);
    return data;
  },

  create: async (dto: CreateSourceDto): Promise<Source> => {
    const { data } = await api.post<Source>("/admin/sources", dto);
    return data;
  },

  update: async (id: string, dto: UpdateSourceDto): Promise<Source> => {
    const { data } = await api.put<Source>(`/admin/sources/${id}`, dto);
    return data;
  },

  toggle: async (id: string): Promise<Source> => {
    const { data } = await api.patch<Source>(`/admin/sources/${id}/toggle`);
    return data;
  },

  regenerateApiKey: async (id: string): Promise<Source> => {
    const { data } = await api.post<Source>(
      `/admin/sources/${id}/regenerate-api-key`,
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/sources/${id}`);
  },
};
