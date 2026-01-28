import api from "./axios";
import type {
  PaymentsSummary,
  SubscriptionStats,
  MRRData,
  PaymentsDashboardData,
  ChartDataPoint,
  BreakdownItem,
  AccountingReport,
  TopPayer,
  ExportTransactionsResponse,
  PeriodComparison,
  StatsPeriod,
  Currency,
} from "@/types";

export const paymentsApi = {
  // === Overview Endpoints ===

  // Общая сводка по платежам
  getSummary: async (
    period: StatsPeriod = "month",
    currency?: Currency,
  ): Promise<PaymentsSummary> => {
    const params: Record<string, string> = { period };
    if (currency) params.currency = currency;
    const { data } = await api.get<PaymentsSummary>("/admin/payments/summary", {
      params,
    });
    return data;
  },

  // Статистика подписок
  getSubscriptions: async (): Promise<SubscriptionStats> => {
    const { data } = await api.get<SubscriptionStats>(
      "/admin/payments/subscriptions",
    );
    return data;
  },

  // MRR метрики
  getMRR: async (currency: Currency = "usd"): Promise<MRRData> => {
    const { data } = await api.get<MRRData>("/admin/payments/mrr", {
      params: { currency },
    });
    return data;
  },

  // Все данные для дашборда (включая topPayers и comparison)
  getDashboard: async (
    period: StatsPeriod = "month",
    currency: Currency = "usd",
  ): Promise<PaymentsDashboardData> => {
    const { data } = await api.get<PaymentsDashboardData>(
      "/admin/payments/dashboard",
      { params: { period, currency } },
    );
    return data;
  },

  // Debug endpoint для отладки данных
  getDebug: async (): Promise<unknown> => {
    const { data } = await api.get("/admin/payments/debug");
    return data;
  },

  // === Charts Endpoints ===

  // Данные для графика выручки
  getRevenueChart: async (
    period: StatsPeriod = "month",
    currency?: Currency,
  ): Promise<ChartDataPoint[]> => {
    const params: Record<string, string> = { period };
    if (currency) params.currency = currency;
    const { data } = await api.get<ChartDataPoint[]>(
      "/admin/payments/charts/revenue",
      { params },
    );
    return data;
  },

  // Данные для графика подписок
  getSubscriptionsChart: async (
    period: StatsPeriod = "month",
  ): Promise<ChartDataPoint[]> => {
    const { data } = await api.get<ChartDataPoint[]>(
      "/admin/payments/charts/subscriptions",
      { params: { period } },
    );
    return data;
  },

  // === Breakdown Endpoints ===

  // Разбивка по типам платежей
  getBreakdownByType: async (
    period: StatsPeriod = "month",
  ): Promise<BreakdownItem[]> => {
    const { data } = await api.get<BreakdownItem[]>(
      "/admin/payments/breakdown/type",
      { params: { period } },
    );
    return data;
  },

  // Разбивка по периодам подписки
  getBreakdownByPeriod: async (
    period: StatsPeriod = "month",
  ): Promise<BreakdownItem[]> => {
    const { data } = await api.get<BreakdownItem[]>(
      "/admin/payments/breakdown/period",
      { params: { period } },
    );
    return data;
  },

  // Разбивка по валютам
  getBreakdownByCurrency: async (
    period: StatsPeriod = "month",
  ): Promise<BreakdownItem[]> => {
    const { data } = await api.get<BreakdownItem[]>(
      "/admin/payments/breakdown/currency",
      { params: { period } },
    );
    return data;
  },

  // === Accounting Endpoints ===

  // Бухгалтерский отчёт
  getAccountingReport: async (
    startDate: string,
    endDate: string,
    currency: Currency = "usd",
  ): Promise<AccountingReport> => {
    const { data } = await api.get<AccountingReport>(
      "/admin/payments/accounting/report",
      { params: { startDate, endDate, currency } },
    );
    return data;
  },

  // Топ плательщиков
  getTopPayers: async (
    limit: number = 10,
    period: StatsPeriod = "all",
  ): Promise<TopPayer[]> => {
    const { data } = await api.get<TopPayer[]>(
      "/admin/payments/accounting/top-payers",
      { params: { limit, period } },
    );
    return data;
  },

  // Экспорт транзакций
  exportTransactions: async (
    startDate: string,
    endDate: string,
  ): Promise<ExportTransactionsResponse> => {
    const { data } = await api.get<ExportTransactionsResponse>(
      "/admin/payments/accounting/export",
      { params: { startDate, endDate } },
    );
    return data;
  },

  // === Comparison Endpoint ===

  // Сравнение периодов
  comparePeriods: async (
    period: StatsPeriod = "month",
    currency: Currency = "usd",
  ): Promise<PeriodComparison> => {
    const { data } = await api.get<PeriodComparison>(
      "/admin/payments/compare",
      { params: { period, currency } },
    );
    return data;
  },
};
