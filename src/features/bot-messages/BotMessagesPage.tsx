import { useState, useMemo } from "react";
import { Card, Button, Switch, Spinner, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/layout";
import { QueryError, SearchInput } from "@/components/shared";
import {
  useBotMessages,
  useUpdateBotMessage,
  useRefreshBotMessagesCache,
} from "@/hooks/queries/useBotMessages";
import { BotMessageEditor } from "./BotMessageEditor";
import toast from "react-hot-toast";
import {
  RefreshCw,
  Pencil,
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import type { BotMessage } from "@/types/bot-message.types";
import { MESSAGE_CATEGORIES } from "@/types/bot-message.types";

export function BotMessagesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<BotMessage | null>(null);

  const {
    data: messages,
    isLoading,
    isError,
    error,
    refetch,
  } = useBotMessages();
  const updateMessage = useUpdateBotMessage();
  const refreshCache = useRefreshBotMessagesCache();

  // Группировка сообщений по категориям
  const groupedMessages = useMemo(() => {
    if (!messages) return {};

    const result: Record<string, BotMessage[]> = {};

    Object.entries(MESSAGE_CATEGORIES).forEach(([categoryKey, category]) => {
      result[categoryKey] = messages.filter((msg) =>
        category.keys.includes(msg.key),
      );
    });

    return result;
  }, [messages]);

  // Фильтрация по поиску
  const filteredMessages = useMemo(() => {
    if (!messages) return [];

    let filtered = messages;

    // Фильтр по категории
    if (selectedCategory) {
      const categoryKeys = MESSAGE_CATEGORIES[selectedCategory]?.keys || [];
      filtered = filtered.filter((msg) => categoryKeys.includes(msg.key));
    }

    // Фильтр по поиску
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.key.toLowerCase().includes(searchLower) ||
          msg.title.toLowerCase().includes(searchLower) ||
          msg.content.toLowerCase().includes(searchLower) ||
          msg.description?.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  }, [messages, search, selectedCategory]);

  // Обработчики
  const handleEdit = (message: BotMessage) => {
    setEditingMessage(message);
  };

  const handleToggleActive = async (message: BotMessage, isActive: boolean) => {
    try {
      await updateMessage.mutateAsync({
        id: message._id,
        data: { isActive },
      });
      toast.success(
        isActive ? "Сообщение активировано" : "Сообщение деактивировано",
      );
    } catch {
      toast.error("Ошибка при обновлении статуса");
    }
  };

  const handleRefreshCache = async () => {
    try {
      await refreshCache.mutateAsync();
      toast.success("Кэш сообщений обновлён");
    } catch {
      toast.error("Ошибка при обновлении кэша");
    }
  };

  // Подсчёт статистики
  const stats = useMemo(() => {
    if (!messages) return { total: 0, active: 0, inactive: 0 };
    return {
      total: messages.length,
      active: messages.filter((m) => m.isActive).length,
      inactive: messages.filter((m) => !m.isActive).length,
    };
  }, [messages]);

  // Форматирование даты
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Обрезка контента для превью
  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return <QueryError message={error?.message} onRetry={refetch} />;
  }

  // Категории для табов
  const categoryTabs = [
    { id: null, label: "Все", count: stats.total },
    ...Object.entries(MESSAGE_CATEGORIES).map(([key, category]) => ({
      id: key,
      label: category.label,
      count: groupedMessages[key]?.length || 0,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Сообщения бота"
        description="Управление текстами сообщений Telegram бота"
        actions={
          <Button
            variant="outline"
            onClick={handleRefreshCache}
            disabled={refreshCache.isPending}
          >
            {refreshCache.isPending ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <RefreshCw size={16} className="mr-2" />
            )}
            Обновить кэш
          </Button>
        }
      />

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500">Всего сообщений</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.active}</div>
              <div className="text-sm text-gray-500">Активных</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <div className="text-sm text-gray-500">Неактивных</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Фильтры */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Поиск */}
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Поиск по ключу, названию или содержимому..."
            />
          </div>
        </div>

        {/* Категории */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id || "all"}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  selectedCategory === tab.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Список сообщений */}
      {filteredMessages.length === 0 ? (
        <EmptyState
          icon={<Search className="w-12 h-12" />}
          title="Сообщения не найдены"
          description={
            search
              ? "Попробуйте изменить параметры поиска"
              : "В системе пока нет сообщений бота"
          }
        />
      ) : (
        <div className="space-y-4">
          {selectedCategory ? (
            // Показ отфильтрованного списка
            <Card>
              <div className="divide-y">
                {filteredMessages.map((message) => (
                  <MessageRow
                    key={message._id}
                    message={message}
                    onEdit={handleEdit}
                    onToggleActive={handleToggleActive}
                    formatDate={formatDate}
                    truncateContent={truncateContent}
                  />
                ))}
              </div>
            </Card>
          ) : (
            // Показ по категориям
            Object.entries(MESSAGE_CATEGORIES).map(
              ([categoryKey, category]) => {
                const categoryMessages = groupedMessages[categoryKey]?.filter(
                  (msg) => {
                    if (!search) return true;
                    const searchLower = search.toLowerCase();
                    return (
                      msg.key.toLowerCase().includes(searchLower) ||
                      msg.title.toLowerCase().includes(searchLower) ||
                      msg.content.toLowerCase().includes(searchLower) ||
                      msg.description?.toLowerCase().includes(searchLower)
                    );
                  },
                );

                if (!categoryMessages?.length) return null;

                return (
                  <Card key={categoryKey}>
                    <div className="p-4 border-b bg-gray-50">
                      <h3 className="font-semibold text-gray-900">
                        {category.label}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {categoryMessages.length} сообщений
                      </p>
                    </div>
                    <div className="divide-y">
                      {categoryMessages.map((message) => (
                        <MessageRow
                          key={message._id}
                          message={message}
                          onEdit={handleEdit}
                          onToggleActive={handleToggleActive}
                          formatDate={formatDate}
                          truncateContent={truncateContent}
                        />
                      ))}
                    </div>
                  </Card>
                );
              },
            )
          )}
        </div>
      )}

      {/* Модальное окно редактирования */}
      {editingMessage && (
        <BotMessageEditor
          message={editingMessage}
          isOpen={!!editingMessage}
          onClose={() => setEditingMessage(null)}
        />
      )}
    </div>
  );
}

