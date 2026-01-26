import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Button,
  Modal,
  Card,
  ConfirmDialog,
  Switch,
  Badge,
  Select,
} from "@/components/ui";
import { DataTable } from "@/components/shared";
import {
  useDirections,
  useDeleteDirection,
  useToggleDirection,
} from "@/hooks/queries/useDirections";
import { useCountries } from "@/hooks/queries/useCountries";
import { DirectionForm } from "./DirectionForm";
import type { ColumnDef } from "@tanstack/react-table";
import type { Direction } from "@/types";

export function DirectionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string>("");

  const { data: countries } = useCountries();
  const { data: directions, isLoading } = useDirections(
    countryFilter || undefined,
  );
  const deleteMutation = useDeleteDirection();
  const toggleMutation = useToggleDirection();

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

  const columns: ColumnDef<Direction, unknown>[] = [
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => <Badge variant="default">{row.original.slug}</Badge>,
    },
    {
      accessorKey: "country",
      header: "Страна",
      cell: ({ row }) => (
        <span>
          {row.original.country?.flag} {row.original.country?.name || "-"}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Описание",
      cell: ({ row }) => (
        <span className="text-gray-500 truncate max-w-xs block">
          {row.original.description || "-"}
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
        title="Направления"
        description="Управление направлениями для категоризации лидов"
        actions={
          <Button onClick={handleCreate} leftIcon={<Plus size={16} />}>
            Добавить направление
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select
              label="Фильтр по стране"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              options={[
                { value: "", label: "Все страны" },
                ...(countries?.map((c) => ({
                  value: c._id,
                  label: `${c.flag} ${c.name}`,
                })) || []),
              ]}
            />
          </div>
          {countryFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCountryFilter("")}
              className="mt-6"
            >
              Сбросить
            </Button>
          )}
        </div>
      </Card>

      <Card padding="none">
        <DataTable
          data={directions || []}
          columns={columns}
          isLoading={isLoading}
          emptyState={{
            title: "Нет направлений",
            description: "Создайте первое направление",
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
        title={editingId ? "Редактировать направление" : "Новое направление"}
      >
        <DirectionForm directionId={editingId} onSuccess={handleClose} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить направление?"
        message="Это действие нельзя отменить."
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
