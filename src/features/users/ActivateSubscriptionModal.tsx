import { useState } from "react";
import { Modal, Button, Input, Select } from "@/components/ui";
import { useActivateSubscription } from "@/hooks/queries/useUsers";
import type { User } from "@/types/user.types";

interface ActivateSubscriptionModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

// Предустановленные варианты длительности
const DURATION_OPTIONS = [
  { value: 7, label: "7 дней" },
  { value: 14, label: "14 дней" },
  { value: 30, label: "1 месяц" },
  { value: 90, label: "3 месяца" },
  { value: 180, label: "6 месяцев" },
  { value: 365, label: "1 год" },
  { value: 0, label: "Другое..." },
];

export function ActivateSubscriptionModal({
  user,
  isOpen,
  onClose,
}: ActivateSubscriptionModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<string>("");
  const [tributeSubscriptionId, setTributeSubscriptionId] = useState<string>(
    user.subscription.tributeSubscriptionId || "",
  );

  const activateMutation = useActivateSubscription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const durationDays =
      selectedDuration === 0 ? parseInt(customDuration, 10) : selectedDuration;

    if (!durationDays || durationDays <= 0) {
      return;
    }

    await activateMutation.mutateAsync({
      id: user._id,
      data: {
        durationDays,
        ...(tributeSubscriptionId && { tributeSubscriptionId }),
      },
    });

    onClose();
  };

  const isCustomDuration = selectedDuration === 0;
  const currentDuration = isCustomDuration
    ? parseInt(customDuration, 10) || 0
    : selectedDuration;

  // Рассчитать дату окончания
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + currentDuration);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Активировать подписку"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Пользователь</div>
          <div className="font-medium">
            {user.username ? `@${user.username}` : user.telegramId}
          </div>
          {(user.firstName || user.lastName) && (
            <div className="text-sm text-gray-500">
              {[user.firstName, user.lastName].filter(Boolean).join(" ")}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Длительность подписки
          </label>
          <Select
            value={selectedDuration.toString()}
            onChange={(e) => setSelectedDuration(parseInt(e.target.value, 10))}
            options={DURATION_OPTIONS.map((option) => ({
              value: option.value.toString(),
              label: option.label,
            }))}
          />
        </div>

        {isCustomDuration && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Количество дней
            </label>
            <Input
              type="number"
              min="1"
              max="3650"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              placeholder="Введите количество дней"
              required={isCustomDuration}
            />
          </div>
        )}

        {currentDuration > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg text-sm">
            <div className="text-blue-700">
              Подписка будет активна до:{" "}
              <span className="font-medium">
                {endDate.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tribute Subscription ID (опционально)
          </label>
          <Input
            value={tributeSubscriptionId}
            onChange={(e) => setTributeSubscriptionId(e.target.value)}
            placeholder="sub_..."
          />
          <p className="text-xs text-gray-500 mt-1">
            ID подписки в системе Tribute (если оплата через Tribute)
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            isLoading={activateMutation.isPending}
            disabled={currentDuration <= 0}
          >
            Активировать
          </Button>
        </div>
      </form>
    </Modal>
  );
}
