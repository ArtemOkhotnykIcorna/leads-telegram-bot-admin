# Модуль Leads - Документация для фронтенда

## Обзор

Модуль **Leads** управляет лидами (потенциальными клиентами), которые собираются из различных источников (Telegram каналы/группы, RSS, API). Модуль предоставляет API для просмотра, фильтрации, управления и анализа лидов.

---

## Схема данных Lead

### Основная структура

```typescript
interface Lead {
  _id: string;

  // Связи
  sourceId: string | LeadSource; // Источник лида (populate)
  directionId?: string | Direction; // Направление (populate)
  countryId?: string | Country; // Страна (populate)

  // Контент
  title?: string; // Заголовок (имя, username)
  content: string; // Основной текст сообщения
  contentHash: string; // SHA256 хеш для дедупликации

  // Контактная информация
  contact?: {
    name?: string; // ФИО
    phone?: string; // Телефон (+7 999 123 45 67)
    email?: string; // Email
    telegram?: string; // Telegram username
  };

  // Метаданные источника
  rawData?: Record<string, any>; // Оригинальные данные
  sourceUrl?: string; // URL источника
  sourcePublishedAt?: Date; // Дата публикации в источнике

  // Статус и обработка
  status: LeadStatus; // Текущий статус
  publishAttempts: number; // Счётчик попыток публикации
  nextPublishAt?: Date; // Время следующей попытки
  lastError?: string; // Последняя ошибка

  // История публикаций
  publications: LeadPublishInfo[]; // Массив публикаций в группы

  // Служебная информация
  metadata?: Record<string, any>; // Дополнительные метаданные
  createdAt: Date; // Дата создания
  updatedAt: Date; // Дата обновления
}

// Информация о публикации
interface LeadPublishInfo {
  groupId: string; // ID группы Telegram
  messageId?: number; // ID сообщения в Telegram
  publishedAt: Date; // Время публикации
  success: boolean; // Успешность
  error?: string; // Ошибка (если была)
}
```

### Статусы лида (LeadStatus)

```typescript
enum LeadStatus {
  NEW = 'new', // Новый, ожидает публикации
  PROCESSING = 'processing', // В процессе публикации
  PUBLISHED = 'published', // Успешно опубликован
  FAILED = 'failed', // Ошибка публикации (можно повторить)
  DUPLICATE = 'duplicate', // Дубликат (пропущен)
  SKIPPED = 'skipped', // Пропущен по другой причине
}
```

---

## API Эндпоинты

### Базовый URL

```
/api/admin/leads
```

### Авторизация

Все эндпоинты требуют JWT токен в заголовке:

```
Authorization: Bearer <jwt_token>
```

Минимальное право доступа: `viewAnalytics`

---

## 1. Получить список лидов с фильтрацией

### `GET /api/admin/leads`

Получить список лидов с пагинацией и фильтрами.

#### Query параметры

| Параметр      | Тип        | Обязательный | По умолчанию | Описание                         |
| ------------- | ---------- | ------------ | ------------ | -------------------------------- |
| `page`        | number     | Нет          | 1            | Номер страницы (начиная с 1)     |
| `limit`       | number     | Нет          | 20           | Количество лидов на странице     |
| `status`      | LeadStatus | Нет          | -            | Фильтр по статусу                |
| `sourceId`    | string     | Нет          | -            | Фильтр по источнику (ObjectId)   |
| `directionId` | string     | Нет          | -            | Фильтр по направлению (ObjectId) |

#### Примеры запросов

**Получить первую страницу всех лидов:**

```bash
GET /api/admin/leads?page=1&limit=20
```

**Получить новые лиды:**

```bash
GET /api/admin/leads?status=new&page=1&limit=50
```

**Получить лиды из конкретного источника:**

```bash
GET /api/admin/leads?sourceId=65a1b2c3d4e5f6789012345&page=1
```

**Получить опубликованные лиды из конкретного направления:**

```bash
GET /api/admin/leads?status=published&directionId=65a1b2c3d4e5f6789012346
```

**Комбинированные фильтры:**

```bash
GET /api/admin/leads?status=failed&sourceId=65a1b2c3d4e5f6789012345&page=1&limit=10
```

#### Ответ

```typescript
{
  items: Lead[];      // Массив лидов
  total: number;      // Общее количество лидов (с учётом фильтра)
  pages: number;      // Общее количество страниц
}
```

#### Пример ответа

