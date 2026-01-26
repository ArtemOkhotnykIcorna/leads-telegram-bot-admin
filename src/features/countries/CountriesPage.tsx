import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button, Modal, Card, ConfirmDialog, Switch } from "@/components/ui";
import { DataTable } from "@/components/shared";
import {
  useCountries,
  useDeleteCountry,
  useToggleCountry,
} from "@/hooks/queries/useCountries";
import { CountryForm } from "./CountryForm";
import type { ColumnDef } from "@tanstack/react-table";
import type { Country } from "@/types";

export function CountriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: countries, isLoading } = useCountries();
  const deleteMutation = useDeleteCountry();
  const toggleMutation = useToggleCountry();

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

  const columns: ColumnDef<Country, unknown>[] = [
    {
      accessorKey: "flag",
      header: "",
      cell: ({ row }) => <span className="text-2xl">{row.original.flag}</span>,
    },
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "sortOrder",
      header: "Порядок",
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
        title="Страны"
        description="Управление списком стран для маршрутизации"
        actions={
          <Button onClick={handleCreate} leftIcon={<Plus size={16} />}>
            Добавить страну
          </Button>
        }
      />

      <Card padding="none">
        <DataTable
          data={countries || []}
          columns={columns}
          isLoading={isLoading}
          emptyState={{
            title: "Нет стран",
            description: "Создайте первую страну для маршрутизации",
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
        title={editingId ? "Редактировать страну" : "Новая страна"}
      >
        <CountryForm countryId={editingId} onSuccess={handleClose} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить страну?"
        message="Это действие нельзя отменить. Связанные правила маршрутизации могут перестать работать."
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
