# Модуль Bot Messages — Документация для фронтенда

## Обзор

Модуль **Bot Messages** позволяет управлять текстами сообщений Telegram бота через админ-панель. Все сообщения хранятся в MongoDB и кэшируются для быстрого доступа. Поддерживается Markdown форматирование и переменные для динамической подстановки.

## Базовый URL

```
/api/admin/bot-messages
```

## Аутентификация

Все эндпоинты требуют JWT токен в заголовке:

```
Authorization: Bearer <token>
```

Доступ: роли `admin` и `manager`.

---

## Типы данных

### BotMessageKey (enum)

Уникальные ключи сообщений:

```typescript
enum BotMessageKey {
  // Приветственные сообщения
  WELCOME_NEW_USER = 'welcome_new_user',
  WELCOME_RETURNING_USER = 'welcome_returning_user',

  // Описание бота
  BOT_DESCRIPTION = 'bot_description',

  // Выбор страны
  SELECT_COUNTRY = 'select_country',
  NO_COUNTRIES_AVAILABLE = 'no_countries_available',
  COUNTRY_NOT_FOUND = 'country_not_found',

  // Выбор направления
  SELECT_DIRECTION = 'select_direction',
  NO_DIRECTIONS_AVAILABLE = 'no_directions_available',
  DIRECTION_ACCESS_DENIED = 'direction_access_denied',

  // Группы
  GROUP_INFO = 'group_info',
  GROUP_NOT_FOUND = 'group_not_found',
  GROUP_INVITE_SUCCESS = 'group_invite_success',
  GROUP_INVITE_PERMANENT = 'group_invite_permanent',
  GROUP_INVITE_ERROR = 'group_invite_error',

  // Подписка
  SUBSCRIPTION_REQUIRED = 'subscription_required',
  SUBSCRIPTION_INFO_ACTIVE = 'subscription_info_active',
  SUBSCRIPTION_INFO_TRIAL = 'subscription_info_trial',
  SUBSCRIPTION_INFO_INACTIVE = 'subscription_info_inactive',
  SUBSCRIPTION_SELECT_PLAN = 'subscription_select_plan',
  SUBSCRIPTION_PAYMENT_LINK = 'subscription_payment_link',
  SUBSCRIPTION_PLAN_NOT_FOUND = 'subscription_plan_not_found',

  // Навигация
  MAIN_MENU = 'main_menu',
  HELP = 'help',
}
```

### BotMessage (интерфейс ответа)

```typescript
interface BotMessage {
  _id: string;
  key: BotMessageKey;
  title: string; // Название для админ-панели
  content: string; // Текст сообщения (Markdown)
  description?: string; // Описание/подсказка
  isActive: boolean; // Активно ли сообщение
  variables: string[]; // Доступные переменные
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

### UpdateBotMessageDto (тело запроса на обновление)

```typescript
interface UpdateBotMessageDto {
  title?: string;
  content?: string;
  description?: string;
  isActive?: boolean;
  variables?: string[];
}
```

---

## API Эндпоинты

### 1. Получить все сообщения

```http
GET /api/admin/bot-messages
```

**Ответ:** `200 OK`

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "key": "welcome_new_user",
    "title": "Приветствие нового пользователя",
    "content": "🎉 *Добро пожаловать, {{name}}!*",
    "description": "Отправляется при первом запуске бота новым пользователем",
    "isActive": true,
    "variables": ["name"],
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-20T14:45:00.000Z"
  }
  // ... другие сообщения
]
```

---

### 2. Получить сообщение по ID

```http
GET /api/admin/bot-messages/:id
```

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | string | MongoDB ObjectId |

**Ответ:** `200 OK` — объект `BotMessage`

**Ошибки:**

- `404 Not Found` — сообщение не найдено

---

### 3. Получить сообщение по ключу

```http
GET /api/admin/bot-messages/key/:key
```

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `key` | BotMessageKey | Ключ сообщения (например, `welcome_new_user`) |

**Ответ:** `200 OK` — объект `BotMessage`

**Ошибки:**

- `404 Not Found` — сообщение не найдено

---

### 4. Обновить сообщение по ID

```http
PUT /api/admin/bot-messages/:id
```

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | string | MongoDB ObjectId |