```json
{
  "items": [
    {
      "_id": "65a1b2c3d4e5f6789012347",
      "sourceId": {
        "_id": "65a1b2c3d4e5f6789012345",
        "name": "Крипто-канал Premium",
        "slug": "crypto-premium"
      },
      "directionId": {
        "_id": "65a1b2c3d4e5f6789012346",
        "name": "Криптовалюты",
        "slug": "crypto"
      },
      "title": "@john_crypto",
      "content": "Новый клиент\nКонтакт: @john_crypto\nДепозит: $10,000\nГотов инвестировать в BTC",
      "contact": {
        "telegram": "john_crypto"
      },
      "status": "new",
      "publishAttempts": 0,
      "publications": [],
      "createdAt": "2026-01-26T15:30:00.000Z",
      "updatedAt": "2026-01-26T15:30:00.000Z"
    },
    {
      "_id": "65a1b2c3d4e5f6789012348",
      "sourceId": {
        "_id": "65a1b2c3d4e5f6789012345",
        "name": "Крипто-канал Premium",
        "slug": "crypto-premium"
      },
      "directionId": {
        "_id": "65a1b2c3d4e5f6789012346",
        "name": "Криптовалюты",
        "slug": "crypto"
      },
      "title": "Иван Петров",
      "content": "Имя: Иван Петров\nТелефон: +7 999 123 45 67\nКомментарий: Интересуется стейкингом",
      "contact": {
        "name": "Иван Петров",
        "phone": "+79991234567"
      },
      "status": "published",
      "publishAttempts": 1,
      "publications": [
        {
          "groupId": "65a1b2c3d4e5f6789012349",
          "messageId": 12345,
          "publishedAt": "2026-01-26T15:35:00.000Z",
          "success": true
        }
      ],
      "createdAt": "2026-01-26T15:30:00.000Z",
      "updatedAt": "2026-01-26T15:35:00.000Z"
    }
  ],
  "total": 156,
  "pages": 8
}
```

---

## 2. Получить статистику по лидам

### `GET /api/admin/leads/stats`

Получить агрегированную статистику по статусам лидов.

#### Ответ

```typescript
{
  total: number;        // Общее количество лидов
  new: number;          // Количество новых
  processing: number;   // В процессе
  published: number;    // Опубликованных
  failed: number;       // С ошибками
  duplicate: number;    // Дубликатов
  skipped: number;      // Пропущенных
}
```

#### Пример запроса

```bash
GET /api/admin/leads/stats
```

#### Пример ответа

```json
{
  "total": 1543,
  "new": 234,
  "processing": 12,
  "published": 1098,
  "failed": 56,
  "duplicate": 98,
  "skipped": 45
}
```

---

## 3. Получить лид по ID

### `GET /api/admin/leads/:id`

Получить детальную информацию о конкретном лиде.

#### URL параметры

| Параметр | Тип    | Описание              |
| -------- | ------ | --------------------- |
| `id`     | string | MongoDB ObjectId лида |

#### Пример запроса

```bash
GET /api/admin/leads/65a1b2c3d4e5f6789012347
```

#### Ответ

Возвращает объект `Lead` с populate для `sourceId`, `directionId`, `countryId`.

#### Пример ответа

```json
{
  "_id": "65a1b2c3d4e5f6789012347",
  "sourceId": {
    "_id": "65a1b2c3d4e5f6789012345",
    "name": "Крипто-канал Premium",
    "slug": "crypto-premium",
    "type": "telegram_channel",
    "isActive": true
  },
  "directionId": {
    "_id": "65a1b2c3d4e5f6789012346",
    "name": "Криптовалюты",
    "slug": "crypto",
    "isActive": true
  },
  "countryId": {
    "_id": "65a1b2c3d4e5f6789012350",
    "name": "Россия",
    "code": "RU",
    "flag": "🇷🇺"
  },
  "title": "@john_crypto",
  "content": "Новый клиент\nКонтакт: @john_crypto\nДепозит: $10,000\nГотов инвестировать в BTC",
  "contentHash": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
  "contact": {
    "telegram": "john_crypto"
  },
  "rawData": {
    "messageId": 12345,
    "chatId": "-1001234567890",
    "from": {
      "id": 123456789,
      "username": "john_crypto",
      "first_name": "John"
    }
  },
  "sourcePublishedAt": "2026-01-26T15:25:00.000Z",
  "status": "published",
  "publishAttempts": 1,
  "publications": [
    {
      "groupId": "65a1b2c3d4e5f6789012349",
      "messageId": 67890,
      "publishedAt": "2026-01-26T15:35:00.000Z",
      "success": true
    }
  ],
  "metadata": {
    "telegramMessageId": 12345,
    "chatId": "-1001234567890"
  },
  "createdAt": "2026-01-26T15:30:00.000Z",
  "updatedAt": "2026-01-26T15:35:00.000Z"
}
```

