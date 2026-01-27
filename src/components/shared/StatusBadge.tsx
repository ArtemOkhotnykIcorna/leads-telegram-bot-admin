import { Badge } from "@/components/ui";
import type { LeadStatus } from "@/types";

export interface StatusBadgeProps {
  status: LeadStatus;
  label?: string;
}

// Метки статусов согласно документации
const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новый",
  processing: "В обработке",
  published: "Опубликован",
  failed: "Ошибка",
  duplicate: "Дубликат",
  skipped: "Пропущен",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const variants: Record<
    LeadStatus,
    "default" | "success" | "warning" | "danger" | "info"
  > = {
    new: "info",
    processing: "warning",
    published: "success",
    failed: "danger",
    duplicate: "default",
    skipped: "default",
  };

  return (
    <Badge variant={variants[status]}>
      {label || STATUS_LABELS[status] || status}
    </Badge>
  );
}
