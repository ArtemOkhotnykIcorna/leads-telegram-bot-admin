import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button, Spinner } from "@/components/ui";
import { StatCard } from "@/components/shared";
import { useAnalyticsStats } from "@/hooks/queries/useAnalytics";
import { formatNumber, formatCurrency } from "@/lib/formatters";
import { Users, CreditCard, FileText, UserCheck } from "lucide-react";

export function AnalyticsPage() {
  const { data: stats, isLoading, refetch } = useAnalyticsStats("all");

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
        description="Общая статистика системы"
        actions={
          <Button
            variant="secondary"
            onClick={() => refetch()}
            leftIcon={<RefreshCw size={16} />}
          >
            Обновить
          </Button>
        }
      />

      {/* Лиды */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Лиды
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Всего лидов"
            value={formatNumber(stats?.totalLeads || 0)}
            icon={<FileText size={24} />}
          />
        </div>
      </div>

      {/* Пользователи */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Пользователи
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Всего пользователей"
            value={formatNumber(stats?.totalUsers || 0)}
            icon={<Users size={24} />}
          />
          <StatCard
            title="Активные подписки"
            value={formatNumber(stats?.activeSubscriptions || 0)}
            icon={<UserCheck size={24} />}
            variant={stats?.activeSubscriptions ? "default" : "default"}
          />
          <StatCard
            title="Бесплатные"
            value={formatNumber(stats?.freeUsers || 0)}
            icon={<Users size={24} />}
          />
        </div>
      </div>

      {/* Платежи */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Платежи
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Всего платежей"
            value={formatNumber(stats?.totalPayments || 0)}
            icon={<CreditCard size={24} />}
          />
          <StatCard
            title="Выручка"
            value={formatCurrency(stats?.revenue || 0)}
            icon={<CreditCard size={24} />}
          />
        </div>
      </div>
    </div>
  );
}
