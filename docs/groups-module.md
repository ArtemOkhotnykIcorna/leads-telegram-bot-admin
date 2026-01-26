# Модуль Groups - Документация для Frontend

## Оглавление

1. [Обзор модуля](#обзор-модуля)
2. [Архитектура и концепции](#архитектура-и-концепции)
3. [API Endpoints](#api-endpoints)
4. [Модели данных](#модели-данных)
5. [Workflow: Регистрация групп](#workflow-регистрация-групп)
6. [UI/UX рекомендации](#uiux-рекомендации)
7. [Примеры запросов](#примеры-запросов)

---

## Обзор модуля

Модуль **Groups** отвечает за управление Telegram-группами и каналами, в которые публикуются лиды. Каждая группа привязана к определённому **направлению** (Direction).

### Основные сущности:

| Сущность          | Описание                                                                               |
| ----------------- | -------------------------------------------------------------------------------------- |
| **TelegramGroup** | Зарегистрированная и активная группа для публикации лидов                              |
| **PendingGroup**  | Группа, ожидающая привязки к направлению (автоматически создаётся при добавлении бота) |

---

## Архитектура и концепции

### Жизненный цикл группы

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         СПОСОБЫ СОЗДАНИЯ ГРУППЫ                          │
└─────────────────────────────────────────────────────────────────────────┘
                    │                              │
                    ▼                              ▼
    ┌───────────────────────────┐    ┌───────────────────────────┐
    │   🤖 АВТОМАТИЧЕСКИЙ       │    │   ✋ РУЧНОЙ               │
    │   (Рекомендуемый)         │    │   (Резервный)            │
    └───────────────────────────┘    └───────────────────────────┘
                    │                              │
                    ▼                              │
    ┌───────────────────────────┐                  │
    │ 1. Админ добавляет бота   │                  │
    │    в Telegram группу/     │                  │
    │    канал как админа       │                  │
    └───────────────────────────┘                  │
                    │                              │
                    ▼                              │
    ┌───────────────────────────┐                  │
    │ 2. Бот отправляет событие │                  │
    │    my_chat_member         │                  │
    └───────────────────────────┘                  │
                    │                              │
                    ▼                              │
    ┌───────────────────────────┐                  │
    │ 3. Создаётся PendingGroup │                  │
    │    (статус: pending)      │                  │
    └───────────────────────────┘                  │
                    │                              │
                    ▼                              │
    ┌───────────────────────────┐                  │
    │ 4. Админ в админ-панели   │                  │
    │    видит группу в разделе │                  │
    │    "Ожидающие регистрации"│                  │
    └───────────────────────────┘                  │
                    │                              │
                    ▼                              │
    ┌───────────────────────────┐                  │
    │ 5. Админ выбирает         │                  │
    │    направление и          │                  │
    │    привязывает группу     │                  │
    │    POST /pending/:id/link │                  │
    └───────────────────────────┘                  │
                    │                              │
                    ▼                              ▼
              ┌─────────────────────────────────────────┐
              │       TelegramGroup создана             │
              │       (статус: active)                  │
              │       chatId автоматически заполнен     │
              │       deepLinkId сгенерирован           │
              └─────────────────────────────────────────┘
                                   │
                                   ▼
              ┌─────────────────────────────────────────┐
              │       Группа готова к публикации        │
              │       лидов                             │
              └─────────────────────────────────────────┘
```

### Ключевые поля группы

| Поле          | Описание                                                   | Источник                      |
| ------------- | ---------------------------------------------------------- | ----------------------------- |
| `chatId`      | Уникальный ID чата в Telegram (например, `-1001234567890`) | Автоматически из Telegram API |
| `deepLinkId`  | Уникальный идентификатор для deep links (12 символов)      | Автогенерация (nanoid)        |
| `directionId` | Ссылка на направление                                      | Выбирается админом            |
| `inviteLink`  | Ссылка для вступления в группу                             | Опционально, вручную          |

---

## API Endpoints

**Base URL:** `/api/admin/groups`

**Авторизация:** Bearer Token (JWT)

**Права доступа:** Требуется permission `manageGroups` для операций создания/редактирования/удаления

### Зарегистрированные группы (TelegramGroup)

#### GET `/api/admin/groups`

Получить все группы

**Query параметры:**
| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `directionId` | string (MongoId) | Нет | Фильтр по направлению |

**Response 200:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Crypto UA Premium",
    "chatId": "-1001234567890",
    "deepLinkId": "abc123xyz456",
    "inviteLink": "https://t.me/joinchat/ABC123",
    "directionId": {
      "_id": "507f1f77bcf86cd799439022",
      "name": "Крипта",
      "slug": "crypto"
    },
    "countryId": {
      "_id": "507f1f77bcf86cd799439033",
      "name": "Украина",
      "code": "UA"
    },
    "isActive": true,
    "stats": {
      "leadsPublished": 156,
      "lastPublishedAt": "2026-01-25T12:00:00.000Z",
      "invitesGenerated": 42
    },
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-25T12:00:00.000Z"
  }
]
```

---

#### GET `/api/admin/groups/active`

Получить только активные группы

**Query параметры:**
| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `directionId` | string (MongoId) | Нет | Фильтр по направлению |

**Response 200:** Аналогично `/api/admin/groups`

---

#### GET `/api/admin/groups/:id`

Получить группу по ID

**Path параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | string (MongoId) | ID группы |

**Response 200:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Crypto UA Premium",
  "chatId": "-1001234567890",
  "deepLinkId": "abc123xyz456",
  "directionId": { ... },
  "countryId": { ... },
  "isActive": true,
  "stats": { ... }
}
```

**Response 404:** Группа не найдена

---

#### POST `/api/admin/groups`

Создать группу вручную

> ⚠️ **Рекомендуется использовать автоматическую регистрацию** через добавление бота в группу

**Request Body:**

```json
{
  "name": "Crypto UA Premium",
  "chatId": "-1001234567890", // Опционально
  "directionId": "507f1f77bcf86cd799439022",
  "inviteLink": "https://t.me/joinchat/ABC123", // Опционально
  "isActive": true // Опционально, default: true
}
```

| Поле          | Тип              | Обязательный | Описание                   |
| ------------- | ---------------- | ------------ | -------------------------- |
| `name`        | string           | Да           | Название группы            |
| `chatId`      | string           | Нет          | Telegram Chat ID           |
| `directionId` | string (MongoId) | Да           | ID направления             |
| `inviteLink`  | string           | Нет          | Ссылка для вступления      |
| `isActive`    | boolean          | Нет          | Активность (default: true) |

**Response 201:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Crypto UA Premium",
  "chatId": "-1001234567890",
  "deepLinkId": "abc123xyz456",
  "directionId": { ... },
  "isActive": true,
  "stats": {
    "leadsPublished": 0,
    "invitesGenerated": 0
  }
}
```

**Response 400:** Группа с таким `chatId` уже существует

---

#### PUT `/api/admin/groups/:id`

Обновить группу

**Request Body:**

```json
{
  "name": "Crypto UA Premium Updated",
  "chatId": "-1001234567890",
  "directionId": "507f1f77bcf86cd799439022",
  "inviteLink": "https://t.me/joinchat/XYZ789",
  "isActive": false
}
```

Все поля опциональны - отправляйте только те, которые нужно обновить.

**Response 200:** Обновлённая группа

---

#### PATCH `/api/admin/groups/:id/toggle`

Переключить активность группы (active ↔ inactive)

**Response 200:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "isActive": false,
  ...
}
```

---

#### POST `/api/admin/groups/:id/regenerate-deeplink`

Перегенерировать deep link группы

> ⚠️ **Внимание:** После регенерации старые deep links перестанут работать!

**Response 200:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "deepLinkId": "newlink12345",
  ...
}
```

---

#### DELETE `/api/admin/groups/:id`

Удалить группу

**Response 204:** No Content

---

### Ожидающие группы (PendingGroup)

#### GET `/api/admin/groups/pending`

Получить группы, ожидающие привязки к направлению

**Response 200:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439044",
    "chatId": "-1001234567890",
    "title": "My Crypto Group",
    "username": "mycryptogroup",
    "type": "supergroup",
    "addedByUserId": 123456789,
    "status": "pending",
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:00:00.000Z"
  }
]
```

| Поле            | Описание                                   |
| --------------- | ------------------------------------------ |
| `chatId`        | Telegram Chat ID                           |
| `title`         | Название группы в Telegram                 |
| `username`      | Username группы (если есть)                |
| `type`          | Тип: `group`, `supergroup`, `channel`      |
| `addedByUserId` | Telegram ID пользователя, добавившего бота |
| `status`        | Статус: `pending`, `linked`, `rejected`    |

---

#### POST `/api/admin/groups/pending/:id/link`

Привязать ожидающую группу к направлению

**Path параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | string (MongoId) | ID pending group |

**Request Body:**

```json
{
  "directionId": "507f1f77bcf86cd799439022",
  "inviteLink": "https://t.me/joinchat/ABC123" // Опционально
}
```

| Поле          | Тип              | Обязательный | Описание              |
| ------------- | ---------------- | ------------ | --------------------- |
| `directionId` | string (MongoId) | Да           | ID направления        |
| `inviteLink`  | string           | Нет          | Ссылка для вступления |

**Response 201:** Созданная TelegramGroup

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "My Crypto Group",
  "chatId": "-1001234567890",
  "deepLinkId": "abc123xyz456",
  "directionId": {
    "_id": "507f1f77bcf86cd799439022",
    "name": "Крипта"
  },
  "isActive": true,
  "stats": {
    "leadsPublished": 0,
    "invitesGenerated": 0
  }
}
```

**Response 400:**

- `Pending group not found` - группа не найдена
- `Group already linked` - группа уже привязана

---

#### DELETE `/api/admin/groups/pending/:id`

Отклонить ожидающую группу

> Группа останется в базе со статусом `rejected`. Если бота удалят и снова добавят в эту группу, она опять станет `pending`.

**Response 204:** No Content

---

## Модели данных

### TelegramGroup (Зарегистрированная группа)

```typescript
interface TelegramGroup {
  _id: string; // MongoDB ObjectId
  name: string; // Название группы
  chatId: string; // Telegram Chat ID (напр. "-1001234567890")
  deepLinkId: string; // Уникальный ID для deep links (12 символов)
  inviteLink?: string; // Ссылка для вступления в группу
  countryId?: Country; // Страна (populated)
  directionId: Direction; // Направление (populated, обязательно)
  isActive: boolean; // Активность группы
  stats: {
    leadsPublished: number; // Количество опубликованных лидов
    lastPublishedAt?: Date; // Дата последней публикации
    invitesGenerated: number; // Количество сгенерированных инвайтов
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### PendingGroup (Ожидающая группа)

```typescript
interface PendingGroup {
  _id: string; // MongoDB ObjectId
  chatId: string; // Telegram Chat ID
  title: string; // Название из Telegram
  username?: string; // @username группы (если есть)
  type: 'group' | 'supergroup' | 'channel'; // Тип чата
  addedByUserId?: number; // Telegram ID пользователя, добавившего бота
  status: 'pending' | 'linked' | 'rejected';
  linkedGroupId?: string; // ID созданной TelegramGroup (если linked)
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Workflow: Регистрация групп

### Сценарий 1: Автоматическая регистрация (рекомендуется)

```
Пользователь                    Telegram                    Backend                       Frontend
     │                              │                           │                              │
     │  1. Добавляет бота в        │                           │                              │
     │     группу как админа       │                           │                              │
     │ ─────────────────────────► │                           │                              │
     │                              │                           │                              │
     │                              │  2. my_chat_member event │                              │
     │                              │ ────────────────────────► │                              │
     │                              │                           │                              │
     │                              │                           │  3. Создаёт PendingGroup    │
     │                              │                           │     (status: pending)        │
     │                              │                           │                              │
     │  4. Получает уведомление   │                           │                              │
     │     в личку от бота         │ ◄──────────────────────── │                              │
     │     "Группа добавлена,      │                           │                              │
     │      привяжите в админке"   │                           │                              │
     │                              │                           │                              │
     │                              │                           │                              │
     │                              │                           │  5. GET /pending            │
     │                              │                           │ ◄──────────────────────────── │
     │                              │                           │                              │
     │                              │                           │  6. Список pending groups   │
     │                              │                           │ ─────────────────────────────►│
     │                              │                           │                              │
     │                              │                           │  7. POST /pending/:id/link  │
     │                              │                           │     { directionId: "..." }   │
     │                              │                           │ ◄──────────────────────────── │
     │                              │                           │                              │
     │                              │                           │  8. Создаёт TelegramGroup   │
     │                              │                           │     Обновляет PendingGroup   │
     │                              │                           │     (status: linked)         │
     │                              │                           │                              │
     │                              │                           │  9. TelegramGroup created   │
     │                              │                           │ ─────────────────────────────►│
     │                              │                           │                              │
```

### Сценарий 2: Ручное создание (резервный)

```
Frontend                                          Backend
    │                                                │
    │  1. POST /api/admin/groups                    │
    │     {                                          │
    │       "name": "My Group",                      │
    │       "directionId": "...",                    │
    │       "chatId": "-1001234567890"  // optional │
    │     }                                          │
    │ ─────────────────────────────────────────────►│
    │                                                │
    │  2. Группа создана                            │
    │     (без chatId публикация невозможна)        │
    │ ◄───────────────────────────────────────────── │
    │                                                │
```

> ⚠️ Если группа создана без `chatId`, публикация лидов в неё **невозможна**. Используйте автоматическую регистрацию!

---

## UI/UX рекомендации

### Страница "Группы"

Рекомендуется разделить на **две вкладки**:

#### Вкладка 1: "Зарегистрированные группы"

- Таблица со всеми TelegramGroup
- Колонки: Название, Направление, Статус, Лидов опубликовано, Последняя публикация, Действия
- Фильтр по направлению
- Кнопка "Добавить вручную" (скрытая, для продвинутых пользователей)

#### Вкладка 2: "Ожидающие регистрации"

- **Badge с количеством** ожидающих групп
- Таблица с PendingGroup (status = pending)
- Колонки: Название, Тип, Chat ID, Добавлено, Действия
- Действия: "Привязать" (открывает модалку), "Отклонить"

### Модальное окно "Привязка группы"

```
┌─────────────────────────────────────────────────────────────┐
│  🔗 Привязка группы к направлению                         X │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Группа: My Crypto Group                                    │
│  Chat ID: -1001234567890                                    │
│  Тип: supergroup                                            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Направление *                                    ▼ │  │
│  │ Крипта                                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Ссылка для вступления (опционально)                  │  │
│  │ https://t.me/joinchat/...                            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│                         ┌──────────┐  ┌──────────────────┐  │
│                         │  Отмена  │  │  Привязать       │  │
│                         └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Индикаторы статуса группы

| Статус             | Иконка | Цвет    | Описание                                      |
| ------------------ | ------ | ------- | --------------------------------------------- |
| Активна + chatId   | ✅     | Зелёный | Группа готова к публикации                    |
| Активна без chatId | ⚠️     | Жёлтый  | Группа без Telegram ID, публикация невозможна |
| Неактивна          | 🔴     | Серый   | Группа деактивирована                         |
| Pending            | 🕐     | Синий   | Ожидает привязки                              |

### Инструкция для пользователя

Добавьте блок-подсказку на страницу:

```
💡 Как добавить новую группу?

1. Создайте группу/канал в Telegram
2. Добавьте бота @YourBotName как администратора
3. Бот автоматически появится в разделе "Ожидающие регистрации"
4. Выберите направление и привяжите группу
```

---

## Примеры запросов

### Fetch API (JavaScript/TypeScript)

```typescript
const API_BASE = 'http://localhost:3000/api/admin';
const token = 'your-jwt-token';

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

// Получить все группы
const groups = await fetch(`${API_BASE}/groups`, { headers }).then((res) =>
  res.json(),
);

// Получить pending группы
const pendingGroups = await fetch(`${API_BASE}/groups/pending`, {
  headers,
}).then((res) => res.json());

// Привязать pending группу
const linkedGroup = await fetch(
  `${API_BASE}/groups/pending/${pendingId}/link`,
  {
    method: 'POST',
    headers,
    body: JSON.stringify({
      directionId: '507f1f77bcf86cd799439022',
      inviteLink: 'https://t.me/joinchat/ABC123',
    }),
  },
).then((res) => res.json());

// Создать группу вручную
const newGroup = await fetch(`${API_BASE}/groups`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    name: 'Crypto UA Premium',
    directionId: '507f1f77bcf86cd799439022',
    chatId: '-1001234567890', // опционально
  }),
}).then((res) => res.json());

// Переключить активность
const toggledGroup = await fetch(`${API_BASE}/groups/${groupId}/toggle`, {
  method: 'PATCH',
  headers,
}).then((res) => res.json());

// Удалить группу
await fetch(`${API_BASE}/groups/${groupId}`, {
  method: 'DELETE',
  headers,
});
```

### React Query (рекомендуется)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

// Hooks
export function useGroups(directionId?: string) {
  return useQuery({
    queryKey: ['groups', { directionId }],
    queryFn: () => api.get('/groups', { params: { directionId } }),
  });
}

export function usePendingGroups() {
  return useQuery({
    queryKey: ['groups', 'pending'],
    queryFn: () => api.get('/groups/pending'),
    refetchInterval: 30000, // Обновлять каждые 30 сек
  });
}

export function useLinkPendingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LinkPendingGroupDto }) =>
      api.post(`/groups/pending/${id}/link`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useToggleGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.patch(`/groups/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
```

---

## Обработка ошибок

| HTTP код | Ситуация                         | Действие в UI                                 |
| -------- | -------------------------------- | --------------------------------------------- |
| 400      | Группа с таким chatId существует | Показать ошибку "Группа уже зарегистрирована" |
| 400      | Pending group already linked     | Обновить список, показать уведомление         |
| 401      | Не авторизован                   | Редирект на страницу логина                   |
| 403      | Нет прав (manageGroups)          | Показать "Недостаточно прав"                  |
| 404      | Группа не найдена                | Обновить список, показать уведомление         |
| 500      | Ошибка сервера                   | Показать "Произошла ошибка, попробуйте позже" |

---

## Связанные модули

- **Directions** - Направления, к которым привязываются группы
- **Countries** - Страны (опционально для групп)
- **Publisher** - Модуль публикации лидов в группы
- **Bot** - Telegram бот (обработка событий добавления/удаления)
