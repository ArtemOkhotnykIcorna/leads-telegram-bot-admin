import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/api/payments.api";
import type { StatsPeriod, Currency } from "@/types";

const QUERY_KEY = ["payments"];

// Получить все данные дашборда
export function usePaymentsDashboard(currency: Currency = "usd") {
  return useQuery({
    queryKey: [...QUERY_KEY, "dashboard", currency],
    queryFn: () => paymentsApi.getDashboard(currency),
    staleTime: 60 * 1000, // 1 минута
  });
}

// Получить сводку по платежам
export function usePaymentsSummary(
  period: StatsPeriod = "month",
  currency?: Currency,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "summary", period, currency],
    queryFn: () => paymentsApi.getSummary(period, currency),
  });
}

// Получить статистику подписок
export function useSubscriptionStats() {
  return useQuery({
    queryKey: [...QUERY_KEY, "subscriptions"],
    queryFn: paymentsApi.getSubscriptions,
  });
}

// Получить MRR
export function useMRR(currency: Currency = "usd") {
  return useQuery({
    queryKey: [...QUERY_KEY, "mrr", currency],
    queryFn: () => paymentsApi.getMRR(currency),
  });
}

// Получить данные для графика выручки
export function useRevenueChart(
  period: StatsPeriod = "month",
  currency?: Currency,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "charts", "revenue", period, currency],
    queryFn: () => paymentsApi.getRevenueChart(period, currency),
  });
}

// Получить данные для графика подписок
export function useSubscriptionsChart(period: StatsPeriod = "month") {
  return useQuery({
    queryKey: [...QUERY_KEY, "charts", "subscriptions", period],
    queryFn: () => paymentsApi.getSubscriptionsChart(period),
  });
}

// Получить разбивку по типам
export function useBreakdownByType(period: StatsPeriod = "month") {
  return useQuery({
    queryKey: [...QUERY_KEY, "breakdown", "type", period],
    queryFn: () => paymentsApi.getBreakdownByType(period),
  });
}

// Получить разбивку по периодам
export function useBreakdownByPeriod(period: StatsPeriod = "month") {
  return useQuery({
    queryKey: [...QUERY_KEY, "breakdown", "period", period],
    queryFn: () => paymentsApi.getBreakdownByPeriod(period),
  });
}

// Получить разбивку по валютам
export function useBreakdownByCurrency(period: StatsPeriod = "month") {
  return useQuery({
    queryKey: [...QUERY_KEY, "breakdown", "currency", period],
    queryFn: () => paymentsApi.getBreakdownByCurrency(period),
  });
}

// Получить сравнение периодов
export function usePeriodComparison(
  period: StatsPeriod = "month",
  currency: Currency = "usd",
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "compare", period, currency],
    queryFn: () => paymentsApi.comparePeriods(period, currency),
  });
}

// Получить бухгалтерский отчёт
export function useAccountingReport(
  startDate: string,
  endDate: string,
  currency: Currency = "usd",
) {
  return useQuery({
    queryKey: [
      ...QUERY_KEY,
      "accounting",
      "report",
      startDate,
      endDate,
      currency,
    ],
    queryFn: () =>
      paymentsApi.getAccountingReport(startDate, endDate, currency),
    enabled: !!startDate && !!endDate,
  });
}

// Получить топ плательщиков
export function useTopPayers(limit: number = 10, period: StatsPeriod = "all") {
  return useQuery({
    queryKey: [...QUERY_KEY, "top-payers", limit, period],
    queryFn: () => paymentsApi.getTopPayers(limit, period),
  });
}

// Экспорт транзакций
export function useExportTransactions(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, "export", startDate, endDate],
    queryFn: () => paymentsApi.exportTransactions(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}
