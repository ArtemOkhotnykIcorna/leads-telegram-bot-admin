# Аналитика — Документация для фронтенда

## Обзор

Модуль аналитики предоставляет 13 специализированных эндпоинтов для построения дашбордов и графиков. Все запросы требуют авторизации через JWT-токен и разрешения `viewAnalytics`.

**Базовый URL:** `/api/admin/analytics`

**Аутентификация:** `Authorization: Bearer <token>`

---

## Параметр `period`

Большинство эндпоинтов принимают опциональный query-параметр `period`, который задаёт временной диапазон выборки и гранулярность группировки данных в таймлайнах.

| Значение                 | Диапазон           | Шаг таймлайна |
| ------------------------ | ------------------ | ------------- |
| `day`                    | Последние 24 часа  | 1 час         |
| `week`                   | Последние 7 дней   | 1 день        |
| `month` _(по умолчанию)_ | Последние 30 дней  | 1 день        |
| `year`                   | Последние 365 дней | 1 месяц       |

Формат дат в таймлайнах:

- `hour` → `"2026-02-26T14:00"`
- `day` → `"2026-02-26"`
- `month` → `"2026-02"`

---

## 1. Обзорная статистика (KPI Dashboard)

**`GET /overview`** · Параметры: `period`

Главный эндпоинт дашборда. Возвращает ключевые показатели системы с динамикой роста относительно предыдущего аналогичного периода.

### Структура ответа

```
{
  period: string,
  users: {
    total: number,            // Всего пользователей в системе
    new: number,              // Новых за текущий период
    newGrowth: number|null,   // % изменения vs предыдущий период (null если prev=0)
    byStatus: {
      trial: number,
      active: number,
      expired: number,
      blocked: number
    },
    activeRate: number        // % активных от общего числа
  },
  revenue: {
    total: number,            // Выручка за текущий период
    previous: number,         // Выручка за предыдущий период
    growth: number|null,      // % изменения
    byCurrency: {             // Объект { "usd": 1200, "rub": 45000, ... }
      [currency: string]: number
    },
    paymentsCount: number
  },
  leads: {
    total: number,            // Всего лидов (сумма leadsCount из источников)
    new: number,              // Новых за период
    newGrowth: number|null
  },
  sources: {
    total: number,
    active: number
  }
}
```

### Рекомендуемые компоненты

- Карточки KPI с индикаторами роста/падения (стрелка + %)
- Pie chart «Пользователи по статусам подписки»
- Сравнительные баджи период-к-периоду

---

## 2. Статистика пользователей

**`GET /users`** · Параметры: `period`

Регистрации, воронка подписок, конверсия пробного периода, топ стран и направлений.

### Структура ответа

```
{
  period: string,
  granularity: string,        // "hour" | "day" | "month"
  timeline: [                 // Массив точек регистраций во времени
    { date: string, count: number }
  ],
  totals: {
    total: number,
    trial: number,
    active: number,
    expired: number,
    blocked: number,
    trialUsed: number
  },
  conversion: {
    trialStarted: number,     // Пользователей, у которых был trial
    trialConverted: number,   // Перешли в active после trial
    rate: number              // % конверсии
  },
  byCountry: [                // Топ-10 стран
    { id, name, flag, count }
  ],
  byDirection: [              // Топ-10 направлений
    { id, name, slug, count }
  ]
}
```

### Рекомендуемые компоненты

- Line chart таймлайн регистраций
- Funnel chart воронки: trial → active → expired/blocked
- Gauge/Progress «Конверсия trial→paid» (`conversion.rate`)
- Horizontal bar chart «Топ стран» и «Топ направлений»

---

## 3. Статистика выручки

**`GET /revenue`** · Параметры: `period`

Выручка во времени, разбивка по валютам и планам, MRR.

### Структура ответа

