import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Key,
  Link2,
  X,
  Hash,
  MessageSquare,
  Globe,
  Plug,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Button,
  Modal,
  Card,
  ConfirmDialog,
  Switch,
  Badge,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { DataTable } from "@/components/shared";
import {
  useSources,
  useDeleteSource,
  useToggleSource,
  useRegenerateApiKey,
  usePendingSources,
  useRejectPendingSource,
  useParsingTemplates,
} from "@/hooks/queries/useSources";
import { useDirections } from "@/hooks/queries/useDirections";
import { SourceForm } from "./SourceForm";
import { LinkPendingSourceForm } from "./LinkPendingSourceForm";
import { copyToClipboard } from "@/lib/utils";
import toast from "react-hot-toast";
import type { ColumnDef } from "@tanstack/react-table";
import type { LeadSource, PendingSource, ParsingTemplate } from "@/types";

export function SourcesPage() {
  const [activeTab, setActiveTab] = useState("sources");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [directionFilter, setDirectionFilter] = useState<string>("");
  const [linkingSource, setLinkingSource] = useState<PendingSource | null>(
    null,
  );
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { data: directions } = useDirections();
  const { data: sources, isLoading } = useSources(directionFilter || undefined);
  const { data: pendingSources, isLoading: pendingLoading } =
    usePendingSources();
  const { data: parsingTemplates } = useParsingTemplates();
  const deleteMutation = useDeleteSource();
  const toggleMutation = useToggleSource();
  const regenerateKeyMutation = useRegenerateApiKey();
  const rejectMutation = useRejectPendingSource();

  const pendingCount =
    pendingSources?.filter((s) => s.status === "pending").length || 0;

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

  const handleReject = async () => {
    if (rejectingId) {
      await rejectMutation.mutateAsync(rejectingId);
      setRejectingId(null);
    }
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success("Скопировано!");
    }
  };

  const handleRegenerateKey = async (id: string) => {
    if (window.confirm("Текущий API ключ перестанет работать. Продолжить?")) {
      const result = await regenerateKeyMutation.mutateAsync(id);
      if (result.apiKey) {
        await copyToClipboard(result.apiKey);
        toast.success("Новый ключ скопирован в буфер обмена");
      }
    }
  };

  // Иконка типа источника
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "telegram_channel":
        return <Hash size={16} className="text-blue-500" />;
      case "telegram_group":
        return <MessageSquare size={16} className="text-green-500" />;
      case "api":
        return <Plug size={16} className="text-purple-500" />;
      case "website":
        return <Globe size={16} className="text-orange-500" />;
      default:
        return <Hash size={16} className="text-gray-500" />;
    }
  };

  // Лейбл типа
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "telegram_channel":
        return "Канал";
      case "telegram_group":
        return "Группа";
      case "api":
        return "API";
      case "website":
        return "Сайт";
      default:
        return type;
    }
  };

  // Колонки для зарегистрированных источников
  const sourceColumns: ColumnDef<LeadSource, unknown>[] = [
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(row.original.type)}
          <div>
            <span className="font-medium">{row.original.name}</span>
            <div className="text-xs text-gray-500">
              {row.original.slug && (
                <code className="bg-gray-100 px-1 rounded">
                  {row.original.slug}
                </code>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => (
        <Badge variant="default">{getTypeLabel(row.original.type)}</Badge>
      ),
    },
    {
      accessorKey: "directionIds",
      header: "Направления",
      cell: ({ row }) => {
        const dirIds = row.original.directionIds || [];
        return (
          <div className="flex flex-wrap gap-1">
            {dirIds.map((dir, index) => {
              // Проверяем, это populated объект или просто ID
              const isPopulated = typeof dir === "object" && dir !== null;
              const directionId = isPopulated ? dir._id : dir;
              const directionName = isPopulated
                ? dir.name
                : directions?.find((d) => d._id === dir)?.name || dir;
              return (
                <Badge key={directionId || index} variant="info">
                  {directionName}
                </Badge>
              );
            })}
            {dirIds.length === 0 && <span className="text-gray-400">—</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "apiKey",
      header: "API Key",
      cell: ({ row }) =>
        row.original.type === "api" && row.original.apiKey ? (
          <div className="flex items-center gap-2">
            <code className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[100px]">
              {row.original.apiKey.slice(0, 12)}...
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(row.original.apiKey!)}
            >
              <Copy size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRegenerateKey(row.original._id)}
              title="Перегенерировать"
            >
              <Key size={14} />
            </Button>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      accessorKey: "leadsCount",
      header: "Лидов",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.leadsCount?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Статус",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onChange={() => toggleMutation.mutate(row.original._id)}
          size="sm"
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original._id)}
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.original._id)}
          >
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  // Колонки для ожидающих источников
  const pendingColumns: ColumnDef<PendingSource, unknown>[] = [
    {
      accessorKey: "title",
      header: "Название",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.chatType === "channel" ? (
            <Hash size={16} className="text-blue-500" />
          ) : (
            <MessageSquare size={16} className="text-green-500" />
          )}
          <div>
            <span className="font-medium">{row.original.title}</span>
            {row.original.username && (
              <div className="text-xs text-gray-500">
                @{row.original.username}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "chatType",
      header: "Тип",
      cell: ({ row }) => {
        const labels: Record<string, string> = {
          channel: "Канал",
          group: "Группа",
          supergroup: "Супергруппа",
        };
        return (
          <Badge variant="default">
            {labels[row.original.chatType] || row.original.chatType}
          </Badge>
        );
      },
    },
    {
      accessorKey: "chatId",
      header: "Chat ID",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {row.original.chatId}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(row.original.chatId)}
          >
            <Copy size={14} />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "suggestedSlug",
      header: "Предложенный slug",
      cell: ({ row }) =>
        row.original.suggestedSlug ? (
          <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
            {row.original.suggestedSlug}
          </code>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const statusConfig: Record<
          string,
          { label: string; variant: "default" | "success" | "warning" }
        > = {
          pending: { label: "Ожидает", variant: "warning" },
          linked: { label: "Подключен", variant: "success" },
          rejected: { label: "Отклонён", variant: "default" },
        };
        const config =
          statusConfig[row.original.status] || statusConfig.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "pending" && (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setLinkingSource(row.original)}
            >
              <Link2 size={16} className="mr-1" />
              Подключить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRejectingId(row.original._id)}
            >
              <X size={16} className="text-red-500" />
            </Button>
          </div>
        ),
    },
  ];

  // Колонки для шаблонов парсинга
  const templateColumns: ColumnDef<ParsingTemplate, unknown>[] = [
    {
      accessorKey: "key",
      header: "Ключ",
      cell: ({ row }) => (
        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
          {row.original.key}
        </code>
      ),
    },
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Описание",
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.description}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Источники"
        description="Управление источниками получения лидов (парсинг каналов/групп)"
        actions={
          <Button onClick={handleCreate} leftIcon={<Plus size={16} />}>
            Добавить источник
          </Button>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="sources">Все источники</TabsTrigger>
          <TabsTrigger value="pending">
            Ожидающие настройки
            {pendingCount > 0 && (
              <Badge variant="warning" className="ml-2">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="templates">Шаблоны парсинга</TabsTrigger>
        </TabsList>

        {/* Вкладка зарегистрированных источников */}
        <TabsContent value="sources">
          {/* Фильтр по направлению */}
          <div className="mb-4">
            <Select
              label=""
              options={[
                { value: "", label: "Все направления" },
                ...(directions?.map((d) => ({
                  value: d._id,
                  label: `${d.country?.flag || ""} ${d.name}`,
                })) || []),
              ]}
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="w-64"
            />
          </div>

          <Card padding="none">
            <DataTable
              data={sources || []}
              columns={sourceColumns}
              isLoading={isLoading}
              emptyState={{
                title: "Нет источников",
                description:
                  "Добавьте бота в канал/группу как участника или создайте источник вручную",
                action: (
                  <Button onClick={handleCreate} leftIcon={<Plus size={16} />}>
                    Добавить
                  </Button>
                ),
              }}
            />
          </Card>
        </TabsContent>

        {/* Вкладка ожидающих источников */}
        <TabsContent value="pending">
          {/* Инструкция */}
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  Как добавить источник автоматически:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Добавьте бота в канал/группу <strong>как участника</strong>{" "}
                    (не админа!)
                  </li>
                  <li>Источник появится в этом списке</li>
                  <li>
                    Нажмите "Подключить" и выберите направления и шаблон
                    парсинга
                  </li>
                </ol>
                <p className="mt-2 text-xs text-blue-600">
                  💡 Если добавить бота как администратора — он станет группой
                  для публикации, а не источником для парсинга
                </p>
              </div>
            </div>
          </Card>

          <Card padding="none">
            <DataTable
              data={pendingSources?.filter((s) => s.status === "pending") || []}
              columns={pendingColumns}
              isLoading={pendingLoading}
              emptyState={{
                title: "Нет ожидающих источников",
                description:
                  "Добавьте бота в канал или группу как участника для автоматического создания источника",
              }}
            />
          </Card>
        </TabsContent>

        {/* Вкладка шаблонов парсинга */}
        <TabsContent value="templates">
          <Card className="mb-4 bg-gray-50">
            <div className="flex gap-3">
              <Info size={20} className="text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p>
                  Шаблоны парсинга определяют, как извлекаются данные из
                  сообщений канала/группы. Выберите подходящий шаблон при
                  подключении источника.
                </p>
              </div>
            </div>
          </Card>

          <Card padding="none">
            <DataTable
              data={parsingTemplates || []}
              columns={templateColumns}
              isLoading={false}
              emptyState={{
                title: "Нет шаблонов",
                description: "Шаблоны парсинга не загружены",
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Модалка создания/редактирования источника */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleClose}
        title={editingId ? "Редактировать источник" : "Новый источник"}
      >
        <SourceForm sourceId={editingId} onSuccess={handleClose} />
      </Modal>

      {/* Модалка привязки pending источника */}
      <Modal
        isOpen={!!linkingSource}
        onClose={() => setLinkingSource(null)}
        title="Настройка источника"
        size="lg"
      >
        {linkingSource && (
          <LinkPendingSourceForm
            source={linkingSource}
            onSuccess={() => setLinkingSource(null)}
          />
        )}
      </Modal>

      {/* Подтверждение удаления */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить источник?"
        message="Источник будет удалён. Собранные лиды останутся в системе."
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />

      {/* Подтверждение отклонения */}
      <ConfirmDialog
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onConfirm={handleReject}
        title="Отклонить источник?"
        message="Источник будет отклонён и удалён из списка ожидающих."
        confirmText="Отклонить"
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
