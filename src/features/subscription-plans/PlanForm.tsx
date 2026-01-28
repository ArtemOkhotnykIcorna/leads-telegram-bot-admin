import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Modal,
  Button,
  Input,
  Select,
  Switch,
  Textarea,
} from "@/components/ui";
import {
  useCreatePlan,
  useUpdatePlan,
} from "@/hooks/queries/useSubscriptionPlans";
import toast from "react-hot-toast";
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanDto,
  PlanPeriodType,
  PlanCurrency,
} from "@/types";

interface PlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan | null;
}

const periodTypeOptions: { value: PlanPeriodType; label: string }[] = [
  { value: "daily", label: "Ежедневно" },
  { value: "weekly", label: "Еженедельно" },
  { value: "monthly", label: "Ежемесячно" },
  { value: "yearly", label: "Ежегодно" },
  { value: "lifetime", label: "Навсегда" },
];

const currencyOptions: { value: PlanCurrency; label: string }[] = [
  { value: "usd", label: "USD ($)" },
  { value: "eur", label: "EUR (€)" },
  { value: "rub", label: "RUB (₽)" },
];

// Длительность по умолчанию для каждого типа периода
const defaultDurations: Record<PlanPeriodType, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
  lifetime: 36500,
};

export function PlanForm({ isOpen, onClose, plan }: PlanFormProps) {
  const isEditing = !!plan;
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateSubscriptionPlanDto>({
    defaultValues: {
      periodType: "monthly",
      durationDays: 30,
      currency: "usd",
      sortOrder: 0,
      discountPercent: 0,
      isPopular: false,
      isRecommended: false,
      isActive: true,
      isAvailableForPurchase: true,
      hasTrial: false,
      features: [],
    },
  });

  const periodType = watch("periodType");
  const hasTrial = watch("hasTrial");

  // Заполняем форму при редактировании
  useEffect(() => {
    if (plan) {
      reset({
        code: plan.code,
        name: plan.name,
        description: plan.description || "",
        periodType: plan.periodType,
        durationDays: plan.durationDays,
        price: plan.price,
        currency: plan.currency,
        discountPercent: plan.discountPercent || 0,
        oldPrice: plan.oldPrice,
        sortOrder: plan.sortOrder || 0,
        isPopular: plan.isPopular,
        isRecommended: plan.isRecommended,
        badge: plan.badge || "",
        icon: plan.icon || "",
        features: plan.features || [],
        isActive: plan.isActive,
        isAvailableForPurchase: plan.isAvailableForPurchase,
        hasTrial: plan.hasTrial,
        trialDays: plan.trialDays,
        tributeProductId: plan.tributeProductId,
        tributeLink: plan.tributeLink || "",
        tributeWebLink: plan.tributeWebLink || "",
      });
    } else {
      reset({
        periodType: "monthly",
        durationDays: 30,
        currency: "usd",
        sortOrder: 0,
        discountPercent: 0,
        isPopular: false,
        isRecommended: false,
        isActive: true,
        isAvailableForPurchase: true,
        hasTrial: false,
        features: [],
      });
    }
  }, [plan, reset]);

  // Автоматическое заполнение durationDays при смене периода
  useEffect(() => {
    if (!isEditing && periodType) {
      setValue("durationDays", defaultDurations[periodType]);
    }
  }, [periodType, isEditing, setValue]);

  const onSubmit = async (data: CreateSubscriptionPlanDto) => {
    try {
      // Парсим features из строки, если это строка
      const processedData = {
        ...data,
        features:
          typeof data.features === "string"
            ? (data.features as string)
                .split("\n")
                .map((f) => f.trim())
                .filter(Boolean)
            : data.features,
      };

      if (isEditing && plan) {
        await updatePlan.mutateAsync({
          id: plan._id,
          data: processedData,
        });
        toast.success("Тариф обновлён");
      } else {
        await createPlan.mutateAsync(processedData);
        toast.success("Тариф создан");
      }
      onClose();
    } catch (error) {
      toast.error(
        isEditing
          ? "Ошибка при обновлении тарифа"
          : "Ошибка при создании тарифа",
      );
    }
  };

  const isLoading = createPlan.isPending || updatePlan.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Редактировать тариф" : "Создать тариф"}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Основная информация */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">
            Основная информация
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Код *"
              placeholder="monthly"
              disabled={isEditing}
              error={errors.code?.message}
              {...register("code", { required: "Обязательное поле" })}
            />
            <Input
              label="Название *"
              placeholder="Месячная подписка"
              error={errors.name?.message}
              {...register("name", { required: "Обязательное поле" })}
            />
          </div>

          <Textarea
            label="Описание"
            placeholder="Описание тарифа..."
            rows={2}
            {...register("description")}
          />

          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="periodType"
              control={control}
              render={({ field }) => (
                <Select
                  label="Тип периода *"
                  options={periodTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Input
              label="Длительность (дней) *"
              type="number"
              error={errors.durationDays?.message}
              {...register("durationDays", {
                required: "Обязательное поле",
                valueAsNumber: true,
              })}
            />
            <Input label="Иконка" placeholder="📅" {...register("icon")} />
          </div>
        </div>

        {/* Цена */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Цена</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Input
                label="Цена (центы) *"
                type="number"
                placeholder="990"
                error={errors.price?.message}
                {...register("price", {
                  required: "Обязательное поле",
                  valueAsNumber: true,
                })}
              />
              <p className="text-xs text-gray-500 mt-1">990 = $9.90</p>
            </div>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <Select
                  label="Валюта"
                  options={currencyOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Input
              label="Порядок сортировки"
              type="number"
              {...register("sortOrder", { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Старая цена (центы)"
              type="number"
              placeholder="1290"
              {...register("oldPrice", { valueAsNumber: true })}
            />
            <Input
              label="Скидка (%)"
              type="number"
              placeholder="20"
              {...register("discountPercent", { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Отображение */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">
            Отображение
          </h4>
          <Input
            label="Кастомный бейдж"
            placeholder="Экономия 33%"
            {...register("badge")}
          />
          <div className="flex items-center gap-6">
            <Controller
              name="isPopular"
              control={control}
              render={({ field }) => (
                <Switch
                  label="Популярный"
                  checked={field.value ?? false}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="isRecommended"
              control={control}
              render={({ field }) => (
                <Switch
                  label="Рекомендуемый"
                  checked={field.value ?? false}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {/* Функции */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">
            Включённые функции
          </h4>
          <Textarea
            label="Функции (каждая с новой строки)"
            placeholder="Доступ ко всем группам&#10;Уведомления о новых лидах&#10;Поддержка 24/7"
            rows={4}
            {...register("features")}
          />
        </div>

        {/* Статус и Trial */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">
            Статус и Trial
          </h4>
          <div className="flex items-center gap-6">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  label="Активен"
                  checked={field.value ?? true}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="isAvailableForPurchase"
              control={control}
              render={({ field }) => (
                <Switch
                  label="Доступен для покупки"
                  checked={field.value ?? true}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex items-center gap-4">
            <Controller
              name="hasTrial"
              control={control}
              render={({ field }) => (
                <Switch
                  label="Пробный период"
                  checked={field.value ?? false}
                  onChange={field.onChange}
                />
              )}
            />
            {hasTrial && (
              <Input
                label="Дней пробного периода"
                type="number"
                className="w-32"
                placeholder="7"
                {...register("trialDays", { valueAsNumber: true })}
              />
            )}
          </div>
        </div>

        {/* Tribute интеграция */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">
            Tribute интеграция
          </h4>
          <Input
            label="Tribute Product ID"
            type="number"
            placeholder="12345"
            {...register("tributeProductId", { valueAsNumber: true })}
          />
          <Input
            label="Ссылка Mini App"
            placeholder="https://t.me/tribute/app?startapp=..."
            {...register("tributeLink")}
          />
          <Input
            label="Веб-ссылка оплаты"
            placeholder="https://tribute.tg/checkout/..."
            {...register("tributeWebLink")}
          />
        </div>

        {/* Действия */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Сохранение..." : isEditing ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