```
{
  period: string,
  granularity: string,
  timeline: [                 // Выручка по шагам периода
    { date: string, count: number, amount: number }
  ],
  totals: {
    totalCount: number,       // Количество платежей
    totalAmount: number,      // Общая сумма
    avgAmount: number,        // Средний чек
    maxAmount: number,
    minAmount: number
  },
  byCurrency: [               // Разбивка по валютам
    { currency, count, amount }
  ],
  byRecordType: [             // subscription | subscription_renewal | donation | digital_product
    { recordType, count, amount }
  ],
  bySubscriptionPlan: [       // Топ-10 планов
    { name, count, amount }
  ],
  mrr: {                      // Monthly Recurring Revenue (monthly-платежи)
    [currency: string]: number
  }
}
```

### Рекомендуемые компоненты

- Area/Bar chart «Выручка во времени» (двойная ось: сумма + количество)
- Donut chart «По валютам»
- Donut chart «По типам записей» (subscription vs donation vs product)
- Bar chart «Топ тарифов по выручке»
- Карточка MRR

---

## 4. Статистика лидов

**`GET /leads`** · Параметры: `period`

Лиды во времени, по статусам, источникам, направлениям, качество контактных данных.

### Структура ответа

```
{
  period: string,
  granularity: string,
  timeline: [
    { date: string, count: number }
  ],
  totals: {
    total: number,
    byStatus: [               // Разбивка по статусам
      { status: string, count: number }
    ]
  },
  contactCoverage: {          // Качество извлечения контактов
    total: number,
    withAny: number,          // Хотя бы один контакт
    withAnyRate: number,
    withPhone: number,
    withPhoneRate: number,
    withTelegram: number,
    withTelegramRate: number,
    withEmail: number,
    withEmailRate: number,
    withName: number,
    withNameRate: number
  },
  bySource: [                 // Топ-10 источников
    { sourceId, name, slug, type, count, published, publishRate }
  ],
  byDirection: [              // Топ-10 направлений
    { directionId, name, slug, count }
  ]
}
```

### Рекомендуемые компоненты

- Line chart таймлайн лидов
- Stacked bar chart «Лиды по статусам»
- Horizontal bar chart «Топ источников» с двойной шкалой (всего / publishRate)
- Progress bars «Покрытие контактными данными»

---

## 5. Статистика источников

**`GET /sources`** · Параметры: нет

Рейтинг источников, типы, здоровье MTProto-подключений.

### Структура ответа

```
{
  total: number,
  active: number,
  inactive: number,
  totalLeads: number,
  byType: [                   // telegram_channel | telegram_group | website | api
    { type, count, active, totalLeads }
  ],
  mtprotoStatus: [            // joined | pending | error | left
    { status, count }
  ],
  topSources: [               // Топ-20 источников
    {
      id, name, slug, type,
      leadsCount, percentage,  // % от общего числа лидов
      isActive, collectionMethod,
      mtprotoStatus
    }
  ]
}
```

### Рекомендуемые компоненты

- Donut chart «Источники по типам»
- Status indicators MTProto (joined/pending/error/left)
- Таблица-рейтинг источников

---

## 6. Удержание подписчиков (Retention)

**`GET /retention`** · Параметры: нет

Динамика подписок по месяцам за год: новые, истёкшие, отменённые.

### Структура ответа

```
{
  newSubscriptions: [         // Новые подписки по месяцам
    { month: string, count: number, revenue: number }
  ],
  expiredSubscriptions: [     // Истёкшие по месяцам
    { month: string, count: number }
  ],
  cancelledSubscriptions: [   // Отменённые по месяцам
    { month: string, count: number }
  ]
}
```

Формат `month`: `"2026-02"`.

### Рекомендуемые компоненты

- Grouped bar chart с тремя рядами: новые / истёкшие / отменённые
- Area chart «Чистый прирост» (новые − истёкшие − отменённые)

---

## 7. Активность в реальном времени

**`GET /realtime`** · Параметры: нет

