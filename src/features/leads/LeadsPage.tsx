import { useState } from "react";
import {
  Eye,
  RefreshCw,
  Filter,
  Phone,
  AtSign,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Copy as CopyIcon,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button, Modal, Badge, Card, Select } from "@/components/ui";
import { DataTable } from "@/components/shared";
import {
  useLeads,
  useLeadStats,
  useRetryLead,
  useRetryFailedLeads,
} from "@/hooks/queries/useLeads";
import { useSources } from "@/hooks/queries/useSources";
import { useDirections } from "@/hooks/queries/useDirections";
import { LeadDetails } from "./LeadDetails";
import { formatDate } from "@/lib/formatters";
import type { ColumnDef } from "@tanstack/react-table";
import type { Lead, LeadStatus, LeadsFilter } from "@/types";

// Конфигурация статусов согласно документации
const statusConfig: Record<
  LeadStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
  }
> = {
  new: {
    label: "Новый",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: <Clock size={14} />,
  },
  processing: {
    label: "В обработке",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: <RefreshCw size={14} className="animate-spin" />,
  },
  published: {
    label: "Опубликован",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: <CheckCircle size={14} />,
  },
  failed: {
    label: "Ошибка",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: <XCircle size={14} />,
  },
  duplicate: {
    label: "Дубликат",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: <CopyIcon size={14} />,
  },
  skipped: {
    label: "Пропущен",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    icon: <X size={14} />,
  },
};

