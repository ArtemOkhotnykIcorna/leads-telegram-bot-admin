import { useLead, useRetryLead } from "@/hooks/queries/useLeads";
import { Button, Badge, Spinner } from "@/components/ui";
import { formatDateTime } from "@/lib/formatters";
import {
  RefreshCw,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  AtSign,
  MessageSquare,
  AlertTriangle,
  Send,
  X,
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import toast from "react-hot-toast";
import type { LeadStatus, LeadPublishInfo } from "@/types";

interface LeadDetailsProps {
  leadId: string;
  onClose: () => void;
}

// Конфигурация статусов
const statusConfig: Record<
  LeadStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
  }
> = {
  new: {
    label: "Новый",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: <Clock size={16} />,
  },
  processing: {
    label: "В обработке",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: <RefreshCw size={16} className="animate-spin" />,
  },
  published: {
    label: "Опубликован",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: <CheckCircle size={16} />,
  },
  failed: {
    label: "Ошибка",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: <XCircle size={16} />,
  },
  duplicate: {
    label: "Дубликат",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: <Copy size={16} />,
  },
  skipped: {
    label: "Пропущен",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    icon: <X size={16} />,
  },
};

// Компонент записи публикации
function PublicationItem({ pub }: { pub: LeadPublishInfo }) {
  const groupName =
    typeof pub.groupId === "object" && pub.groupId
      ? pub.groupId.name
      : "Группа";

  return (
    <div
      className={`p-3 rounded-lg border ${pub.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {pub.success ? (
            <CheckCircle size={16} className="text-green-600" />
          ) : (
            <XCircle size={16} className="text-red-600" />
          )}
          <span className="font-medium">{groupName}</span>
        </div>
        <span className="text-xs text-gray-500">
          {formatDateTime(pub.publishedAt)}
        </span>
      </div>
      {pub.messageId && (
        <div className="mt-1 text-xs text-gray-500">
          ID сообщения: {pub.messageId}
        </div>
      )}
      {pub.error && (
        <div className="mt-2 text-sm text-red-600 bg-red-100 px-2 py-1 rounded">
          {pub.error}
        </div>
      )}
    </div>
  );
}

export function LeadDetails({ leadId, onClose }: LeadDetailsProps) {
  const { data: lead, isLoading } = useLead(leadId);
  const retryMutation = useRetryLead();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!lead) {
    return <div className="text-center py-12 text-gray-500">Лид не найден</div>;
  }

  const handleCopy = async (text: string | undefined, label: string) => {
    if (!text) return;
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} скопирован!`);
    }
  };

  const handleRetry = async () => {
    await retryMutation.mutateAsync(leadId);
    toast.success("Лид отправлен на повторную публикацию");
  };

  const statusCfg = statusConfig[lead.status];

  // Хелперы для populated данных
  const source =
    typeof lead.sourceId === "object" && lead.sourceId ? lead.sourceId : null;
  const direction =
    typeof lead.directionId === "object" && lead.directionId
      ? lead.directionId
      : null;
  const country =
    typeof lead.countryId === "object" && lead.countryId
      ? lead.countryId
      : null;

  return (
    <div className="space-y-6">
      {/* Статус и действия */}
      <div className="flex items-center justify-between pb-4 border-b">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusCfg.bgColor} ${statusCfg.color}`}
        >
          {statusCfg.icon}
          {statusCfg.label}
        </span>
        {lead.status === "failed" && (
          <Button
            size="sm"
            onClick={handleRetry}
            isLoading={retryMutation.isPending}
            leftIcon={<RefreshCw size={14} />}
          >
            Повторить публикацию
          </Button>
        )}
      </div>

      {/* Заголовок и контент */}
      {(lead.title || lead.content) && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <MessageSquare size={16} />
            Содержание
          </h4>
          {lead.title && (
            <div className="font-semibold text-lg mb-2">{lead.title}</div>
          )}
          {lead.content && (
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
              {lead.content}
            </div>
          )}
        </div>
      )}

      {/* Контактная информация */}
      {lead.contact && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Контактная информация
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {lead.contact.name && (
              <div className="flex items-center gap-3">
                <User size={16} className="text-gray-400" />
                <span className="font-medium">{lead.contact.name}</span>
              </div>
            )}
            {lead.contact.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <code className="bg-white px-2 py-1 rounded border">
                  {lead.contact.phone}
                </code>
                <button
                  onClick={() => handleCopy(lead.contact?.phone, "Телефон")}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Copy size={14} className="text-gray-400" />
                </button>
              </div>
            )}
            {lead.contact.email && (
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400" />
                <a
                  href={`mailto:${lead.contact.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {lead.contact.email}
                </a>
                <button
                  onClick={() => handleCopy(lead.contact?.email, "Email")}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Copy size={14} className="text-gray-400" />
                </button>
              </div>
            )}
            {lead.contact.telegram && (
              <div className="flex items-center gap-3">
                <AtSign size={16} className="text-gray-400" />
                <a
                  href={`https://t.me/${lead.contact.telegram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {lead.contact.telegram}
                </a>
                <button
                  onClick={() => handleCopy(lead.contact?.telegram, "Telegram")}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Copy size={14} className="text-gray-400" />
                </button>
              </div>
            )}
            {!lead.contact.name &&
              !lead.contact.phone &&
              !lead.contact.email &&
              !lead.contact.telegram && (
                <span className="text-gray-400">Нет контактных данных</span>
              )}
          </div>
        </div>
      )}

      {/* Классификация */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Классификация</h4>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Источник</dt>
            <dd className="font-medium">
              {source ? source.name : <span className="text-gray-400">—</span>}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Направление</dt>
            <dd>
              {direction ? (
                <Badge variant="info">{direction.name}</Badge>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </dd>
          </div>
          {country && (
            <div>
              <dt className="text-sm text-gray-500">Страна</dt>
              <dd>
                {country.flag} {country.name}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* История публикаций */}
      {lead.publications && lead.publications.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Send size={16} />
            История публикаций ({lead.publications.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {lead.publications.map((pub, index) => (
              <PublicationItem key={index} pub={pub} />
            ))}
          </div>
        </div>
      )}

      {/* Ошибка */}
      {lead.lastError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
            <AlertTriangle size={16} />
            Последняя ошибка
          </div>
          <p className="text-sm text-red-600">{lead.lastError}</p>
        </div>
      )}

      {/* Метаданные */}
      <div className="pt-4 border-t">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Создан</dt>
            <dd>{formatDateTime(lead.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Попыток публикации</dt>
            <dd>{lead.publishAttempts || 0}</dd>
          </div>
          {lead.updatedAt && (
            <div>
              <dt className="text-gray-500">Обновлён</dt>
              <dd>{formatDateTime(lead.updatedAt)}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Действия */}
      <div className="flex justify-end pt-4 border-t">
        <Button variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </div>
  );
}
