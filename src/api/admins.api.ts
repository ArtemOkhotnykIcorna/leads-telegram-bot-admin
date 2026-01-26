import api from "./axios";
import type {
  Admin,
  CreateAdminDto,
  UpdateAdminDto,
  UpdatePermissionsDto,
  ChangePasswordDto,
} from "@/types";

export const adminsApi = {
  getAll: async (): Promise<Admin[]> => {
    const { data } = await api.get<Admin[]>("/admin/admins");
    return data;
  },

  getById: async (id: string): Promise<Admin> => {
    const { data } = await api.get<Admin>(`/admin/admins/${id}`);
    return data;
  },

  create: async (dto: CreateAdminDto): Promise<Admin> => {
    const { data } = await api.post<Admin>("/admin/admins", dto);
    return data;
  },

  update: async (id: string, dto: UpdateAdminDto): Promise<Admin> => {
    const { data } = await api.put<Admin>(`/admin/admins/${id}`, dto);
    return data;
  },

  updatePermissions: async (
    id: string,
    dto: UpdatePermissionsDto,
  ): Promise<Admin> => {
    const { data } = await api.patch<Admin>(
      `/admin/admins/${id}/permissions`,
      dto,
    );
    return data;
  },

  changePassword: async (id: string, dto: ChangePasswordDto): Promise<void> => {
    await api.patch(`/admin/admins/${id}/password`, dto);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/admins/${id}`);
  },
};
