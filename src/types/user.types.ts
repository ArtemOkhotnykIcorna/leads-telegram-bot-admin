// Статус подписки пользователя
export type SubscriptionStatus = "trial" | "active" | "expired" | "blocked";

// Подписка пользователя
export interface Subscription {
  status: SubscriptionStatus;
  trialStartedAt?: string;
  trialEndsAt?: string;
  trialUsed: boolean;
  activeUntil?: string;
  tributeSubscriptionId?: string;
}

// Права доступа пользователя
export interface UserPermissions {
  accessInsurance: boolean;
}

// Текущее состояние пользователя в боте
export interface CurrentState {
  step?: "country" | "direction" | "group";
  countryId?: string;
  directionId?: string;
}

// Пользователь
export interface User {
  _id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  subscription: Subscription;
  permissions: UserPermissions;
  currentState?: CurrentState;
  createdAt: string;
  updatedAt: string;
}

// Ответ списка пользователей
export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Статистика пользователей
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

// Параметры запроса списка пользователей
export interface UsersQueryParams {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  search?: string;
  isActiveOnly?: boolean;
  sortBy?:
    | "createdAt"
    | "telegramId"
    | "username"
    | "subscription.status"
    | "subscription.activeUntil";
  sortOrder?: "asc" | "desc";
  hasTributeSubscription?: boolean;
}

// DTO для обновления пользователя
export interface AdminUpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  subscriptionStatus?: SubscriptionStatus;
  activeUntil?: string;
  accessInsurance?: boolean;
}

// DTO для активации подписки
export interface AdminActivateSubscriptionDto {
  durationDays: number;
  tributeSubscriptionId?: string;
}

// Ответ на удаление пользователя
export interface DeleteUserResponse {
  deleted: boolean;
  id?: string;
  telegramId?: number;
}
