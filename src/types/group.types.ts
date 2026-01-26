export interface Group {
  _id: string;
  name: string;
  telegramChatId: string;
  deepLink?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDto {
  name: string;
  telegramChatId: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateGroupDto {
  name?: string;
  telegramChatId?: string;
  description?: string;
  isActive?: boolean;
}
