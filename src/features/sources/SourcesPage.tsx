import { useState } from "react";
import { Plus, Pencil, Trash2, Key, Copy } from "lucide-react";
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
  useSources,
  useDeleteSource,
  useToggleSource,
  useRegenerateApiKey,
} from "@/hooks/queries/useSources";
import { SourceForm } from "./SourceForm";
import { copyToClipboard } from "@/lib/utils";
import toast from "react-hot-toast";
import type { ColumnDef } from "@tanstack/react-table";
import type { Source } from "@/types";

export function SourcesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: sources, isLoading } = useSources();
  const deleteMutation = useDeleteSource();
  const toggleMutation = useToggleSource();
  const regenerateKeyMutation = useRegenerateApiKey();

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

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success("API ключ скопирован!");
    }
  };

  const handleRegenerateKey = async (id: string) => {
    if (window.confirm("Текущий API ключ перестанет работать. Продолжить?")) {
      const result = await regenerateKeyMutation.mutateAsync(id);
      if (result.apiKey) {
        await copyToClipboard(result.apiKey);
        toast.success("Новый ключ скопирован в буфер обмена");
      }
    }
  };

  const columns: ColumnDef<Source, unknown>[] = [
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => {
        const typeLabels: Record<string, string> = {
          api: "API",
          telegram: "Telegram",
          webhook: "Webhook",
          manual: "Ручной",
        };
        return (
          <Badge variant="default">
            {typeLabels[row.original.type] || row.original.type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "apiKey",
      header: "API Key",
      cell: ({ row }) =>
        row.original.apiKey ? (
          <div className="flex items-center gap-2">
            <code className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[120px]">
              {row.original.apiKey.slice(0, 12)}...
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(row.original.apiKey!)}
            >
              <Copy size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRegenerateKey(row.original._id)}
            >
              <Key size={14} />
            </Button>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      accessorKey: "leadsCount",
      header: "Лидов",
      cell: ({ row }) => row.original.leadsCount || 0,
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
        title="Источники"
        description="Управление источниками получения лидов"
        actions={
          <Button onClick={handleCreate} leftIcon={<Plus size={16} />}>
            Добавить источник
          </Button>
        }
      />

      <Card padding="none">
        <DataTable
          data={sources || []}
          columns={columns}
          isLoading={isLoading}
          emptyState={{
            title: "Нет источников",
            description: "Добавьте источник для приёма лидов",
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
        title={editingId ? "Редактировать источник" : "Новый источник"}
      >
        <SourceForm sourceId={editingId} onSuccess={handleClose} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить источник?"
        message="Лиды от этого источника больше не будут приниматься."
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
