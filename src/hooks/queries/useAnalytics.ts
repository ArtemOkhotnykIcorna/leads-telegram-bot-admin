import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api";
import type { AnalyticsDateRange } from "@/types";

const QUERY_KEY = ["analytics"];

export function useAnalyticsOverview(dateRange?: AnalyticsDateRange) {
  return useQuery({
    queryKey: [...QUERY_KEY, "overview", dateRange],
    queryFn: () => analyticsApi.getOverview(dateRange),
  });
}

export function useAnalyticsUsers(dateRange?: AnalyticsDateRange) {
  return useQuery({
    queryKey: [...QUERY_KEY, "users", dateRange],
    queryFn: () => analyticsApi.getUsers(dateRange),
  });
}

export function useAnalyticsPayments(dateRange?: AnalyticsDateRange) {
  return useQuery({
    queryKey: [...QUERY_KEY, "payments", dateRange],
    queryFn: () => analyticsApi.getPayments(dateRange),
  });
}

export function useAnalyticsSources(dateRange?: AnalyticsDateRange) {
  return useQuery({
    queryKey: [...QUERY_KEY, "sources", dateRange],
    queryFn: () => analyticsApi.getSources(dateRange),
  });
}

// Alias for AnalyticsPage compatibility
export function useAnalytics(period: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, "data", period],
    queryFn: () => analyticsApi.getOverview({ period }),
  });
}

export function useAnalyticsStats(period: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, "stats", period],
    queryFn: () => analyticsApi.getOverview({ period }),
    select: (data) => ({
      totalLeads: data?.totalLeads || 0,
      sentLeads: data?.sentLeads || 0,
      failedLeads: data?.failedLeads || 0,
      successRate: data?.successRate || 0,
      conversionRate: data?.conversionRate || 0,
      leadsGrowth: data?.leadsGrowth,
      conversionGrowth: data?.conversionGrowth,
    }),
  });
}
