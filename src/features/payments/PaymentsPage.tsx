import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, Button, Badge, Spinner, Select } from "@/components/ui";
import {
  usePaymentsDashboard,
  usePeriodComparison,
  useTopPayers,
} from "@/hooks/queries/usePayments";
import { formatDateTime } from "@/lib/formatters";
import type {
  StatsPeriod,
  Currency,
  ChangeDirection,
  PaymentRecordType,
} from "@/types";

// Конфиг периодов
const periodOptions: { value: StatsPeriod; label: string }[] = [
  { value: "day", label: "День" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
  { value: "quarter", label: "Квартал" },
  { value: "year", label: "Год" },
];

// Конфиг валют
const currencyOptions: { value: Currency; label: string }[] = [
  { value: "usd", label: "USD ($)" },
  { value: "eur", label: "EUR (€)" },
  { value: "rub", label: "RUB (₽)" },
];

// Лейблы типов платежей
const paymentTypeLabels: Record<PaymentRecordType, string> = {
  subscription: "Подписка",
  subscription_renewal: "Продление",
  donation: "Донат",
  digital_product: "Цифровой товар",
};

// Компонент карточки метрики
function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "text-gray-900",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: ChangeDirection;
  };
  color?: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span className="text-gray-400">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      {trend && (
        <div
          className={`flex items-center text-xs mt-2 ${
            trend.direction === "up"
              ? "text-green-600"
              : trend.direction === "down"
                ? "text-red-600"
                : "text-gray-500"
          }`}
        >
          {trend.direction === "up" && <ArrowUp size={12} className="mr-1" />}
          {trend.direction === "down" && (
            <ArrowDown size={12} className="mr-1" />
          )}
          {trend.value > 0 ? "+" : ""}
          {trend.value.toFixed(1)}% vs прошлый период
        </div>
      )}
    </Card>
  );
}

