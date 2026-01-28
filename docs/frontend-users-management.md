# API Управления Пользователями - Документация для Frontend

## Обзор

API для управления пользователями в админ-панели. Предоставляет полный CRUD функционал, фильтрацию, сортировку, статистику и управление подписками.

**Базовый URL:** `/api/admin/users`

**Авторизация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

---

## Эндпоинты

### 1. Получить список пользователей

```
GET /api/admin/users
```

#### Query параметры

| Параметр                 | Тип     | По умолчанию | Описание                                                                                                  |
| ------------------------ | ------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| `page`                   | number  | 1            | Номер страницы (начиная с 1)                                                                              |
| `limit`                  | number  | 20           | Количество записей на странице (макс. 100)                                                                |
| `status`                 | string  | -            | Фильтр по статусу подписки: `trial`, `active`, `expired`, `blocked`                                       |
| `search`                 | string  | -            | Поиск по username, имени или Telegram ID                                                                  |
| `isActiveOnly`           | boolean | -            | Показать только пользователей с активной подпиской                                                        |
| `sortBy`                 | string  | `createdAt`  | Поле сортировки: `createdAt`, `telegramId`, `username`, `subscription.status`, `subscription.activeUntil` |
| `sortOrder`              | string  | `desc`       | Порядок сортировки: `asc`, `desc`                                                                         |
| `hasTributeSubscription` | boolean | -            | Фильтр по наличию Tribute подписки                                                                        |

#### Пример запроса