---

## 4. Повторить публикацию лида

### `POST /api/admin/leads/:id/retry`

Повторить попытку публикации для лида со статусом `failed`.

**Требуется право:** `manageSources`

#### URL параметры

| Параметр | Тип    | Описание              |
| -------- | ------ | --------------------- |
| `id`     | string | MongoDB ObjectId лида |

#### Пример запроса

```bash
POST /api/admin/leads/65a1b2c3d4e5f6789012347/retry
```

#### Ответ

Возвращает обновлённый лид с новым статусом `new` и сброшенным `nextPublishAt`.

#### Пример ответа

```json
{
  "_id": "65a1b2c3d4e5f6789012347",
  "status": "new",
  "nextPublishAt": "2026-01-26T16:00:00.000Z",
  "publishAttempts": 3,
  "lastError": null,
  ...
}
```

---

## Флоу работы с лидами

### Жизненный цикл лида

```
┌──────────────────────────────────────────────────────────────┐
│                    СОЗДАНИЕ ЛИДА                             │
│  Источник (Telegram/RSS/API) → TelegramLeadProcessor        │
│  → LeadsService.create() → status: "new"                     │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                    ОБРАБОТКА                                 │
│  PublisherService получает лиды со статусом "new"            │
│  → status: "processing"                                      │
└──────────────────────────────────────────────────────────────┘
                           ↓
                    ┌──────┴──────┐
                    ↓             ↓
          ┌─────────────┐  ┌─────────────┐
          │   УСПЕХ     │  │   ОШИБКА    │
          │ "published" │  │  "failed"   │
          └─────────────┘  └─────────────┘
                                  ↓
                           [retry endpoint]
                                  ↓
                            status: "new"
```

### Дедупликация

Лиды дедуплицируются по хешу контента:

```
contentHash = SHA256(sourceId + normalize(content))
```

Если лид с таким хешом уже существует → статус `duplicate`, запись не создаётся заново.

---

## Интеграция на фронтенде

### 1. Список лидов (Таблица)

**Компонент:** `LeadsTable.tsx`

**Функционал:**

- Таблица с колонками: Title, Source, Direction, Status, Contact, Created
- Пагинация
- Фильтры: статус, источник, направление
- Действия: Просмотр, Повторить (для failed)

**Пример структуры:**

```typescript
// LeadsTable.tsx
import { useState, useEffect } from 'react';
import { fetchLeads } from '@/api/leads';

interface LeadsTableProps {
  initialStatus?: LeadStatus;
}

export const LeadsTable = ({ initialStatus }: LeadsTableProps) => {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: initialStatus,
    sourceId: null,
    directionId: null,
  });

  useEffect(() => {
    loadLeads();
  }, [page, filters]);

  const loadLeads = async () => {
    const response = await fetchLeads({
      page,
      limit: 20,
      ...filters,
    });
    setLeads(response.items);
    setTotal(response.total);
    setPages(response.pages);
  };

  return (
    <div>
      {/* Фильтры */}
      <LeadsFilters filters={filters} onChange={setFilters} />

      {/* Таблица */}
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Source</th>
            <th>Direction</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <LeadRow key={lead._id} lead={lead} onRetry={loadLeads} />
          ))}
        </tbody>
      </table>

      {/* Пагинация */}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
};
```

### 2. Фильтры

**Компонент:** `LeadsFilters.tsx`

```typescript
interface LeadsFiltersProps {
  filters: {
    status?: LeadStatus;
    sourceId?: string;
    directionId?: string;
  };
  onChange: (filters: any) => void;
}

export const LeadsFilters = ({ filters, onChange }: LeadsFiltersProps) => {
  const { data: sources } = useSources(); // GET /api/sources
  const { data: directions } = useDirections(); // GET /api/directions

  return (
    <div className="filters">
      <select
        value={filters.status || ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
      >
        <option value="">Все статусы</option>
        <option value="new">Новые</option>
        <option value="processing">В обработке</option>
        <option value="published">Опубликованные</option>
        <option value="failed">С ошибками</option>
        <option value="duplicate">Дубликаты</option>
        <option value="skipped">Пропущенные</option>
      </select>

      <select
        value={filters.sourceId || ''}
        onChange={(e) => onChange({ ...filters, sourceId: e.target.value || undefined })}
      >
        <option value="">Все источники</option>
        {sources?.map((source) => (
          <option key={source._id} value={source._id}>
            {source.name}
          </option>
        ))}
      </select>

      <select
        value={filters.directionId || ''}
        onChange={(e) => onChange({ ...filters, directionId: e.target.value || undefined })}
      >
        <option value="">Все направления</option>
        {directions?.map((direction) => (
          <option key={direction._id} value={direction._id}>
            {direction.name}
          </option>
        ))}
      </select>

      <button onClick={() => onChange({})}>Сбросить</button>
    </div>
  );
};
```

