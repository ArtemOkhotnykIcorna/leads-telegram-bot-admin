export interface AnalyticsOverview {
  totalLeads: number;
  totalLeadsToday: number;
  totalLeadsWeek: number;
  totalLeadsMonth: number;
  sentLeads?: number;
  failedLeads?: number;
  successRate: number;
  conversionRate?: number;
  averageProcessingTime: number;
  activeGroups: number;
  activeSources: number;
  leadsGrowth?: number;
  conversionGrowth?: number;
  leadsOverTime?: Array<{ date: string; total: number; sent: number }>;
  byStatus?: Array<{ status: string; count: number }>;
  byCountry?: Array<{ name: string; count: number }>;
  bySource?: Array<{ name: string; count: number }>;
  byDirection?: Array<{ name: string; count: number }>;
  topGroups?: Array<{ _id: string; name: string; leadsCount: number }>;
}

export interface AnalyticsUsers {
  totalUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  usersByCountry: {
    countryId: string;
    countryName: string;
    count: number;
  }[];
  usersByDirection: {
    directionId: string;
    directionName: string;
    count: number;
  }[];
}

export interface AnalyticsPayments {
  totalPayments: number;
  totalAmount: number;
  todayAmount: number;
  weekAmount: number;
  monthAmount: number;
  paymentsBySource: {
    sourceId: string;
    sourceName: string;
    count: number;
    amount: number;
  }[];
}

export interface AnalyticsSources {
  sources: {
    sourceId: string;
    sourceName: string;
    totalLeads: number;
    successfulLeads: number;
    failedLeads: number;
    successRate: number;
    lastActivityAt?: string;
  }[];
}

export interface AnalyticsDateRange {
  startDate?: string;
  endDate?: string;
  period?: string;
}

export interface AnalyticsChartData {
  date: string;
  value: number;
  label?: string;
}
