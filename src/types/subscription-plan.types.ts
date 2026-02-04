// Тип периода подписки
export type PlanPeriodType =
  | "monthly"
  | "yearly"
  | "weekly"
  | "daily"
  | "lifetime";

// Поддерживаемые валюты для планов
export type PlanCurrency = "usd" | "eur" | "rub";

// Тарифный план подписки
export interface SubscriptionPlan {
  /** MongoDB ObjectId */
  _id: string;
  /** Уникальный код (например: 'monthly', 'yearly') */
  code: string;
  /** Название для отображения */
  name: string;
  /** Описание тарифа */
  description?: string;

  // Период и длительность
  /** Тип периода */
  periodType: PlanPeriodType;
  /** Длительность в днях */
  durationDays: number;

  // Цена
  /** Цена в минимальных единицах (центы/копейки) */
  price: number;
  /** Валюта */
  currency: PlanCurrency;
  /** Скидка в % (для отображения) */
  discountPercent: number;
  /** Старая цена (для зачёркнутого отображения) */
  oldPrice?: number;

  // Tribute интеграция
  /** ID продукта в Tribute */
  tributeProductId?: number;
  /** Ссылка на оплату через Mini App */
  tributeLink?: string;
  /** Ссылка на оплату через веб */
  tributeWebLink?: string;

  // Настройки отображения
  /** Порядок сортировки (меньше = выше) */
  sortOrder: number;
  /** Бейдж "Популярный" */
  isPopular: boolean;
  /** Бейдж "Рекомендуемый" */
  isRecommended: boolean;
  /** Кастомный бейдж (например: "Экономия 33%") */
  badge?: string;
  /** Иконка/эмодзи */
  icon?: string;

  // Функции и лимиты
  /** Список включённых функций */
  features: string[];
  /** Лимиты (maxGroups, maxLeads...) */
  limits?: Record<string, number>;

  // Статус
  /** Активен ли план */
  isActive: boolean;
  /** Доступен ли для покупки */
  isAvailableForPurchase: boolean;
  /** Дата начала действия */
  validFrom?: string;
  /** Дата окончания действия */
  validUntil?: string;

  // Trial
  /** Есть ли пробный период */
  hasTrial: boolean;
  /** Длительность пробного периода в днях */
  trialDays?: number;

  // Метаданные
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// DTO для создания тарифного плана
export interface CreateSubscriptionPlanDto {
  // Обязательные поля
  code: string;
  name: string;
  periodType: PlanPeriodType;
  durationDays: number;
  price: number;

  // Опциональные
  description?: string;
  currency?: PlanCurrency;
  discountPercent?: number;
  oldPrice?: number;

  // Tribute интеграция
  tributeProductId?: number;
  tributeLink?: string;
  tributeWebLink?: string;

  // Отображение
  sortOrder?: number;
  isPopular?: boolean;
  isRecommended?: boolean;
  badge?: string;
  icon?: string;

  // Функции
  features?: string[];
  limits?: Record<string, number>;

  // Статус
  isActive?: boolean;
  isAvailableForPurchase?: boolean;
  validFrom?: string;
  validUntil?: string;

  // Trial
  hasTrial?: boolean;
  trialDays?: number;

  metadata?: Record<string, unknown>;
}

// DTO для обновления тарифного плана
export interface UpdateSubscriptionPlanDto {
  name?: string;
  description?: string;
  periodType?: PlanPeriodType;
  durationDays?: number;
  price?: number;
  currency?: PlanCurrency;
  discountPercent?: number;
  oldPrice?: number;
  tributeProductId?: number;
  tributeLink?: string;
  tributeWebLink?: string;
  sortOrder?: number;
  isPopular?: boolean;
  isRecommended?: boolean;
  badge?: string;
  icon?: string;
  features?: string[];
  limits?: Record<string, number>;
  isActive?: boolean;
  isAvailableForPurchase?: boolean;
  validFrom?: string;
  validUntil?: string;
  hasTrial?: boolean;
  trialDays?: number;
  metadata?: Record<string, unknown>;
}

// Query параметры для фильтрации планов
export interface QuerySubscriptionPlansDto {
  isActive?: boolean;
  isAvailableForPurchase?: boolean;
  periodType?: PlanPeriodType;
  currency?: PlanCurrency;
}
