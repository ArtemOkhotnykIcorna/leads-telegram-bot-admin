# Subscription Plans API - Frontend Documentation

Документация по интеграции модуля тарифных планов подписок для админ-панели.

## Содержание

1. [Обзор](#обзор)
2. [Авторизация](#авторизация)
3. [TypeScript типы](#typescript-типы)
4. [API Endpoints](#api-endpoints)
5. [Примеры использования](#примеры-использования)
6. [React компоненты](#react-компоненты)

---

## Обзор

Модуль предоставляет управление тарифными планами подписок для админ-панели:

- **Просмотр планов** — список всех тарифов с фильтрацией
- **CRUD операции** — создание, редактирование, удаление планов
- **Управление статусом** — активация/деактивация планов
- **Настройка отображения** — бейджи, иконки, порядок сортировки
- **Интеграция с Tribute** — привязка к платёжной системе

**Base URL:** `/api/subscription-plans`

> **Примечание:** Цены хранятся в минимальных единицах валюты (центы/копейки). `990` = $9.90 или 990 копеек.

---

## Авторизация

Публичные эндпоинты (не требуют авторизации):
- `GET /api/subscription-plans`
- `GET /api/subscription-plans/available`
- `GET /api/subscription-plans/telegram`
- `GET /api/subscription-plans/:id`
- `GET /api/subscription-plans/code/:code`

Защищённые эндпоинты (требуют JWT + права администратора):
- `POST /api/subscription-plans`
- `PUT /api/subscription-plans/:id`
- `PUT /api/subscription-plans/code/:code`
- `DELETE /api/subscription-plans/:id`
- `DELETE /api/subscription-plans/code/:code`
- `POST /api/subscription-plans/seed`
- `POST /api/subscription-plans/refresh-cache`

```typescript
// Headers для защищённых эндпоинтов
{
  'Authorization': 'Bearer <access_token>',
  'Content-Type': 'application/json'
}
```

---

## TypeScript типы

### Enums и базовые типы

```typescript
/**
 * Тип периода подписки
 */
type PlanPeriodType = 'monthly' | 'yearly' | 'weekly' | 'daily' | 'lifetime';

/**
 * Поддерживаемые валюты
 */
type PlanCurrency = 'usd' | 'eur' | 'rub';
```

### Основные интерфейсы

```typescript
/**
 * Тарифный план подписки
 */
interface SubscriptionPlan {
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
  validFrom?: string; // ISO date
  /** Дата окончания действия */
  validUntil?: string; // ISO date

  // Trial
  /** Есть ли пробный период */
  hasTrial: boolean;
  /** Длительность пробного периода в днях */
  trialDays?: number;

  // Метаданные
  metadata?: Record<string, unknown>;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

/**
 * Формат плана для Telegram бота
 */
interface TelegramPlanInfo {
  code: string;
  name: string;
  description: string;
  /** Цена в минимальных единицах */
  price: number;
  /** Форматированная цена (например: "$9.90") */
  priceFormatted: string;
  currency: PlanCurrency;
  periodType: PlanPeriodType;
  durationDays: number;
  icon: string;
  badge?: string;
  isPopular: boolean;
  isRecommended: boolean;
  features: string[];
  discountPercent: number;
  oldPrice?: number;
  oldPriceFormatted?: string;
  /** Ссылка на оплату Mini App */
  paymentLink?: string;
  /** Ссылка на оплату через веб */
  webPaymentLink?: string;
  hasTrial: boolean;
  trialDays?: number;
}
```

### DTO типы

```typescript
/**
 * DTO для создания тарифного плана
 */
interface CreateSubscriptionPlanDto {
  // Обязательные поля
  /** Уникальный код */
  code: string;
  /** Название */
  name: string;
  /** Тип периода */
  periodType: PlanPeriodType;
  /** Длительность в днях */
  durationDays: number;
  /** Цена в минимальных единицах (центы/копейки) */
  price: number;

  // Опциональные
  description?: string;
  /** @default 'usd' */
  currency?: PlanCurrency;
  /** 0-100, @default 0 */
  discountPercent?: number;
  oldPrice?: number;

  // Tribute интеграция
  tributeProductId?: number;
  tributeLink?: string;
  tributeWebLink?: string;

  // Отображение
  /** @default 0 */
  sortOrder?: number;
  /** @default false */
  isPopular?: boolean;
  /** @default false */
  isRecommended?: boolean;
  badge?: string;
  icon?: string;

  // Функции
  /** @default [] */
  features?: string[];
  limits?: Record<string, number>;

  // Статус
  /** @default true */
  isActive?: boolean;
  /** @default true */
  isAvailableForPurchase?: boolean;
  validFrom?: string; // ISO date
  validUntil?: string; // ISO date

  // Trial
  /** @default false */
  hasTrial?: boolean;
  trialDays?: number;

  metadata?: Record<string, unknown>;
}

/**
 * DTO для обновления тарифного плана (все поля опциональные)
 */
interface UpdateSubscriptionPlanDto {
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

/**
 * Query параметры для фильтрации планов
 */
interface QuerySubscriptionPlansDto {
  /** Фильтр по активности */
  isActive?: boolean;
  /** Фильтр по доступности для покупки */
  isAvailableForPurchase?: boolean;
  /** Фильтр по типу периода */
  periodType?: PlanPeriodType;
  /** Фильтр по валюте */
  currency?: PlanCurrency;
}
```

---

## API Endpoints

### GET `/api/subscription-plans`

Получение списка всех планов с фильтрацией.

**Query параметры:**

| Параметр                 | Тип              | Описание                      |
| ------------------------ | ---------------- | ----------------------------- |
| `isActive`               | `boolean`        | Фильтр по активности          |
| `isAvailableForPurchase` | `boolean`        | Фильтр по доступности покупки |
| `periodType`             | `PlanPeriodType` | Фильтр по типу периода        |
| `currency`               | `PlanCurrency`   | Фильтр по валюте              |

**Пример запроса:**

```http
GET /api/subscription-plans?isActive=true&periodType=monthly
```

**Пример ответа:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "code": "monthly",
    "name": "Месячная подписка",
    "description": "Доступ ко всем группам на 30 дней",
    "periodType": "monthly",
    "durationDays": 30,
    "price": 990,
    "currency": "usd",
    "discountPercent": 0,
    "sortOrder": 1,
    "isPopular": true,
    "isRecommended": false,
    "icon": "📅",
    "features": [
      "Доступ ко всем группам с лидами",
      "Получение уведомлений о новых лидах",
      "Поддержка 24/7"
    ],
    "isActive": true,
    "isAvailableForPurchase": true,
    "hasTrial": false,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
]
```

---

### GET `/api/subscription-plans/available`

Получение только доступных для покупки планов.

Автоматически фильтрует: `isActive=true` И `isAvailableForPurchase=true`.

**Пример ответа:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "code": "monthly",
    "name": "Месячная подписка",
    "description": "Доступ ко всем группам на 30 дней",
    "periodType": "monthly",
    "durationDays": 30,
    "price": 990,
    "currency": "usd",
    "discountPercent": 0,
    "sortOrder": 1,
    "isPopular": true,
    "isRecommended": false,
    "icon": "📅",
    "features": ["Доступ ко всем группам"],
    "isActive": true,
    "isAvailableForPurchase": true,
    "hasTrial": false
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "code": "yearly",
    "name": "Годовая подписка",
    "description": "Доступ ко всем группам на 365 дней",
    "periodType": "yearly",
    "durationDays": 365,
    "price": 7990,
    "oldPrice": 11880,
    "currency": "usd",
    "discountPercent": 33,
    "sortOrder": 2,
    "isPopular": false,
    "isRecommended": true,
    "badge": "Экономия 33%",
    "icon": "🌟",
    "features": ["Доступ ко всем группам", "Приоритетная поддержка"],
    "isActive": true,
    "isAvailableForPurchase": true,
    "hasTrial": false
  }
]
```

---

### GET `/api/subscription-plans/telegram`

Получение планов в формате для Telegram бота (с форматированными ценами).

**Пример ответа:**

```json
[
  {
    "code": "monthly",
    "name": "Месячная подписка",
    "description": "Доступ ко всем группам на 30 дней",
    "price": 990,
    "priceFormatted": "$9.90",
    "currency": "usd",
    "periodType": "monthly",
    "durationDays": 30,
    "icon": "📅",
    "isPopular": true,
    "isRecommended": false,
    "features": ["Доступ ко всем группам с лидами"],
    "discountPercent": 0,
    "paymentLink": "https://t.me/tribute/app?startapp=abc123",
    "webPaymentLink": "https://tribute.tg/checkout/abc123",
    "hasTrial": false
  },
  {
    "code": "yearly",
    "name": "Годовая подписка",
    "description": "Доступ ко всем группам на 365 дней",
    "price": 7990,
    "priceFormatted": "$79.90",
    "currency": "usd",
    "periodType": "yearly",
    "durationDays": 365,
    "icon": "🌟",
    "badge": "Экономия 33%",
    "isPopular": false,
    "isRecommended": true,
    "features": ["Доступ ко всем группам", "Приоритетная поддержка"],
    "discountPercent": 33,
    "oldPrice": 11880,
    "oldPriceFormatted": "$118.80",
    "paymentLink": "https://t.me/tribute/app?startapp=xyz789",
    "webPaymentLink": "https://tribute.tg/checkout/xyz789",
    "hasTrial": false
  }
]
```

---

### GET `/api/subscription-plans/:id`

Получение плана по MongoDB ID.

**Параметры пути:**

| Параметр | Тип      | Пример                       | Описание         |
| -------- | -------- | ---------------------------- | ---------------- |
| `id`     | `string` | `507f1f77bcf86cd799439011`   | MongoDB ObjectId |

**Ответы:**

| Status | Описание       |
| ------ | -------------- |
| `200`  | План найден    |
| `404`  | План не найден |

---

### GET `/api/subscription-plans/code/:code`

Получение плана по уникальному коду.

**Параметры пути:**

| Параметр | Тип      | Пример    | Описание             |
| -------- | -------- | --------- | -------------------- |
| `code`   | `string` | `monthly` | Уникальный код плана |

**Пример запроса:**

```http
GET /api/subscription-plans/code/yearly
```

**Ответы:**

| Status | Описание       |
| ------ | -------------- |
| `200`  | План найден    |
| `404`  | План не найден |

---

### POST `/api/subscription-plans`

Создание нового тарифного плана.

**Требует авторизации:** ✅

**Request Body:** `CreateSubscriptionPlanDto`

**Пример запроса:**

```json
{
  "code": "premium_monthly",
  "name": "Premium подписка",
  "description": "Расширенный доступ на 30 дней",
  "periodType": "monthly",
  "durationDays": 30,
  "price": 1990,
  "currency": "usd",
  "sortOrder": 3,
  "isPopular": false,
  "isRecommended": true,
  "badge": "Premium",
  "icon": "💎",
  "features": [
    "Все базовые функции",
    "Приоритетная поддержка",
    "API доступ"
  ],
  "isActive": true,
  "isAvailableForPurchase": true
}
```

**Ответы:**

| Status | Описание                          |
| ------ | --------------------------------- |
| `201`  | План успешно создан               |
| `409`  | План с таким кодом уже существует |

---

### PUT `/api/subscription-plans/:id`

Обновление плана по ID.

**Требует авторизации:** ✅

**Request Body:** `UpdateSubscriptionPlanDto`

**Пример запроса:**

```json
{
  "price": 1190,
  "discountPercent": 10,
  "badge": "Новая цена"
}
```

**Ответы:**

| Status | Описание       |
| ------ | -------------- |
| `200`  | План обновлён  |
| `404`  | План не найден |

---

### PUT `/api/subscription-plans/code/:code`

Обновление плана по коду.

**Требует авторизации:** ✅

**Пример запроса:**

```http
PUT /api/subscription-plans/code/monthly
Content-Type: application/json
Authorization: Bearer <token>

{
  "isPopular": false,
  "badge": "Базовый"
}
```

---

### DELETE `/api/subscription-plans/:id`

Удаление плана по ID.

**Требует авторизации:** ✅

**Ответы:**

| Status | Описание                 |
| ------ | ------------------------ |
| `204`  | План удалён (без ответа) |
| `404`  | План не найден           |

---

### DELETE `/api/subscription-plans/code/:code`

Удаление плана по коду.

**Требует авторизации:** ✅

**Ответы:**

| Status | Описание                 |
| ------ | ------------------------ |
| `204`  | План удалён (без ответа) |
| `404`  | План не найден           |

---

### POST `/api/subscription-plans/seed`

Создание базовых тарифов (только если планов нет в БД).

**Требует авторизации:** ✅

**Пример ответа:**

```json
{
  "message": "Default plans seeded successfully"
}
```

**Создаваемые планы по умолчанию:**

| Код       | Название          | Период   | Цена   | Особенности                     |
| --------- | ----------------- | -------- | ------ | ------------------------------- |
| `monthly` | Месячная подписка | 30 дней  | $9.90  | `isPopular: true`               |
| `yearly`  | Годовая подписка  | 365 дней | $79.90 | `isRecommended: true`, скидка 33% |

---

### POST `/api/subscription-plans/refresh-cache`

Принудительное обновление серверного кэша планов.

**Требует авторизации:** ✅

**Пример ответа:**

```json
{
  "message": "Cache refreshed successfully"
}
```

---

## Примеры использования

### API Client (TypeScript/Axios)

```typescript
import axios, { AxiosInstance } from 'axios';

interface SubscriptionPlansApi {
  getAll(query?: QuerySubscriptionPlansDto): Promise<SubscriptionPlan[]>;
  getAvailable(): Promise<SubscriptionPlan[]>;
  getForTelegram(): Promise<TelegramPlanInfo[]>;
  getById(id: string): Promise<SubscriptionPlan>;
  getByCode(code: string): Promise<SubscriptionPlan>;
  create(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan>;
  update(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan>;
  updateByCode(code: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan>;
  delete(id: string): Promise<void>;
  deleteByCode(code: string): Promise<void>;
  seed(): Promise<{ message: string }>;
  refreshCache(): Promise<{ message: string }>;
}

class SubscriptionPlansClient implements SubscriptionPlansApi {
  constructor(private http: AxiosInstance) {}

  async getAll(query?: QuerySubscriptionPlansDto): Promise<SubscriptionPlan[]> {
    const { data } = await this.http.get('/api/subscription-plans', { params: query });
    return data;
  }

  async getAvailable(): Promise<SubscriptionPlan[]> {
    const { data } = await this.http.get('/api/subscription-plans/available');
    return data;
  }

  async getForTelegram(): Promise<TelegramPlanInfo[]> {
    const { data } = await this.http.get('/api/subscription-plans/telegram');
    return data;
  }

  async getById(id: string): Promise<SubscriptionPlan> {
    const { data } = await this.http.get(`/api/subscription-plans/${id}`);
    return data;
  }

  async getByCode(code: string): Promise<SubscriptionPlan> {
    const { data } = await this.http.get(`/api/subscription-plans/code/${code}`);
    return data;
  }

  async create(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const { data } = await this.http.post('/api/subscription-plans', dto);
    return data;
  }

  async update(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const { data } = await this.http.put(`/api/subscription-plans/${id}`, dto);
    return data;
  }

  async updateByCode(code: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const { data } = await this.http.put(`/api/subscription-plans/code/${code}`, dto);
    return data;
  }

  async delete(id: string): Promise<void> {
    await this.http.delete(`/api/subscription-plans/${id}`);
  }

  async deleteByCode(code: string): Promise<void> {
    await this.http.delete(`/api/subscription-plans/code/${code}`);
  }

  async seed(): Promise<{ message: string }> {
    const { data } = await this.http.post('/api/subscription-plans/seed');
    return data;
  }

  async refreshCache(): Promise<{ message: string }> {
    const { data } = await this.http.post('/api/subscription-plans/refresh-cache');
    return data;
  }
}

// Использование
const http = axios.create({
  baseURL: 'https://api.example.com',
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

export const subscriptionPlansApi = new SubscriptionPlansClient(http);
```

---

## React компоненты

### Custom Hooks

```typescript
// hooks/useSubscriptionPlans.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionPlansApi } from '../api/client';

/**
 * Hook для получения всех планов
 */
export function useSubscriptionPlans(filters?: QuerySubscriptionPlansDto) {
  return useQuery({
    queryKey: ['subscription-plans', filters],
    queryFn: () => subscriptionPlansApi.getAll(filters),
  });
}

/**
 * Hook для получения доступных планов
 */
export function useAvailablePlans() {
  return useQuery({
    queryKey: ['subscription-plans', 'available'],
    queryFn: () => subscriptionPlansApi.getAvailable(),
    staleTime: 5 * 60 * 1000, // 5 минут (соответствует серверному кэшу)
  });
}

/**
 * Hook для получения плана по ID
 */
export function useSubscriptionPlan(id: string) {
  return useQuery({
    queryKey: ['subscription-plans', id],
    queryFn: () => subscriptionPlansApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook для получения плана по коду
 */
export function useSubscriptionPlanByCode(code: string) {
  return useQuery({
    queryKey: ['subscription-plans', 'code', code],
    queryFn: () => subscriptionPlansApi.getByCode(code),
    enabled: !!code,
  });
}

/**
 * Hook для создания плана
 */
export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSubscriptionPlanDto) =>
      subscriptionPlansApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
}

/**
 * Hook для обновления плана
 */
export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionPlanDto }) =>
      subscriptionPlansApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', variables.id] });
    },
  });
}

/**
 * Hook для удаления плана
 */
export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionPlansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
}

/**
 * Hook для seed планов
 */
export function useSeedPlans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionPlansApi.seed(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
}

/**
 * Hook для обновления кэша
 */
export function useRefreshCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionPlansApi.refreshCache(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
}
```

### Утилиты

```typescript
// utils/formatPrice.ts

/**
 * Форматирование цены из минимальных единиц
 */
export function formatPrice(amount: number, currency: PlanCurrency = 'usd'): string {
  const value = amount / 100;
  
  const formatters: Record<PlanCurrency, () => string> = {
    usd: () => `$${value.toFixed(2)}`,
    eur: () => `€${value.toFixed(2)}`,
    rub: () => `${value.toFixed(0)} ₽`,
  };

  return formatters[currency]?.() || `${value.toFixed(2)} ${currency.toUpperCase()}`;
}

/**
 * Получить название периода на русском
 */
export function getPeriodLabel(periodType: PlanPeriodType): string {
  const labels: Record<PlanPeriodType, string> = {
    daily: 'день',
    weekly: 'неделя',
    monthly: 'месяц',
    yearly: 'год',
    lifetime: 'навсегда',
  };
  return labels[periodType] || periodType;
}

/**
 * Получить иконку по умолчанию для периода
 */
export function getDefaultIcon(periodType: PlanPeriodType): string {
  const icons: Record<PlanPeriodType, string> = {
    daily: '📆',
    weekly: '📅',
    monthly: '🗓',
    yearly: '🌟',
    lifetime: '♾️',
  };
  return icons[periodType] || '📋';
}
```

### Компонент списка планов

```tsx
// components/PlansTable.tsx
import React from 'react';
import { useSubscriptionPlans, useUpdatePlan, useDeletePlan } from '../hooks/useSubscriptionPlans';
import { formatPrice, getPeriodLabel } from '../utils/formatPrice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2 } from 'lucide-react';

interface PlansTableProps {
  onEdit: (plan: SubscriptionPlan) => void;
}

export const PlansTable: React.FC<PlansTableProps> = ({ onEdit }) => {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const toggleActive = (plan: SubscriptionPlan) => {
    updatePlan.mutate({
      id: plan._id,
      data: { isActive: !plan.isActive },
    });
  };

  const toggleAvailable = (plan: SubscriptionPlan) => {
    updatePlan.mutate({
      id: plan._id,
      data: { isAvailableForPurchase: !plan.isAvailableForPurchase },
    });
  };

  const handleDelete = (plan: SubscriptionPlan) => {
    if (confirm(`Удалить тариф "${plan.name}"?`)) {
      deletePlan.mutate(plan._id);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Загрузка...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Код</TableHead>
          <TableHead>Название</TableHead>
          <TableHead>Цена</TableHead>
          <TableHead>Период</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Доступен</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans?.map((plan) => (
          <TableRow key={plan._id}>
            <TableCell className="font-mono text-sm">{plan.code}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>{plan.icon}</span>
                <span>{plan.name}</span>
                {plan.isPopular && (
                  <Badge variant="secondary">Популярный</Badge>
                )}
                {plan.isRecommended && (
                  <Badge variant="default">Рекомендуемый</Badge>
                )}
                {plan.badge && (
                  <Badge variant="outline">{plan.badge}</Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div>
                <span className="font-medium">
                  {formatPrice(plan.price, plan.currency)}
                </span>
                {plan.oldPrice && (
                  <span className="ml-2 text-sm text-muted-foreground line-through">
                    {formatPrice(plan.oldPrice, plan.currency)}
                  </span>
                )}
                {plan.discountPercent > 0 && (
                  <Badge className="ml-2" variant="destructive">
                    -{plan.discountPercent}%
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              {getPeriodLabel(plan.periodType)}
              <span className="text-muted-foreground ml-1">
                ({plan.durationDays} дн.)
              </span>
            </TableCell>
            <TableCell>
              <Switch
                checked={plan.isActive}
                onCheckedChange={() => toggleActive(plan)}
              />
            </TableCell>
            <TableCell>
              <Switch
                checked={plan.isAvailableForPurchase}
                onCheckedChange={() => toggleAvailable(plan)}
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(plan)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(plan)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

### Форма создания/редактирования плана

```tsx
// components/PlanForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreatePlan, useUpdatePlan } from '../hooks/useSubscriptionPlans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PlanFormProps {
  plan?: SubscriptionPlan | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PlanForm: React.FC<PlanFormProps> = ({ plan, onSuccess, onCancel }) => {
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const isEditing = !!plan;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSubscriptionPlanDto>({
    defaultValues: plan
      ? {
          code: plan.code,
          name: plan.name,
          description: plan.description,
          periodType: plan.periodType,
          durationDays: plan.durationDays,
          price: plan.price,
          currency: plan.currency,
          discountPercent: plan.discountPercent,
          oldPrice: plan.oldPrice,
          sortOrder: plan.sortOrder,
          isPopular: plan.isPopular,
          isRecommended: plan.isRecommended,
          badge: plan.badge,
          icon: plan.icon,
          features: plan.features,
          isActive: plan.isActive,
          isAvailableForPurchase: plan.isAvailableForPurchase,
          hasTrial: plan.hasTrial,
          trialDays: plan.trialDays,
          tributeProductId: plan.tributeProductId,
          tributeLink: plan.tributeLink,
          tributeWebLink: plan.tributeWebLink,
        }
      : {
          periodType: 'monthly',
          durationDays: 30,
          currency: 'usd',
          sortOrder: 0,
          isPopular: false,
          isRecommended: false,
          isActive: true,
          isAvailableForPurchase: true,
          hasTrial: false,
          features: [],
        },
  });

  const onSubmit = async (data: CreateSubscriptionPlanDto) => {
    try {
      if (isEditing) {
        await updatePlan.mutateAsync({ id: plan._id, data });
      } else {
        await createPlan.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const periodType = watch('periodType');
  const hasTrial = watch('hasTrial');

  // Автоматическое заполнение durationDays
  React.useEffect(() => {
    const durations: Record<PlanPeriodType, number> = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
      lifetime: 36500,
    };
    if (!isEditing && periodType) {
      setValue('durationDays', durations[periodType] || 30);
    }
  }, [periodType, isEditing, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Код *</Label>
              <Input
                id="code"
                {...register('code', { required: 'Обязательное поле' })}
                placeholder="monthly"
                disabled={isEditing}
              />
              {errors.code && (
                <span className="text-sm text-destructive">{errors.code.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Обязательное поле' })}
                placeholder="Месячная подписка"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Описание тарифа..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Тип периода *</Label>
              <Select
                value={periodType}
                onValueChange={(v) => setValue('periodType', v as PlanPeriodType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Ежедневно</SelectItem>
                  <SelectItem value="weekly">Еженедельно</SelectItem>
                  <SelectItem value="monthly">Ежемесячно</SelectItem>
                  <SelectItem value="yearly">Ежегодно</SelectItem>
                  <SelectItem value="lifetime">Навсегда</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationDays">Длительность (дней) *</Label>
              <Input
                id="durationDays"
                type="number"
                {...register('durationDays', { required: true, valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Иконка</Label>
              <Input
                id="icon"
                {...register('icon')}
                placeholder="📅"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Цена</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Цена (центы) *</Label>
              <Input
                id="price"
                type="number"
                {...register('price', { required: true, valueAsNumber: true })}
                placeholder="990"
              />
              <p className="text-xs text-muted-foreground">
                990 = $9.90 или 990 копеек
              </p>
            </div>
            <div className="space-y-2">
              <Label>Валюта</Label>
              <Select
                value={watch('currency')}
                onValueChange={(v) => setValue('currency', v as PlanCurrency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="rub">RUB (₽)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Порядок сортировки</Label>
              <Input
                id="sortOrder"
                type="number"
                {...register('sortOrder', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="oldPrice">Старая цена (центы)</Label>
              <Input
                id="oldPrice"
                type="number"
                {...register('oldPrice', { valueAsNumber: true })}
                placeholder="1290"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountPercent">Скидка (%)</Label>
              <Input
                id="discountPercent"
                type="number"
                {...register('discountPercent', { valueAsNumber: true })}
                placeholder="20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Отображение</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="badge">Кастомный бейдж</Label>
            <Input
              id="badge"
              {...register('badge')}
              placeholder="Экономия 33%"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="isPopular"
                checked={watch('isPopular')}
                onCheckedChange={(v) => setValue('isPopular', v)}
              />
              <Label htmlFor="isPopular">Популярный</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isRecommended"
                checked={watch('isRecommended')}
                onCheckedChange={(v) => setValue('isRecommended', v)}
              />
              <Label htmlFor="isRecommended">Рекомендуемый</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Статус и Trial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={watch('isActive')}
                onCheckedChange={(v) => setValue('isActive', v)}
              />
              <Label htmlFor="isActive">Активен</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isAvailableForPurchase"
                checked={watch('isAvailableForPurchase')}
                onCheckedChange={(v) => setValue('isAvailableForPurchase', v)}
              />
              <Label htmlFor="isAvailableForPurchase">Доступен для покупки</Label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="hasTrial"
                checked={hasTrial}
                onCheckedChange={(v) => setValue('hasTrial', v)}
              />
              <Label htmlFor="hasTrial">Пробный период</Label>
            </div>
            {hasTrial && (
              <div className="flex items-center gap-2">
                <Label htmlFor="trialDays">Дней:</Label>
                <Input
                  id="trialDays"
                  type="number"
                  className="w-20"
                  {...register('trialDays', { valueAsNumber: true })}
                  placeholder="7"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tribute интеграция</CardTitle>
          <CardDescription>
            Настройки для интеграции с платёжной системой Tribute
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tributeProductId">Tribute Product ID</Label>
            <Input
              id="tributeProductId"
              type="number"
              {...register('tributeProductId', { valueAsNumber: true })}
              placeholder="12345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tributeLink">Ссылка Mini App</Label>
            <Input
              id="tributeLink"
              {...register('tributeLink')}
              placeholder="https://t.me/tribute/app?startapp=..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tributeWebLink">Веб-ссылка оплаты</Label>
            <Input
              id="tributeWebLink"
              {...register('tributeWebLink')}
              placeholder="https://tribute.tg/checkout/..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          type="submit"
          disabled={createPlan.isPending || updatePlan.isPending}
        >
          {createPlan.isPending || updatePlan.isPending
            ? 'Сохранение...'
            : isEditing
              ? 'Сохранить'
              : 'Создать'}
        </Button>
      </div>
    </form>
  );
};
```

### Страница управления планами

```tsx
// pages/PlansPage.tsx
import React, { useState } from 'react';
import { PlansTable } from '../components/PlansTable';
import { PlanForm } from '../components/PlanForm';
import { useSeedPlans, useRefreshCache } from '../hooks/useSubscriptionPlans';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, RefreshCw, Database } from 'lucide-react';

export const PlansPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  
  const seedPlans = useSeedPlans();
  const refreshCache = useRefreshCache();

  const handleCreate = () => {
    setEditingPlan(null);
    setIsFormOpen(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPlan(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Тарифные планы</h1>
          <p className="text-muted-foreground">
            Управление подписками и ценами
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refreshCache.mutate()}
            disabled={refreshCache.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshCache.isPending ? 'animate-spin' : ''}`} />
            Обновить кэш
          </Button>
          <Button
            variant="outline"
            onClick={() => seedPlans.mutate()}
            disabled={seedPlans.isPending}
          >
            <Database className="h-4 w-4 mr-2" />
            Seed планов
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Создать план
          </Button>
        </div>
      </div>

      <PlansTable onEdit={handleEdit} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Редактировать план' : 'Создать план'}
            </DialogTitle>
          </DialogHeader>
          <PlanForm
            plan={editingPlan}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

---

## Коды ошибок

| HTTP Code | Описание                                     |
| --------- | -------------------------------------------- |
| `200`     | Успешный запрос                              |
| `201`     | Ресурс создан                                |
| `204`     | Ресурс удалён (без тела ответа)              |
| `400`     | Неверные параметры запроса                   |
| `401`     | Не авторизован                               |
| `403`     | Нет прав доступа                             |
| `404`     | План не найден                               |
| `409`     | Конфликт (план с таким кодом уже существует) |
| `500`     | Внутренняя ошибка сервера                    |

**Примеры ошибок:**

```json
// 404 Not Found
{
  "statusCode": 404,
  "message": "Subscription plan with code \"nonexistent\" not found",
  "error": "Not Found"
}

// 409 Conflict
{
  "statusCode": 409,
  "message": "Plan with code \"monthly\" already exists",
  "error": "Conflict"
}

// 400 Bad Request
{
  "statusCode": 400,
  "message": ["code must be a string", "price must be a number"],
  "error": "Bad Request"
}
```

---

## Рекомендации

### Именование кодов

Используйте понятные и уникальные коды:

- ✅ `monthly`, `yearly`, `premium_monthly`, `basic_weekly`
- ❌ `plan1`, `test`, `новый_план`

### Ценообразование

- Храните цены в **минимальных единицах** (центы/копейки)
- `990` = $9.90 или 990 копеек
- Используйте `oldPrice` для показа скидки
- Вычисляйте `discountPercent` для отображения бейджа

### Сортировка

- Используйте `sortOrder` для управления порядком отображения
- Чем меньше значение — тем выше в списке
- Рекомендуется: 1, 2, 3... (не 10, 20, 30)

### Кэширование на клиенте

- Используйте `staleTime: 5 * 60 * 1000` (5 минут) для соответствия серверному кэшу
- При мутации планов вызывайте `queryClient.invalidateQueries(['subscription-plans'])`

### Trial период

- Устанавливайте `hasTrial: true` и `trialDays: 7` для пробного периода
- Обрабатывайте trial в UI отдельно от обычных планов
