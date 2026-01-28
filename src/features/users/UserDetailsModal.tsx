import { Modal, Badge } from "@/components/ui";
import { formatDateTime } from "@/lib/formatters";
import type { User, SubscriptionStatus } from "@/types/user.types";

interface UserDetailsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const statusLabels: Record<SubscriptionStatus, string> = {
  trial: "Пробный период",
  active: "Активная",
  expired: "Истекла",
  blocked: "Заблокирован",
};

const statusVariants: Record<
  SubscriptionStatus,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  trial: "info",
  active: "success",
  expired: "warning",
  blocked: "danger",
};

function InfoRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">
        {children || value || "-"}
      </span>
    </div>
  );
}

export function UserDetailsModal({
  user,
  isOpen,
  onClose,
}: UserDetailsModalProps) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Информация о пользователе"
      size="lg"
    >
      <div className="space-y-6">
        {/* Основная информация */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Основная информация
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <InfoRow label="ID" value={user._id} />
            <InfoRow label="Telegram ID" value={user.telegramId} />
            <InfoRow label="Username">
              {user.username ? (
                <a
                  href={`https://t.me/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  @{user.username}
                </a>
              ) : (
                "-"
              )}
            </InfoRow>
            <InfoRow label="Имя" value={fullName || "-"} />
          </div>
        </div>

        {/* Подписка */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Подписка
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <InfoRow label="Статус">
              <Badge variant={statusVariants[user.subscription.status]}>
                {statusLabels[user.subscription.status]}
              </Badge>
            </InfoRow>
            <InfoRow
              label="Активна до"
              value={
                user.subscription.activeUntil
                  ? formatDateTime(user.subscription.activeUntil)
                  : "-"
              }
            />
            <InfoRow label="Пробный период использован">
              <Badge
                variant={user.subscription.trialUsed ? "default" : "success"}
              >
                {user.subscription.trialUsed ? "Да" : "Нет"}
              </Badge>
            </InfoRow>
            {user.subscription.trialStartedAt && (
              <InfoRow
                label="Начало пробного периода"
                value={formatDateTime(user.subscription.trialStartedAt)}
              />
            )}
            {user.subscription.trialEndsAt && (
              <InfoRow
                label="Конец пробного периода"
                value={formatDateTime(user.subscription.trialEndsAt)}
              />
            )}
            {user.subscription.tributeSubscriptionId && (
              <InfoRow
                label="Tribute ID"
                value={user.subscription.tributeSubscriptionId}
              />
            )}
          </div>
        </div>

        {/* Права доступа */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Права доступа
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <InfoRow label="Доступ к страховкам">
              <Badge
                variant={
                  user.permissions.accessInsurance ? "success" : "default"
                }
              >
                {user.permissions.accessInsurance ? "Да" : "Нет"}
              </Badge>
            </InfoRow>
          </div>
        </div>

        {/* Текущее состояние */}
        {user.currentState?.step && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Текущее состояние
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <InfoRow label="Шаг" value={user.currentState.step} />
              {user.currentState.countryId && (
                <InfoRow
                  label="Страна ID"
                  value={user.currentState.countryId}
                />
              )}
              {user.currentState.directionId && (
                <InfoRow
                  label="Направление ID"
                  value={user.currentState.directionId}
                />
              )}
            </div>
          </div>
        )}

        {/* Системная информация */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Системная информация
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <InfoRow label="Создан" value={formatDateTime(user.createdAt)} />
            <InfoRow label="Обновлён" value={formatDateTime(user.updatedAt)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
