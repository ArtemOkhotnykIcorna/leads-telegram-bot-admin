import { Users, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { StatCard } from "@/components/shared";
import { Card, Spinner } from "@/components/ui";
import { useLeadStats } from "@/hooks/queries/useLeads";
import { formatNumber } from "@/lib/formatters";

export function DashboardPage() {
  const { data: stats, isLoading } = useLeadStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Обзор системы управления лидами"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Всего лидов"
          value={formatNumber(stats?.total || 0)}
          icon={<FileText size={24} />}
        />
        <StatCard
          title="Лидов сегодня"
          value={formatNumber(stats?.todayTotal || 0)}
          icon={<Users size={24} />}
        />
        <StatCard
          title="Успешно отправлено"
          value={formatNumber(stats?.sent || 0)}
          icon={<CheckCircle size={24} />}
        />
        <StatCard
          title="Ошибки"
          value={formatNumber(stats?.failed || 0)}
          icon={<AlertCircle size={24} />}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Статусы лидов
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ожидают</span>
              <span className="font-medium">{stats?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">В обработке</span>
              <span className="font-medium">{stats?.processing || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Отправлены</span>
              <span className="font-medium text-green-600">
                {stats?.sent || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Доставлены</span>
              <span className="font-medium text-green-600">
                {stats?.delivered || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ошибки</span>
              <span className="font-medium text-red-600">
                {stats?.failed || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Отклонены</span>
              <span className="font-medium text-gray-500">
                {stats?.rejected || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Быстрые действия
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/leads"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Просмотр лидов</p>
              <p className="text-sm text-gray-500">Все входящие лиды</p>
            </a>
            <a
              href="/sources"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users className="h-6 w-6 text-green-600 mb-2" />
              <p className="font-medium text-gray-900">Источники</p>
              <p className="text-sm text-gray-500">Настройка источников</p>
            </a>
            <a
              href="/routing"
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <CheckCircle className="h-6 w-6 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">Маршрутизация</p>
              <p className="text-sm text-gray-500">Правила распределения</p>
            </a>
            <a
              href="/analytics"
              className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <AlertCircle className="h-6 w-6 text-orange-600 mb-2" />
              <p className="font-medium text-gray-900">Аналитика</p>
              <p className="text-sm text-gray-500">Отчёты и статистика</p>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
