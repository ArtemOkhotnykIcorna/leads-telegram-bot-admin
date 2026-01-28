import { useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Ban,
  TrendingUp,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, Button, Select, Badge, Modal } from "@/components/ui";
import { DataTable, SearchInput } from "@/components/shared";
import {
  useUsers,
  useUsersStats,
  useBlockUser,
  useUnblockUser,
  useDeleteUser,
} from "@/hooks/queries/useUsers";
import { UserForm } from "./UserForm";
import { ActivateSubscriptionModal } from "./ActivateSubscriptionModal";
import { UserDetailsModal } from "./UserDetailsModal";
import { formatDate } from "@/lib/formatters";
import { useDebounce } from "@/hooks/useDebounce";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  User,
  SubscriptionStatus,
  UsersQueryParams,
} from "@/types/user.types";
import { ConfirmDialog } from "@/components/ui";

// Конфигурация статусов
const statusConfig: Record<
  SubscriptionStatus,
  {
    label: string;
    variant: "default" | "success" | "warning" | "danger" | "info";
    icon: React.ReactNode;
  }
> = {
  trial: {
    label: "Пробный",
    variant: "info",
    icon: <Clock size={14} />,
  },
  active: {
    label: "Активный",
    variant: "success",
    icon: <UserCheck size={14} />,
  },
  expired: {
    label: "Истёк",
    variant: "warning",
    icon: <UserX size={14} />,
  },
  blocked: {
    label: "Заблокирован",
    variant: "danger",
    icon: <Ban size={14} />,
  },
};

// Компонент статистики
function StatsCard({
  title,
  value,
  icon,
  color,
  onClick,
  isActive,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all text-left w-full ${
        isActive
          ? "border-blue-500 bg-blue-50"
          : "border-transparent bg-white hover:border-gray-200 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        <div className={`text-2xl font-bold text-gray-900`}>
          {value.toLocaleString()}
        </div>
      </div>
      <div className="text-sm text-gray-600 mt-2">{title}</div>
    </button>
  );
}

// Компонент статус-бейджа
function UserStatusBadge({ status }: { status: SubscriptionStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant}>
      <span className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </span>
    </Badge>
  );
}

