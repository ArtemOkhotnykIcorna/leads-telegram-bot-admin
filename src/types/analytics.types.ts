export interface AnalyticsOverview {
  users: {
    total: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    freeUsers: number;
  };
  payments: {
    total: number;
    revenue: number;
  };
  leads: {
    total: number;
  };
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
