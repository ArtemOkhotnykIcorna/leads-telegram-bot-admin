import { useLead, useResendLead } from "@/hooks/queries/useLeads";
import { Button, Badge, Spinner } from "@/components/ui";
import { StatusBadge } from "@/components/shared";
import { formatDateTime } from "@/lib/formatters";
import { RefreshCw, Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import toast from "react-hot-toast";
import type { LeadStatus } from "@/types";

interface LeadDetailsProps {
  leadId: string;
  onClose: () => void;
}

const statusLabels: Record<LeadStatus, string> = {
  new: "Новый",
  pending: "Ожидает",
  processing: "В обработке",
  sent: "Отправлен",
  delivered: "Доставлен",
  failed: "Ошибка",
  rejected: "Отклонён",
  duplicate: "Дубликат",
};

export function LeadDetails({ leadId, onClose }: LeadDetailsProps) {
  const { data: lead, isLoading } = useLead(leadId);
  const resendMutation = useResendLead();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12 text-gray-500">Лід не знайдено</div>
    );
  }

  const handleCopy = async (text: string | undefined, label: string) => {
    if (!text) return;
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} скопійовано!`);
    }
  };

  const handleResend = async () => {
    await resendMutation.mutateAsync(leadId);
    toast.success("Лід відправлено повторно");
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex items-center justify-between pb-4 border-b">
        <StatusBadge status={lead.status} label={statusLabels[lead.status]} />
        {lead.status === "failed" && (
          <Button
            size="sm"
            onClick={handleResend}
            isLoading={resendMutation.isPending}
            leftIcon={<RefreshCw size={14} />}
          >
            Отправить повторно
          </Button>
        )}
      </div>

      {/* Contact Info */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">
          Контактная информация
        </h4>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Имя</dt>
            <dd className="font-medium">{lead.name || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Телефон</dt>
            <dd className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded">
                {lead.phone}
              </code>
              <button onClick={() => handleCopy(lead.phone, "Телефон")}>
                <Copy size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            </dd>
          </div>
          {lead.email && (
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="flex items-center gap-2">
                <span>{lead.email}</span>
                <button onClick={() => handleCopy(lead.email!, "Email")}>
                  <Copy
                    size={14}
                    className="text-gray-400 hover:text-gray-600"
                  />
                </button>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Classification */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Классификация</h4>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Страна</dt>
            <dd>
              {typeof lead.country === "object" && lead.country ? (
                <span>
                  {lead.country.flag} {lead.country.name}
                </span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Направление</dt>
            <dd>
              {typeof lead.direction === "object" && lead.direction ? (
                <Badge variant="default">{lead.direction.name}</Badge>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Источник</dt>
            <dd>
              {typeof lead.source === "object" && lead.source ? (
                <span>{lead.source.name}</span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Additional Data */}
      {lead.data && Object.keys(lead.data).length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Дополнительные данные
          </h4>
          <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-40">
            {JSON.stringify(lead.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Error Message */}
      {lead.statusHistory?.some((h) => h.message) && (
        <div>
          <h4 className="font-medium text-red-600 mb-2">Сообщения</h4>
          {lead.statusHistory
            .filter((h) => h.message)
            .map((h, i) => (
              <p
                key={i}
                className="text-sm text-gray-600 bg-gray-50 p-3 rounded mb-1"
              >
                {h.message}
              </p>
            ))}
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-4 border-t">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Создан</dt>
            <dd>{formatDateTime(lead.createdAt)}</dd>
          </div>
          {lead.processedAt && (
            <div>
              <dt className="text-gray-500">Обработан</dt>
              <dd>{formatDateTime(lead.processedAt)}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4 border-t">
        <Button variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </div>
  );
}
