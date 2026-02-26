import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api";
import type { AnalyticsDateRange } from "@/types";

const KEY = ["analytics"];

const STALE = {
  overview: 5 * 60 * 1000,
  users: 5 * 60 * 1000,
  revenue: 5 * 60 * 1000,
  leads: 2 * 60 * 1000,
  sources: 10 * 60 * 1000,
  retention: 30 * 60 * 1000,
  realtime: 60 * 1000,
  groups: 5 * 60 * 1000,
  invites: 2 * 60 * 1000,
  pipeline: 2 * 60 * 1000,
  routing: 15 * 60 * 1000,
};

export function useAnalyticsOverview(dateRange?: AnalyticsDateRange) {
  return useQuery({
    queryKey: [...KEY, "overview", dateRange],
    queryFn: () => analyticsApi.getOverview(dateRange),
    staleTime: STALE.overview,
  });
}

export function useAnalyticsUsers(dateRange?: AnalyticsDateRange) {
  return useQuery({
    queryKey: [...KEY, "users", dateRange],
    queryFn: () => analyticsApi.getUsers(dateRange),
    staleTime: STALE.users,
  });
}

export function useAnalyticsRevenue(dateRange?: AnalyticsDateRange) {
  return useQuery({
    queryKey: [...KEY, "revenue", dateRange],
    queryFn: () => analyticsApi.getRevenue(dateRange),
    staleTime: STALE.revenue,
  });
}

export function useAnalyticsLeads(dateRange?: AnalyticsDateRange) {
  return useQuery({
    queryKey: [...KEY, "leads", dateRange],
    queryFn: () => analyticsApi.getLeads(dateRange),
    staleTime: STALE.leads,
  });
}

export function useAnalyticsSources() {
  return useQuery({
    queryKey: [...KEY, "sources"],
    queryFn: () => analyticsApi.getSources(),
    staleTime: STALE.sources,
  });
}

export function useAnalyticsRetention() {
  return useQuery({
    queryKey: [...KEY, "retention"],
    queryFn: () => analyticsApi.getRetention(),
    staleTime: STALE.retention,
  });
}

export function useAnalyticsRealtime() {
  return useQuery({
    queryKey: [...KEY, "realtime"],
    queryFn: () => analyticsApi.getRealtime(),
    staleTime: 0,
    refetchInterval: STALE.realtime,
  });
}

export function useAnalyticsGroups(dateRange?: AnalyticsDateRange) {
  return useQuery({
    queryKey: [...KEY, "groups", dateRange],
    queryFn: () => analyticsApi.getGroups(dateRange),
    staleTime: STALE.groups,
  });
}

export function useAnalyticsInvites(dateRange?: AnalyticsDateRange) {
  return useQuery({
    queryKey: [...KEY, "invites", dateRange],
    queryFn: () => analyticsApi.getInvites(dateRange),
    staleTime: STALE.invites,
  });
}

export function useAnalyticsLeadsPipeline(dateRange?: AnalyticsDateRange) {
  return useQuery({
    queryKey: [...KEY, "pipeline", dateRange],
    queryFn: () => analyticsApi.getLeadsPipeline(dateRange),
    staleTime: STALE.pipeline,
  });
}

export function useAnalyticsRouting() {
  return useQuery({
    queryKey: [...KEY, "routing"],
    queryFn: () => analyticsApi.getRouting(),
    staleTime: STALE.routing,
  });
}