«Пульс» системы: последние 24 часа без кэша. Рекомендуется polling каждые 60 секунд.

### Структура ответа

```
{
  leadsPerHour: [             // Лиды по часам за 24 ч
    { hour: string, count: number }
  ],
  leadsLast1h: number,        // Лидов за последний час
  newUsersLast24h: number,    // Новых пользователей за 24 ч
  recentLeads: [              // Последние 10 лидов
    {
      id, title, status,
      hasPhone: boolean,
      hasTelegram: boolean,
      createdAt: string
    }
  ]
}
```

### Рекомендуемые компоненты

- Sparkline / Area chart «Лиды по часам»
- Live-счётчики `leadsLast1h` и `newUsersLast24h`
- Live-лента последних лидов

---

## 8. Статистика Telegram-групп

**`GET /groups`** · Параметры: `period`

Активность групп: публикации, инвайты, разбивка по направлениям и странам.

### Структура ответа

```
{
  period: string,
  totals: {
    total: number,
    active: number,
    inactive: number
  },
  topByPublished: [           // Топ-15 групп по опубликованным лидам
    {
      id, name,
      leadsPublished: number,
      invitesGenerated: number,
      lastPublishedAt: string|null,
      directionName, countryName, countryFlag,
      isActive: boolean
    }
  ],
  byDirection: [              // Разбивка по направлениям
    { directionId, directionName, groupsCount, activeCount, totalPublished, totalInvites }
  ],
  byCountry: [                // Разбивка по странам
    { countryId, countryName, countryFlag, groupsCount, totalPublished }
  ],
  publishTimeline: [          // Публикации лидов в группы во времени
    { date: string, count: number }
  ],
  inviteTimeline: [           // Генерация инвайтов во времени
    { date: string, count: number }
  ]
}
```

### Рекомендуемые компоненты

- Bar/Column chart «Топ групп по публикациям»
- Dual-line chart «Публикации vs Инвайты во времени»
- Grouped bar «По направлениям»

---

## 9. Аналитика приглашений

**`GET /invites`** · Параметры: `period`

Воронка конверсии приглашений, скорость использования, активность по группам.

### Структура ответа

```
{
  period: string,
  granularity: string,
  totals: {
    total: number,
    active: number,
    used: number,
    expired: number,
    revoked: number,
    overallConversionRate: number   // % использованных от всех
  },
  conversionSpeed: {          // Скорость использования инвайтов
    avgHours: number,         // Среднее время до использования (часы)
    minHours: number,
    maxHours: number,
    count: number             // Количество использованных инвайтов
  },
  timeline: [                 // Динамика созданных и использованных
    {
      date: string,
      created: number,
      used: number,
      conversionRate: number
    }
  ],
  byStatus: [                 // active | used | expired | revoked
    { status, count }
  ],
  byGroup: [                  // Топ-10 групп
    { groupId, groupName, total, used, conversionRate }
  ]
}
```

### Рекомендуемые компоненты

- Funnel chart статусов инвайтов
- Dual-line «Создано vs Использовано» с вторичной осью % конверсии
- Horizontal bar «Топ групп по конверсии инвайтов»
- Карточка «Средняя скорость использования»

---

## 10. Конвейер обработки лидов

**`GET /leads/pipeline`** · Параметры: `period`

Детальная воронка обработки лидов: успешность, задержки, ошибки.

### Структура ответа

```
{
  period: string,
  granularity: string,
  funnel: {
    total: number,
    new: number,
    processing: number,
    published: number,
    failed: number,
    duplicate: number,
    skipped: number,
    publishedRate: number,    // % от total
    failedRate: number,
    duplicateRate: number,
    skippedRate: number
  },
  publishSuccess: {
    totalAttempts: number,    // Всего попыток публикации
    successful: number,
    failed: number,
    successRate: number       // % успешных попыток
  },
  processingDelay: {          // Задержка от публикации в источнике
    avgDelayMinutes: number,  // Среднее время обработки (минуты)
    minDelayMinutes: number,
    maxDelayMinutes: number,
    count: number
  },
  attemptsDistribution: [     // Сколько лидов потребовало N попыток
    { attempts: number, count: number }
  ],
  duplicateAndSkipTimeline: [ // Дубликаты и скипы во времени
    { date: string, status: "duplicate"|"skipped", count: number }
  ],
  errorTimeline: [            // Ошибки (failed) во времени
    { date: string, count: number }
  ]
}
```

