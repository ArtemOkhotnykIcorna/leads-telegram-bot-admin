import { Badge } from "@/components/ui";
import { LEAD_STATUS_LABELS } from "@/lib/constants";
import type { LeadStatus } from "@/types";

export interface StatusBadgeProps {
  status: LeadStatus;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const variants: Record<
    LeadStatus,
    "default" | "success" | "warning" | "danger" | "info"
  > = {
    new: "info",
    pending: "warning",
    processing: "info",
    sent: "success",
    delivered: "success",
    failed: "danger",
    rejected: "default",
    duplicate: "default",
  };

  return (
    <Badge variant={variants[status]}>
      {label || LEAD_STATUS_LABELS[status] || status}
    </Badge>
  );
}
