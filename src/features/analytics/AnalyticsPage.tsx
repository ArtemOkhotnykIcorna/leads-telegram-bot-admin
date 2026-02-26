import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  RefreshCw,
  Users,
  TrendingUp,
  FileText,
  Radio,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Zap,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Button,
  Card,
  CardHeader,
  Select,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { StatCard } from "@/components/shared";
import {
  useAnalyticsOverview,
  useAnalyticsRealtime,
  useAnalyticsLeads,
  useAnalyticsLeadsPipeline,
  useAnalyticsUsers,
  useAnalyticsRevenue,
  useAnalyticsGroups,
  useAnalyticsInvites,
  useAnalyticsRouting,
} from "@/hooks/queries/useAnalytics";
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatRelativeTime,
} from "@/lib/formatters";
import { cn } from "@/lib/cn";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
];

const PERIOD_OPTIONS = [
  { value: "day", label: "24 часа" },
  { value: "week", label: "7 дней" },
  { value: "month", label: "30 дней" },
  { value: "year", label: "12 месяцев" },
];

const STATUS_LABELS: Record<string, string> = {
  trial: "Пробный",
  active: "Активный",
  expired: "Истёкший",
  blocked: "Заблокирован",
  new: "Новый",
  processing: "Обработка",
  published: "Опубликован",
  failed: "Ошибка",
  duplicate: "Дубликат",
  skipped: "Пропущен",
  used: "Использован",
  revoked: "Отозван",
};

// ─── Section title ────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
      {children}
    </h3>
  );
}

