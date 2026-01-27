# Payment Statistics API - Frontend Documentation

Документация по интеграции модуля статистики платежей для админ-панели.

## Содержание

1. [Обзор](#обзор)
2. [Авторизация](#авторизация)
3. [TypeScript типы](#typescript-типы)
4. [API Endpoints](#api-endpoints)
5. [Примеры использования](#примеры-использования)
6. [React компоненты](#react-компоненты)

---

## Обзор

Модуль предоставляет аналитику и статистику по платежам для админ-панели:

- **Сводка по платежам** — общая выручка, количество платежей, средний чек
- **Статистика подписок** — активные, отмененные, конверсия, churn rate
- **MRR/ARR метрики** — Monthly/Annual Recurring Revenue
- **Графики** — выручка и подписки по времени
- **Разбивки** — по типам, валютам, периодам
- **Бухгалтерия** — отчёты, топ плательщиков, экспорт транзакций
- **Сравнение периодов** — текущий vs предыдущий

**Base URL:** `/api/admin/payments`

---

## Авторизация

Все эндпоинты требуют JWT авторизации и permission `viewAnalytics`.

```typescript
// Headers
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
 * Период для фильтрации статистики
 */
type StatsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';

/**
 * Поддерживаемые валюты
 */
type Currency = 'usd' | 'eur' | 'rub';

/**
 * Тип записи платежа
 */
type PaymentRecordType =
  | 'subscription'
  | 'subscription_renewal'
  | 'donation'
  | 'digital_product';

/**
 * Направление изменения (для сравнения периодов)
 */
type ChangeDirection = 'up' | 'down' | 'same';
```

### Response типы

```typescript
/**
 * GET /api/admin/payments/summary
 * Общая сводка по платежам
 */
interface PaymentsSummary {
  /** Общее количество платежей */
  totalPayments: number;
  /** Общая выручка (в минимальных единицах: центы/копейки) */
  totalRevenue: number;
  /** Форматированная выручка (например, "$1,234.56") */
  totalRevenueFormatted: string;
  /** Средний платёж (в минимальных единицах) */
  avgPayment: number;
  /** Форматированный средний платёж */
  avgPaymentFormatted: string;
  /** Валюта */
  currency: string;
}

/**
 * GET /api/admin/payments/subscriptions
 * Статистика подписок
 */
interface SubscriptionStats {
  /** Количество активных подписок */
  activeSubscriptions: number;
  /** Количество отменённых (но ещё активных) подписок */
  cancelledSubscriptions: number;
  /** Количество истекших подписок */
  expiredSubscriptions: number;
  /** Количество пользователей на trial */
  trialUsers: number;
  /** Конверсия trial -> regular (%) */
  conversionRate: number;
  /** Churn rate - процент отмен (%) */
  churnRate: number;
}

/**
 * GET /api/admin/payments/mrr
 * MRR (Monthly Recurring Revenue)
 */
interface MRRData {
  /** Текущий MRR (в минимальных единицах) */
  currentMRR: number;
  /** Форматированный текущий MRR */
  currentMRRFormatted: string;
  /** MRR за предыдущий месяц */
  previousMRR: number;
  /** Абсолютный рост MRR */
  growth: number;
  /** Процент роста MRR */
  growthPercent: number;
  /** Projected ARR (MRR * 12) */
  projectedARR: number;
  /** Форматированный Projected ARR */
  projectedARRFormatted: string;
}

/**
 * GET /api/admin/payments/dashboard
 * Все данные для дашборда
 */
interface DashboardData {
  summary: PaymentsSummary;
  subscriptions: SubscriptionStats;
  mrr: MRRData;
  charts: {
    revenue: ChartDataPoint[];
  };
  breakdown: {
    byType: BreakdownItem[];
    byCurrency: BreakdownItem[];
  };
}

/**
 * Точка данных для графика
 */
interface ChartDataPoint {
  /** Дата в формате YYYY-MM-DD или YYYY-MM-DD HH:00 */
  date: string;
  /** Значение (выручка или количество) */
  value: number;
  /** Количество транзакций (опционально) */
  count?: number;
}

/**
 * Элемент разбивки
 */
interface BreakdownItem {
  /** Тип/период/валюта */
  type?: string;
  period?: string;
  currency?: string;
  /** Количество платежей */
  count: number;
  /** Выручка (в минимальных единицах) */
  revenue: number;
}

/**
 * GET /api/admin/payments/accounting/report
 * Бухгалтерский отчёт
 */
interface AccountingReport {
  /** Период отчёта */
  period: {
    start: string; // ISO date
    end: string; // ISO date
  };
  /** Выручка */
  revenue: {
    /** Общая выручка */
    total: number;
    /** По типам платежей */
    byType: Record<PaymentRecordType, number>;
    /** По валютам */
    byCurrency: Record<Currency, number>;
    /** По периодам подписки (monthly/yearly) */
    byPeriod: Record<string, number>;
  };
  /** Статистика транзакций */
  transactions: {
    total: number;
    completed: number;
    failed: number;
    refunded: number;
    cancelled: number;
  };
  /** Средний чек */
  avgCheck: number;
  /** Основная валюта отчёта */
  currency: string;
}

/**
 * GET /api/admin/payments/accounting/top-payers
 * Топ плательщик
 */
interface TopPayer {
  /** Telegram ID пользователя */
  telegramId: number;
  /** Username в Telegram */
  username?: string;
  /** Имя */
  firstName?: string;
  /** Фамилия */
  lastName?: string;
  /** Общая сумма платежей */
  totalSpent: number;
  /** Количество платежей */
  paymentsCount: number;
  /** Дата последнего платежа */
  lastPayment: string; // ISO date
}

/**
 * GET /api/admin/payments/accounting/export
 * Транзакция для экспорта
 */
interface ExportTransaction {
  /** ID транзакции */
  id: string;
  /** Дата транзакции */
  date: string; // ISO date
  /** Тип записи */
  type: PaymentRecordType;
  /** Статус */
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  /** Сумма (в минимальных единицах) */
  amount: number;
  /** Форматированная сумма */
  amountFormatted: string;
  /** Валюта */
  currency: string;
  /** Период подписки */
  period?: 'monthly' | 'yearly' | 'once';
  /** Тип подписки */
  subscriptionType?: 'regular' | 'gift' | 'trial';
  /** Информация о пользователе */
  user: {
    telegramId: number;
    username?: string;
    name: string;
  } | null;
  /** ID подписки в Tribute */
  tributeSubscriptionId?: number;
  /** ID продукта в Tribute */
  tributeProductId?: number;
}

/**
 * Ответ экспорта транзакций
 */
interface ExportTransactionsResponse {
  period: {
    start: string;
    end: string;
  };
  count: number;
  transactions: ExportTransaction[];
}

/**
 * GET /api/admin/payments/compare
 * Сравнение периодов
 */
interface PeriodComparison {
  /** Период сравнения */
  period: StatsPeriod;
  /** Текущий период */
  current: PaymentsSummary;
  /** Предыдущий период */
  previous: PaymentsSummary;
  /** Изменения */
  changes: {
    revenue: {
      /** Абсолютное изменение */
      absolute: number;
      /** Процентное изменение */
      percent: number;
      /** Направление */
      direction: ChangeDirection;
    };
    payments: {
      absolute: number;
      percent: number;
      direction: ChangeDirection;
    };
  };
}
```

---

## API Endpoints

### Overview Endpoints

#### GET `/api/admin/payments/summary`

Общая сводка по платежам за период.

**Query параметры:**

| Параметр   | Тип           | По умолчанию | Описание              |
| ---------- | ------------- | ------------ | --------------------- |
| `period`   | `StatsPeriod` | `month`      | Период для статистики |
| `currency` | `Currency`    | -            | Фильтр по валюте      |

**Пример запроса:**

```http
GET /api/admin/payments/summary?period=month&currency=usd
Authorization: Bearer <token>
```

**Пример ответа:**

```json
{
  "totalPayments": 156,
  "totalRevenue": 1560000,
  "totalRevenueFormatted": "$15,600",
  "avgPayment": 10000,
  "avgPaymentFormatted": "$100",
  "currency": "usd"
}
```

---

#### GET `/api/admin/payments/subscriptions`

Статистика подписок.

**Пример ответа:**

```json
{
  "activeSubscriptions": 234,
  "cancelledSubscriptions": 12,
  "expiredSubscriptions": 89,
  "trialUsers": 45,
  "conversionRate": 23.5,
  "churnRate": 4.88
}
```

---

#### GET `/api/admin/payments/mrr`

MRR (Monthly Recurring Revenue) метрики.

**Query параметры:**

| Параметр   | Тип        | По умолчанию | Описание           |
| ---------- | ---------- | ------------ | ------------------ |
| `currency` | `Currency` | `usd`        | Валюта для расчёта |

**Пример ответа:**

```json
{
  "currentMRR": 2340000,
  "currentMRRFormatted": "$23,400",
  "previousMRR": 2100000,
  "growth": 240000,
  "growthPercent": 11.43,
  "projectedARR": 28080000,
  "projectedARRFormatted": "$280,800"
}
```

---

#### GET `/api/admin/payments/dashboard`

Все ключевые метрики для дашборда одним запросом.

**Query параметры:**

| Параметр   | Тип        | По умолчанию | Описание           |
| ---------- | ---------- | ------------ | ------------------ |
| `currency` | `Currency` | `usd`        | Валюта для расчёта |

**Пример ответа:**

```json
{
  "summary": {
    "totalPayments": 156,
    "totalRevenue": 1560000,
    "totalRevenueFormatted": "$15,600",
    "avgPayment": 10000,
    "avgPaymentFormatted": "$100",
    "currency": "usd"
  },
  "subscriptions": {
    "activeSubscriptions": 234,
    "cancelledSubscriptions": 12,
    "expiredSubscriptions": 89,
    "trialUsers": 45,
    "conversionRate": 23.5,
    "churnRate": 4.88
  },
  "mrr": {
    "currentMRR": 2340000,
    "currentMRRFormatted": "$23,400",
    "previousMRR": 2100000,
    "growth": 240000,
    "growthPercent": 11.43,
    "projectedARR": 28080000,
    "projectedARRFormatted": "$280,800"
  },
  "charts": {
    "revenue": [
      { "date": "2026-01-01", "value": 50000, "count": 5 },
      { "date": "2026-01-02", "value": 75000, "count": 8 }
    ]
  },
  "breakdown": {
    "byType": [
      { "type": "subscription", "count": 120, "revenue": 1200000 },
      { "type": "donation", "count": 36, "revenue": 360000 }
    ],
    "byCurrency": [
      { "currency": "usd", "count": 150, "revenue": 1500000 },
      { "currency": "eur", "count": 6, "revenue": 60000 }
    ]
  }
}
```

---

### Charts Endpoints

#### GET `/api/admin/payments/charts/revenue`

Данные для графика выручки.

**Query параметры:**

| Параметр   | Тип           | По умолчанию | Описание                       |
| ---------- | ------------- | ------------ | ------------------------------ |
| `period`   | `StatsPeriod` | `month`      | Период (влияет на группировку) |
| `currency` | `Currency`    | -            | Фильтр по валюте               |

**Группировка по периодам:**

- `day` — по часам (`YYYY-MM-DD HH:00`)
- `week`, `month` — по дням (`YYYY-MM-DD`)
- `quarter`, `year` — по месяцам (`YYYY-MM`)

**Пример ответа:**

```json
[
  { "date": "2026-01-01", "value": 50000, "count": 5 },
  { "date": "2026-01-02", "value": 75000, "count": 8 },
  { "date": "2026-01-03", "value": 120000, "count": 12 }
]
```

---

#### GET `/api/admin/payments/charts/subscriptions`

Данные для графика новых подписок.

**Пример ответа:**

```json
[
  { "date": "2026-01-01", "value": 3 },
  { "date": "2026-01-02", "value": 5 },
  { "date": "2026-01-03", "value": 8 }
]
```

---

### Breakdown Endpoints

#### GET `/api/admin/payments/breakdown/type`

Разбивка по типам платежей.

**Пример ответа:**

```json
[
  { "type": "subscription", "count": 120, "revenue": 1200000 },
  { "type": "subscription_renewal", "count": 45, "revenue": 450000 },
  { "type": "donation", "count": 36, "revenue": 180000 },
  { "type": "digital_product", "count": 10, "revenue": 50000 }
]
```

---

#### GET `/api/admin/payments/breakdown/period`

Разбивка по периодам подписки.

**Пример ответа:**

```json
[
  { "period": "monthly", "count": 150, "revenue": 1500000 },
  { "period": "yearly", "count": 15, "revenue": 1500000 }
]
```

---

#### GET `/api/admin/payments/breakdown/currency`

Разбивка по валютам.

**Пример ответа:**

```json
[
  { "currency": "usd", "count": 150, "revenue": 1500000 },
  { "currency": "eur", "count": 20, "revenue": 200000 },
  { "currency": "rub", "count": 5, "revenue": 50000 }
]
```

---

### Accounting Endpoints

#### GET `/api/admin/payments/accounting/report`

Бухгалтерский отчёт за произвольный период.

**Query параметры:**

| Параметр    | Тип        | Обязательный | Описание                       |
| ----------- | ---------- | ------------ | ------------------------------ |
| `startDate` | `string`   | ✅           | Начало периода (ISO date)      |
| `endDate`   | `string`   | ✅           | Конец периода (ISO date)       |
| `currency`  | `Currency` | -            | Валюта отчёта (default: `usd`) |

**Пример запроса:**

```http
GET /api/admin/payments/accounting/report?startDate=2026-01-01&endDate=2026-01-31&currency=usd
```

**Пример ответа:**

```json
{
  "period": {
    "start": "2026-01-01T00:00:00.000Z",
    "end": "2026-01-31T00:00:00.000Z"
  },
  "revenue": {
    "total": 1560000,
    "byType": {
      "subscription": 1200000,
      "subscription_renewal": 300000,
      "donation": 60000
    },
    "byCurrency": {
      "usd": 1500000,
      "eur": 60000
    },
    "byPeriod": {
      "monthly": 1000000,
      "yearly": 560000
    }
  },
  "transactions": {
    "total": 170,
    "completed": 156,
    "failed": 10,
    "refunded": 2,
    "cancelled": 2
  },
  "avgCheck": 10000,
  "currency": "usd"
}
```

---

#### GET `/api/admin/payments/accounting/top-payers`

Список топ плательщиков.

**Query параметры:**

| Параметр | Тип           | По умолчанию | Описание            |
| -------- | ------------- | ------------ | ------------------- |
| `limit`  | `number`      | `10`         | Количество записей  |
| `period` | `StatsPeriod` | `all`        | Период для подсчёта |

**Пример ответа:**

```json
[
  {
    "telegramId": 123456789,
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "totalSpent": 120000,
    "paymentsCount": 12,
    "lastPayment": "2026-01-25T14:30:00.000Z"
  },
  {
    "telegramId": 987654321,
    "username": "jane_smith",
    "firstName": "Jane",
    "lastName": "Smith",
    "totalSpent": 100000,
    "paymentsCount": 10,
    "lastPayment": "2026-01-24T10:15:00.000Z"
  }
]
```

---

#### GET `/api/admin/payments/accounting/export`

Экспорт транзакций за период (для скачивания/отчётов).

**Query параметры:**

| Параметр    | Тип      | Обязательный | Описание                  |
| ----------- | -------- | ------------ | ------------------------- |
| `startDate` | `string` | ✅           | Начало периода (ISO date) |
| `endDate`   | `string` | ✅           | Конец периода (ISO date)  |

**Пример ответа:**

```json
{
  "period": {
    "start": "2026-01-01T00:00:00.000Z",
    "end": "2026-01-31T00:00:00.000Z"
  },
  "count": 156,
  "transactions": [
    {
      "id": "507f1f77bcf86cd799439011",
      "date": "2026-01-25T14:30:00.000Z",
      "type": "subscription",
      "status": "completed",
      "amount": 10000,
      "amountFormatted": "$100",
      "currency": "usd",
      "period": "monthly",
      "subscriptionType": "regular",
      "user": {
        "telegramId": 123456789,
        "username": "john_doe",
        "name": "John Doe"
      },
      "tributeSubscriptionId": 1644
    }
  ]
}
```

---

### Comparison Endpoint

#### GET `/api/admin/payments/compare`

Сравнение текущего периода с предыдущим.

**Query параметры:**

| Параметр   | Тип           | По умолчанию | Описание             |
| ---------- | ------------- | ------------ | -------------------- |
| `period`   | `StatsPeriod` | `month`      | Период для сравнения |
| `currency` | `Currency`    | `usd`        | Валюта               |

**Логика сравнения:**

- `day` — сегодня vs вчера
- `week` — последние 7 дней vs предыдущие 7 дней
- `month` — последние 30 дней vs предыдущие 30 дней
- `quarter` — последние 90 дней vs предыдущие 90 дней
- `year` — последние 365 дней vs предыдущие 365 дней

**Пример ответа:**

```json
{
  "period": "month",
  "current": {
    "totalPayments": 156,
    "totalRevenue": 1560000,
    "totalRevenueFormatted": "$15,600",
    "avgPayment": 10000,
    "avgPaymentFormatted": "$100",
    "currency": "usd"
  },
  "previous": {
    "totalPayments": 140,
    "totalRevenue": 1400000,
    "totalRevenueFormatted": "$14,000",
    "avgPayment": 10000,
    "avgPaymentFormatted": "$100",
    "currency": "usd"
  },
  "changes": {
    "revenue": {
      "absolute": 160000,
      "percent": 11.43,
      "direction": "up"
    },
    "payments": {
      "absolute": 16,
      "percent": 11.43,
      "direction": "up"
    }
  }
}
```

---

## Примеры использования

### API Client (TypeScript/Axios)

```typescript
import axios, { AxiosInstance } from 'axios';

interface ApiClient {
  payments: PaymentsApi;
}

interface PaymentsApi {
  getSummary(
    period?: StatsPeriod,
    currency?: Currency,
  ): Promise<PaymentsSummary>;
  getSubscriptions(): Promise<SubscriptionStats>;
  getMRR(currency?: Currency): Promise<MRRData>;
  getDashboard(currency?: Currency): Promise<DashboardData>;
  getRevenueChart(
    period?: StatsPeriod,
    currency?: Currency,
  ): Promise<ChartDataPoint[]>;
  getSubscriptionsChart(period?: StatsPeriod): Promise<ChartDataPoint[]>;
  getBreakdownByType(period?: StatsPeriod): Promise<BreakdownItem[]>;
  getBreakdownByPeriod(period?: StatsPeriod): Promise<BreakdownItem[]>;
  getBreakdownByCurrency(period?: StatsPeriod): Promise<BreakdownItem[]>;
  getAccountingReport(
    startDate: string,
    endDate: string,
    currency?: Currency,
  ): Promise<AccountingReport>;
  getTopPayers(limit?: number, period?: StatsPeriod): Promise<TopPayer[]>;
  exportTransactions(
    startDate: string,
    endDate: string,
  ): Promise<ExportTransactionsResponse>;
  comparePeriods(
    period?: StatsPeriod,
    currency?: Currency,
  ): Promise<PeriodComparison>;
}

class PaymentStatsClient implements PaymentsApi {
  constructor(private http: AxiosInstance) {}

  async getSummary(
    period: StatsPeriod = 'month',
    currency?: Currency,
  ): Promise<PaymentsSummary> {
    const params = new URLSearchParams({ period });
    if (currency) params.append('currency', currency);
    const { data } = await this.http.get(
      `/api/admin/payments/summary?${params}`,
    );
    return data;
  }

  async getSubscriptions(): Promise<SubscriptionStats> {
    const { data } = await this.http.get('/api/admin/payments/subscriptions');
    return data;
  }

  async getMRR(currency: Currency = 'usd'): Promise<MRRData> {
    const { data } = await this.http.get(
      `/api/admin/payments/mrr?currency=${currency}`,
    );
    return data;
  }

  async getDashboard(currency: Currency = 'usd'): Promise<DashboardData> {
    const { data } = await this.http.get(
      `/api/admin/payments/dashboard?currency=${currency}`,
    );
    return data;
  }

  async getRevenueChart(
    period: StatsPeriod = 'month',
    currency?: Currency,
  ): Promise<ChartDataPoint[]> {
    const params = new URLSearchParams({ period });
    if (currency) params.append('currency', currency);
    const { data } = await this.http.get(
      `/api/admin/payments/charts/revenue?${params}`,
    );
    return data;
  }

  async getSubscriptionsChart(
    period: StatsPeriod = 'month',
  ): Promise<ChartDataPoint[]> {
    const { data } = await this.http.get(
      `/api/admin/payments/charts/subscriptions?period=${period}`,
    );
    return data;
  }

  async getBreakdownByType(
    period: StatsPeriod = 'month',
  ): Promise<BreakdownItem[]> {
    const { data } = await this.http.get(
      `/api/admin/payments/breakdown/type?period=${period}`,
    );
    return data;
  }

  async getBreakdownByPeriod(
    period: StatsPeriod = 'month',
  ): Promise<BreakdownItem[]> {
    const { data } = await this.http.get(
      `/api/admin/payments/breakdown/period?period=${period}`,
    );
    return data;
  }

  async getBreakdownByCurrency(
    period: StatsPeriod = 'month',
  ): Promise<BreakdownItem[]> {
    const { data } = await this.http.get(
      `/api/admin/payments/breakdown/currency?period=${period}`,
    );
    return data;
  }

  async getAccountingReport(
    startDate: string,
    endDate: string,
    currency: Currency = 'usd',
  ): Promise<AccountingReport> {
    const params = new URLSearchParams({ startDate, endDate, currency });
    const { data } = await this.http.get(
      `/api/admin/payments/accounting/report?${params}`,
    );
    return data;
  }

  async getTopPayers(
    limit: number = 10,
    period: StatsPeriod = 'all',
  ): Promise<TopPayer[]> {
    const { data } = await this.http.get(
      `/api/admin/payments/accounting/top-payers?limit=${limit}&period=${period}`,
    );
    return data;
  }

  async exportTransactions(
    startDate: string,
    endDate: string,
  ): Promise<ExportTransactionsResponse> {
    const params = new URLSearchParams({ startDate, endDate });
    const { data } = await this.http.get(
      `/api/admin/payments/accounting/export?${params}`,
    );
    return data;
  }

  async comparePeriods(
    period: StatsPeriod = 'month',
    currency: Currency = 'usd',
  ): Promise<PeriodComparison> {
    const { data } = await this.http.get(
      `/api/admin/payments/compare?period=${period}&currency=${currency}`,
    );
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

const paymentsApi = new PaymentStatsClient(http);
```

---

## React компоненты

### Custom Hooks

```typescript
// hooks/usePaymentStats.ts
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../api/client';

export function usePaymentsDashboard(currency: Currency = 'usd') {
  return useQuery({
    queryKey: ['payments', 'dashboard', currency],
    queryFn: () => paymentsApi.getDashboard(currency),
    staleTime: 60 * 1000, // 1 минута
  });
}

export function usePaymentsSummary(
  period: StatsPeriod = 'month',
  currency?: Currency,
) {
  return useQuery({
    queryKey: ['payments', 'summary', period, currency],
    queryFn: () => paymentsApi.getSummary(period, currency),
  });
}

export function useRevenueChart(
  period: StatsPeriod = 'month',
  currency?: Currency,
) {
  return useQuery({
    queryKey: ['payments', 'charts', 'revenue', period, currency],
    queryFn: () => paymentsApi.getRevenueChart(period, currency),
  });
}

export function usePeriodComparison(
  period: StatsPeriod = 'month',
  currency: Currency = 'usd',
) {
  return useQuery({
    queryKey: ['payments', 'compare', period, currency],
    queryFn: () => paymentsApi.comparePeriods(period, currency),
  });
}

export function useAccountingReport(
  startDate: string,
  endDate: string,
  currency: Currency = 'usd',
) {
  return useQuery({
    queryKey: [
      'payments',
      'accounting',
      'report',
      startDate,
      endDate,
      currency,
    ],
    queryFn: () =>
      paymentsApi.getAccountingReport(startDate, endDate, currency),
    enabled: !!startDate && !!endDate,
  });
}

export function useTopPayers(limit: number = 10, period: StatsPeriod = 'all') {
  return useQuery({
    queryKey: ['payments', 'top-payers', limit, period],
    queryFn: () => paymentsApi.getTopPayers(limit, period),
  });
}
```

### Dashboard Component

```tsx
// components/PaymentsDashboard.tsx
import React from 'react';
import { usePaymentsDashboard } from '../hooks/usePaymentStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Users,
  CreditCard,
  DollarSign,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'same';
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      {trend && (
        <div
          className={`flex items-center text-xs ${
            trend.direction === 'up'
              ? 'text-green-600'
              : trend.direction === 'down'
                ? 'text-red-600'
                : 'text-gray-500'
          }`}
        >
          {trend.direction === 'up' && <ArrowUp className="h-3 w-3 mr-1" />}
          {trend.direction === 'down' && <ArrowDown className="h-3 w-3 mr-1" />}
          {trend.value > 0 ? '+' : ''}
          {trend.value}% vs прошлый период
        </div>
      )}
    </CardContent>
  </Card>
);

export const PaymentsDashboard: React.FC = () => {
  const { data, isLoading, error } = usePaymentsDashboard('usd');

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки данных</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Выручка (месяц)"
          value={data.summary.totalRevenueFormatted}
          subtitle={`${data.summary.totalPayments} платежей`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="MRR"
          value={data.mrr.currentMRRFormatted}
          subtitle={`ARR: ${data.mrr.projectedARRFormatted}`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: data.mrr.growthPercent,
            direction:
              data.mrr.growth > 0
                ? 'up'
                : data.mrr.growth < 0
                  ? 'down'
                  : 'same',
          }}
        />
        <StatCard
          title="Активные подписки"
          value={data.subscriptions.activeSubscriptions}
          subtitle={`Churn: ${data.subscriptions.churnRate}%`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Средний чек"
          value={data.summary.avgPaymentFormatted}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Подписки */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика подписок</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {data.subscriptions.activeSubscriptions}
              </div>
              <div className="text-sm text-muted-foreground">Активные</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {data.subscriptions.cancelledSubscriptions}
              </div>
              <div className="text-sm text-muted-foreground">Отменённые</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-500">
                {data.subscriptions.expiredSubscriptions}
              </div>
              <div className="text-sm text-muted-foreground">Истекшие</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Trial пользователи: {data.subscriptions.trialUsers}</span>
              <span>Конверсия: {data.subscriptions.conversionRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Разбивка по типам */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>По типам платежей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.breakdown.byType.map((item) => (
                <div key={item.type} className="flex justify-between">
                  <span className="capitalize">
                    {item.type?.replace('_', ' ')}
                  </span>
                  <span className="font-medium">
                    {item.count} ({formatAmount(item.revenue)})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>По валютам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.breakdown.byCurrency.map((item) => (
                <div key={item.currency} className="flex justify-between">
                  <span className="uppercase">{item.currency}</span>
                  <span className="font-medium">{item.count} платежей</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Утилита форматирования
function formatAmount(amount: number, currency: string = 'usd'): string {
  const value = amount / 100;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
  return formatter.format(value);
}
```

### Revenue Chart Component

```tsx
// components/RevenueChart.tsx
import React from 'react';
import { useRevenueChart } from '../hooks/usePaymentStats';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RevenueChartProps {
  defaultPeriod?: StatsPeriod;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  defaultPeriod = 'month',
}) => {
  const [period, setPeriod] = React.useState<StatsPeriod>(defaultPeriod);
  const { data, isLoading } = useRevenueChart(period);

  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((point) => ({
      ...point,
      // Конвертируем центы в доллары для отображения
      revenue: point.value / 100,
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>График выручки</CardTitle>
        <Select
          value={period}
          onValueChange={(v) => setPeriod(v as StatsPeriod)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">День</SelectItem>
            <SelectItem value="week">Неделя</SelectItem>
            <SelectItem value="month">Месяц</SelectItem>
            <SelectItem value="quarter">Квартал</SelectItem>
            <SelectItem value="year">Год</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            Загрузка...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return period === 'day'
                    ? date.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : date.toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'short',
                      });
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toFixed(2)}`,
                  'Выручка',
                ]}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString('ru-RU')
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
```

### Accounting Report Component

```tsx
// components/AccountingReport.tsx
import React from 'react';
import { useAccountingReport, useTopPayers } from '../hooks/usePaymentStats';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Download } from 'lucide-react';

export const AccountingReport: React.FC = () => {
  const [dateRange, setDateRange] = React.useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(1)), // Начало текущего месяца
    to: new Date(),
  });

  const startDate = format(dateRange.from, 'yyyy-MM-dd');
  const endDate = format(dateRange.to, 'yyyy-MM-dd');

  const { data: report, isLoading } = useAccountingReport(startDate, endDate);
  const { data: topPayers } = useTopPayers(5, 'month');

  const handleExport = async () => {
    const response = await fetch(
      `/api/admin/payments/accounting/export?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    );
    const data = await response.json();

    // Конвертируем в CSV
    const csv = convertToCSV(data.transactions);
    downloadCSV(csv, `transactions_${startDate}_${endDate}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Выбор периода */}
      <Card>
        <CardHeader>
          <CardTitle>Бухгалтерский отчёт</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[280px] justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, 'd MMM', { locale: ru })} -{' '}
                  {format(dateRange.to, 'd MMM yyyy', { locale: ru })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) =>
                    range && setDateRange({ from: range.from!, to: range.to! })
                  }
                  locale={ru}
                />
              </PopoverContent>
            </Popover>

            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Экспорт CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div>Загрузка отчёта...</div>
      ) : (
        report && (
          <>
            {/* Сводка */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    ${(report.revenue.total / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Общая выручка
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {report.transactions.total}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Всего транзакций
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {report.transactions.completed}
                  </div>
                  <div className="text-sm text-muted-foreground">Успешных</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    ${(report.avgCheck / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Средний чек
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Детализация */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Выручка по типам</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(report.revenue.byType).map(
                      ([type, amount]) => (
                        <div key={type} className="flex justify-between">
                          <span className="capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <span className="font-medium">
                            ${(amount / 100).toFixed(2)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Транзакции по статусам</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Успешные</span>
                      <span className="text-green-600 font-medium">
                        {report.transactions.completed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Неудачные</span>
                      <span className="text-red-600 font-medium">
                        {report.transactions.failed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Возвраты</span>
                      <span className="text-yellow-600 font-medium">
                        {report.transactions.refunded}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Отменённые</span>
                      <span className="text-gray-500 font-medium">
                        {report.transactions.cancelled}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Топ плательщиков */}
            <Card>
              <CardHeader>
                <CardTitle>Топ плательщиков</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPayers?.map((payer, index) => (
                    <div
                      key={payer.telegramId}
                      className="flex items-center gap-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {payer.firstName} {payer.lastName}
                          {payer.username && (
                            <span className="text-muted-foreground ml-2">
                              @{payer.username}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payer.paymentsCount} платежей
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          ${(payer.totalSpent / 100).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Последний:{' '}
                          {format(new Date(payer.lastPayment), 'd MMM', {
                            locale: ru,
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  );
};

// Утилиты
function convertToCSV(transactions: ExportTransaction[]): string {
  const headers = [
    'ID',
    'Date',
    'Type',
    'Status',
    'Amount',
    'Currency',
    'User',
    'Telegram ID',
  ];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type,
    t.status,
    (t.amount / 100).toFixed(2),
    t.currency,
    t.user?.name || '',
    t.user?.telegramId || '',
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
```

---

## Коды ошибок

| HTTP Code | Описание                                       |
| --------- | ---------------------------------------------- |
| `200`     | Успешный запрос                                |
| `400`     | Неверные параметры (например, невалидная дата) |
| `401`     | Не авторизован                                 |
| `403`     | Нет прав доступа (требуется `viewAnalytics`)   |
| `500`     | Внутренняя ошибка сервера                      |

**Пример ошибки:**

```json
{
  "statusCode": 400,
  "message": "Invalid date format. Use ISO date format.",
  "error": "Bad Request"
}
```
