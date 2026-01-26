import { useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/layout";
import { Button, Card, Select, Spinner } from "@/components/ui";
import { StatCard } from "@/components/shared";
import { useAnalytics, useAnalyticsStats } from "@/hooks/queries/useAnalytics";
import { formatNumber } from "@/lib/formatters";
import { Users, TrendingUp, Send, AlertCircle } from "lucide-react";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const periodOptions = [
  { value: "7d", label: "Последние 7 дней" },
  { value: "30d", label: "Последние 30 дней" },
  { value: "90d", label: "Последние 90 дней" },
];

export function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");

  const { data: analytics, isLoading, refetch } = useAnalytics(period);
  const { data: stats } = useAnalyticsStats(period);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Аналитика"
        description="Статистика и графики по лидам"
        actions={
          <div className="flex gap-2">
            <Select
              options={periodOptions}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Всего лидов"
          value={formatNumber(stats?.totalLeads || 0)}
          icon={<Users size={24} />}
          trend={stats?.leadsGrowth}
        />
        <StatCard
          title="Отправлено"
          value={formatNumber(stats?.sentLeads || 0)}
          icon={<Send size={24} />}
          description={`${stats?.successRate?.toFixed(1) || 0}% успешных`}
        />
        <StatCard
          title="Конверсия"
          value={`${stats?.conversionRate?.toFixed(1) || 0}%`}
          icon={<TrendingUp size={24} />}
          trend={stats?.conversionGrowth}
        />
        <StatCard
          title="Ошибок"
          value={formatNumber(stats?.failedLeads || 0)}
          icon={<AlertCircle size={24} />}
          variant={
            stats?.failedLeads && stats.failedLeads > 10 ? "danger" : "default"
          }
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Over Time */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Лиды по дням</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.leadsOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Всего"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  name="Отправлено"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* By Status */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">По статусам</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.byStatus || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {analytics?.byStatus?.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* By Country */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">По странам</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.byCountry?.slice(0, 10) || []}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" name="Лидов" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* By Source */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">По источникам</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.bySource || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Лидов" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* By Direction */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">По направлениям</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.byDirection || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Лидов"
                  stroke="#F59E0B"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Groups Performance */}
      {analytics?.topGroups && analytics.topGroups.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">
            Топ групп по получению лидов
          </h3>
          <div className="space-y-3">
            {analytics.topGroups.map((group, index) => (
              <div
                key={group._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold">
                    {index + 1}
                  </span>
                  <span className="font-medium">{group.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-lg">
                    {formatNumber(group.leadsCount)}
                  </span>
                  <span className="text-gray-500 ml-1">лидов</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
