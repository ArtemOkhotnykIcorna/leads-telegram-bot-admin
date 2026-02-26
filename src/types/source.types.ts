import type { Direction } from "./direction.types";

// Типы источников
export type SourceType =
  | "telegram_channel"
  | "telegram_group"
  | "api"
  | "website";

// Типы чатов для pending
export type PendingChatType = "group" | "supergroup" | "channel";

// Статусы pending source
export type PendingSourceStatus = "pending" | "linked" | "rejected";

// Конфигурация парсинга
export interface ParsingConfig {
  namePattern?: string; // Regex для извлечения имени
  phonePattern?: string; // Regex для телефона
  commentPattern?: string; // Regex для комментария
  skipPatterns?: string[]; // Паттерны для пропуска сообщений
}

// Шаблон парсинга
export interface ParsingTemplate {
  key: string;
  name: string;
  description: string;
}

// Зарегистрированный источник лидов
export interface LeadSource {
  _id: string;
  name: string;
  slug: string;
  type: SourceType;
  description?: string;

  // Для Telegram
  telegramChatId?: string;
  telegramUsername?: string;

  // Для API
  apiKey?: string;
  webhookUrl?: string;

  // Привязки - массив направлений (может быть populated или просто ID)
  directionIds: (string | Direction)[];

  // Статус
  isActive: boolean;
  leadsCount: number;
  order: number;

  // Настройки парсинга
  parsingConfig?: ParsingConfig;

  createdAt: string;
  updatedAt: string;
}

// Ожидающий источник (создаётся автоматически при добавлении бота)
export interface PendingSource {
  _id: string;
  chatId: string;
  title: string;
  username?: string;
  chatType: PendingChatType;
  addedByUserId?: number;
  status: PendingSourceStatus;
  linkedSourceId?: string;
  suggestedSlug?: string;
  createdAt: string;
  updatedAt: string;
}

// DTO для привязки pending source
export interface LinkPendingSourceDto {
  directionIds: string[];
  slug?: string;
  parsingTemplateKey?: string;
  parsingConfig?: ParsingConfig;
  description?: string;
}

// DTO для создания источника вручную
export interface CreateSourceDto {
  name: string;
  slug?: string;
  type: SourceType;
  description?: string;
  telegramChatId?: string;
  telegramUsername?: string;
  directionIds: string[];
  parsingConfig?: ParsingConfig;
  isActive?: boolean;
}

// DTO для обновления источника
export interface UpdateSourceDto {
  name?: string;
  description?: string;
  directionIds?: string[];
  isActive?: boolean;
  parsingConfig?: ParsingConfig;
}

// Обратная совместимость (алиас)
export type Source = LeadSource;

// DTO для подключения через MTProto (join-and-add)
export interface MtprotoJoinAndAddDto {
  url: string;
  directionIds?: string[];
  description?: string;
  parsingTemplateKey?: string;
}

// Ответ статуса MTProto клиента
export interface MtprotoStatusResponse {
  connected: boolean;
  monitoredChats: string[];
}
