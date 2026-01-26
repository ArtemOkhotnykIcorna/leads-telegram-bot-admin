import { useState } from "react";
import { Plus, Pencil, Trash2, Copy, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button, Modal, Card, ConfirmDialog, Switch } from "@/components/ui";
import { DataTable } from "@/components/shared";
import {
  useGroups,
  useDeleteGroup,
  useToggleGroup,
  useRegenerateDeepLink,
} from "@/hooks/queries/useGroups";
import { GroupForm } from "./GroupForm";
import { copyToClipboard } from "@/lib/utils";
import toast from "react-hot-toast";
import type { ColumnDef } from "@tanstack/react-table";
import type { Group } from "@/types";

export function GroupsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: groups, isLoading } = useGroups();
  const deleteMutation = useDeleteGroup();
  const toggleMutation = useToggleGroup();
  const regenerateMutation = useRegenerateDeepLink();

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
      toast.success("Скопировано!");
    }
  };

  const columns: ColumnDef<Group, unknown>[] = [
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "telegramChatId",
      header: "Chat ID",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
            {row.original.telegramChatId}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(row.original.telegramChatId)}
          >
            <Copy size={14} />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "deepLink",
      header: "Deep Link",
      cell: ({ row }) =>
        row.original.deepLink ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 truncate max-w-[150px]">
              {row.original.deepLink}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(row.original.deepLink!)}
            >
              <Copy size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => regenerateMutation.mutate(row.original._id)}
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
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
        title="Группы"
        description="Telegram группы для отправки лидов"
        actions={
          <Button onClick={handleCreate} leftIcon={<Plus size={16} />}>
            Добавить группу
          </Button>
        }
      />

      <Card padding="none">
        <DataTable
          data={groups || []}
          columns={columns}
          isLoading={isLoading}
          emptyState={{
            title: "Нет групп",
            description: "Добавьте Telegram группу для отправки лидов",
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
        title={editingId ? "Редактировать группу" : "Новая группа"}
      >
        <GroupForm groupId={editingId} onSuccess={handleClose} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить группу?"
        message="Лиды больше не будут отправляться в эту группу."
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