**Тело запроса:** `UpdateBotMessageDto`

```json
{
  "content": "🎉 *Привет, {{name}}!*\n\nДобро пожаловать в нашего бота!",
  "title": "Приветствие (обновлено)"
}
```

**Ответ:** `200 OK` — обновлённый объект `BotMessage`

**Ошибки:**

- `404 Not Found` — сообщение не найдено

---

### 5. Обновить сообщение по ключу

```http
PUT /api/admin/bot-messages/key/:key
```

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `key` | BotMessageKey | Ключ сообщения |

**Тело запроса:** `UpdateBotMessageDto`

**Ответ:** `200 OK` — обновлённый объект `BotMessage`

**Ошибки:**

- `404 Not Found` — сообщение не найдено

---

### 6. Сбросить сообщение к дефолтному значению

```http
POST /api/admin/bot-messages/:key/reset
```

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `key` | BotMessageKey | Ключ сообщения |

**Ответ:** `200 OK` — сброшенный объект `BotMessage`

**Ошибки:**

- `404 Not Found` — сообщение не найдено

---

### 7. Обновить кэш сообщений

```http
POST /api/admin/bot-messages/refresh-cache
```

**Описание:** Принудительно обновляет кэш сообщений бота. Используйте после массовых изменений.

**Ответ:** `204 No Content`

---

## Переменные в сообщениях

Сообщения поддерживают переменные в формате `{{variableName}}`. При отправке сообщения бот заменяет их на реальные значения.

### Доступные переменные по ключам:

| Ключ сообщения              | Переменные                                                | Описание                  |
| --------------------------- | --------------------------------------------------------- | ------------------------- |
| `welcome_new_user`          | `name`                                                    | Имя пользователя          |
| `welcome_returning_user`    | `name`                                                    | Имя пользователя          |
| `bot_description`           | `trialHours`                                              | Количество часов триала   |
| `select_direction`          | `countryName`                                             | Название выбранной страны |
| `group_info`                | `groupName`, `countryName`, `directionName`, `leadsCount` | Информация о группе       |
| `group_invite_success`      | `groupName`, `inviteLink`                                 | Ссылка-приглашение        |
| `group_invite_permanent`    | `groupName`, `inviteLink`                                 | Постоянная ссылка         |
| `subscription_info_active`  | `expiresDate`                                             | Дата окончания подписки   |
| `subscription_info_trial`   | `expiresDate`                                             | Дата окончания триала     |
| `subscription_select_plan`  | `plansDescription`                                        | Описание тарифов          |
| `subscription_payment_link` | `planName`, `price`                                       | Информация о тарифе       |

---

## Markdown форматирование

Telegram поддерживает MarkdownV2 (с некоторыми ограничениями):

| Формат         | Синтаксис      | Результат    |
| -------------- | -------------- | ------------ |
| Жирный         | `*текст*`      | **текст**    |
| Курсив         | `_текст_`      | _текст_      |
| Код            | `` `код` ``    | `код`        |
| Ссылка         | `[текст](url)` | [текст](url) |
| Перенос строки | `\n`           | новая строка |