```typescript
const fetchUsers = async (params: {
  page?: number;
  limit?: number;
  status?: 'trial' | 'active' | 'expired' | 'blocked';
  search?: string;
  isActiveOnly?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);
  if (params.isActiveOnly) searchParams.set('isActiveOnly', 'true');
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const response = await fetch(`/api/admin/users?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};
```

#### Ответ

```typescript
interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface User {
  _id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  subscription: {
    status: 'trial' | 'active' | 'expired' | 'blocked';
    trialStartedAt?: string; // ISO date
    trialEndsAt?: string; // ISO date
    trialUsed: boolean;
    activeUntil?: string; // ISO date
    tributeSubscriptionId?: string;
  };
  permissions: {
    accessInsurance: boolean;
  };
  currentState?: {
    step?: 'country' | 'direction' | 'group';
    countryId?: string;
    directionId?: string;
  };
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

#### Пример ответа

```json
{
  "users": [
    {
      "_id": "6745a1b2c3d4e5f6a7b8c9d0",
      "telegramId": 123456789,
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "subscription": {
        "status": "active",
        "trialStartedAt": "2024-01-15T10:00:00.000Z",
        "trialEndsAt": "2024-01-15T16:00:00.000Z",
        "trialUsed": true,
        "activeUntil": "2025-01-15T10:00:00.000Z",
        "tributeSubscriptionId": "sub_12345"
      },
      "permissions": {
        "accessInsurance": true
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-06-20T14:30:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

### 2. Получить статистику пользователей

```
GET /api/admin/users/stats
```

#### Ответ

```typescript
interface UsersStats {
  total: number;
  byStatus: {
    trial: number;
    active: number;
    expired: number;
    blocked: number;
  };
  activeSubscriptions: number;
  newLast24h: number;
  newLast7d: number;
  newLast30d: number;
}
```

#### Пример ответа

```json
{
  "total": 1250,
  "byStatus": {
    "trial": 45,
    "active": 320,
    "expired": 850,
    "blocked": 35
  },
  "activeSubscriptions": 365,
  "newLast24h": 12,
  "newLast7d": 78,
  "newLast30d": 245
}
```

---

### 3. Получить пользователя по ID

```
GET /api/admin/users/:id
```

#### Параметры пути

| Параметр | Тип    | Описание                |
| -------- | ------ | ----------------------- |
| `id`     | string | MongoDB ID пользователя |

#### Ответ

Возвращает объект `User` (см. структуру выше).

---

### 4. Получить пользователя по Telegram ID

```
GET /api/admin/users/telegram/:telegramId
```

#### Параметры пути

| Параметр     | Тип    | Описание                 |
| ------------ | ------ | ------------------------ |
| `telegramId` | number | Telegram ID пользователя |

#### Ответ

Возвращает объект `User`.

---

### 5. Обновить данные пользователя

```
PUT /api/admin/users/:id
```

#### Параметры пути

| Параметр | Тип    | Описание                |
| -------- | ------ | ----------------------- |
| `id`     | string | MongoDB ID пользователя |

#### Тело запроса

```typescript
interface AdminUpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  subscriptionStatus?: 'trial' | 'active' | 'expired' | 'blocked';
  activeUntil?: string; // ISO date
  accessInsurance?: boolean;
}
```

#### Пример запроса

```typescript
const updateUser = async (id: string, data: AdminUpdateUserDto) => {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

// Использование
await updateUser('6745a1b2c3d4e5f6a7b8c9d0', {
  subscriptionStatus: 'active',
  activeUntil: '2025-12-31T23:59:59.000Z',
  accessInsurance: true,
});
```

---

### 6. Активировать подписку пользователю

```
POST /api/admin/users/:id/activate
```

#### Параметры пути

| Параметр | Тип    | Описание                |
| -------- | ------ | ----------------------- |
| `id`     | string | MongoDB ID пользователя |

#### Тело запроса

```typescript
interface AdminActivateSubscriptionDto {
  durationDays: number;
  tributeSubscriptionId?: string;
}
```

#### Пример запроса

```typescript
const activateSubscription = async (id: string, durationDays: number) => {
  const response = await fetch(`/api/admin/users/${id}/activate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ durationDays }),
  });

  return response.json();
};

// Активировать подписку на 30 дней
await activateSubscription('6745a1b2c3d4e5f6a7b8c9d0', 30);
```

---

### 7. Заблокировать пользователя

```
POST /api/admin/users/:id/block
```

#### Параметры пути

| Параметр | Тип    | Описание                |
| -------- | ------ | ----------------------- |
| `id`     | string | MongoDB ID пользователя |

#### Ответ

Возвращает обновлённый объект `User` со статусом `blocked`.

---

### 8. Разблокировать пользователя

```
POST /api/admin/users/:id/unblock
```

#### Параметры пути

| Параметр | Тип    | Описание                |
| -------- | ------ | ----------------------- |
| `id`     | string | MongoDB ID пользователя |

#### Ответ

Возвращает обновлённый объект `User` со статусом `expired`.

---

### 9. Удалить пользователя

```
DELETE /api/admin/users/:id
```

#### Параметры пути

| Параметр | Тип    | Описание                |
| -------- | ------ | ----------------------- |
| `id`     | string | MongoDB ID пользователя |

#### Ответ

```json
{
  "deleted": true,
  "id": "6745a1b2c3d4e5f6a7b8c9d0"
}
```

---

### 10. Удалить пользователя по Telegram ID

```
DELETE /api/admin/users/telegram/:telegramId
```

#### Параметры пути

| Параметр     | Тип    | Описание                 |
| ------------ | ------ | ------------------------ |
| `telegramId` | number | Telegram ID пользователя |

#### Ответ

```json
{
  "deleted": true,
  "telegramId": 123456789
}
```

---

## Коды ответов

| Код | Описание                                          |
| --- | ------------------------------------------------- |
| 200 | Успешный запрос                                   |
| 400 | Некорректный запрос (невалидные параметры)        |
| 401 | Не авторизован (отсутствует или невалидный токен) |
| 404 | Пользователь не найден                            |
| 500 | Внутренняя ошибка сервера                         |

---

## React Hooks (примеры)

### useUsers Hook

```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseUsersParams {
  page?: number;
  limit?: number;
  status?: 'trial' | 'active' | 'expired' | 'blocked';
  search?: string;
  isActiveOnly?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useUsers = (params: UseUsersParams = {}) => {
  const [data, setData] = useState<UsersListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });

      const response = await fetch(`/api/admin/users?${searchParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    params.page,
    params.limit,
    params.status,
    params.search,
    params.isActiveOnly,
    params.sortBy,
    params.sortOrder,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, loading, error, refetch: fetchUsers };
};
```

### useUsersStats Hook

```typescript
export const useUsersStats = () => {
  const [stats, setStats] = useState<UsersStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch('/api/admin/users/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setStats(data);
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
```

---

## Компоненты UI (примеры)

### Таблица пользователей

```tsx
import React, { useState } from 'react';
import { useUsers } from './hooks/useUsers';

export const UsersTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, loading, refetch } = useUsers({
    page,
    limit: 20,
    status: status as any,
    search: search || undefined,
    sortBy,
    sortOrder,
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      {/* Фильтры */}
      <div className="filters">
        <input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={status || ''}
          onChange={(e) => setStatus(e.target.value || undefined)}
        >
          <option value="">Все статусы</option>
          <option value="trial">Пробный</option>
          <option value="active">Активный</option>
          <option value="expired">Истёкший</option>
          <option value="blocked">Заблокирован</option>
        </select>
      </div>

      {/* Таблица */}
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('telegramId')}>Telegram ID</th>
            <th onClick={() => handleSort('username')}>Username</th>
            <th onClick={() => handleSort('subscription.status')}>Статус</th>
            <th onClick={() => handleSort('subscription.activeUntil')}>
              Активен до
            </th>
            <th onClick={() => handleSort('createdAt')}>Создан</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {data?.users.map((user) => (
            <tr key={user._id}>
              <td>{user.telegramId}</td>
              <td>{user.username || '-'}</td>
              <td>
                <StatusBadge status={user.subscription.status} />
              </td>
              <td>
                {user.subscription.activeUntil
                  ? new Date(user.subscription.activeUntil).toLocaleDateString()
                  : '-'}
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <UserActions user={user} onUpdate={refetch} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Пагинация */}
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 0}
        onPageChange={setPage}
      />
    </div>
  );
};
```

### Карточки статистики

```tsx
import React from 'react';
import { useUsersStats } from './hooks/useUsersStats';

export const StatsCards: React.FC = () => {
  const { stats, loading } = useUsersStats();

  if (loading || !stats) return <div>Загрузка...</div>;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Всего пользователей</h3>
        <div className="stat-value">{stats.total}</div>
      </div>

      <div className="stat-card">
        <h3>Активные подписки</h3>
        <div className="stat-value">{stats.activeSubscriptions}</div>
      </div>

      <div className="stat-card">
        <h3>Новые за 24ч</h3>
        <div className="stat-value">{stats.newLast24h}</div>
      </div>

      <div className="stat-card">
        <h3>Новые за 7 дней</h3>
        <div className="stat-value">{stats.newLast7d}</div>
      </div>

      <div className="stat-card status-breakdown">
        <h3>По статусам</h3>
        <ul>
          <li>Пробный: {stats.byStatus.trial}</li>
          <li>Активный: {stats.byStatus.active}</li>
          <li>Истёкший: {stats.byStatus.expired}</li>
          <li>Заблокирован: {stats.byStatus.blocked}</li>
        </ul>
      </div>
    </div>
  );
};
```

---

## TypeScript типы

```typescript
// types/users.ts

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'blocked';

export interface Subscription {
  status: SubscriptionStatus;
  trialStartedAt?: string;
  trialEndsAt?: string;
  trialUsed: boolean;
  activeUntil?: string;
  tributeSubscriptionId?: string;
}

export interface Permissions {
  accessInsurance: boolean;
}

export interface CurrentState {
  step?: 'country' | 'direction' | 'group';
  countryId?: string;
  directionId?: string;
}

export interface User {
  _id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  subscription: Subscription;
  permissions: Permissions;
  currentState?: CurrentState;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersStats {
  total: number;
  byStatus: {
    trial: number;
    active: number;
    expired: number;
    blocked: number;
  };
  activeSubscriptions: number;
  newLast24h: number;
  newLast7d: number;
  newLast30d: number;
}

export interface QueryUsersParams {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  search?: string;
  isActiveOnly?: boolean;
  sortBy?:
    | 'createdAt'
    | 'telegramId'
    | 'username'
    | 'subscription.status'
    | 'subscription.activeUntil';
  sortOrder?: 'asc' | 'desc';
  hasTributeSubscription?: boolean;
}

export interface AdminUpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  subscriptionStatus?: SubscriptionStatus;
  activeUntil?: string;
  accessInsurance?: boolean;
}

export interface AdminActivateSubscriptionDto {
  durationDays: number;
  tributeSubscriptionId?: string;
}
```
