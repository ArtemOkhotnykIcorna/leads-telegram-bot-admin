import { useState } from "react";
import { Plus, Pencil, Trash2, Key, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button, Modal, Badge, Card, ConfirmDialog } from "@/components/ui";
import { DataTable } from "@/components/shared";
import { useAdmins, useDeleteAdmin } from "@/hooks/queries/useAdmins";
import { AdminForm } from "./AdminForm";
import { AdminPermissions } from "./AdminPermissions";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { formatDateTime } from "@/lib/formatters";
import { ROLE_LABELS } from "@/lib/constants";
import type { ColumnDef } from "@tanstack/react-table";
import type { Admin } from "@/types";

export function AdminsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [permissionsAdmin, setPermissionsAdmin] = useState<Admin | null>(null);
  const [passwordAdmin, setPasswordAdmin] = useState<Admin | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: admins, isLoading } = useAdmins();
  const deleteMutation = useDeleteAdmin();

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

  const columns: ColumnDef<Admin, unknown>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Роль",
      cell: ({ row }) => (
        <Badge variant={row.original.role === "admin" ? "info" : "default"}>
          {ROLE_LABELS[row.original.role]}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Статус",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "success" : "danger"}>
          {row.original.isActive ? "Активен" : "Неактивен"}
        </Badge>
      ),
    },
    {
      accessorKey: "lastLoginAt",
      header: "Последний вход",
      cell: ({ row }) =>
        row.original.lastLoginAt
          ? formatDateTime(row.original.lastLoginAt)
          : "-",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPermissionsAdmin(row.original)}
            title="Права доступа"
          >
            <Shield size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPasswordAdmin(row.original)}
            title="Сменить пароль"
          >
            <Key size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original._id)}
            title="Редактировать"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.original._id)}
            title="Удалить"
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
        title="Администраторы"
        description="Управление пользователями админ-панели"
        actions={
          <Button onClick={handleCreate} leftIcon={<Plus size={16} />}>
            Добавить администратора
          </Button>
        }
      />

      <Card padding="none">
        <DataTable
          data={admins || []}
          columns={columns}
          isLoading={isLoading}
          emptyState={{
            title: "Нет администраторов",
            description: "Создайте первого администратора",
            action: (
              <Button onClick={handleCreate} leftIcon={<Plus size={16} />}>
                Добавить
              </Button>
            ),
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleClose}
        title={
          editingId ? "Редактировать администратора" : "Новый администратор"
        }
        size="lg"
      >
        <AdminForm adminId={editingId} onSuccess={handleClose} />
      </Modal>

      {/* Permissions Modal */}
      {permissionsAdmin && (
        <AdminPermissions
          admin={permissionsAdmin}
          isOpen={!!permissionsAdmin}
          onClose={() => setPermissionsAdmin(null)}
        />
      )}

      {/* Change Password Modal */}
      {passwordAdmin && (
        <ChangePasswordModal
          admin={passwordAdmin}
          isOpen={!!passwordAdmin}
          onClose={() => setPasswordAdmin(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить администратора?"
        message="Это действие нельзя отменить. Администратор потеряет доступ к системе."
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
