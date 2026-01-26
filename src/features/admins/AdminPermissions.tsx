import { useState, useEffect } from "react";
import { useUpdateAdminPermissions } from "@/hooks/queries/useAdmins";
import { Button, Switch, Modal } from "@/components/ui";
import { PERMISSION_LABELS } from "@/lib/constants";
import type { Admin, AdminPermissions as Permissions } from "@/types";

interface AdminPermissionsProps {
  admin: Admin;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPermissions({
  admin,
  isOpen,
  onClose,
}: AdminPermissionsProps) {
  const [permissions, setPermissions] = useState<Permissions>(
    admin.permissions,
  );
  const updateMutation = useUpdateAdminPermissions();

  useEffect(() => {
    setPermissions(admin.permissions);
  }, [admin]);

  const handleToggle = (key: keyof Permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: admin._id,
      dto: { permissions },
    });
    onClose();
  };

  // Admin роль имеет все права автоматически
  if (admin.role === "admin") {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Права доступа">
        <p className="text-gray-500">
          Администратор имеет полный доступ ко всем функциям.
        </p>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Права доступа" size="md">
      <div className="space-y-4">
        {(Object.keys(PERMISSION_LABELS) as (keyof Permissions)[]).map(
          (key) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {PERMISSION_LABELS[key]}
              </span>
              <Switch
                checked={permissions[key]}
                onChange={() => handleToggle(key)}
              />
            </div>
          ),
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={handleSave} isLoading={updateMutation.isPending}>
          Сохранить
        </Button>
      </div>
    </Modal>
  );
}
