import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  RefreshCw,
  Link2,
  X,
  CheckCircle,
  AlertCircle,
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
  useGroups,
  useDeleteGroup,
  useToggleGroup,
  useRegenerateDeepLink,
  usePendingGroups,
  useRejectPendingGroup,
} from "@/hooks/queries/useGroups";
import { useDirections } from "@/hooks/queries/useDirections";
import { GroupForm } from "./GroupForm";
import { LinkPendingGroupForm } from "./LinkPendingGroupForm";
import { copyToClipboard } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import toast from "react-hot-toast";
import type { ColumnDef } from "@tanstack/react-table";
import type { TelegramGroup, PendingGroup } from "@/types";

export function GroupsPage() {
  const [activeTab, setActiveTab] = useState("registered");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [directionFilter, setDirectionFilter] = useState<string>("");
  const [linkingGroup, setLinkingGroup] = useState<PendingGroup | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { data: directions } = useDirections();
  const { data: groups, isLoading } = useGroups(directionFilter || undefined);
  const { data: pendingGroups, isLoading: pendingLoading } = usePendingGroups();
  const deleteMutation = useDeleteGroup();
  const toggleMutation = useToggleGroup();
  const regenerateMutation = useRegenerateDeepLink();
  const rejectMutation = useRejectPendingGroup();

  const pendingCount =
    pendingGroups?.filter((g) => g.status === "pending").length || 0;

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

  // Статус группы
  const getGroupStatus = (group: TelegramGroup) => {
    if (!group.isActive) {
      return {
        icon: <AlertCircle size={16} />,
        label: "Неактивна",
        color: "default" as const,
      };
    }
    if (!group.chatId) {
      return {
        icon: <AlertCircle size={16} />,
        label: "Нет Chat ID",
        color: "warning" as const,
      };
    }
    return {
      icon: <CheckCircle size={16} />,
      label: "Активна",
      color: "success" as const,
    };
  };

  // Колонки для зарегистрированных групп
  const registeredColumns: ColumnDef<TelegramGroup, unknown>[] = [
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <div>
          <span className="font-medium">{row.original.name}</span>
          {row.original.directionId && (
            <div className="text-xs text-gray-500">
              {row.original.directionId.name}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "chatId",
      header: "Chat ID",
      cell: ({ row }) =>
        row.original.chatId ? (
          <div className="flex items-center gap-2">
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
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
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      accessorKey: "deepLinkId",
      header: "Deep Link",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
            {row.original.deepLinkId}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(row.original.deepLinkId)}
          >
            <Copy size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => regenerateMutation.mutate(row.original._id)}
            title="Перегенерировать"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "stats",
      header: "Статистика",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>Лидов: {row.original.stats?.leadsPublished || 0}</div>
          {row.original.stats?.lastPublishedAt && (
            <div className="text-xs text-gray-500">
              Последний: {formatDate(row.original.stats.lastPublishedAt)}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Статус",
      cell: ({ row }) => {
        const status = getGroupStatus(row.original);
        return (
          <div className="flex items-center gap-2">
            <Badge variant={status.color}>{status.label}</Badge>
            <Switch
              checked={row.original.isActive}
              onChange={() => toggleMutation.mutate(row.original._id)}
              size="sm"
            />
          </div>
        );
      },
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

  // Колонки для ожидающих групп
  const pendingColumns: ColumnDef<PendingGroup, unknown>[] = [
    {
      accessorKey: "title",
      header: "Название",
      cell: ({ row }) => (
        <div>
          <span className="font-medium">{row.original.title}</span>
          {row.original.username && (
            <div className="text-xs text-gray-500">
              @{row.original.username}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => {
        const types = {
          group: "Группа",
          supergroup: "Супергруппа",
          channel: "Канал",
        };
        return <Badge variant="info">{types[row.original.type]}</Badge>;
      },
    },
    {
      accessorKey: "chatId",
      header: "Chat ID",
      cell: ({ row }) => (
        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
          {row.original.chatId}
        </code>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Добавлено",
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setLinkingGroup(row.original)}
            leftIcon={<Link2 size={14} />}
          >
            Привязать
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

  return (
    <div>
      <PageHeader
        title="Группы"
        description="Telegram группы для публикации лидов"
        actions={
          <Button onClick={handleCreate} leftIcon={<Plus size={16} />}>
            Добавить вручную
          </Button>
        }
      />

      {/* Подсказка */}
      <Card className="mb-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Как добавить новую группу?</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Создайте группу/канал в Telegram</li>
              <li>Добавьте бота как администратора</li>
              <li>
                Группа автоматически появится во вкладке "Ожидающие регистрации"
              </li>
              <li>Выберите направление и привяжите группу</li>
            </ol>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="registered">
            Зарегистрированные группы
          </TabsTrigger>
          <TabsTrigger value="pending">
            Ожидающие регистрации
            {pendingCount > 0 && (
              <Badge variant="danger" className="ml-2">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registered">
          {/* Фильтр по направлению */}
          <Card className="mb-4">
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Select
                  label="Фильтр по направлению"
                  value={directionFilter}
                  onChange={(e) => setDirectionFilter(e.target.value)}
                  options={[
                    { value: "", label: "Все направления" },
                    ...(directions?.map((d) => ({
                      value: d._id,
                      label: `${d.country?.flag || ""} ${d.name}`.trim(),
                    })) || []),
                  ]}
                />
              </div>
              {directionFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDirectionFilter("")}
                  className="mt-6"
                >
                  Сбросить
                </Button>
              )}
            </div>
          </Card>

          <Card padding="none">
            <DataTable
              data={groups || []}
              columns={registeredColumns}
              isLoading={isLoading}
              emptyState={{
                title: "Нет зарегистрированных групп",
                description:
                  "Добавьте бота в Telegram группу, чтобы она появилась здесь",
              }}
            />
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card padding="none">
            <DataTable
              data={pendingGroups?.filter((g) => g.status === "pending") || []}
              columns={pendingColumns}
              isLoading={pendingLoading}
              emptyState={{
                title: "Нет ожидающих групп",
                description:
                  "Добавьте бота в Telegram группу, и она появится здесь автоматически",
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Модалки */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleClose}
        title={editingId ? "Редактировать группу" : "Создать группу вручную"}
      >
        <GroupForm groupId={editingId} onSuccess={handleClose} />
      </Modal>

      <Modal
        isOpen={!!linkingGroup}
        onClose={() => setLinkingGroup(null)}
        title="Привязка группы к направлению"
      >
        {linkingGroup && (
          <LinkPendingGroupForm
            pendingGroup={linkingGroup}
            onSuccess={() => setLinkingGroup(null)}
            onCancel={() => setLinkingGroup(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить группу?"
        message="Лиды больше не будут публиковаться в эту группу. Это действие нельзя отменить."
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onConfirm={handleReject}
        title="Отклонить группу?"
        message="Группа будет помечена как отклонённая. Если бот будет снова добавлен в эту группу, она опять появится в ожидающих."
        confirmText="Отклонить"
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