**Важно:** Специальные символы (`_`, `*`, `[`, `]`, `(`, `)`, `~`, `` ` ``, `>`, `#`, `+`, `-`, `=`, `|`, `{`, `}`, `.`, `!`) нужно экранировать обратным слэшем в обычном тексте.

---

## Пример реализации на React

### Типы

```typescript
// types/bot-messages.ts

export enum BotMessageKey {
  WELCOME_NEW_USER = 'welcome_new_user',
  WELCOME_RETURNING_USER = 'welcome_returning_user',
  BOT_DESCRIPTION = 'bot_description',
  SELECT_COUNTRY = 'select_country',
  NO_COUNTRIES_AVAILABLE = 'no_countries_available',
  COUNTRY_NOT_FOUND = 'country_not_found',
  SELECT_DIRECTION = 'select_direction',
  NO_DIRECTIONS_AVAILABLE = 'no_directions_available',
  DIRECTION_ACCESS_DENIED = 'direction_access_denied',
  GROUP_INFO = 'group_info',
  GROUP_NOT_FOUND = 'group_not_found',
  GROUP_INVITE_SUCCESS = 'group_invite_success',
  GROUP_INVITE_PERMANENT = 'group_invite_permanent',
  GROUP_INVITE_ERROR = 'group_invite_error',
  SUBSCRIPTION_REQUIRED = 'subscription_required',
  SUBSCRIPTION_INFO_ACTIVE = 'subscription_info_active',
  SUBSCRIPTION_INFO_TRIAL = 'subscription_info_trial',
  SUBSCRIPTION_INFO_INACTIVE = 'subscription_info_inactive',
  SUBSCRIPTION_SELECT_PLAN = 'subscription_select_plan',
  SUBSCRIPTION_PAYMENT_LINK = 'subscription_payment_link',
  SUBSCRIPTION_PLAN_NOT_FOUND = 'subscription_plan_not_found',
  MAIN_MENU = 'main_menu',
  HELP = 'help',
}

export interface BotMessage {
  _id: string;
  key: BotMessageKey;
  title: string;
  content: string;
  description?: string;
  isActive: boolean;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBotMessageDto {
  title?: string;
  content?: string;
  description?: string;
  isActive?: boolean;
  variables?: string[];
}

// Группировка сообщений по категориям для UI
export const MESSAGE_CATEGORIES = {
  welcome: {
    label: 'Приветствия',
    keys: [
      BotMessageKey.WELCOME_NEW_USER,
      BotMessageKey.WELCOME_RETURNING_USER,
    ],
  },
  description: {
    label: 'Описание бота',
    keys: [BotMessageKey.BOT_DESCRIPTION],
  },
  country: {
    label: 'Выбор страны',
    keys: [
      BotMessageKey.SELECT_COUNTRY,
      BotMessageKey.NO_COUNTRIES_AVAILABLE,
      BotMessageKey.COUNTRY_NOT_FOUND,
    ],
  },
  direction: {
    label: 'Выбор направления',
    keys: [
      BotMessageKey.SELECT_DIRECTION,
      BotMessageKey.NO_DIRECTIONS_AVAILABLE,
      BotMessageKey.DIRECTION_ACCESS_DENIED,
    ],
  },
  group: {
    label: 'Группы',
    keys: [
      BotMessageKey.GROUP_INFO,
      BotMessageKey.GROUP_NOT_FOUND,
      BotMessageKey.GROUP_INVITE_SUCCESS,
      BotMessageKey.GROUP_INVITE_PERMANENT,
      BotMessageKey.GROUP_INVITE_ERROR,
    ],
  },
  subscription: {
    label: 'Подписка',
    keys: [
      BotMessageKey.SUBSCRIPTION_REQUIRED,
      BotMessageKey.SUBSCRIPTION_INFO_ACTIVE,
      BotMessageKey.SUBSCRIPTION_INFO_TRIAL,
      BotMessageKey.SUBSCRIPTION_INFO_INACTIVE,
      BotMessageKey.SUBSCRIPTION_SELECT_PLAN,
      BotMessageKey.SUBSCRIPTION_PAYMENT_LINK,
      BotMessageKey.SUBSCRIPTION_PLAN_NOT_FOUND,
    ],
  },
  navigation: {
    label: 'Навигация',
    keys: [BotMessageKey.MAIN_MENU, BotMessageKey.HELP],
  },
};
```

### API сервис

```typescript
// services/bot-messages.api.ts
import { apiClient } from './api-client';
import {
  BotMessage,
  BotMessageKey,
  UpdateBotMessageDto,
} from '../types/bot-messages';

const BASE_URL = '/api/admin/bot-messages';

export const botMessagesApi = {
  // Получить все сообщения
  async getAll(): Promise<BotMessage[]> {
    const response = await apiClient.get<BotMessage[]>(BASE_URL);
    return response.data;
  },

  // Получить по ID
  async getById(id: string): Promise<BotMessage> {
    const response = await apiClient.get<BotMessage>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Получить по ключу
  async getByKey(key: BotMessageKey): Promise<BotMessage> {
    const response = await apiClient.get<BotMessage>(`${BASE_URL}/key/${key}`);
    return response.data;
  },

  // Обновить по ID
  async update(id: string, data: UpdateBotMessageDto): Promise<BotMessage> {
    const response = await apiClient.put<BotMessage>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Обновить по ключу
  async updateByKey(
    key: BotMessageKey,
    data: UpdateBotMessageDto,
  ): Promise<BotMessage> {
    const response = await apiClient.put<BotMessage>(
      `${BASE_URL}/key/${key}`,
      data,
    );
    return response.data;
  },

  // Сбросить к дефолту
  async resetToDefault(key: BotMessageKey): Promise<BotMessage> {
    const response = await apiClient.post<BotMessage>(
      `${BASE_URL}/${key}/reset`,
    );
    return response.data;
  },

  // Обновить кэш
  async refreshCache(): Promise<void> {
    await apiClient.post(`${BASE_URL}/refresh-cache`);
  },
};
```

### React Query хуки

```typescript
// hooks/useBotMessages.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { botMessagesApi } from '../services/bot-messages.api';
import {
  BotMessage,
  BotMessageKey,
  UpdateBotMessageDto,
} from '../types/bot-messages';

const QUERY_KEY = 'bot-messages';

// Получить все сообщения
export function useBotMessages() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: botMessagesApi.getAll,
  });
}

// Получить сообщение по ключу
export function useBotMessage(key: BotMessageKey) {
  return useQuery({
    queryKey: [QUERY_KEY, key],
    queryFn: () => botMessagesApi.getByKey(key),
  });
}

// Обновить сообщение
export function useUpdateBotMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBotMessageDto }) =>
      botMessagesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Сбросить к дефолту
export function useResetBotMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: BotMessageKey) => botMessagesApi.resetToDefault(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Обновить кэш
export function useRefreshBotMessagesCache() {
  return useMutation({
    mutationFn: botMessagesApi.refreshCache,
  });
}
```

### Компонент редактора сообщений

```tsx
// components/BotMessageEditor.tsx
import React, { useState, useEffect } from 'react';
import { BotMessage, UpdateBotMessageDto } from '../types/bot-messages';
import {
  useUpdateBotMessage,
  useResetBotMessage,
} from '../hooks/useBotMessages';

interface Props {
  message: BotMessage;
  onClose: () => void;
}

export function BotMessageEditor({ message, onClose }: Props) {
  const [formData, setFormData] = useState<UpdateBotMessageDto>({
    title: message.title,
    content: message.content,
    description: message.description || '',
    isActive: message.isActive,
  });

  const updateMutation = useUpdateBotMessage();
  const resetMutation = useResetBotMessage();

  const handleSave = async () => {
    await updateMutation.mutateAsync({ id: message._id, data: formData });
    onClose();
  };

  const handleReset = async () => {
    if (confirm('Сбросить сообщение к дефолтному значению?')) {
      await resetMutation.mutateAsync(message.key);
      onClose();
    }
  };

  // Превью с подстановкой переменных
  const getPreview = () => {
    let preview = formData.content || '';
    message.variables.forEach((variable) => {
      preview = preview.replace(
        new RegExp(`{{${variable}}}`, 'g'),
        `[${variable}]`,
      );
    });
    return preview;
  };

  return (
    <div className="message-editor">
      <h2>Редактирование: {message.title}</h2>

      <div className="form-group">
        <label>Ключ (только чтение)</label>
        <input value={message.key} disabled />
      </div>

      <div className="form-group">
        <label>Название</label>
        <input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Текст сообщения (Markdown)</label>
        <textarea
          rows={10}
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
        />
        {message.variables.length > 0 && (
          <div className="variables-hint">
            Доступные переменные:{' '}
            {message.variables.map((v) => `{{${v}}}`).join(', ')}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Описание</label>
        <input
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
          />
          Активно
        </label>
      </div>

      <div className="preview">
        <h3>Превью</h3>
        <pre>{getPreview()}</pre>
      </div>

      <div className="actions">
        <button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button onClick={handleReset} disabled={resetMutation.isPending}>
          Сбросить к дефолту
        </button>
        <button onClick={onClose}>Отмена</button>
      </div>
    </div>
  );
}
```

### Страница списка сообщений

```tsx
// pages/BotMessagesPage.tsx
import React, { useState, useMemo } from 'react';
import {
  useBotMessages,
  useRefreshBotMessagesCache,
} from '../hooks/useBotMessages';
import { BotMessageEditor } from '../components/BotMessageEditor';
import { BotMessage, MESSAGE_CATEGORIES } from '../types/bot-messages';

export function BotMessagesPage() {
  const { data: messages, isLoading, error } = useBotMessages();
  const refreshCacheMutation = useRefreshBotMessagesCache();
  const [editingMessage, setEditingMessage] = useState<BotMessage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Группировка сообщений по категориям
  const groupedMessages = useMemo(() => {
    if (!messages) return {};

    const result: Record<string, BotMessage[]> = {};

    Object.entries(MESSAGE_CATEGORIES).forEach(([categoryKey, category]) => {
      result[categoryKey] = messages.filter((msg) =>
        category.keys.includes(msg.key),
      );
    });

    return result;
  }, [messages]);

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <div className="bot-messages-page">
      <div className="header">
        <h1>Сообщения бота</h1>
        <button
          onClick={() => refreshCacheMutation.mutate()}
          disabled={refreshCacheMutation.isPending}
        >
          🔄 Обновить кэш
        </button>
      </div>

      <div className="categories">
        {Object.entries(MESSAGE_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            className={selectedCategory === key ? 'active' : ''}
            onClick={() =>
              setSelectedCategory(selectedCategory === key ? null : key)
            }
          >
            {category.label} ({groupedMessages[key]?.length || 0})
          </button>
        ))}
      </div>

      <div className="messages-list">
        {Object.entries(MESSAGE_CATEGORIES)
          .filter(([key]) => !selectedCategory || selectedCategory === key)
          .map(([categoryKey, category]) => (
            <div key={categoryKey} className="category-section">
              <h2>{category.label}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Ключ</th>
                    <th>Название</th>
                    <th>Статус</th>
                    <th>Изменено</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedMessages[categoryKey]?.map((message) => (
                    <tr key={message._id}>
                      <td>
                        <code>{message.key}</code>
                      </td>
                      <td>{message.title}</td>
                      <td>
                        <span
                          className={message.isActive ? 'active' : 'inactive'}
                        >
                          {message.isActive ? '✅ Активно' : '❌ Неактивно'}
                        </span>
                      </td>
                      <td>{new Date(message.updatedAt).toLocaleString()}</td>
                      <td>
                        <button onClick={() => setEditingMessage(message)}>
                          ✏️ Редактировать
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>

      {editingMessage && (
        <div className="modal-overlay">
          <div className="modal">
            <BotMessageEditor
              message={editingMessage}
              onClose={() => setEditingMessage(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Советы по UX

1. **Предпросмотр в реальном времени** — показывайте, как будет выглядеть сообщение с подставленными переменными

2. **Подсветка переменных** — выделяйте `{{переменные}}` в редакторе цветом

3. **Валидация Markdown** — предупреждайте о незакрытых тегах `*`, `_`

4. **Сравнение с дефолтом** — показывайте разницу между текущим и дефолтным значением

5. **История изменений** — сохраняйте предыдущие версии (можно использовать `updatedAt`)

6. **Поиск** — добавьте поиск по ключу, названию и содержимому

7. **Кнопка "Обновить кэш"** — после изменений напоминайте обновить кэш для применения в боте

---

## Частые ошибки

| Код | Описание     | Решение                                      |
| --- | ------------ | -------------------------------------------- |
| 401 | Unauthorized | Проверьте JWT токен                          |
| 403 | Forbidden    | Недостаточно прав (нужна роль admin/manager) |
| 404 | Not Found    | Сообщение с таким ID/ключом не найдено       |
| 400 | Bad Request  | Проверьте формат данных                      |

---

## Пример cURL запросов

```bash
# Получить все сообщения
curl -X GET "http://localhost:3000/api/admin/bot-messages" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Получить по ключу
curl -X GET "http://localhost:3000/api/admin/bot-messages/key/welcome_new_user" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Обновить сообщение
curl -X PUT "http://localhost:3000/api/admin/bot-messages/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "🎉 *Привет, {{name}}!*"}'

# Сбросить к дефолту
curl -X POST "http://localhost:3000/api/admin/bot-messages/welcome_new_user/reset" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Обновить кэш
curl -X POST "http://localhost:3000/api/admin/bot-messages/refresh-cache" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
