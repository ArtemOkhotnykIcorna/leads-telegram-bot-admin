// Статусы лида согласно документации
export type LeadStatus =
  | "new" // Новый, ожидает публикации
  | "processing" // В процессе публикации
  | "published" // Успешно опубликован
  | "failed" // Ошибка публикации (можно повторить)
  | "duplicate" // Дубликат (пропущен)
  | "skipped"; // Пропущен по другой причине

// Контактная информация
export interface LeadContact {
  name?: string; // ФИО
  phone?: string; // Телефон (+7 999 123 45 67)
  email?: string; // Email
  telegram?: string; // Telegram username
}

// Группа (populated) для публикации
export interface LeadGroupPopulated {
  _id: string;
  name: string;
  chatId?: string;
}

// Информация о публикации
export interface LeadPublishInfo {
  groupId: string | LeadGroupPopulated; // ID группы или populated
  messageId?: number; // ID сообщения в Telegram
  publishedAt: string; // Время публикации
  success: boolean; // Успешность
  error?: string; // Ошибка (если была)
}

// Источник (populated)
export interface LeadSourcePopulated {
  _id: string;
  name: string;
  slug: string;
  type?: string;
  isActive?: boolean;
}

// Направление (populated)
export interface LeadDirectionPopulated {
  _id: string;
  name: string;
  slug: string;
  isActive?: boolean;
}

// Страна (populated)
export interface LeadCountryPopulated {
  _id: string;
  name: string;
  code?: string;
  slug?: string;
  flag?: string;
}

// Основная структура лида
export interface Lead {
  _id: string;

  // Связи (могут быть populated или просто ID)
  sourceId: string | LeadSourcePopulated;
  directionId?: string | LeadDirectionPopulated;
  countryId?: string | LeadCountryPopulated;

  // Контент
  title?: string; // Заголовок (имя, username)
  content: string; // Основной текст сообщения
  contentHash?: string; // SHA256 хеш для дедупликации

  // Контактная информация
  contact?: LeadContact;

  // Метаданные источника
  rawData?: Record<string, unknown>; // Оригинальные данные
  sourceUrl?: string; // URL источника
  sourcePublishedAt?: string; // Дата публикации в источнике

  // Статус и обработка
  status: LeadStatus;
  publishAttempts: number; // Счётчик попыток публикации
  nextPublishAt?: string; // Время следующей попытки
  lastError?: string; // Последняя ошибка

  // История публикаций
  publications: LeadPublishInfo[];

  // Служебная информация
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Фильтры для списка лидов
export interface LeadsFilter {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  sourceId?: string;
  directionId?: string;
}

// Ответ списка лидов
export interface LeadsResponse {
  items: Lead[];
  total: number;
  pages: number;
}

// Статистика по лидам
export interface LeadStats {
  total: number;
  new: number;
  processing: number;
  published: number;
  failed: number;
  duplicate: number;
  skipped: number;
}
