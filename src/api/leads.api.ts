import api from "./axios";
import type { Lead, LeadsResponse, LeadsFilter, LeadStats } from "@/types";
import { buildQueryString } from "@/lib/utils";

export const leadsApi = {
  getAll: async (filter?: LeadsFilter): Promise<LeadsResponse> => {
    const queryString = filter ? buildQueryString(filter) : "";
    const { data } = await api.get<LeadsResponse>(
      `/admin/leads${queryString ? `?${queryString}` : ""}`,
    );
    return data;
  },

  getById: async (id: string): Promise<Lead> => {
    const { data } = await api.get<Lead>(`/admin/leads/${id}`);
    return data;
  },

  getStats: async (): Promise<LeadStats> => {
    const { data } = await api.get<LeadStats>("/admin/leads/stats");
    return data;
  },

  retry: async (id: string): Promise<Lead> => {
    const { data } = await api.post<Lead>(`/admin/leads/${id}/retry`);
    return data;
  },
};