### Рекомендуемые компоненты

- Funnel chart «new → processing → published/failed/duplicate/skipped»
- Donut «Результаты обработки» (published/failed/duplicate/skipped)
- Карточка «Задержка обработки» (avg/min/max минут)
- Bar chart «Распределение по числу попыток»
- Area chart «Ошибки и дубликаты во времени»

---

## 11. Географическая аналитика

**`GET /geography`** · Параметры: `period`

Сквозная аналитика по странам: лиды, пользователи, группы, выручка.

### Структура ответа

```
{
  period: string,
  leadsByCountry: [
    {
      countryId, name, code, flag,
      leads: number,
      published: number,
      publishRate: number
    }
  ],
  usersByCountry: [
    {
      countryId, name, code, flag,
      total: number,
      active: number,
      trial: number,
      newInPeriod: number,
      activeRate: number
    }
  ],
  groupsByCountry: [
    {
      countryId, name, code, flag,
      groups: number,
      activeGroups: number,
      totalPublished: number
    }
  ],
  revenueByCountry: [
    {
      countryId, name, code, flag,
      revenue: number,
      payments: number
    }
  ]
}
```

Поле `code` содержит ISO-код страны (например `"AE"`, `"BY"`) — используется для привязки к картографическим библиотекам.

### Рекомендуемые компоненты

- Choropleth map с переключением метрики (лиды / пользователи / выручка)
- Grouped bar «Сравнение стран по всем показателям»
- Ranked список стран с мини-метриками

---

## 12. Анализ подписочных планов

**`GET /subscription-plans`** · Параметры: `period`

Популярность тарифов, ARPU, рекуррентность, churn, выручка во времени.

### Структура ответа

```
{
  period: string,
  granularity: string,
  planPopularity: [           // Популярность тарифов
    {
      planName: string,
      purchases: number,
      revenue: number,
      avgAmount: number,
      uniqueUsers: number
    }
  ],
  byPaymentPeriod: [          // monthly | yearly | once
    { period, count, revenue }
  ],
  bySubscriptionType: [       // regular | gift | trial
    { type, count, revenue }
  ],
  cancelReasons: [            // Причины отмены (churn analysis)
    { reason: string, count: number, lostRevenue: number }
  ],
  recurrentStats: {
    total: number,
    recurrent: number,
    oneTime: number,
    recurrentRate: number,    // % рекуррентных от всех
    totalRevenue: number,
    recurrentRevenue: number
  },
  arpu: {
    payingUsers: number,      // Уникальных плательщиков за период
    totalRevenue: number,
    arpu: number,             // Average Revenue Per User
    avgPaymentsPerUser: number,
    maxSpent: number
  },
  revenueByPlanTimeline: [    // Выручка по тарифам во времени
    { date: string, plan: string, revenue: number, count: number }
  ],
  activePlans: [              // Текущий каталог активных планов
    { code, name, periodType, price, currency, discountPercent, isPopular, isRecommended }
  ]
}
```

### Рекомендуемые компоненты

- Stacked area chart «Выручка по тарифам» (`revenueByPlanTimeline`)
- Bar chart «Популярность тарифов» (покупки + выручка)
- Donut «monthly vs yearly vs once»
- Donut «regular vs gift vs trial»
- Bar chart «Причины отмены» (churn)
- Карточка ARPU с `recurrentRate`

---

## 13. Эффективность маршрутизации

**`GET /routing`** · Параметры: нет