// ─── Chart wrapper ────────────────────────────────────────────────────────────
function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader title={title} description={description} />
      <div className="h-64">{children}</div>
    </Card>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressRow({
  label,
  rate,
  count,
}: {
  label: string;
  rate: number;
  count: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-sm text-gray-600 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
      <span className="text-sm text-gray-500 w-20 text-right shrink-0">
        {formatPercent(rate)} ({formatNumber(count)})
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — Обзор
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ period }: { period: string }) {
  const {
    data: overview,
    isLoading: loadingOverview,
    refetch,
  } = useAnalyticsOverview({ period });
  const { data: realtime, isLoading: loadingRealtime } = useAnalyticsRealtime();

  if (loadingOverview) return <Spinner size="lg" className="mx-auto mt-16" />;

  const statusData = overview
    ? [
        { name: STATUS_LABELS.trial, value: overview.users.byStatus.trial },
        { name: STATUS_LABELS.active, value: overview.users.byStatus.active },
        { name: STATUS_LABELS.expired, value: overview.users.byStatus.expired },
        { name: STATUS_LABELS.blocked, value: overview.users.byStatus.blocked },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* KPI карточки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Всего пользователей"
          value={formatNumber(overview?.users.total ?? 0)}
          icon={<Users size={24} />}
          description={
            overview ? `+${formatNumber(overview.users.new)} новых` : undefined
          }
          trend={overview?.users.newGrowth ?? undefined}
        />
        <StatCard
          title="Лиды"
          value={formatNumber(overview?.leads.total ?? 0)}
          icon={<FileText size={24} />}
          description={
            overview ? `+${formatNumber(overview.leads.new)} новых` : undefined
          }
          trend={overview?.leads.newGrowth ?? undefined}
        />
        <StatCard
          title="Выручка"
          value={formatCurrency(overview?.revenue.total ?? 0)}
          icon={<TrendingUp size={24} />}
          description={`${overview?.revenue.paymentsCount ?? 0} платежей`}
          trend={overview?.revenue.growth ?? undefined}
        />
        <StatCard
          title="Источники"
          value={`${overview?.sources.active ?? 0} / ${overview?.sources.total ?? 0}`}
          icon={<Radio size={24} />}
          description="активных / всего"
        />
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Пользователи по статусам */}
        <ChartCard title="Пользователи по статусам подписки">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatNumber(Number(v))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Лиды по часам (realtime) */}
        <ChartCard title="Лиды по часам" description="Последние 24 часа">
          {loadingRealtime ? (
            <Spinner size="sm" className="mx-auto mt-16" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realtime?.leadsPerHour ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(v) => v.slice(11, 16)} />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Лидов"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Выручка по валютам */}
      {overview?.revenue.byCurrency &&
        Object.keys(overview.revenue.byCurrency).length > 0 && (
          <Card>
            <CardHeader title="Выручка по валютам" />
            <div className="flex flex-wrap gap-4">
              {Object.entries(overview.revenue.byCurrency).map(
                ([currency, amount]) => (
                  <div
                    key={currency}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <span className="text-sm font-medium text-gray-500 uppercase">
                      {currency}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(amount, currency.toUpperCase())}
                    </span>
                  </div>
                ),
              )}
            </div>
          </Card>
        )}

      {/* Живая лента лидов */}
      {(realtime?.recentLeads?.length ?? 0) > 0 && (
        <Card>
          <CardHeader
            title="Последние лиды"
            description={
              realtime
                ? `${realtime.leadsLast1h} за последний час · ${realtime.newUsersLast24h} новых пользователей за 24 ч`
                : undefined
            }
            action={
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <Activity size={14} />
                Live
              </span>
            }
          />
          <div className="space-y-2">
            {realtime?.recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium truncate">
                    {lead.title || "—"}
                  </span>
                  <span className="text-gray-400 shrink-0">
                    {STATUS_LABELS[lead.status] ?? lead.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {lead.hasPhone && (
                    <Phone size={13} className="text-blue-500" />
                  )}
                  {lead.hasTelegram && (
                    <Zap size={13} className="text-purple-500" />
                  )}
                  {lead.hasTelegram || lead.hasPhone ? null : (
                    <Mail size={13} className="text-gray-400" />
                  )}
                  <span className="text-gray-400">
                    {formatRelativeTime(lead.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw size={14} />}
        >
          Обновить обзор
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — Лиды
// ─────────────────────────────────────────────────────────────────────────────
function LeadsTab({ period }: { period: string }) {
  const { data: leads, isLoading: loadingLeads } = useAnalyticsLeads({
    period,
  });
  const { data: pipeline, isLoading: loadingPipeline } =
    useAnalyticsLeadsPipeline({ period });

  if (loadingLeads || loadingPipeline)
    return <Spinner size="lg" className="mx-auto mt-16" />;

  const statusData = leads?.totals.byStatus ?? [];

  return (
    <div className="space-y-6">
      {/* Pipeline воронка */}
      {pipeline && (
        <div>
          <SectionTitle>Воронка обработки</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "Всего",
                value: pipeline.funnel.total,
                icon: <FileText size={18} />,
                color: "text-gray-600",
              },
              {
                label: "Новых",
                value: pipeline.funnel.new,
                icon: <Zap size={18} />,
                color: "text-blue-600",
              },
              {
                label: "Обработка",
                value: pipeline.funnel.processing,
                icon: <Clock size={18} />,
                color: "text-yellow-600",
              },
              {
                label: "Опубликовано",
                value: pipeline.funnel.published,
                icon: <CheckCircle size={18} />,
                color: "text-green-600",
                sub: formatPercent(pipeline.funnel.publishedRate),
              },
              {
                label: "Ошибок",
                value: pipeline.funnel.failed,
                icon: <XCircle size={18} />,
                color: "text-red-600",
                sub: formatPercent(pipeline.funnel.failedRate),
              },
              {
                label: "Дубликатов",
                value: pipeline.funnel.duplicate,
                icon: <FileText size={18} />,
                color: "text-orange-500",
                sub: formatPercent(pipeline.funnel.duplicateRate),
              },
            ].map(({ label, value, icon, color, sub }) => (
              <Card key={label} padding="sm">
                <div className={cn("mb-1", color)}>{icon}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(value)}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                {sub && (
                  <div className={cn("text-xs font-medium mt-0.5", color)}>
                    {sub}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Задержка обработки */}
      {pipeline?.processingDelay && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="sm">
            <p className="text-xs text-gray-500">Ср. задержка</p>
            <p className="text-2xl font-bold">
              {pipeline.processingDelay.avgDelayMinutes.toFixed(1)} мин
            </p>
          </Card>
          <Card padding="sm">
            <p className="text-xs text-gray-500">Мин. задержка</p>
            <p className="text-2xl font-bold">
              {pipeline.processingDelay.minDelayMinutes.toFixed(1)} мин
            </p>
          </Card>
          <Card padding="sm">
            <p className="text-xs text-gray-500">Макс. задержка</p>
            <p className="text-2xl font-bold">
              {pipeline.processingDelay.maxDelayMinutes.toFixed(1)} мин
            </p>
          </Card>
        </div>
      )}

      {/* Таймлайн и статусы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Лиды по времени">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={leads?.timeline ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                name="Лидов"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="По статусам">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                label={({ name, percent }) =>
                  `${STATUS_LABELS[name] ?? name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, name) => [
                  formatNumber(Number(v)),
                  STATUS_LABELS[String(name)] ?? name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Покрытие контактными данными */}
      {leads?.contactCoverage && (
        <Card>
          <CardHeader title="Покрытие контактными данными" />
          <div className="space-y-3">
            <ProgressRow
              label="Хотя бы 1 контакт"
              rate={leads.contactCoverage.withAnyRate}
              count={leads.contactCoverage.withAny}
            />
            <ProgressRow
              label="Телефон"
              rate={leads.contactCoverage.withPhoneRate}
              count={leads.contactCoverage.withPhone}
            />
            <ProgressRow
              label="Telegram"
              rate={leads.contactCoverage.withTelegramRate}
              count={leads.contactCoverage.withTelegram}
            />
            <ProgressRow
              label="Email"
              rate={leads.contactCoverage.withEmailRate}
              count={leads.contactCoverage.withEmail}
            />
            <ProgressRow
              label="Имя"
              rate={leads.contactCoverage.withNameRate}
              count={leads.contactCoverage.withName}
            />
          </div>
        </Card>
      )}

      {/* Топ источников */}
      {(leads?.bySource?.length ?? 0) > 0 && (
        <ChartCard title="Топ источников по лидам">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={leads?.bySource?.slice(0, 10) ?? []}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(v, name) => [formatNumber(Number(v)), name]}
              />
              <Legend />
              <Bar dataKey="count" name="Лидов" fill="#3B82F6" />
              <Bar dataKey="published" name="Опубликовано" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3 — Пользователи & Доходы
// ─────────────────────────────────────────────────────────────────────────────
function UsersRevenueTab({ period }: { period: string }) {
  const { data: users, isLoading: loadingUsers } = useAnalyticsUsers({
    period,
  });
  const { data: revenue, isLoading: loadingRevenue } = useAnalyticsRevenue({
    period,
  });

  if (loadingUsers || loadingRevenue)
    return <Spinner size="lg" className="mx-auto mt-16" />;

  return (
    <div className="space-y-6">
      {/* Пользователи KPI */}
      <div>
        <SectionTitle>Пользователи</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Всего", value: users?.totals.total ?? 0 },
            { label: "Пробные", value: users?.totals.trial ?? 0 },
            { label: "Активные", value: users?.totals.active ?? 0 },
            { label: "Истёкшие", value: users?.totals.expired ?? 0 },
            { label: "Заблокированы", value: users?.totals.blocked ?? 0 },
            {
              label: "Trial конверсия",
              value: `${(users?.conversion.rate ?? 0).toFixed(1)}%`,
            },
          ].map(({ label, value }) => (
            <Card key={label} padding="sm">
              <div className="text-2xl font-bold text-gray-900">
                {typeof value === "number" ? formatNumber(value) : value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Конверсия */}
      {users?.conversion && (
        <Card>
          <CardHeader title="Конверсия Trial → Active" />
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {formatNumber(users.conversion.trialStarted)}
              </div>
              <div className="text-sm text-gray-500">Начали trial</div>
            </div>
            <div className="flex-1 relative">
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${Math.min(users.conversion.rate, 100)}%` }}
                />
              </div>
              <div className="text-center text-sm font-semibold text-green-600 mt-1">
                {formatPercent(users.conversion.rate)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatNumber(users.conversion.trialConverted)}
              </div>
              <div className="text-sm text-gray-500">Перешли в active</div>
            </div>
          </div>
        </Card>
      )}

      {/* Таймлайны */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Регистрации пользователей">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={users?.timeline ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                name="Регистраций"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Выручка во времени">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue?.timeline ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(v, name) =>
                  name === "Сумма"
                    ? [formatNumber(Number(v)), name]
                    : [formatNumber(Number(v)), name]
                }
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="amount"
                name="Сумма"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="count"
                name="Платежей"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Выручка KPI */}
      {revenue && (
        <div>
          <SectionTitle>Выручка</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Общая сумма",
                value: formatCurrency(revenue.totals.totalAmount),
              },
              {
                label: "Кол-во платежей",
                value: formatNumber(revenue.totals.totalCount),
              },
              {
                label: "Средний чек",
                value: formatCurrency(revenue.totals.avgAmount),
              },
              {
                label: "Макс. платёж",
                value: formatCurrency(revenue.totals.maxAmount),
              },
            ].map(({ label, value }) => (
              <StatCard
                key={label}
                title={label}
                value={value}
                icon={<TrendingUp size={20} />}
              />
            ))}
          </div>
        </div>
      )}

      {/* По валютам и по планам */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(revenue?.byCurrency?.length ?? 0) > 0 && (
          <ChartCard title="Выручка по валютам">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenue?.byCurrency ?? []}
                  dataKey="amount"
                  nameKey="currency"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name.toUpperCase()} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {revenue?.byCurrency?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatNumber(Number(v))} />
                <Legend formatter={(name) => name.toUpperCase()} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {(revenue?.bySubscriptionPlan?.length ?? 0) > 0 && (
          <ChartCard title="Топ тарифов по выручке">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue?.bySubscriptionPlan?.slice(0, 8) ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(v) => formatNumber(Number(v))} />
                <Legend />
                <Bar dataKey="amount" name="Сумма" fill="#8B5CF6" />
                <Bar dataKey="count" name="Покупок" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Топ направлений и стран */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(users?.byCountry?.length ?? 0) > 0 && (
          <ChartCard title="Топ стран по пользователям">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={users?.byCountry?.slice(0, 8) ?? []}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(v) => formatNumber(Number(v))} />
                <Bar dataKey="count" name="Пользователей" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {(users?.byDirection?.length ?? 0) > 0 && (
          <ChartCard title="Топ направлений">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={users?.byDirection?.slice(0, 8) ?? []}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(v) => formatNumber(Number(v))} />
                <Bar dataKey="count" name="Пользователей" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 4 — Группы & Маршрутизация
// ─────────────────────────────────────────────────────────────────────────────
function GroupsTab({ period }: { period: string }) {
  const { data: groups, isLoading: loadingGroups } = useAnalyticsGroups({
    period,
  });
  const { data: invites, isLoading: loadingInvites } = useAnalyticsInvites({
    period,
  });
  const { data: routing, isLoading: loadingRouting } = useAnalyticsRouting();

  if (loadingGroups || loadingInvites || loadingRouting)
    return <Spinner size="lg" className="mx-auto mt-16" />;

  const inviteStatusData = invites?.byStatus ?? [];

  return (
    <div className="space-y-6">
      {/* Группы KPI */}
      {groups && (
        <div>
          <SectionTitle>Группы</SectionTitle>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              title="Всего групп"
              value={formatNumber(groups.totals.total)}
              icon={<Users size={20} />}
            />
            <StatCard
              title="Активных"
              value={formatNumber(groups.totals.active)}
              icon={<CheckCircle size={20} />}
            />
            <StatCard
              title="Неактивных"
              value={formatNumber(groups.totals.inactive)}
              icon={<XCircle size={20} />}
            />
          </div>
        </div>
      )}

      {/* Publikacii vs invites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Публикации и инвайты во времени">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={(groups?.publishTimeline ?? []).map((p, i) => ({
                date: p.date,
                publications: p.count,
                invites: groups?.inviteTimeline?.[i]?.count ?? 0,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="publications"
                name="Публикации"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="invites"
                name="Инвайты"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Статусы инвайтов */}
        <ChartCard title="Статусы инвайтов">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={inviteStatusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                label={({ name, percent }) =>
                  `${STATUS_LABELS[name] ?? name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {inviteStatusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, name) => [
                  formatNumber(Number(v)),
                  STATUS_LABELS[String(name)] ?? name,
                ]}
              />
              <Legend formatter={(name) => STATUS_LABELS[name] ?? name} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Инвайты KPI */}
      {invites && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Всего инвайтов"
            value={formatNumber(invites.totals.total)}
            icon={<Zap size={20} />}
          />
          <StatCard
            title="Использовано"
            value={formatNumber(invites.totals.used)}
            icon={<CheckCircle size={20} />}
          />
          <StatCard
            title="Конверсия"
            value={formatPercent(invites.totals.overallConversionRate)}
            icon={<TrendingUp size={20} />}
          />
          <StatCard
            title="Ср. скорость"
            value={`${invites.conversionSpeed.avgHours.toFixed(1)} ч`}
            icon={<Clock size={20} />}
            description="до использования"
          />
        </div>
      )}

      {/* Топ групп по публикациям */}
      {(groups?.topByPublished?.length ?? 0) > 0 && (
        <ChartCard title="Топ групп по публикациям" className="">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={groups?.topByPublished?.slice(0, 10) ?? []}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={140}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v) => formatNumber(Number(v))} />
              <Legend />
              <Bar
                dataKey="leadsPublished"
                name="Опубликовано"
                fill="#3B82F6"
              />
              <Bar dataKey="invitesGenerated" name="Инвайтов" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Маршрутизация */}
      {routing && (
        <div>
          <SectionTitle>Маршрутизация</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatCard
              title="Правил"
              value={formatNumber(routing.totals.totalRules)}
              icon={<Activity size={20} />}
            />
            <StatCard
              title="Активных"
              value={formatNumber(routing.totals.activeRules)}
              icon={<CheckCircle size={20} />}
            />
            <StatCard
              title="Обработано лидов"
              value={formatNumber(routing.totals.totalRouted)}
              icon={<FileText size={20} />}
            />
            <StatCard
              title="Неактивных"
              value={formatNumber(routing.totals.inactiveRules)}
              icon={<XCircle size={20} />}
            />
          </div>

          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Правило
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Стратегия
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">
                      Приоритет
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">
                      Статус
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Лидов
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Групп
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {routing.rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {rule.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {{
                          all: "Всем",
                          round_robin: "Round-robin",
                          random: "Случайно",
                          weighted: "Взвешенный",
                        }[rule.distributionMode] ?? rule.distributionMode}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {rule.priority}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            rule.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600",
                          )}
                        >
                          {rule.isActive ? "Активно" : "Неактивно"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatNumber(rule.leadsRouted)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rule.targetGroupsCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export function AnalyticsPage() {
  const [tab, setTab] = useState("overview");
  const [period, setPeriod] = useState("month");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Аналитика"
        description="Статистика и графики по работе системы"
        actions={
          <Select
            options={PERIOD_OPTIONS}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="leads">Лиды</TabsTrigger>
          <TabsTrigger value="users">Пользователи & Доходы</TabsTrigger>
          <TabsTrigger value="groups">Группы & Маршрутизация</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab period={period} />
        </TabsContent>
        <TabsContent value="leads">
          <LeadsTab period={period} />
        </TabsContent>
        <TabsContent value="users">
          <UsersRevenueTab period={period} />
        </TabsContent>
        <TabsContent value="groups">
          <GroupsTab period={period} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