### 3. Карточка лида (детальный просмотр)

**Компонент:** `LeadDetailModal.tsx`

```typescript
interface LeadDetailModalProps {
  leadId: string;
  onClose: () => void;
}

export const LeadDetailModal = ({ leadId, onClose }: LeadDetailModalProps) => {
  const { data: lead, isLoading } = useLead(leadId); // GET /api/admin/leads/:id

  if (isLoading) return <Spinner />;

  return (
    <Modal onClose={onClose}>
      <h2>{lead.title || 'Без заголовка'}</h2>

      {/* Статус */}
      <StatusBadge status={lead.status} />

      {/* Источник и направление */}
      <div>
        <strong>Источник:</strong> {lead.sourceId.name}
      </div>
      <div>
        <strong>Направление:</strong> {lead.directionId?.name || 'Не указано'}
      </div>

      {/* Контент */}
      <div className="content">
        <pre>{lead.content}</pre>
      </div>

      {/* Контактная информация */}
      {lead.contact && (
        <div className="contact">
          <h3>Контакты</h3>
          {lead.contact.name && <div>Имя: {lead.contact.name}</div>}
          {lead.contact.phone && <div>Телефон: {lead.contact.phone}</div>}
          {lead.contact.email && <div>Email: {lead.contact.email}</div>}
          {lead.contact.telegram && <div>Telegram: @{lead.contact.telegram}</div>}
        </div>
      )}

      {/* История публикаций */}
      {lead.publications.length > 0 && (
        <div className="publications">
          <h3>История публикаций</h3>
          {lead.publications.map((pub, idx) => (
            <div key={idx}>
              {pub.success ? '✅' : '❌'} {new Date(pub.publishedAt).toLocaleString()}
              {pub.error && <div className="error">{pub.error}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Ошибка */}
      {lead.lastError && (
        <div className="error-box">
          <strong>Ошибка:</strong> {lead.lastError}
        </div>
      )}

      {/* Действия */}
      {lead.status === 'failed' && (
        <button onClick={() => retryLead(leadId)}>
          Повторить публикацию
        </button>
      )}
    </Modal>
  );
};
```

### 4. Статистика (дашборд)

**Компонент:** `LeadsStats.tsx`

```typescript
export const LeadsStats = () => {
  const { data: stats } = useLeadsStats(); // GET /api/admin/leads/stats

  return (
    <div className="stats-grid">
      <StatCard title="Всего" value={stats?.total || 0} color="blue" />
      <StatCard title="Новые" value={stats?.new || 0} color="green" />
      <StatCard title="Опубликованные" value={stats?.published || 0} color="success" />
      <StatCard title="С ошибками" value={stats?.failed || 0} color="red" />
      <StatCard title="Дубликаты" value={stats?.duplicate || 0} color="gray" />
    </div>
  );
};
```

### 5. API клиент

**Файл:** `api/leads.ts`

```typescript
import { api } from './client';

export interface LeadsFilters {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  sourceId?: string;
  directionId?: string;
}

export const leadsApi = {
  // Получить список
  fetchLeads: (filters: LeadsFilters) =>
    api.get('/api/admin/leads', { params: filters }),

  // Получить по ID
  fetchLead: (id: string) => api.get(`/api/admin/leads/${id}`),

  // Статистика
  fetchStats: () => api.get('/api/admin/leads/stats'),

  // Повторить публикацию
  retryLead: (id: string) => api.post(`/api/admin/leads/${id}/retry`),
};

// React Query хуки
export const useLeads = (filters: LeadsFilters) =>
  useQuery(['leads', filters], () => leadsApi.fetchLeads(filters));

export const useLead = (id: string) =>
  useQuery(['lead', id], () => leadsApi.fetchLead(id));

export const useLeadsStats = () =>
  useQuery(['leads', 'stats'], leadsApi.fetchStats);

export const useRetryLead = () => useMutation(leadsApi.retryLead);
```

