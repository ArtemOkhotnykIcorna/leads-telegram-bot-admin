import api from "./axios";
import type {
  AnalyticsOverview,
  AnalyticsUsers,
  AnalyticsRevenue,
  AnalyticsLeads,
  AnalyticsSources,
  AnalyticsRetention,
  AnalyticsRealtime,
  AnalyticsGroups,
  AnalyticsInvites,
  AnalyticsLeadsPipeline,
  AnalyticsRouting,
  AnalyticsDateRange,
} from "@/types";
import { buildQueryString } from "@/lib/utils";

const qs = (dateRange?: AnalyticsDateRange) => {
  const str = dateRange ? buildQueryString(dateRange) : "";
  return str ? `?${str}` : "";
};

export const analyticsApi = {
  getOverview: (dateRange?: AnalyticsDateRange) =>
    api
      .get<AnalyticsOverview>(`/admin/analytics/overview${qs(dateRange)}`)
      .then((r) => r.data),

  getUsers: (dateRange?: AnalyticsDateRange) =>
    api
      .get<AnalyticsUsers>(`/admin/analytics/users${qs(dateRange)}`)
      .then((r) => r.data),

  getRevenue: (dateRange?: AnalyticsDateRange) =>
    api
      .get<AnalyticsRevenue>(`/admin/analytics/revenue${qs(dateRange)}`)
      .then((r) => r.data),

  getLeads: (dateRange?: AnalyticsDateRange) =>
    api
      .get<AnalyticsLeads>(`/admin/analytics/leads${qs(dateRange)}`)
      .then((r) => r.data),

  getSources: () =>
    api.get<AnalyticsSources>(`/admin/analytics/sources`).then((r) => r.data),

  getRetention: () =>
    api
      .get<AnalyticsRetention>(`/admin/analytics/retention`)
      .then((r) => r.data),

  getRealtime: () =>
    api.get<AnalyticsRealtime>(`/admin/analytics/realtime`).then((r) => r.data),

  getGroups: (dateRange?: AnalyticsDateRange) =>
    api
      .get<AnalyticsGroups>(`/admin/analytics/groups${qs(dateRange)}`)
      .then((r) => r.data),

  getInvites: (dateRange?: AnalyticsDateRange) =>
    api
      .get<AnalyticsInvites>(`/admin/analytics/invites${qs(dateRange)}`)
      .then((r) => r.data),

  getLeadsPipeline: (dateRange?: AnalyticsDateRange) =>
    api
      .get<AnalyticsLeadsPipeline>(
        `/admin/analytics/leads/pipeline${qs(dateRange)}`,
      )
      .then((r) => r.data),

  getRouting: () =>
    api.get<AnalyticsRouting>(`/admin/analytics/routing`).then((r) => r.data),
};
