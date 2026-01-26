import api from "./axios";
import type {
  LeadSource,
  PendingSource,
  ParsingTemplate,
  CreateSourceDto,
  UpdateSourceDto,
  LinkPendingSourceDto,
} from "@/types";

export const sourcesApi = {
  // Шаблоны парсинга
  getParsingTemplates: async (): Promise<ParsingTemplate[]> => {
    const { data } = await api.get<ParsingTemplate[]>(
      "/admin/sources/parsing-templates",
    );
    return data;
  },

  // Зарегистрированные источники
  getAll: async (directionId?: string): Promise<LeadSource[]> => {
    const params = directionId ? { directionId } : undefined;
    const { data } = await api.get<LeadSource[]>("/admin/sources", { params });
    return data;
  },

  getActive: async (directionId?: string): Promise<LeadSource[]> => {
    const params = directionId ? { directionId } : undefined;
    const { data } = await api.get<LeadSource[]>("/admin/sources/active", {
      params,
    });
    return data;
  },

  getById: async (id: string): Promise<LeadSource> => {
    const { data } = await api.get<LeadSource>(`/admin/sources/${id}`);
    return data;
  },

  create: async (dto: CreateSourceDto): Promise<LeadSource> => {
    const { data } = await api.post<LeadSource>("/admin/sources", dto);
    return data;
  },

  update: async (id: string, dto: UpdateSourceDto): Promise<LeadSource> => {
    const { data } = await api.put<LeadSource>(`/admin/sources/${id}`, dto);
    return data;
  },

  toggle: async (id: string): Promise<LeadSource> => {
    const { data } = await api.patch<LeadSource>(`/admin/sources/${id}/toggle`);
    return data;
  },

  regenerateApiKey: async (id: string): Promise<LeadSource> => {
    const { data } = await api.post<LeadSource>(
      `/admin/sources/${id}/regenerate-api-key`,
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/sources/${id}`);
  },

  // Ожидающие источники (Pending)
  getPending: async (): Promise<PendingSource[]> => {
    const { data } = await api.get<PendingSource[]>("/admin/sources/pending");
    return data;
  },

  linkPending: async (
    id: string,
    dto: LinkPendingSourceDto,
  ): Promise<LeadSource> => {
    const { data } = await api.post<LeadSource>(
      `/admin/sources/pending/${id}/link`,
      dto,
    );
    return data;
  },

  rejectPending: async (id: string): Promise<void> => {
    await api.delete(`/admin/sources/pending/${id}`);
  },
};
