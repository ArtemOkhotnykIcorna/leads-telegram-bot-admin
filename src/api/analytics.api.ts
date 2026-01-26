import api from "./axios";
import type {
  AnalyticsOverview,
  AnalyticsUsers,
  AnalyticsPayments,
  AnalyticsSources,
  AnalyticsDateRange,
} from "@/types";
import { buildQueryString } from "@/lib/utils";

export const analyticsApi = {
  getOverview: async (
    dateRange?: AnalyticsDateRange,
  ): Promise<AnalyticsOverview> => {
    const queryString = dateRange ? buildQueryString(dateRange) : "";
    const { data } = await api.get<AnalyticsOverview>(
      `/admin/analytics/overview${queryString ? `?${queryString}` : ""}`,
    );
    return data;
  },

  getUsers: async (dateRange?: AnalyticsDateRange): Promise<AnalyticsUsers> => {
    const queryString = dateRange ? buildQueryString(dateRange) : "";
    const { data } = await api.get<AnalyticsUsers>(
      `/admin/analytics/users${queryString ? `?${queryString}` : ""}`,
    );
    return data;
  },

  getPayments: async (
    dateRange?: AnalyticsDateRange,
  ): Promise<AnalyticsPayments> => {
    const queryString = dateRange ? buildQueryString(dateRange) : "";
    const { data } = await api.get<AnalyticsPayments>(
      `/admin/analytics/payments${queryString ? `?${queryString}` : ""}`,
    );
    return data;
  },

  getSources: async (
    dateRange?: AnalyticsDateRange,
  ): Promise<AnalyticsSources> => {
    const queryString = dateRange ? buildQueryString(dateRange) : "";
    const { data } = await api.get<AnalyticsSources>(
      `/admin/analytics/sources${queryString ? `?${queryString}` : ""}`,
    );
    return data;
  },
};
