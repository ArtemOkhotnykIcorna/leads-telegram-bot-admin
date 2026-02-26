import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Button,
  Modal,
  Badge,
  Card,
  ConfirmDialog,
  Switch,
} from "@/components/ui";
import { DataTable } from "@/components/shared";
import {
  useRoutingRules,
  useDeleteRoutingRule,
  useToggleRoutingRule,
} from "@/hooks/queries/useRouting";
import { useGroups } from "@/hooks/queries/useGroups";
import { RoutingForm } from "./RoutingForm";
import type { ColumnDef } from "@tanstack/react-table";
import type { RoutingRule } from "@/types";

export function RoutingPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: rules, isLoading } = useRoutingRules();
  const { data: allGroups } = useGroups();
  const deleteMutation = useDeleteRoutingRule();
  const toggleMutation = useToggleRoutingRule();

  const handleCreate = () => {
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<RoutingRule, unknown>[] = [
    {
      accessorKey: "priority",
      header: () => (
        <div className="flex items-center gap-1">
          <ArrowUpDown size={14} />
          Приоритет
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.priority}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "conditions",
      header: "Условия",
      cell: ({ row }) => {
        const conditions = row.original.conditions || {};
        const badges = [];

        if (conditions.countries?.length) {
          badges.push(
            <Badge key="countries" variant="info" size="sm">
              Страны: {conditions.countries.length}
            </Badge>,
          );
        }
        if (conditions.directions?.length) {
          badges.push(
            <Badge key="directions" variant="info" size="sm">
              Направл: {conditions.directions.length}
            </Badge>,
          );
        }
        if (conditions.sources?.length) {
          badges.push(
            <Badge key="sources" variant="info" size="sm">
              Источн: {conditions.sources.length}
            </Badge>,
          );
        }

        return (
          <div className="flex flex-wrap gap-1">
            {badges.length > 0 ? (
              badges
            ) : (
              <span className="text-gray-400">Все лиды</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "targetGroupIds",
      header: "Группы",
      cell: ({ row }) => {
        const ids = row.original.targetGroupIds || [];
        if (ids.length === 0) return <span className="text-gray-400">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {ids.map((item: unknown) => {
              // API may return populated group objects or plain string IDs
              const isPopulated =
                typeof item === "object" && item !== null && "_id" in item;
              const key = isPopulated
                ? (item as { _id: string })._id
                : String(item);
              const name = isPopulated
                ? (item as unknown as { name: string }).name
                : (allGroups?.find((g) => g._id === item)?.name ??
                  String(item));
              return (
                <Badge key={key} variant="default" size="sm">
                  {name}
                </Badge>
              );
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "distributionMode",
      header: "Режим",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.distributionMode === "round_robin" ? "info" : "default"
          }
          size="sm"
        >
          {row.original.distributionMode === "round_robin"
            ? "round_robin"
            : "all"}
        </Badge>
      ),
    },
    {
      accessorKey: "leadsRouted",
      header: "Лидов",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.leadsRouted ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Статус",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onChange={() => toggleMutation.mutate(row.original._id)}
          size="sm"
        />
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
            onClick={() => handleEdit(row.original._id)}
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.original._id)}
          >
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Маршрутизация"
        description="Правила распределения лидов по группам"
        actions={
          <Button onClick={handleCreate} leftIcon={<Plus size={16} />}>
            Добавить правило
          </Button>
        }
      />

      <Card padding="none">
        <DataTable
          data={rules || []}
          columns={columns}
          isLoading={isLoading}
          emptyState={{
            title: "Нет правил маршрутизации",
            description: "Создайте правило для распределения лидов",
            action: (
              <Button onClick={handleCreate} leftIcon={<Plus size={16} />}>
                Добавить
              </Button>
            ),
          }}
        />
      </Card>

      <Modal
        isOpen={isFormOpen}
        onClose={handleClose}
        title={editingId ? "Редактировать правило" : "Новое правило"}
        size="lg"
      >
        <RoutingForm ruleId={editingId} onSuccess={handleClose} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить правило?"
        message="Лиды, соответствующие этому правилу, будут обрабатываться другими правилами."
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
