// API
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const APP_NAME = import.meta.env.VITE_APP_NAME || "Leads Bot Admin";

// Auth
export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const TOKEN_EXPIRY_BUFFER = 60 * 1000; // 1 minute

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Date formats
export const DATE_FORMAT = "dd.MM.yyyy";
export const DATE_TIME_FORMAT = "dd.MM.yyyy HH:mm";
export const API_DATE_FORMAT = "yyyy-MM-dd";

// Status colors
export const LEAD_STATUS_COLORS: Record<string, { bg: string; text: string }> =
  {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
    processing: { bg: "bg-blue-100", text: "text-blue-800" },
    sent: { bg: "bg-green-100", text: "text-green-800" },
    delivered: { bg: "bg-green-100", text: "text-green-800" },
    failed: { bg: "bg-red-100", text: "text-red-800" },
    rejected: { bg: "bg-gray-100", text: "text-gray-800" },
  };

// Status labels
export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  pending: "Ожидает",
  processing: "Обработка",
  sent: "Отправлен",
  delivered: "Доставлен",
  failed: "Ошибка",
  rejected: "Отклонён",
  duplicate: "Дубликат",
};

// Role labels
export const ROLE_LABELS: Record<string, string> = {
  admin: "Администратор",
  manager: "Менеджер",
};

// Source type labels
export const SOURCE_TYPE_LABELS: Record<string, string> = {
  api: "API",
  webhook: "Webhook",
  manual: "Ручной",
};

// Permission labels
export const PERMISSION_LABELS: Record<string, string> = {
  manageCountries: "Управление странами",
  manageDirections: "Управление направлениями",
  manageGroups: "Управление группами",
  manageSources: "Управление источниками",
  manageRouting: "Управление маршрутизацией",
  manageAdmins: "Управление администраторами",
  viewAnalytics: "Просмотр аналитики",
};

// Routing condition operators
export const ROUTING_OPERATORS: Record<string, string> = {
  equals: "Равно",
  contains: "Содержит",
  startsWith: "Начинается с",
  endsWith: "Заканчивается на",
  regex: "Регулярное выражение",
};
