// Период для фильтрации статистики
export type StatsPeriod = "day" | "week" | "month" | "quarter" | "year" | "all";

// Поддерживаемые валюты
export type Currency = "usd" | "eur" | "rub";

// Тип записи платежа
export type PaymentRecordType =
  | "subscription"
  | "subscription_renewal"
  | "donation"
  | "digital_product";

// Статус транзакции
export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

// Направление изменения (для сравнения периодов)
export type ChangeDirection = "up" | "down" | "same";

// Общая сводка по платежам
export interface PaymentsSummary {
  totalPayments: number;
  totalRevenue: number;
  totalRevenueFormatted: string;
  avgPayment: number;
  avgPaymentFormatted: string;
  currency: string;
}

// Статистика подписок
export interface SubscriptionStats {
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  trialUsers: number;
  conversionRate: number;
  churnRate: number;
}

// MRR (Monthly Recurring Revenue)
export interface MRRData {
  currentMRR: number;
  currentMRRFormatted: string;
  previousMRR: number;
  growth: number;
  growthPercent: number;
  projectedARR: number;
  projectedARRFormatted: string;
}

// Точка данных для графика
export interface ChartDataPoint {
  date: string;
  value: number;
  count?: number;
}

// Элемент разбивки
export interface BreakdownItem {
  type?: string;
  period?: string;
  currency?: string;
  count: number;
  revenue: number;
}

// Данные для дашборда
export interface PaymentsDashboardData {
  summary: PaymentsSummary;
  subscriptions: SubscriptionStats;
  mrr: MRRData;
  charts: {
    revenue: ChartDataPoint[];
  };
  breakdown: {
    byType: BreakdownItem[];
    byCurrency: BreakdownItem[];
  };
}

// Бухгалтерский отчёт
export interface AccountingReport {
  period: {
    start: string;
    end: string;
  };
  revenue: {
    total: number;
    byType: Record<PaymentRecordType, number>;
    byCurrency: Record<Currency, number>;
    byPeriod: Record<string, number>;
  };
  transactions: {
    total: number;
    completed: number;
    failed: number;
    refunded: number;
    cancelled: number;
  };
  avgCheck: number;
  currency: string;
}

// Топ плательщик
export interface TopPayer {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  totalSpent: number;
  paymentsCount: number;
  lastPayment: string;
}

// Транзакция для экспорта
export interface ExportTransaction {
  id: string;
  date: string;
  type: PaymentRecordType;
  status: TransactionStatus;
  amount: number;
  amountFormatted: string;
  currency: string;
  period?: "monthly" | "yearly" | "once";
  subscriptionType?: "regular" | "gift" | "trial";
  user: {
    telegramId: number;
    username?: string;
    name: string;
  } | null;
  tributeSubscriptionId?: number;
  tributeProductId?: number;
}

// Ответ экспорта транзакций
export interface ExportTransactionsResponse {
  period: {
    start: string;
    end: string;
  };
  count: number;
  transactions: ExportTransaction[];
}

// Сравнение периодов
export interface PeriodComparison {
  period: StatsPeriod;
  current: PaymentsSummary;
  previous: PaymentsSummary;
  changes: {
    revenue: {
      absolute: number;
      percent: number;
      direction: ChangeDirection;
    };
    payments: {
      absolute: number;
      percent: number;
      direction: ChangeDirection;
    };
  };
}

// Фильтры для запросов
export interface PaymentsFilter {
  period?: StatsPeriod;
  currency?: Currency;
}

export interface AccountingFilter {
  startDate: string;
  endDate: string;
  currency?: Currency;
}
