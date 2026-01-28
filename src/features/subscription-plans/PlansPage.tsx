import { useState, useMemo } from "react";
import {
  Card,
  Button,
  Badge,
  Switch,
  Spinner,
  EmptyState,
  ConfirmDialog,
} from "@/components/ui";
import { PageHeader } from "@/components/layout";
import { QueryError, SearchInput } from "@/components/shared";
import {
  useSubscriptionPlans,
  useUpdatePlan,
  useDeletePlan,
  useSeedPlans,
  useRefreshPlanCache,
} from "@/hooks/queries/useSubscriptionPlans";
import { PlanForm } from "./PlanForm";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Database,
  Star,
  Crown,
  Calendar,
  DollarSign,
  Zap,
} from "lucide-react";
import type { SubscriptionPlan, PlanPeriodType } from "@/types";

const periodTypeLabels: Record<PlanPeriodType, string> = {
  daily: "Ежедневно",
  weekly: "Еженедельно",
  monthly: "Ежемесячно",
  yearly: "Ежегодно",
  lifetime: "Навсегда",
};

const currencySymbols: Record<string, string> = {
  usd: "$",
  eur: "€",
  rub: "₽",
};

function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  const symbol = currencySymbols[currency] || currency.toUpperCase();
  return `${symbol}${amount.toFixed(2)}`;
}

export function PlansPage() {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(
    null,
  );

  const {
    data: plans,
    isLoading,
    isError,
    error,
    refetch,
  } = useSubscriptionPlans();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const seedPlans = useSeedPlans();
  const refreshCache = useRefreshPlanCache();

  // Фильтрация по поиску
  const filteredPlans = useMemo(() => {
    if (!plans) return [];
    if (!search) return plans;
    const searchLower = search.toLowerCase();
    return plans.filter(
      (plan) =>
        plan.code.toLowerCase().includes(searchLower) ||
        plan.name.toLowerCase().includes(searchLower) ||
        plan.description?.toLowerCase().includes(searchLower),
    );
  }, [plans, search]);

  // Обработчики
  const handleCreate = () => {
    setEditingPlan(null);
    setIsFormOpen(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPlan) return;
    try {
      await deletePlan.mutateAsync(deletingPlan._id);
      toast.success("Тариф удалён");
      setDeletingPlan(null);
    } catch {
      toast.error("Ошибка при удалении тарифа");
    }
  };

  const handleToggleActive = async (
    plan: SubscriptionPlan,
    isActive: boolean,
  ) => {
    try {
      await updatePlan.mutateAsync({
        id: plan._id,
        data: { isActive },
      });
      toast.success(isActive ? "Тариф активирован" : "Тариф деактивирован");
    } catch {
      toast.error("Ошибка при обновлении статуса");
    }
  };

  const handleToggleAvailable = async (
    plan: SubscriptionPlan,
    isAvailableForPurchase: boolean,
  ) => {
    try {
      await updatePlan.mutateAsync({
        id: plan._id,
        data: { isAvailableForPurchase },
      });
      toast.success(
        isAvailableForPurchase
          ? "Тариф доступен для покупки"
          : "Тариф скрыт из списка",
      );
    } catch {
      toast.error("Ошибка при обновлении доступности");
    }
  };

  const handleSeed = async () => {
    try {
      await seedPlans.mutateAsync();
      toast.success("Тарифы по умолчанию созданы");
    } catch {
      toast.error("Ошибка при создании тарифов");
    }
  };

  const handleRefreshCache = async () => {
    try {
      await refreshCache.mutateAsync();
      toast.success("Кэш обновлён");
    } catch {
      toast.error("Ошибка при обновлении кэша");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <QueryError
        message={error?.message || "Ошибка загрузки тарифов"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Тарифные планы"
        description="Управление тарифами подписок"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefreshCache}
              disabled={refreshCache.isPending}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshCache.isPending ? "animate-spin" : ""}`}
              />
              Обновить кэш
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSeed}
              disabled={seedPlans.isPending}
            >
              <Database className="h-4 w-4 mr-2" />
              Заполнить по умолчанию
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить тариф
            </Button>
          </div>
        }
      />

      <Card>
        <div className="p-4 border-b">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Поиск по коду, названию или описанию..."
          />
        </div>

        {filteredPlans.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-12 w-12 text-gray-400" />}
            title="Тарифы не найдены"
            description={
              search
                ? "Попробуйте изменить параметры поиска"
                : "Создайте первый тариф или заполните по умолчанию"
            }
            action={
              !search && (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleSeed}>
                    <Database className="h-4 w-4 mr-2" />
                    Заполнить по умолчанию
                  </Button>
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать тариф
                  </Button>
                </div>
              )
            }
          />
        ) : (
          <div className="divide-y">
            {filteredPlans.map((plan) => (
              <div
                key={plan._id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !plan.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Левая часть - информация */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {plan.icon && (
                        <span className="text-xl">{plan.icon}</span>
                      )}
                      <h3 className="font-medium text-gray-900">{plan.name}</h3>
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {plan.code}
                      </code>
                      {plan.isPopular && (
                        <Badge
                          variant="warning"
                          className="flex items-center gap-1"
                        >
                          <Star className="h-3 w-3" />
                          Популярный
                        </Badge>
                      )}
                      {plan.isRecommended && (
                        <Badge
                          variant="success"
                          className="flex items-center gap-1"
                        >
                          <Crown className="h-3 w-3" />
                          Рекомендуемый
                        </Badge>
                      )}
                      {plan.badge && <Badge variant="info">{plan.badge}</Badge>}
                    </div>

                    {plan.description && (
                      <p className="text-sm text-gray-500 mb-2">
                        {plan.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-gray-900">
                          {formatPrice(plan.price, plan.currency)}
                        </span>
                        {plan.oldPrice && (
                          <span className="line-through text-gray-400 ml-1">
                            {formatPrice(plan.oldPrice, plan.currency)}
                          </span>
                        )}
                        {plan.discountPercent > 0 && (
                          <Badge variant="success" size="sm">
                            -{plan.discountPercent}%
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{periodTypeLabels[plan.periodType]}</span>
                        <span className="text-gray-400">
                          ({plan.durationDays} дней)
                        </span>
                      </div>

                      {plan.hasTrial && plan.trialDays && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Zap className="h-4 w-4" />
                          <span>Trial {plan.trialDays} дней</span>
                        </div>
                      )}

                      {plan.tributeProductId && (
                        <Badge variant="info" size="sm">
                          Tribute #{plan.tributeProductId}
                        </Badge>
                      )}
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {plan.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="default" size="sm">
                            {feature}
                          </Badge>
                        ))}
                        {plan.features.length > 3 && (
                          <Badge variant="default" size="sm">
                            +{plan.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Правая часть - переключатели и действия */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-2 text-sm">
                      <Switch
                        label="Активен"
                        checked={plan.isActive}
                        onChange={(checked) =>
                          handleToggleActive(plan, checked)
                        }
                      />
                      <Switch
                        label="Для покупки"
                        checked={plan.isAvailableForPurchase}
                        onChange={(checked) =>
                          handleToggleAvailable(plan, checked)
                        }
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                        title="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingPlan(plan)}
                        title="Удалить"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Форма создания/редактирования */}
      <PlanForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPlan(null);
        }}
        plan={editingPlan}
      />

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        onConfirm={handleDelete}
        title="Удалить тариф"
        message={`Вы уверены, что хотите удалить тариф "${deletingPlan?.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={deletePlan.isPending}
      />
    </div>
  );
}
