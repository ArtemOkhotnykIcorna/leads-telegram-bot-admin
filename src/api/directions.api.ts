import api from "./axios";
import type {
  Direction,
  CreateDirectionDto,
  UpdateDirectionDto,
} from "@/types";

export const directionsApi = {
  getAll: async (): Promise<Direction[]> => {
    const { data } = await api.get<Direction[]>("/admin/directions");
    return data;
  },

  getActive: async (): Promise<Direction[]> => {
    const { data } = await api.get<Direction[]>("/admin/directions/active");
    return data;
  },

  getById: async (id: string): Promise<Direction> => {
    const { data } = await api.get<Direction>(`/admin/directions/${id}`);
    return data;
  },

  create: async (dto: CreateDirectionDto): Promise<Direction> => {
    const { data } = await api.post<Direction>("/admin/directions", dto);
    return data;
  },

  update: async (id: string, dto: UpdateDirectionDto): Promise<Direction> => {
    const { data } = await api.put<Direction>(`/admin/directions/${id}`, dto);
    return data;
  },

  toggle: async (id: string): Promise<Direction> => {
    const { data } = await api.patch<Direction>(
      `/admin/directions/${id}/toggle`,
    );
    return data;
  },

  updateOrder: async (id: string, order: number): Promise<Direction> => {
    const { data } = await api.patch<Direction>(
      `/admin/directions/${id}/order`,
      { order },
    );
    return data;
  },

  bulkReorder: async (
    items: { id: string; order: number }[],
  ): Promise<Direction[]> => {
    const { data } = await api.patch<Direction[]>(
      "/admin/directions/bulk-reorder",
      { items },
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/directions/${id}`);
  },
};
