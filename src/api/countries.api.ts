import api from "./axios";
import type { Country, CreateCountryDto, UpdateCountryDto } from "@/types";

export const countriesApi = {
  getAll: async (): Promise<Country[]> => {
    const { data } = await api.get<Country[]>("/admin/countries");
    return data;
  },

  getActive: async (): Promise<Country[]> => {
    const { data } = await api.get<Country[]>("/admin/countries/active");
    return data;
  },

  getById: async (id: string): Promise<Country> => {
    const { data } = await api.get<Country>(`/admin/countries/${id}`);
    return data;
  },

  create: async (dto: CreateCountryDto): Promise<Country> => {
    const { data } = await api.post<Country>("/admin/countries", dto);
    return data;
  },

  update: async (id: string, dto: UpdateCountryDto): Promise<Country> => {
    const { data } = await api.put<Country>(`/admin/countries/${id}`, dto);
    return data;
  },

  toggle: async (id: string): Promise<Country> => {
    const { data } = await api.patch<Country>(`/admin/countries/${id}/toggle`);
    return data;
  },

  updateOrder: async (id: string, order: number): Promise<Country> => {
    const { data } = await api.patch<Country>(`/admin/countries/${id}/order`, {
      order,
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/countries/${id}`);
  },
};
