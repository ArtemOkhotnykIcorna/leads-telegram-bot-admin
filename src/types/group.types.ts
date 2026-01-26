// Зарегистрированная группа (TelegramGroup)
export interface TelegramGroup {
  _id: string;
  name: string;
  chatId: string;
  deepLinkId: string;
  inviteLink?: string;
  directionId: {
    _id: string;
    name: string;
    slug: string;
  };
  countryId?: {
    _id: string;
    name: string;
    code?: string;
    flag?: string;
  };
  isActive: boolean;
  stats: {
    leadsPublished: number;
    lastPublishedAt?: string;
    invitesGenerated: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Ожидающая группа (PendingGroup)
export interface PendingGroup {
  _id: string;
  chatId: string;
  title: string;
  username?: string;
  type: "group" | "supergroup" | "channel";
  addedByUserId?: number;
  status: "pending" | "linked" | "rejected";
  linkedGroupId?: string;
  createdAt: string;
  updatedAt: string;
}

// DTO для создания группы вручную
export interface CreateGroupDto {
  name: string;
  chatId?: string;
  directionId: string;
  inviteLink?: string;
  isActive?: boolean;
}

// DTO для обновления группы
export interface UpdateGroupDto {
  name?: string;
  chatId?: string;
  directionId?: string;
  inviteLink?: string;
  isActive?: boolean;
}

// DTO для привязки pending группы
export interface LinkPendingGroupDto {
  directionId: string;
  inviteLink?: string;
}

// Алиас для совместимости
export type Group = TelegramGroup;