// Компонент строки сообщения
interface MessageRowProps {
  message: BotMessage;
  onEdit: (message: BotMessage) => void;
  onToggleActive: (message: BotMessage, isActive: boolean) => void;
  formatDate: (date: string) => string;
  truncateContent: (content: string, maxLength?: number) => string;
}

function MessageRow({
  message,
  onEdit,
  onToggleActive,
  formatDate,
  truncateContent,
}: MessageRowProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Заголовок и ключ */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">
              {message.title}
            </h4>
            <code className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
              {message.key}
            </code>
          </div>

          {/* Описание */}
          {message.description && (
            <p className="text-sm text-gray-500 mb-2">{message.description}</p>
          )}

          {/* Превью контента */}
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border font-mono">
            {truncateContent(message.content, 150)}
          </p>

          {/* Мета информация */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              Изменено: {formatDate(message.updatedAt)}
            </div>
            {message.variables.length > 0 && (
              <div>
                Переменные:{" "}
                {message.variables.map((v) => `{{${v}}}`).join(", ")}
              </div>
            )}
          </div>
        </div>

        {/* Действия */}
        <div className="flex items-center gap-3">
          <Switch
            checked={message.isActive}
            onChange={(checked) => onToggleActive(message, checked)}
          />
          <Button variant="outline" size="sm" onClick={() => onEdit(message)}>
            <Pencil size={14} className="mr-1" />
            Редактировать
          </Button>
        </div>
      </div>
    </div>
  );
}