// Компонент статистики
function StatsCard({
  title,
  value,
  color,
  onClick,
  isActive,
}: {
  title: string;
  value: number | undefined;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all text-left w-full ${
        isActive
          ? "border-blue-500 bg-blue-50"
          : "border-transparent bg-white hover:border-gray-200"
      }`}
    >
      <div className={`text-2xl font-bold ${color}`}>
        {(value ?? 0).toLocaleString()}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
    </button>
  );
}

// Компонент статус-бейджа
function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

export function LeadsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<LeadsFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  // Данные
  const { data: stats } = useLeadStats();
  const { data, isLoading, refetch } = useLeads({
    page,
    limit: 20,
    ...filters,
  });
  const { data: sources } = useSources();
  const { data: directions } = useDirections();
  const retryMutation = useRetryLead();
  const retryFailedMutation = useRetryFailedLeads();

  // Обработчики
  const handleRetry = async (id: string) => {
    await retryMutation.mutateAsync(id);
  };

  const handleQuickFilter = (status?: LeadStatus) => {
    setFilters(status ? { status } : {});
    setPage(1);
  };

  const handleFilterChange = (key: keyof LeadsFilter, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Хелпер для получения populated данных
  const getPopulated = <T extends { _id: string; name: string }>(
    value: string | T | undefined,
  ): T | null => {
    if (!value) return null;
    if (typeof value === "object") return value;
    return null;
  };

  // Колонки таблицы
  const columns: ColumnDef<Lead, unknown>[] = [
    {
      accessorKey: "createdAt",
      header: "Дата",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Заголовок",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="font-medium truncate">
            {row.original.title || "Без заголовка"}
          </div>
          {row.original.contact?.telegram && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <AtSign size={12} />
              {row.original.contact.telegram}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Контакт",
      cell: ({ row }) => {
        const contact = row.original.contact;
        if (!contact) return <span className="text-gray-400">—</span>;

        return (
          <div className="space-y-1">
            {contact.name && (
              <div className="flex items-center gap-1 text-sm">
                <User size={12} className="text-gray-400" />
                {contact.name}
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-1">
                <Phone size={12} className="text-gray-400" />
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {contact.phone}
                </code>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "sourceId",
      header: "Источник",
      cell: ({ row }) => {
        const source = getPopulated(row.original.sourceId);
        return source ? (
          <span className="text-sm">{source.name}</span>
        ) : (
          <span className="text-gray-400">—</span>
        );
      },
    },
    {
      accessorKey: "directionId",
      header: "Направление",
      cell: ({ row }) => {
        const direction = getPopulated(row.original.directionId);
        if (direction) return <Badge variant="info">{direction.name}</Badge>;

        // Fallback: directionId пришёл как строка (ID без populate)
        if (typeof row.original.directionId === "string" && directions) {
          const found = directions.find(
            (d) => d._id === row.original.directionId,
          );
          if (found) return <Badge variant="info">{found.name}</Badge>;
        }

        return <span className="text-gray-400">—</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => <LeadStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "publishAttempts",
      header: "Попытки",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.publishAttempts || 0}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedLead(row.original._id)}
            title="Подробнее"
          >
            <Eye size={16} />
          </Button>
          {row.original.status === "failed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRetry(row.original._id)}
              disabled={retryMutation.isPending}
              title="Повторить публикацию"
            >
              <RefreshCw
                size={16}
                className={retryMutation.isPending ? "animate-spin" : ""}
              />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Лиды"
        description="Все полученные лиды и их статусы публикации"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter size={16} />}
            >
              Фильтры
              {activeFiltersCount > 0 && (
                <Badge variant="info" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={() => refetch()}
              leftIcon={<RefreshCw size={16} />}
            >
              Обновить
            </Button>
            <Button
              variant="primary"
              onClick={() => retryFailedMutation.mutate()}
              isLoading={retryFailedMutation.isPending}
              leftIcon={<RefreshCw size={16} />}
            >
              Опубликовать Failed
            </Button>
          </div>
        }
      />

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatsCard
            title="Всего"
            value={stats.total}
            color="text-gray-900"
            onClick={() => handleQuickFilter()}
            isActive={!filters.status}
          />
          <StatsCard
            title="Новые"
            value={stats.new}
            color="text-blue-600"
            onClick={() => handleQuickFilter("new")}
            isActive={filters.status === "new"}
          />
          <StatsCard
            title="В обработке"
            value={stats.processing}
            color="text-amber-600"
            onClick={() => handleQuickFilter("processing")}
            isActive={filters.status === "processing"}
          />
          <StatsCard
            title="Опубликованы"
            value={stats.published}
            color="text-green-600"
            onClick={() => handleQuickFilter("published")}
            isActive={filters.status === "published"}
          />
          <StatsCard
            title="Ошибки"
            value={stats.failed}
            color="text-red-600"
            onClick={() => handleQuickFilter("failed")}
            isActive={filters.status === "failed"}
          />
          <StatsCard
            title="Дубликаты"
            value={stats.duplicate}
            color="text-gray-600"
            onClick={() => handleQuickFilter("duplicate")}
            isActive={filters.status === "duplicate"}
          />
          <StatsCard
            title="Пропущены"
            value={stats.skipped}
            color="text-gray-500"
            onClick={() => handleQuickFilter("skipped")}
            isActive={filters.status === "skipped"}
          />
        </div>
      )}

      {/* Расширенные фильтры */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Источник"
              options={[
                { value: "", label: "Все источники" },
                ...(sources?.map((s) => ({ value: s._id, label: s.name })) ||
                  []),
              ]}
              value={filters.sourceId || ""}
              onChange={(e) => handleFilterChange("sourceId", e.target.value)}
            />
            <Select
              label="Направление"
              options={[
                { value: "", label: "Все направления" },
                ...(directions?.map((d) => ({
                  value: d._id,
                  label: d.name,
                })) || []),
              ]}
              value={filters.directionId || ""}
              onChange={(e) =>
                handleFilterChange("directionId", e.target.value)
              }
            />
            <div className="flex items-end">
              <Button variant="ghost" onClick={clearFilters}>
                Сбросить фильтры
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Индикатор ошибок */}
      {stats && stats.failed > 0 && !filters.status && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle size={20} className="text-red-500" />
          <span className="text-sm text-red-700">
            {stats.failed} лидов с ошибками публикации.
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickFilter("failed")}
            className="text-red-700"
          >
            Показать
          </Button>
        </div>
      )}

      {/* Таблица лидов */}
      <Card padding="none">
        <DataTable
          data={data?.items || []}
          columns={columns}
          isLoading={isLoading}
          pagination={{
            page,
            pageSize: 20,
            total: data?.total || 0,
            onPageChange: setPage,
          }}
          emptyState={{
            title: "Нет лидов",
            description: filters.status
              ? `Нет лидов со статусом "${statusConfig[filters.status]?.label}"`
              : "Лиды появятся здесь после получения из источников",
          }}
        />
      </Card>

      {/* Модалка деталей лида */}
      <Modal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title="Детали лида"
        size="lg"
      >
        {selectedLead && (
          <LeadDetails
            leadId={selectedLead}
            onClose={() => setSelectedLead(null)}
          />
        )}
      </Modal>
    </div>
  );
}