export function UsersPage() {
  // Состояние фильтров
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | "">("");
  const [sortBy, setSortBy] = useState<UsersQueryParams["sortBy"]>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Модальные окна
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activatingUser, setActivatingUser] = useState<User | null>(null);
  const [blockingUser, setBlockingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchValue, 300);

  // Query параметры
  const queryParams: UsersQueryParams = {
    page,
    limit: 20,
    ...(status && { status }),
    ...(debouncedSearch && { search: debouncedSearch }),
    sortBy,
    sortOrder,
  };

  // Данные
  const { data, isLoading, refetch } = useUsers(queryParams);
  const { data: stats } = useUsersStats();

  // Мутации
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const deleteMutation = useDeleteUser();

  // Обработчики
  const handleStatusFilter = (newStatus: SubscriptionStatus | "") => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleQuickFilter = (filterStatus: SubscriptionStatus | null) => {
    setStatus(filterStatus || "");
    setPage(1);
  };

  const handleSort = (field: UsersQueryParams["sortBy"]) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleBlock = async () => {
    if (blockingUser) {
      await blockMutation.mutateAsync(blockingUser._id);
      setBlockingUser(null);
    }
  };

  const handleUnblock = async (user: User) => {
    await unblockMutation.mutateAsync(user._id);
  };

  const handleDelete = async () => {
    if (deletingUser) {
      await deleteMutation.mutateAsync(deletingUser._id);
      setDeletingUser(null);
    }
  };

  // Колонки таблицы
  const columns: ColumnDef<User, unknown>[] = [
    {
      accessorKey: "telegramId",
      header: () => (
        <button
          onClick={() => handleSort("telegramId")}
          className="flex items-center gap-1 hover:text-gray-700"
        >
          Telegram ID
          {sortBy === "telegramId" && (
            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
          )}
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.telegramId}</span>
      ),
    },
    {
      accessorKey: "username",
      header: () => (
        <button
          onClick={() => handleSort("username")}
          className="flex items-center gap-1 hover:text-gray-700"
        >
          Username
          {sortBy === "username" && (
            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
          )}
        </button>
      ),
      cell: ({ row }) => (
        <div>
          {row.original.username ? (
            <a
              href={`https://t.me/${row.original.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              @{row.original.username}
            </a>
          ) : (
            <span className="text-gray-400">-</span>
          )}
          {(row.original.firstName || row.original.lastName) && (
            <div className="text-xs text-gray-500">
              {[row.original.firstName, row.original.lastName]
                .filter(Boolean)
                .join(" ")}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "subscription.status",
      header: () => (
        <button
          onClick={() => handleSort("subscription.status")}
          className="flex items-center gap-1 hover:text-gray-700"
        >
          Статус
          {sortBy === "subscription.status" && (
            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
          )}
        </button>
      ),
      cell: ({ row }) => (
        <UserStatusBadge status={row.original.subscription.status} />
      ),
    },
    {
      accessorKey: "subscription.activeUntil",
      header: () => (
        <button
          onClick={() => handleSort("subscription.activeUntil")}
          className="flex items-center gap-1 hover:text-gray-700"
        >
          Активен до
          {sortBy === "subscription.activeUntil" && (
            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
          )}
        </button>
      ),
      cell: ({ row }) => {
        const activeUntil = row.original.subscription.activeUntil;
        if (!activeUntil) return <span className="text-gray-400">-</span>;

        const isExpired = new Date(activeUntil) < new Date();
        return (
          <span className={isExpired ? "text-red-600" : "text-gray-700"}>
            {formatDate(activeUntil)}
          </span>
        );
      },
    },
    {
      accessorKey: "permissions.accessInsurance",
      header: "Страховки",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.permissions.accessInsurance ? "success" : "default"
          }
        >
          {row.original.permissions.accessInsurance ? "Да" : "Нет"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <button
          onClick={() => handleSort("createdAt")}
          className="flex items-center gap-1 hover:text-gray-700"
        >
          Создан
          {sortBy === "createdAt" && (
            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
          )}
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        const isBlocked = user.subscription.status === "blocked";

        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUser(user)}
              title="Подробнее"
            >
              👁️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingUser(user)}
              title="Редактировать"
            >
              ✏️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivatingUser(user)}
              title="Активировать подписку"
            >
              🎫
            </Button>
            {isBlocked ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnblock(user)}
                title="Разблокировать"
                disabled={unblockMutation.isPending}
              >
                🔓
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBlockingUser(user)}
                title="Заблокировать"
              >
                🔒
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeletingUser(user)}
              title="Удалить"
            >
              🗑️
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Пользователи"
        description="Управление пользователями бота"
        actions={
          <Button onClick={() => refetch()} leftIcon={<RefreshCw size={16} />}>
            Обновить
          </Button>
        }
      />

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <StatsCard
            title="Всего"
            value={stats.total}
            icon={<Users size={20} className="text-gray-600" />}
            color="bg-gray-100"
            onClick={() => handleQuickFilter(null)}
            isActive={!status}
          />
          <StatsCard
            title="Пробный период"
            value={stats.byStatus.trial}
            icon={<Clock size={20} className="text-blue-600" />}
            color="bg-blue-100"
            onClick={() => handleQuickFilter("trial")}
            isActive={status === "trial"}
          />
          <StatsCard
            title="Активные"
            value={stats.byStatus.active}
            icon={<UserCheck size={20} className="text-green-600" />}
            color="bg-green-100"
            onClick={() => handleQuickFilter("active")}
            isActive={status === "active"}
          />
          <StatsCard
            title="Истёкшие"
            value={stats.byStatus.expired}
            icon={<UserX size={20} className="text-yellow-600" />}
            color="bg-yellow-100"
            onClick={() => handleQuickFilter("expired")}
            isActive={status === "expired"}
          />
          <StatsCard
            title="Заблокированные"
            value={stats.byStatus.blocked}
            icon={<Ban size={20} className="text-red-600" />}
            color="bg-red-100"
            onClick={() => handleQuickFilter("blocked")}
            isActive={status === "blocked"}
          />
          <StatsCard
            title="Новые за 24ч"
            value={stats.newLast24h}
            icon={<TrendingUp size={20} className="text-purple-600" />}
            color="bg-purple-100"
          />
        </div>
      )}

      {/* Дополнительная статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <UserCheck size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.activeSubscriptions}
                </div>
                <div className="text-sm text-gray-500">Активных подписок</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.newLast7d}</div>
                <div className="text-sm text-gray-500">Новых за 7 дней</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <TrendingUp size={20} className="text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.newLast30d}</div>
                <div className="text-sm text-gray-500">Новых за 30 дней</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Фильтры */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Поиск по username, имени или Telegram ID..."
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={status}
              onChange={(e) =>
                handleStatusFilter(e.target.value as SubscriptionStatus | "")
              }
              options={[
                { value: "", label: "Все статусы" },
                { value: "trial", label: "Пробный" },
                { value: "active", label: "Активный" },
                { value: "expired", label: "Истёкший" },
                { value: "blocked", label: "Заблокирован" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Таблица */}
      <Card padding="none">
        <DataTable
          data={data?.users || []}
          columns={columns}
          isLoading={isLoading}
          pagination={
            data
              ? {
                  page: data.page,
                  pageSize: data.limit,
                  total: data.total,
                  onPageChange: setPage,
                }
              : undefined
          }
          clientPagination={false}
          emptyState={{
            title: "Пользователи не найдены",
            description: searchValue
              ? "Попробуйте изменить параметры поиска"
              : "Пользователи появятся после начала использования бота",
          }}
        />
      </Card>

      {/* Модальные окна */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title="Редактировать пользователя"
          size="lg"
        >
          <UserForm user={editingUser} onSuccess={() => setEditingUser(null)} />
        </Modal>
      )}

      {activatingUser && (
        <ActivateSubscriptionModal
          user={activatingUser}
          isOpen={!!activatingUser}
          onClose={() => setActivatingUser(null)}
        />
      )}

      {/* Подтверждение блокировки */}
      <ConfirmDialog
        isOpen={!!blockingUser}
        onClose={() => setBlockingUser(null)}
        onConfirm={handleBlock}
        title="Заблокировать пользователя?"
        message={`Пользователь ${
          blockingUser?.username
            ? `@${blockingUser.username}`
            : blockingUser?.telegramId
        } потеряет доступ к боту.`}
        confirmText="Заблокировать"
        isLoading={blockMutation.isPending}
      />

      {/* Подтверждение удаления */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title="Удалить пользователя?"
        message={`Пользователь ${
          deletingUser?.username
            ? `@${deletingUser.username}`
            : deletingUser?.telegramId
        } будет удалён безвозвратно.`}
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
