# Модуль Sources - Документация для Frontend

## Оглавление

1. [Обзор модуля](#обзор-модуля)
2. [Архитектура и концепции](#архитектура-и-концепции)
3. [API Endpoints](#api-endpoints)
4. [Модели данных](#модели-данных)
5. [Шаблоны парсинга](#шаблоны-парсинга)
6. [Workflow: Регистрация источников](#workflow-регистрация-источников)
7. [UI/UX рекомендации](#uiux-рекомендации)
8. [Примеры запросов](#примеры-запросов)

---

## Обзор модуля

Модуль **Sources** отвечает за управление источниками лидов - каналами и группами в Telegram, откуда парсятся лиды для последующей публикации.

### Типы источников

| Тип                | Описание                    |
| ------------------ | --------------------------- |
| `telegram_channel` | Telegram канал              |
| `telegram_group`   | Telegram группа/супергруппа |
| `api`              | Внешний API источник        |
| `website`          | Веб-сайт (парсинг)          |

### Основные сущности

| Сущность          | Описание                                                                    |
| ----------------- | --------------------------------------------------------------------------- |
| **LeadSource**    | Зарегистрированный источник лидов с настройками парсинга                    |
| **PendingSource** | Источник, ожидающий настройки (автоматически создаётся при добавлении бота) |

---

## Архитектура и концепции

### Автоматическое определение назначения

Когда бота добавляют в канал/группу, система **автоматически определяет** его назначение:

```
┌─────────────────────────────────────────────────────────────────┐
│              ЛОГИКА ОПРЕДЕЛЕНИЯ НАЗНАЧЕНИЯ                      │
└─────────────────────────────────────────────────────────────────┘

     Бот добавлен в канал/группу
                │
                ▼
     ┌──────────────────────────────────────┐
     │  Проверяем СТАТУС бота:             │
     │                                      │
     │  🔹 Бот = АДМИНИСТРАТОР             │
     │     → PendingGroup (публикация)     │
     │                                      │
     │  🔹 Бот = УЧАСТНИК (member)         │
     │     → PendingSource (парсинг)       │
     └──────────────────────────────────────┘
```

### Жизненный цикл источника

```
┌─────────────────────────────────────────────────────────────────────┐
│              АВТОМАТИЧЕСКАЯ РЕГИСТРАЦИЯ ИСТОЧНИКА                   │
└─────────────────────────────────────────────────────────────────────┘

     1. Админ добавляет бота в канал/группу
        КАК УЧАСТНИКА (не админа!)
                │
                ▼
     2. Telegram отправляет событие my_chat_member
        (status: member)
                │
                ▼
     3. Бот создаёт PendingSource
        • chatId
        • title (название канала)
        • username (@channel)
        • suggestedSlug (автогенерация)
                │
                ▼
     4. Админ в панели:
        • Видит источник в "Ожидающие настройки"
        • Выбирает направления (directionIds)
        • Выбирает шаблон парсинга
                │
                ▼
     5. POST /pending/:id/link
        • Создаётся LeadSource
        • PendingSource.status = "linked"
                │
                ▼
     6. Источник готов к парсингу лидов!
```

---

## API Endpoints

**Base URL:** `/api/admin/sources`

**Авторизация:** Bearer Token (JWT)

**Права доступа:** Требуется permission `manageSources`

### Шаблоны парсинга

#### GET `/api/admin/sources/parsing-templates`

Получить список доступных шаблонов парсинга

**Response 200:**

```json
[
  {
    "key": "standard",
    "name": "Стандартный",
    "description": "Имя: ..., Телефон: ..., Комментарий: ..."
  },
  {
    "key": "phone_only",
    "name": "Только телефон",
    "description": "Извлекает только номера телефонов"
  },
  {
    "key": "emoji_format",
    "name": "С emoji маркерами",
    "description": "👤 Имя, 📞 Телефон, 💬 Комментарий"
  },
  {
    "key": "table_format",
    "name": "Табличный",
    "description": "Имя | Телефон | Комментарий"
  },
  {
    "key": "crypto",
    "name": "Крипто-лиды",
    "description": "Депозит, сумма, контакт"
  },
  {
    "key": "realestate",
    "name": "Недвижимость",
    "description": "Клиент, телефон, объект, бюджет"
  },
  {
    "key": "auto",
    "name": "Авто-лиды",
    "description": "Клиент, телефон, авто, бюджет"
  },
  {
    "key": "universal",
    "name": "Универсальный",
    "description": "Широкий парсинг, подходит для большинства форматов"
  },
  {
    "key": "custom",
    "name": "Пользовательский",
    "description": "Пустой шаблон для ручной настройки"
  }
]
```

---

### Ожидающие источники (PendingSource)

#### GET `/api/admin/sources/pending`

Получить источники, ожидающие настройки

**Response 200:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439044",
    "chatId": "-1001234567890",
    "title": "Crypto Leads Channel",
    "username": "crypto_leads",
    "chatType": "channel",
    "addedByUserId": 123456789,
    "status": "pending",
    "suggestedSlug": "crypto-leads-channel",
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:00:00.000Z"
  }
]
```

| Поле            | Описание                                     |
| --------------- | -------------------------------------------- |
| `chatId`        | Telegram Chat ID                             |
| `title`         | Название канала/группы                       |
| `username`      | @username (если есть)                        |
| `chatType`      | `channel`, `group`, `supergroup`             |
| `addedByUserId` | Telegram ID пользователя, добавившего бота   |
| `suggestedSlug` | Предложенный slug (сгенерирован из названия) |
| `status`        | `pending`, `linked`, `rejected`              |

---

#### POST `/api/admin/sources/pending/:id/link`

Привязать ожидающий источник к направлениям

**Path параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | string (MongoId) | ID pending source |

**Request Body:**

```json
{
  "directionIds": ["507f1f77bcf86cd799439022", "507f1f77bcf86cd799439023"],
  "slug": "crypto-leads-ua",
  "parsingTemplateKey": "crypto",
  "description": "Канал с криптовалютными лидами"
}
```

| Поле                 | Тип      | Обязательный | Описание                                           |
| -------------------- | -------- | ------------ | -------------------------------------------------- |
| `directionIds`       | string[] | Да           | Массив ID направлений                              |
| `slug`               | string   | Нет          | Уникальный slug (автогенерация если не указан)     |
| `parsingTemplateKey` | string   | Нет          | Ключ шаблона парсинга                              |
| `parsingConfig`      | object   | Нет          | Кастомная конфигурация (если templateKey = custom) |
| `description`        | string   | Нет          | Описание источника                                 |

**Response 201:**

```json
{
  "_id": "507f1f77bcf86cd799439055",
  "name": "Crypto Leads Channel",
  "slug": "crypto-leads-ua",
  "type": "telegram_channel",
  "telegramChatId": "-1001234567890",
  "telegramUsername": "@crypto_leads",
  "directionIds": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "name": "Крипта"
    }
  ],
  "parsingConfig": {
    "namePattern": "...",
    "phonePattern": "...",
    "commentPattern": "...",
    "skipPatterns": [...]
  },
  "isActive": true,
  "leadsCount": 0,
  "order": 0
}
```

**Response 404:** `Pending source not found`
**Response 409:** `Source already linked` или `Источник с chatId уже существует`

---

#### DELETE `/api/admin/sources/pending/:id`

Отклонить ожидающий источник

**Response 204:** No Content

---

### Зарегистрированные источники (LeadSource)

#### GET `/api/admin/sources`

Получить все источники

**Query параметры:**
| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `directionId` | string (MongoId) | Нет | Фильтр по направлению |

**Response 200:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439055",
    "name": "Crypto Leads Channel",
    "slug": "crypto-leads-ua",
    "type": "telegram_channel",
    "description": "Канал с криптовалютными лидами",
    "telegramChatId": "-1001234567890",
    "telegramUsername": "@crypto_leads",
    "directionIds": [
      {
        "_id": "507f1f77bcf86cd799439022",
        "name": "Крипта",
        "slug": "crypto"
      }
    ],
    "parsingConfig": {
      "namePattern": "(?:Контакт|Contact|Username|TG)\\s*[:\\-]\\s*@?([\\w\\d_]+)",
      "phonePattern": "\\+?[0-9\\s\\-\\(\\)]{10,18}",
      "commentPattern": "(?:Депозит|Deposit|Сумма|Amount)\\s*[:\\-]\\s*\\$?([\\d\\s,\\.]+)",
      "skipPatterns": ["scam", "fake", "#ad"]
    },
    "isActive": true,
    "leadsCount": 1542,
    "order": 0,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-25T12:00:00.000Z"
  }
]
```

---

#### GET `/api/admin/sources/active`

Получить только активные источники

**Response 200:** Аналогично `/api/admin/sources`

---

#### GET `/api/admin/sources/:id`

Получить источник по ID

**Response 200:** Объект источника
**Response 404:** Источник не найден

---

#### POST `/api/admin/sources`

Создать источник вручную

> ⚠️ **Рекомендуется использовать автоматическую регистрацию** через добавление бота в канал

**Request Body:**

```json
{
  "name": "Crypto Channel UA",
  "slug": "crypto-channel-ua",
  "type": "telegram_channel",
  "description": "Канал с криптовалютными лидами",
  "telegramChatId": "-1001234567890",
  "telegramUsername": "@crypto_channel_ua",
  "directionIds": ["507f1f77bcf86cd799439011"],
  "parsingConfig": {
    "namePattern": "^Имя:\\s*(.+)$",
    "phonePattern": "\\+?[0-9]{10,15}",
    "commentPattern": "^Комментарий:\\s*(.+)$",
    "skipPatterns": ["реклама", "#ad"]
  }
}
```

**Response 201:** Созданный источник
**Response 409:** Source with this slug already exists

---

#### PUT `/api/admin/sources/:id`

Обновить источник

**Request Body:** (все поля опциональны)

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "directionIds": ["507f1f77bcf86cd799439011"],
  "isActive": false,
  "parsingConfig": { ... }
}
```

**Response 200:** Обновлённый источник

---

#### PATCH `/api/admin/sources/:id/toggle`

Переключить активность источника

**Response 200:** Обновлённый источник

---

#### POST `/api/admin/sources/:id/regenerate-api-key`

Перегенерировать API ключ (только для type = api)

**Response 200:** Источник с новым apiKey
**Response 409:** API key can only be regenerated for API sources

---

#### DELETE `/api/admin/sources/:id`

Удалить источник

**Response 204:** No Content

---

## Модели данных

### LeadSource (Зарегистрированный источник)

```typescript
interface LeadSource {
  _id: string;
  name: string; // Название источника
  slug: string; // Уникальный идентификатор
  type: 'telegram_channel' | 'telegram_group' | 'website' | 'api';
  description?: string;

  // Для Telegram
  telegramChatId?: string; // Telegram Chat ID
  telegramUsername?: string; // @username

  // Для API
  apiKey?: string; // API ключ (только для type=api)
  webhookUrl?: string;

  // Привязки
  directionIds: Direction[]; // Направления (populated)

  // Статус
  isActive: boolean;
  leadsCount: number; // Количество спарсенных лидов
  order: number; // Порядок сортировки

  // Настройки парсинга
  parsingConfig?: {
    namePattern?: string; // Regex для извлечения имени
    phonePattern?: string; // Regex для телефона
    commentPattern?: string; // Regex для комментария
    skipPatterns?: string[]; // Паттерны для пропуска сообщений
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### PendingSource (Ожидающий источник)

```typescript
interface PendingSource {
  _id: string;
  chatId: string; // Telegram Chat ID
  title: string; // Название из Telegram
  username?: string; // @username
  chatType: 'group' | 'supergroup' | 'channel';
  addedByUserId?: number; // Telegram ID добавившего пользователя
  status: 'pending' | 'linked' | 'rejected';
  linkedSourceId?: string; // ID созданного LeadSource
  suggestedSlug?: string; // Предложенный slug
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Шаблоны парсинга

### Доступные шаблоны

| Ключ           | Название         | Описание                             | Пример сообщения                        |
| -------------- | ---------------- | ------------------------------------ | --------------------------------------- |
| `standard`     | Стандартный      | Имя, телефон, комментарий на строках | `Имя: Иван`<br>`Телефон: +380501234567` |
| `phone_only`   | Только телефон   | Извлекает только номера              | `Звонить: +380501234567`                |
| `emoji_format` | С emoji          | Emoji-маркеры                        | `👤 Иван`<br>`📞 +380501234567`         |
| `table_format` | Табличный        | Разделитель `\|`                     | `Иван \| +380501234567 \| VIP`          |
| `crypto`       | Крипто-лиды      | Депозит, контакт                     | `Deposit: $500`<br>`TG: @user`          |
| `realestate`   | Недвижимость     | Клиент, объект, бюджет               | `Клиент: Иван`<br>`Бюджет: $100k`       |
| `auto`         | Авто-лиды        | Клиент, авто, бюджет                 | `Авто: BMW X5`<br>`Бюджет: $50k`        |
| `universal`    | Универсальный    | Широкий парсинг                      | Подходит для большинства                |
| `custom`       | Пользовательский | Пустой шаблон                        | Ручная настройка                        |

### Структура parsingConfig

```typescript
interface ParsingConfig {
  // Regex для извлечения имени клиента
  namePattern?: string;

  // Regex для извлечения телефона (обязателен для лида)
  phonePattern?: string;

  // Regex для извлечения комментария/дополнительной информации
  commentPattern?: string;

  // Массив паттернов для пропуска сообщений (реклама, спам)
  skipPatterns?: string[];
}
```

### Пример конфигурации

```json
{
  "parsingConfig": {
    "namePattern": "^(?:Имя|Name|ФИО)\\s*[:\\-]\\s*(.+)$",
    "phonePattern": "\\+?[0-9][0-9\\s\\-\\(\\)]{9,17}",
    "commentPattern": "^(?:Комментарий|Note)\\s*[:\\-]\\s*(.+)$",
    "skipPatterns": ["#ad", "реклама", "партнерская\\s+ссылка"]
  }
}
```

---

## Workflow: Регистрация источников

### Sequence Diagram

```
Пользователь                    Telegram                    Backend                       Frontend
     │                              │                           │                              │
     │  1. Добавляет бота          │                           │                              │
     │     КАК УЧАСТНИКА            │                           │                              │
     │     (НЕ админа!)             │                           │                              │
     │ ─────────────────────────► │                           │                              │
     │                              │                           │                              │
     │                              │  2. my_chat_member       │                              │
     │                              │     status: member        │                              │
     │                              │ ────────────────────────► │                              │
     │                              │                           │                              │
     │                              │                           │  3. Создаёт PendingSource   │
     │                              │                           │     (НЕ отправляет          │
     │                              │                           │      сообщение в канал!)    │
     │                              │                           │                              │
     │  4. Уведомление в личку     │                           │                              │
     │ ◄────────────────────────────────────────────────────── │                              │
     │     "Источник добавлен,      │                           │                              │
     │      настройте в админке"    │                           │                              │
     │                              │                           │                              │
     │                              │                           │  5. GET /pending            │
     │                              │                           │ ◄──────────────────────────── │
     │                              │                           │                              │
     │                              │                           │  6. Список pending sources  │
     │                              │                           │ ─────────────────────────────►│
     │                              │                           │                              │
     │                              │                           │  7. GET /parsing-templates  │
     │                              │                           │ ◄──────────────────────────── │
     │                              │                           │                              │
     │                              │                           │  8. Список шаблонов         │
     │                              │                           │ ─────────────────────────────►│
     │                              │                           │                              │
     │                              │                           │  9. POST /pending/:id/link  │
     │                              │                           │ ◄──────────────────────────── │
     │                              │                           │                              │
     │                              │                           │  10. LeadSource created     │
     │                              │                           │ ─────────────────────────────►│
```

### Важно: Разница между Groups и Sources

| Аспект                | Groups (публикация) | Sources (парсинг)           |
| --------------------- | ------------------- | --------------------------- |
| **Статус бота**       | Администратор       | Участник (member)           |
| **Направления**       | Одно (directionId)  | Несколько (directionIds[])  |
| **Сообщение в чат**   | ✅ Отправляется     | ❌ НЕ отправляется          |
| **Главная настройка** | Выбор направления   | Выбор направлений + парсинг |

---

## UI/UX рекомендации

### Страница "Источники"

#### Три вкладки:

1. **"Все источники"** - таблица LeadSource
2. **"Ожидающие настройки"** - badge с количеством pending
3. **"Шаблоны парсинга"** - справочник шаблонов

#### Таблица источников

| Название  | Тип        | Направления   | Лидов | Статус | Действия |
| --------- | ---------- | ------------- | ----- | ------ | -------- |
| Crypto UA | 📢 channel | Крипта, Forex | 1,542 | 🟢     | ⚙️ 🗑️    |

#### Модальное окно "Настройка источника"

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Настройка источника                                   X │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📢 Crypto Leads Channel                                    │
│  Chat ID: -1001234567890                                    │
│  @crypto_leads                                              │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Направления *                                    ▼ │  │
│  │ ☑ Крипта                                            │  │
│  │ ☑ Forex                                             │  │
│  │ ☐ Недвижимость                                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Шаблон парсинга                                  ▼ │  │
│  │ 🔹 Крипто-лиды                                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Slug (опционально)                                   │  │
│  │ crypto-leads-ua                                      │  │
│  │ 💡 Предложено: crypto-leads-channel                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Описание (опционально)                               │  │
│  │ Основной канал с криптовалютными лидами...           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ☐ Настроить парсинг вручную (advanced)                    │
│                                                             │
│                         ┌──────────┐  ┌──────────────────┐  │
│                         │  Отмена  │  │  Подключить      │  │
│                         └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Индикаторы

| Статус    | Иконка | Цвет       | Описание              |
| --------- | ------ | ---------- | --------------------- |
| Активен   | ✅     | Зелёный    | Источник парсит лиды  |
| Неактивен | 🔴     | Серый      | Парсинг приостановлен |
| Pending   | 🕐     | Синий      | Ожидает настройки     |
| API       | 🔑     | Фиолетовый | API источник          |

### Типы источников (иконки)

| Тип              | Иконка |
| ---------------- | ------ |
| telegram_channel | 📢     |
| telegram_group   | 👥     |
| api              | 🔌     |
| website          | 🌐     |

---

## Примеры запросов

### JavaScript/TypeScript

```typescript
const API_BASE = 'http://localhost:3000/api/admin';
const token = 'your-jwt-token';

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

// Получить шаблоны парсинга
const templates = await fetch(`${API_BASE}/sources/parsing-templates`, {
  headers,
}).then((res) => res.json());

// Получить pending sources
const pendingSources = await fetch(`${API_BASE}/sources/pending`, {
  headers,
}).then((res) => res.json());

// Привязать pending source
const linkedSource = await fetch(
  `${API_BASE}/sources/pending/${pendingId}/link`,
  {
    method: 'POST',
    headers,
    body: JSON.stringify({
      directionIds: ['507f1f77bcf86cd799439022'],
      parsingTemplateKey: 'crypto',
      description: 'Канал с крипто-лидами',
    }),
  },
).then((res) => res.json());

// Получить все источники
const sources = await fetch(`${API_BASE}/sources`, { headers }).then((res) =>
  res.json(),
);

// Переключить активность
const toggledSource = await fetch(`${API_BASE}/sources/${sourceId}/toggle`, {
  method: 'PATCH',
  headers,
}).then((res) => res.json());
```

### React Query Hooks

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Шаблоны парсинга
export function useParsingTemplates() {
  return useQuery({
    queryKey: ['sources', 'parsing-templates'],
    queryFn: () => api.get('/sources/parsing-templates'),
    staleTime: Infinity, // Шаблоны не меняются
  });
}

// Pending sources
export function usePendingSources() {
  return useQuery({
    queryKey: ['sources', 'pending'],
    queryFn: () => api.get('/sources/pending'),
    refetchInterval: 30000,
  });
}

// Link pending source
export function useLinkPendingSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/sources/pending/${id}/link`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });
}

// All sources
export function useSources(directionId?: string) {
  return useQuery({
    queryKey: ['sources', { directionId }],
    queryFn: () => api.get('/sources', { params: { directionId } }),
  });
}
```

---

## Обработка ошибок

| HTTP код | Ситуация                 | Действие в UI             |
| -------- | ------------------------ | ------------------------- |
| 400      | Невалидные данные        | Показать ошибки валидации |
| 401      | Не авторизован           | Редирект на логин         |
| 403      | Нет прав (manageSources) | "Недостаточно прав"       |
| 404      | Источник не найден       | Обновить список           |
| 409      | Slug уже существует      | Предложить изменить slug  |
| 409      | Source already linked    | Обновить список pending   |
| 500      | Ошибка сервера           | "Попробуйте позже"        |

---

## Связанные модули

- **Directions** - Направления, к которым привязываются источники
- **Groups** - Группы для публикации лидов (противоположность sources)
- **Collectors** - Модуль сбора лидов из источников
- **Bot** - Telegram бот (обработка событий добавления)
