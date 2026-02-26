// ─── Overview ────────────────────────────────────────────────────────────────
export interface AnalyticsOverview {
  period: string;
  users: {
    total: number;
    new: number;
    newGrowth: number | null;
    byStatus: {
      trial: number;
      active: number;
      expired: number;
      blocked: number;
    };
    activeRate: number;
  };
  revenue: {
    total: number;
    previous: number;
    growth: number | null;
    byCurrency: Record<string, number>;
    paymentsCount: number;
  };
  leads: {
    total: number;
    new: number;
    newGrowth: number | null;
  };
  sources: {
    total: number;
    active: number;
  };
}

// ─── Users ───────────────────────────────────────────────────────────────────
export interface AnalyticsUsers {
  period: string;
  granularity: string;
  timeline: { date: string; count: number }[];
  totals: {
    total: number;
    trial: number;
    active: number;
    expired: number;
    blocked: number;
    trialUsed: number;
  };
  conversion: {
    trialStarted: number;
    trialConverted: number;
    rate: number;
  };
  byCountry: { id: string; name: string; flag: string; count: number }[];
  byDirection: { id: string; name: string; slug: string; count: number }[];
}

// ─── Revenue ─────────────────────────────────────────────────────────────────
export interface AnalyticsRevenue {
  period: string;
  granularity: string;
  timeline: { date: string; count: number; amount: number }[];
  totals: {
    totalCount: number;
    totalAmount: number;
    avgAmount: number;
    maxAmount: number;
    minAmount: number;
  };
  byCurrency: { currency: string; count: number; amount: number }[];
  byRecordType: { recordType: string; count: number; amount: number }[];
  bySubscriptionPlan: { name: string; count: number; amount: number }[];
  mrr: Record<string, number>;
}

// ─── Leads ───────────────────────────────────────────────────────────────────
export interface AnalyticsLeads {
  period: string;
  granularity: string;
  timeline: { date: string; count: number }[];
  totals: {
    total: number;
    byStatus: { status: string; count: number }[];
  };
  contactCoverage: {
    total: number;
    withAny: number;
    withAnyRate: number;
    withPhone: number;
    withPhoneRate: number;
    withTelegram: number;
    withTelegramRate: number;
    withEmail: number;
    withEmailRate: number;
    withName: number;
    withNameRate: number;
  };
  bySource: {
    sourceId: string;
    name: string;
    slug: string;
    type: string;
    count: number;
    published: number;
    publishRate: number;
  }[];
  byDirection: {
    directionId: string;
    name: string;
    slug: string;
    count: number;
  }[];
}

// ─── Sources ─────────────────────────────────────────────────────────────────
export interface AnalyticsSources {
  total: number;
  active: number;
  inactive: number;
  totalLeads: number;
  byType: { type: string; count: number; active: number; totalLeads: number }[];
  mtprotoStatus: { status: string; count: number }[];
  topSources: {
    id: string;
    name: string;
    slug: string;
    type: string;
    leadsCount: number;
    percentage: number;
    isActive: boolean;
    collectionMethod: string;
    mtprotoStatus?: string;
  }[];
}

// ─── Retention ───────────────────────────────────────────────────────────────
export interface AnalyticsRetention {
  newSubscriptions: { month: string; count: number; revenue: number }[];
  expiredSubscriptions: { month: string; count: number }[];
  cancelledSubscriptions: { month: string; count: number }[];
}

// ─── Realtime ─────────────────────────────────────────────────────────────────
export interface AnalyticsRealtime {
  leadsPerHour: { hour: string; count: number }[];
  leadsLast1h: number;
  newUsersLast24h: number;
  recentLeads: {
    id: string;
    title: string;
    status: string;
    hasPhone: boolean;
    hasTelegram: boolean;
    createdAt: string;
  }[];
}

// ─── Groups ──────────────────────────────────────────────────────────────────
export interface AnalyticsGroups {
  period: string;
  totals: { total: number; active: number; inactive: number };
  topByPublished: {
    id: string;
    name: string;
    leadsPublished: number;
    invitesGenerated: number;
    lastPublishedAt: string | null;
    directionName: string;
    countryName: string;
    countryFlag: string;
    isActive: boolean;
  }[];
  byDirection: {
    directionId: string;
    directionName: string;
    groupsCount: number;
    activeCount: number;
    totalPublished: number;
    totalInvites: number;
  }[];
  byCountry: {
    countryId: string;
    countryName: string;
    countryFlag: string;
    groupsCount: number;
    totalPublished: number;
  }[];
  publishTimeline: { date: string; count: number }[];
  inviteTimeline: { date: string; count: number }[];
}

// ─── Invites ─────────────────────────────────────────────────────────────────
export interface AnalyticsInvites {
  period: string;
  granularity: string;
  totals: {
    total: number;
    active: number;
    used: number;
    expired: number;
    revoked: number;
    overallConversionRate: number;
  };
  conversionSpeed: {
    avgHours: number;
    minHours: number;
    maxHours: number;
    count: number;
  };
  timeline: {
    date: string;
    created: number;
    used: number;
    conversionRate: number;
  }[];
  byStatus: { status: string; count: number }[];
  byGroup: {
    groupId: string;
    groupName: string;
    total: number;
    used: number;
    conversionRate: number;
  }[];
}

// ─── Leads Pipeline ───────────────────────────────────────────────────────────
export interface AnalyticsLeadsPipeline {
  period: string;
  granularity: string;
  funnel: {
    total: number;
    new: number;
    processing: number;
    published: number;
    failed: number;
    duplicate: number;
    skipped: number;
    publishedRate: number;
    failedRate: number;
    duplicateRate: number;
    skippedRate: number;
  };
  publishSuccess: {
    totalAttempts: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  processingDelay: {
    avgDelayMinutes: number;
    minDelayMinutes: number;
    maxDelayMinutes: number;
    count: number;
  };
  attemptsDistribution: { attempts: number; count: number }[];
  errorTimeline: { date: string; count: number }[];
}

// ─── Routing ─────────────────────────────────────────────────────────────────
export interface AnalyticsRouting {
  totals: {
    totalRules: number;
    activeRules: number;
    inactiveRules: number;
    totalRouted: number;
  };
  rules: {
    id: string;
    name: string;
    distributionMode: "all" | "round_robin" | "random" | "weighted";
    priority: number;
    isActive: boolean;
    leadsRouted: number;
    targetGroupsCount: number;
  }[];
  byDistributionMode: {
    mode: string;
    count: number;
    activeCount: number;
    totalRouted: number;
  }[];
  directionCoverage: {
    directionId: string;
    directionName: string;
    rulesCount: number;
    totalRouted: number;
  }[];
}

// ─── Shared ───────────────────────────────────────────────────────────────────
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

// Keep legacy payments type for API compatibility
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
