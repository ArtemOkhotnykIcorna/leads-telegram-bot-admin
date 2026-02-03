// Уникальные ключи сообщений бота
export enum BotMessageKey {
  // Приветственные сообщения
  WELCOME_NEW_USER = "welcome_new_user",
  WELCOME_RETURNING_USER = "welcome_returning_user",

  // Описание бота
  BOT_DESCRIPTION = "bot_description",

  // Выбор страны
  SELECT_COUNTRY = "select_country",
  NO_COUNTRIES_AVAILABLE = "no_countries_available",
  COUNTRY_NOT_FOUND = "country_not_found",

  // Выбор направления
  SELECT_DIRECTION = "select_direction",
  NO_DIRECTIONS_AVAILABLE = "no_directions_available",
  DIRECTION_ACCESS_DENIED = "direction_access_denied",

  // Группы
  GROUP_INFO = "group_info",
  GROUP_NOT_FOUND = "group_not_found",
  GROUP_INVITE_SUCCESS = "group_invite_success",
  GROUP_INVITE_PERMANENT = "group_invite_permanent",
  GROUP_INVITE_ERROR = "group_invite_error",

  // Подписка
  SUBSCRIPTION_REQUIRED = "subscription_required",
  SUBSCRIPTION_INFO_ACTIVE = "subscription_info_active",
  SUBSCRIPTION_INFO_TRIAL = "subscription_info_trial",
  SUBSCRIPTION_INFO_INACTIVE = "subscription_info_inactive",
  SUBSCRIPTION_SELECT_PLAN = "subscription_select_plan",
  SUBSCRIPTION_PAYMENT_LINK = "subscription_payment_link",
  SUBSCRIPTION_PLAN_NOT_FOUND = "subscription_plan_not_found",

  // Навигация
  MAIN_MENU = "main_menu",
  HELP = "help",
}

// Интерфейс сообщения бота
export interface BotMessage {
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

// DTO для обновления сообщения
export interface UpdateBotMessageDto {
  title?: string;
  content?: string;
  description?: string;
  isActive?: boolean;
  variables?: string[];
}

// Категория сообщений для UI
export interface MessageCategory {
  label: string;
  keys: BotMessageKey[];
}

// Группировка сообщений по категориям для UI
export const MESSAGE_CATEGORIES: Record<string, MessageCategory> = {
  welcome: {
    label: "Приветствия",
    keys: [
      BotMessageKey.WELCOME_NEW_USER,
      BotMessageKey.WELCOME_RETURNING_USER,
    ],
  },
  description: {
    label: "Описание бота",
    keys: [BotMessageKey.BOT_DESCRIPTION],
  },
  country: {
    label: "Выбор страны",
    keys: [
      BotMessageKey.SELECT_COUNTRY,
      BotMessageKey.NO_COUNTRIES_AVAILABLE,
      BotMessageKey.COUNTRY_NOT_FOUND,
    ],
  },
  direction: {
    label: "Выбор направления",
    keys: [
      BotMessageKey.SELECT_DIRECTION,
      BotMessageKey.NO_DIRECTIONS_AVAILABLE,
      BotMessageKey.DIRECTION_ACCESS_DENIED,
    ],
  },
  group: {
    label: "Группы",
    keys: [
      BotMessageKey.GROUP_INFO,
      BotMessageKey.GROUP_NOT_FOUND,
      BotMessageKey.GROUP_INVITE_SUCCESS,
      BotMessageKey.GROUP_INVITE_PERMANENT,
      BotMessageKey.GROUP_INVITE_ERROR,
    ],
  },
  subscription: {
    label: "Подписка",
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
    label: "Навигация",
    keys: [BotMessageKey.MAIN_MENU, BotMessageKey.HELP],
  },
};

// Описания переменных для каждого ключа
export const MESSAGE_VARIABLES_INFO: Partial<
  Record<BotMessageKey, { variable: string; description: string }[]>
> = {
  [BotMessageKey.WELCOME_NEW_USER]: [
    { variable: "name", description: "Имя пользователя" },
  ],
  [BotMessageKey.WELCOME_RETURNING_USER]: [
    { variable: "name", description: "Имя пользователя" },
  ],
  [BotMessageKey.BOT_DESCRIPTION]: [
    { variable: "trialHours", description: "Количество часов триала" },
  ],
  [BotMessageKey.SELECT_DIRECTION]: [
    { variable: "countryName", description: "Название выбранной страны" },
  ],
  [BotMessageKey.GROUP_INFO]: [
    { variable: "groupName", description: "Название группы" },
    { variable: "countryName", description: "Название страны" },
    { variable: "directionName", description: "Название направления" },
    { variable: "leadsCount", description: "Количество лидов" },
  ],
  [BotMessageKey.GROUP_INVITE_SUCCESS]: [
    { variable: "groupName", description: "Название группы" },
    { variable: "inviteLink", description: "Ссылка-приглашение" },
  ],
  [BotMessageKey.GROUP_INVITE_PERMANENT]: [
    { variable: "groupName", description: "Название группы" },
    { variable: "inviteLink", description: "Постоянная ссылка" },
  ],
  [BotMessageKey.SUBSCRIPTION_INFO_ACTIVE]: [
    { variable: "expiresDate", description: "Дата окончания подписки" },
  ],
  [BotMessageKey.SUBSCRIPTION_INFO_TRIAL]: [
    { variable: "expiresDate", description: "Дата окончания триала" },
  ],
  [BotMessageKey.SUBSCRIPTION_SELECT_PLAN]: [
    { variable: "plansDescription", description: "Описание тарифов" },
  ],
  [BotMessageKey.SUBSCRIPTION_PAYMENT_LINK]: [
    { variable: "planName", description: "Название тарифа" },
    { variable: "price", description: "Цена тарифа" },
  ],
};
