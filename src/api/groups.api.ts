import api from "./axios";
import type { Group, CreateGroupDto, UpdateGroupDto } from "@/types";

export const groupsApi = {
  getAll: async (): Promise<Group[]> => {
    const { data } = await api.get<Group[]>("/admin/groups");
    return data;
  },

  getActive: async (): Promise<Group[]> => {
    const { data } = await api.get<Group[]>("/admin/groups/active");
    return data;
  },

  getById: async (id: string): Promise<Group> => {
    const { data } = await api.get<Group>(`/admin/groups/${id}`);
    return data;
  },

  create: async (dto: CreateGroupDto): Promise<Group> => {
    const { data } = await api.post<Group>("/admin/groups", dto);
    return data;
  },

  update: async (id: string, dto: UpdateGroupDto): Promise<Group> => {
    const { data } = await api.put<Group>(`/admin/groups/${id}`, dto);
    return data;
  },

  toggle: async (id: string): Promise<Group> => {
    const { data } = await api.patch<Group>(`/admin/groups/${id}/toggle`);
    return data;
  },

  regenerateDeepLink: async (id: string): Promise<Group> => {
    const { data } = await api.post<Group>(
      `/admin/groups/${id}/regenerate-deeplink`,
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/groups/${id}`);
  },
};