Аналитика правил маршрутизации лидов.

### Структура ответа

```
{
  totals: {
    totalRules: number,
    activeRules: number,
    inactiveRules: number,
    totalRouted: number       // Всего лидов обработано всеми правилами
  },
  rules: [                    // Все правила, отсортированы по leadsRouted
    {
      id, name,
      distributionMode: "all"|"round_robin"|"random"|"weighted",
      priority: number,
      isActive: boolean,
      leadsRouted: number,
      targetGroupsCount: number
    }
  ],
  byDistributionMode: [       // По стратегиям распределения
    { mode, count, activeCount, totalRouted }
  ],
  directionCoverage: [        // Охват направлений активными правилами
    { directionId, directionName, rulesCount, totalRouted }
  ]
}
```

### Рекомендуемые компоненты

- Таблица правил с индикатором активности и прогресс-баром `leadsRouted`
- Donut «Стратегии распределения»
- Bar chart «Покрытие направлений»

---

## Эндпоинты без периода

Следующие эндпоинты возвращают актуальное состояние всей системы без фильтрации по времени и не требуют параметра `period`:

| Эндпоинт         | Данные                                            |
| ---------------- | ------------------------------------------------- |
| `GET /sources`   | Все источники, MTProto-статусы                    |
| `GET /retention` | Динамика подписок за год (фиксированный диапазон) |
| `GET /realtime`  | Последние 24 ч / 1 ч, живая лента                 |
| `GET /routing`   | Актуальное состояние правил маршрутизации         |

---

## Рекомендации по организации дашборда

### Страница 1 — Главный дашборд

Эндпоинты: `overview` + `realtime`

Показывает: KPI-карточки, «пульс» системы, живую ленту лидов.

### Страница 2 — Лиды

Эндпоинты: `leads` + `leads/pipeline` + `sources`

Показывает: таймлайн, воронку обработки, покрытие контактов, рейтинг источников.

### Страница 3 — Пользователи и подписки

Эндпоинты: `users` + `revenue` + `subscription-plans` + `retention`

Показывает: регистрации, выручку, ARPU, конверсию trial→paid, churn.

### Страница 4 — География

Эндпоинт: `geography`

Показывает: карту активности, сравнение стран по всем метрикам.

### Страница 5 — Группы и инвайты

Эндпоинты: `groups` + `invites` + `routing`

Показывает: активность групп, конверсию инвайтов, эффективность маршрутизации.

---

## Стратегия кэширования

| Эндпоинт             | Рекомендуемый TTL | Комментарий          |
| -------------------- | ----------------- | -------------------- |
| `overview`           | 5 мин             | Меняется редко       |
| `users`              | 5 мин             |                      |
| `revenue`            | 5 мин             |                      |
| `leads`              | 2 мин             | Активно обновляется  |
| `sources`            | 10 мин            | Меняется очень редко |
| `retention`          | 30 мин            | Месячные данные      |
| `realtime`           | Polling 60 с      | Не кэшировать        |
| `groups`             | 5 мин             |                      |
| `invites`            | 2 мин             |                      |
| `leads/pipeline`     | 2 мин             |                      |
| `geography`          | 10 мин            |                      |
| `subscription-plans` | 5 мин             |                      |
| `routing`            | 15 мин            | Меняется вручную     |

---

## Обработка ошибок

| HTTP-код                    | Причина                                         |
| --------------------------- | ----------------------------------------------- |
| `401 Unauthorized`          | JWT-токен отсутствует или истёк                 |
| `403 Forbidden`             | У администратора нет разрешения `viewAnalytics` |
| `500 Internal Server Error` | Ошибка агрегации (проблема на стороне сервера)  |

Поле `growth` и `newGrowth` может быть `null` — это означает, что в предыдущем периоде не было данных для сравнения (деление на ноль). Фронтенд должен отображать `null` как `N/A` или `∞`, а не как 0%.
