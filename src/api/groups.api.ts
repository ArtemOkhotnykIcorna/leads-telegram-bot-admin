import api from "./axios";
import type {
  TelegramGroup,
  PendingGroup,
  CreateGroupDto,
  UpdateGroupDto,
  LinkPendingGroupDto,
} from "@/types";

export const groupsApi = {
  // === Зарегистрированные группы (TelegramGroup) ===

  getAll: async (directionId?: string): Promise<TelegramGroup[]> => {
    const params = directionId ? { directionId } : undefined;
    const { data } = await api.get<TelegramGroup[]>("/admin/groups", {
      params,
    });
    return data;
  },

  getActive: async (directionId?: string): Promise<TelegramGroup[]> => {
    const params = directionId ? { directionId } : undefined;
    const { data } = await api.get<TelegramGroup[]>("/admin/groups/active", {
      params,
    });
    return data;
  },

  getById: async (id: string): Promise<TelegramGroup> => {
    const { data } = await api.get<TelegramGroup>(`/admin/groups/${id}`);
    return data;
  },

  create: async (dto: CreateGroupDto): Promise<TelegramGroup> => {
    const { data } = await api.post<TelegramGroup>("/admin/groups", dto);
    return data;
  },

  update: async (id: string, dto: UpdateGroupDto): Promise<TelegramGroup> => {
    const { data } = await api.put<TelegramGroup>(`/admin/groups/${id}`, dto);
    return data;
  },

  toggle: async (id: string): Promise<TelegramGroup> => {
    const { data } = await api.patch<TelegramGroup>(
      `/admin/groups/${id}/toggle`,
    );
    return data;
  },

  regenerateDeepLink: async (id: string): Promise<TelegramGroup> => {
    const { data } = await api.post<TelegramGroup>(
      `/admin/groups/${id}/regenerate-deeplink`,
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/groups/${id}`);
  },

  // === Ожидающие группы (PendingGroup) ===

  getPending: async (): Promise<PendingGroup[]> => {
    const { data } = await api.get<PendingGroup[]>("/admin/groups/pending");
    return data;
  },

  linkPending: async (
    id: string,
    dto: LinkPendingGroupDto,
  ): Promise<TelegramGroup> => {
    const { data } = await api.post<TelegramGroup>(
      `/admin/groups/pending/${id}/link`,
      dto,
    );
    return data;
  },

  rejectPending: async (id: string): Promise<void> => {
    await api.delete(`/admin/groups/pending/${id}`);
  },
};
