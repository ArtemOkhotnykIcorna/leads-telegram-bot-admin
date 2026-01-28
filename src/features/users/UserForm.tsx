import { useState } from "react";
import { Button, Input, Select, Switch } from "@/components/ui";
import { useUpdateUser } from "@/hooks/queries/useUsers";
import type {
  User,
  AdminUpdateUserDto,
  SubscriptionStatus,
} from "@/types/user.types";

interface UserFormProps {
  user: User;
  onSuccess: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState<AdminUpdateUserDto>({
    username: user.username || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    subscriptionStatus: user.subscription.status,
    activeUntil: user.subscription.activeUntil
      ? new Date(user.subscription.activeUntil).toISOString().slice(0, 16)
      : "",
    accessInsurance: user.permissions.accessInsurance,
  });

  const updateMutation = useUpdateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: AdminUpdateUserDto = {};

    if (formData.username !== user.username) {
      data.username = formData.username || undefined;
    }
    if (formData.firstName !== user.firstName) {
      data.firstName = formData.firstName || undefined;
    }
    if (formData.lastName !== user.lastName) {
      data.lastName = formData.lastName || undefined;
    }
    if (formData.subscriptionStatus !== user.subscription.status) {
      data.subscriptionStatus = formData.subscriptionStatus;
    }
    if (formData.activeUntil) {
      const newDate = new Date(formData.activeUntil).toISOString();
      if (newDate !== user.subscription.activeUntil) {
        data.activeUntil = newDate;
      }
    }
    if (formData.accessInsurance !== user.permissions.accessInsurance) {
      data.accessInsurance = formData.accessInsurance;
    }

    if (Object.keys(data).length === 0) {
      onSuccess();
      return;
    }

    await updateMutation.mutateAsync({ id: user._id, data });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telegram ID
          </label>
          <Input value={user.telegramId.toString()} disabled />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <Input
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="username"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Имя
          </label>
          <Input
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            placeholder="Имя"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Фамилия
          </label>
          <Input
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            placeholder="Фамилия"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Статус подписки
          </label>
          <Select
            value={formData.subscriptionStatus}
            onChange={(e) =>
              setFormData({
                ...formData,
                subscriptionStatus: e.target.value as SubscriptionStatus,
              })
            }
            options={[
              { value: "trial", label: "Пробный" },
              { value: "active", label: "Активный" },
              { value: "expired", label: "Истёкший" },
              { value: "blocked", label: "Заблокирован" },
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Активен до
          </label>
          <Input
            type="datetime-local"
            value={formData.activeUntil}
            onChange={(e) =>
              setFormData({ ...formData, activeUntil: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="font-medium">Доступ к страховкам</div>
          <div className="text-sm text-gray-500">
            Разрешить пользователю доступ к страховым лидам
          </div>
        </div>
        <Switch
          checked={formData.accessInsurance || false}
          onChange={(checked) =>
            setFormData({ ...formData, accessInsurance: checked })
          }
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" isLoading={updateMutation.isPending}>
          Сохранить
        </Button>
      </div>
    </form>
  );
}
