import { useState } from "react";
import { Eye, RefreshCw, Filter } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button, Modal, Badge, Card } from "@/components/ui";
import { DataTable, StatusBadge } from "@/components/shared";
import { useLeads, useResendLead } from "@/hooks/queries/useLeads";
import { LeadDetails } from "./LeadDetails";
import { LeadFilters } from "./LeadFilters";
import { formatDate } from "@/lib/formatters";
import type { ColumnDef } from "@tanstack/react-table";
import type { Lead, LeadStatus, LeadsFilter } from "@/types";

const statusConfig: Record<
  LeadStatus,
  {
    label: string;
    variant: "success" | "warning" | "error" | "info" | "default";
  }
> = {
  new: { label: "Новый", variant: "info" },
  pending: { label: "Ожидает", variant: "default" },
  processing: { label: "В обработке", variant: "warning" },
  sent: { label: "Отправлен", variant: "success" },
  delivered: { label: "Доставлен", variant: "success" },
  failed: { label: "Ошибка", variant: "error" },
  rejected: { label: "Отклонён", variant: "error" },
  duplicate: { label: "Дубликат", variant: "default" },
};

export function LeadsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<LeadsFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const { data, isLoading, refetch } = useLeads({
    page,
    limit: 20,
    ...filters,
  });
  const resendMutation = useResendLead();

  const handleResend = async (id: string) => {
    await resendMutation.mutateAsync(id);
  };

  const handleApplyFilters = (newFilters: LeadsFilter) => {
    setFilters(newFilters);
    setPage(1);
    setShowFilters(false);
  };

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
      accessorKey: "name",
      header: "Имя",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name || "-"}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Телефон",
      cell: ({ row }) => (
        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
          {row.original.phone}
        </code>
      ),
    },
    {
      accessorKey: "country",
      header: "Страна",
      cell: ({ row }) => {
        const country = row.original.country;
        if (typeof country === "object" && country) {
          return (
            <span>
              {country.flag || ""} {country.name}
            </span>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      accessorKey: "direction",
      header: "Направление",
      cell: ({ row }) => {
        const direction = row.original.direction;
        if (typeof direction === "object" && direction) {
          return <Badge variant="default">{direction.name}</Badge>;
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      accessorKey: "source",
      header: "Источник",
      cell: ({ row }) => {
        const source = row.original.source;
        if (typeof source === "object" && source) {
          return <span className="text-sm">{source.name}</span>;
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const config = statusConfig[row.original.status];
        return (
          <StatusBadge status={row.original.status} label={config.label} />
        );
      },
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
          >
            <Eye size={16} />
          </Button>
          {row.original.status === "failed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleResend(row.original._id)}
              disabled={resendMutation.isPending}
            >
              <RefreshCw size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div>
      <PageHeader
        title="Лиды"
        description="Все полученные лиды и их статусы"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(true)}
              leftIcon={<Filter size={16} />}
            >
              Фильтры
              {activeFiltersCount > 0 && (
                <Badge variant="info" size="sm" className="ml-2">
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
          </div>
        }
      />

      <Card padding="none">
        <DataTable
          data={data?.data || []}
          columns={columns}
          isLoading={isLoading}
          pagination={{
            page,
            pageSize: 20,
            total: data?.pagination?.total || 0,
            onPageChange: setPage,
          }}
          emptyState={{
            title: "Нет лидов",
            description: "Лиды появятся здесь после получения из источников",
          }}
        />
      </Card>

      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Фильтры"
      >
        <LeadFilters
          filters={filters}
          onApply={handleApplyFilters}
          onReset={() => handleApplyFilters({})}
        />
      </Modal>

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