---

## Рекомендации по UX

### 1. Цветовая индикация статусов

```typescript
const statusColors = {
  new: '#3b82f6', // синий
  processing: '#f59e0b', // оранжевый
  published: '#10b981', // зелёный
  failed: '#ef4444', // красный
  duplicate: '#6b7280', // серый
  skipped: '#9ca3af', // светло-серый
};

const statusLabels = {
  new: 'Новый',
  processing: 'Обрабатывается',
  published: 'Опубликован',
  failed: 'Ошибка',
  duplicate: 'Дубликат',
  skipped: 'Пропущен',
};
```

### 2. Обновление в реальном времени

Используйте WebSocket или polling для обновления статусов:

```typescript
// Polling каждые 30 секунд для лидов в статусе "processing"
useEffect(() => {
  const interval = setInterval(() => {
    if (filters.status === 'processing') {
      refetch();
    }
  }, 30000);
  return () => clearInterval(interval);
}, [filters, refetch]);
```

### 3. Быстрые фильтры

Добавьте кнопки быстрого доступа:

```tsx
<div className="quick-filters">
  <button onClick={() => setFilters({ status: 'new' })}>
    Новые ({stats.new})
  </button>
  <button onClick={() => setFilters({ status: 'failed' })}>
    Ошибки ({stats.failed})
  </button>
  <button onClick={() => setFilters({ status: 'published' })}>
    Опубликованные ({stats.published})
  </button>
</div>
```

### 4. Массовые операции

Рассмотрите добавление:

- Массовая повторная публикация (для `failed`)
- Массовое удаление (для `duplicate`)
- Экспорт в CSV

---

## Обработка ошибок

### Возможные ошибки

| Код | Описание          | Решение                          |
| --- | ----------------- | -------------------------------- |
| 401 | Не авторизован    | Перенаправить на логин           |
| 403 | Недостаточно прав | Показать сообщение "Нет доступа" |
| 404 | Лид не найден     | Показать "Лид не найден"         |
| 500 | Ошибка сервера    | Показать "Попробуйте позже"      |

### Пример обработки

```typescript
try {
  const lead = await leadsApi.fetchLead(id);
  setLead(lead);
} catch (error) {
  if (error.response?.status === 404) {
    toast.error('Лид не найден');
    navigate('/leads');
  } else if (error.response?.status === 403) {
    toast.error('Недостаточно прав');
  } else {
    toast.error('Ошибка загрузки лида');
  }
}
```

---

## Производительность

### Оптимизация запросов

1. **Кэширование:** Используйте React Query с staleTime:

   ```typescript
   useQuery(['leads', filters], fetchLeads, { staleTime: 60000 });
   ```

2. **Дебаунс фильтров:** Задержка применения фильтров:

   ```typescript
   const debouncedFilters = useDebounce(filters, 500);
   ```

3. **Виртуализация:** Для больших списков используйте `react-window`

4. **Префетч:** Предзагрузка следующей страницы:
   ```typescript
   queryClient.prefetchQuery(['leads', { ...filters, page: page + 1 }]);
   ```

---

## Тестирование

### Mock данные

```typescript
export const mockLead: Lead = {
  _id: '65a1b2c3d4e5f6789012347',
  sourceId: '65a1b2c3d4e5f6789012345',
  directionId: '65a1b2c3d4e5f6789012346',
  title: 'Иван Петров',
  content: 'Имя: Иван Петров\nТелефон: +7 999 123 45 67',
  contentHash: 'abc123',
  contact: {
    name: 'Иван Петров',
    phone: '+79991234567',
  },
  status: 'new',
  publishAttempts: 0,
  publications: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

---

## Дополнительные возможности

### Будущие эндпоинты (могут быть добавлены)

- `POST /api/admin/leads/:id/skip` - пропустить лид
- `DELETE /api/admin/leads/:id` - удалить лид
- `POST /api/admin/leads/bulk-retry` - массовый retry
- `GET /api/admin/leads/export` - экспорт в CSV
- `PATCH /api/admin/leads/:id` - редактирование лида

---

## Связь с другими модулями

- **Sources** - источники лидов
- **Directions** - направления для фильтрации
- **Countries** - страны для фильтрации
- **Publisher** - публикация лидов в группы
- **Analytics** - статистика и отчёты