// Компонент топ плательщика
function TopPayerRow({
  payer,
  rank,
}: {
  payer: {
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    totalSpent: number;
    paymentsCount: number;
    lastPayment: string;
  };
  rank: number;
}) {
  const fullName =
    [payer.firstName, payer.lastName].filter(Boolean).join(" ") || "Без имени";

  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {fullName}
          {payer.username && (
            <span className="text-gray-500 ml-2">@{payer.username}</span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {payer.paymentsCount} платежей
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-green-600">
          ${(payer.totalSpent / 100).toFixed(2)}
        </div>
        <div className="text-xs text-gray-500">
          {formatDateTime(payer.lastPayment).split(",")[0]}
        </div>
      </div>
    </div>
  );
}

export function PaymentsPage() {
  const [currency, setCurrency] = useState<Currency>("usd");
  const [period, setPeriod] = useState<StatsPeriod>("month");

  const {
    data: dashboard,
    isLoading,
    refetch,
  } = usePaymentsDashboard(currency);
  const { data: comparison } = usePeriodComparison(period, currency);
  const { data: topPayers } = useTopPayers(5, period);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Платежи"
        description="Статистика платежей и подписок"
        actions={
          <div className="flex items-center gap-3">
            <Select
              options={periodOptions}
              value={period}
              onChange={(e) => setPeriod(e.target.value as StatsPeriod)}
            />
            <Select
              options={currencyOptions}
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            />
            <Button
              variant="secondary"
              onClick={() => refetch()}
              leftIcon={<RefreshCw size={16} />}
            >
              Обновить
            </Button>
          </div>
        }
      />

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Выручка"
          value={dashboard?.summary.totalRevenueFormatted || "$0"}
          subtitle={`${dashboard?.summary.totalPayments || 0} платежей`}
          icon={<DollarSign size={20} />}
          trend={
            comparison
              ? {
                  value: comparison.changes.revenue.percent,
                  direction: comparison.changes.revenue.direction,
                }
              : undefined
          }
        />
        <MetricCard
          title="MRR"
          value={dashboard?.mrr.currentMRRFormatted || "$0"}
          subtitle={`ARR: ${dashboard?.mrr.projectedARRFormatted || "$0"}`}
          icon={<TrendingUp size={20} />}
          trend={
            dashboard?.mrr.growth !== undefined
              ? {
                  value: dashboard.mrr.growthPercent,
                  direction:
                    dashboard.mrr.growth > 0
                      ? "up"
                      : dashboard.mrr.growth < 0
                        ? "down"
                        : "same",
                }
              : undefined
          }
        />
        <MetricCard
          title="Активные подписки"
          value={dashboard?.subscriptions.activeSubscriptions || 0}
          subtitle={`Churn: ${dashboard?.subscriptions.churnRate || 0}%`}
          icon={<Users size={20} />}
          color="text-green-600"
        />
        <MetricCard
          title="Средний чек"
          value={dashboard?.summary.avgPaymentFormatted || "$0"}
          icon={<CreditCard size={20} />}
        />
      </div>

      {/* Статистика подписок */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Статистика подписок
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Активные</span>
              <Badge variant="success">
                {dashboard?.subscriptions.activeSubscriptions || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Отменённые</span>
              <Badge variant="warning">
                {dashboard?.subscriptions.cancelledSubscriptions || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Истекшие</span>
              <Badge variant="default">
                {dashboard?.subscriptions.expiredSubscriptions || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Trial пользователи</span>
              <Badge variant="info">
                {dashboard?.subscriptions.trialUsers || 0}
              </Badge>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Конверсия Trial → Regular</span>
                <span className="font-medium">
                  {dashboard?.subscriptions.conversionRate || 0}%
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Churn Rate</span>
                <span className="font-medium text-red-600">
                  {dashboard?.subscriptions.churnRate || 0}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Топ плательщиков */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Топ плательщиков
          </h3>
          {topPayers && topPayers.length > 0 ? (
            <div>
              {topPayers.map((payer, index) => (
                <TopPayerRow
                  key={payer.telegramId}
                  payer={payer}
                  rank={index + 1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Нет данных о плательщиках
            </div>
          )}
        </Card>
      </div>

      {/* Разбивки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* По типам платежей */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            По типам платежей
          </h3>
          {dashboard?.breakdown.byType &&
          dashboard.breakdown.byType.length > 0 ? (
            <div className="space-y-3">
              {dashboard.breakdown.byType.map((item) => (
                <div
                  key={item.type}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-600">
                    {paymentTypeLabels[item.type as PaymentRecordType] ||
                      item.type}
                  </span>
                  <div className="text-right">
                    <span className="font-medium">
                      ${(item.revenue / 100).toFixed(2)}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({item.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">Нет данных</div>
          )}
        </Card>

        {/* По валютам */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            По валютам
          </h3>
          {dashboard?.breakdown.byCurrency &&
          dashboard.breakdown.byCurrency.length > 0 ? (
            <div className="space-y-3">
              {dashboard.breakdown.byCurrency.map((item) => (
                <div
                  key={item.currency}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-600 uppercase">
                    {item.currency}
                  </span>
                  <div className="text-right">
                    <span className="font-medium">{item.count} платежей</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">Нет данных</div>
          )}
        </Card>
      </div>

      {/* Сравнение периодов */}
      {comparison && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Сравнение с прошлым периодом
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-2">Текущий период</div>
              <div className="text-2xl font-bold">
                {comparison.current.totalRevenueFormatted}
              </div>
              <div className="text-sm text-gray-500">
                {comparison.current.totalPayments} платежей
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Прошлый период</div>
              <div className="text-2xl font-bold text-gray-400">
                {comparison.previous.totalRevenueFormatted}
              </div>
              <div className="text-sm text-gray-500">
                {comparison.previous.totalPayments} платежей
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
            <div
              className={`p-3 rounded-lg ${
                comparison.changes.revenue.direction === "up"
                  ? "bg-green-50"
                  : comparison.changes.revenue.direction === "down"
                    ? "bg-red-50"
                    : "bg-gray-50"
              }`}
            >
              <div className="text-sm text-gray-600">Изменение выручки</div>
              <div
                className={`text-lg font-bold flex items-center gap-1 ${
                  comparison.changes.revenue.direction === "up"
                    ? "text-green-600"
                    : comparison.changes.revenue.direction === "down"
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                {comparison.changes.revenue.direction === "up" && (
                  <ArrowUp size={18} />
                )}
                {comparison.changes.revenue.direction === "down" && (
                  <ArrowDown size={18} />
                )}
                {comparison.changes.revenue.percent > 0 ? "+" : ""}
                {comparison.changes.revenue.percent.toFixed(1)}%
              </div>
            </div>
            <div
              className={`p-3 rounded-lg ${
                comparison.changes.payments.direction === "up"
                  ? "bg-green-50"
                  : comparison.changes.payments.direction === "down"
                    ? "bg-red-50"
                    : "bg-gray-50"
              }`}
            >
              <div className="text-sm text-gray-600">Изменение платежей</div>
              <div
                className={`text-lg font-bold flex items-center gap-1 ${
                  comparison.changes.payments.direction === "up"
                    ? "text-green-600"
                    : comparison.changes.payments.direction === "down"
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                {comparison.changes.payments.direction === "up" && (
                  <ArrowUp size={18} />
                )}
                {comparison.changes.payments.direction === "down" && (
                  <ArrowDown size={18} />
                )}
                {comparison.changes.payments.percent > 0 ? "+" : ""}
                {comparison.changes.payments.percent.toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
