import api from "./axios";
import type {
  BotMessage,
  BotMessageKey,
  UpdateBotMessageDto,
} from "@/types/bot-message.types";

const BASE_URL = "/admin/bot-messages";

export const botMessagesApi = {
  // Получить все сообщения
  getAll: async (): Promise<BotMessage[]> => {
    const { data } = await api.get<BotMessage[]>(BASE_URL);
    return data;
  },

  // Получить сообщение по ID
  getById: async (id: string): Promise<BotMessage> => {
    const { data } = await api.get<BotMessage>(`${BASE_URL}/${id}`);
    return data;
  },

  // Получить сообщение по ключу
  getByKey: async (key: BotMessageKey): Promise<BotMessage> => {
    const { data } = await api.get<BotMessage>(`${BASE_URL}/key/${key}`);
    return data;
  },

  // Обновить сообщение по ID
  update: async (id: string, dto: UpdateBotMessageDto): Promise<BotMessage> => {
    const { data } = await api.put<BotMessage>(`${BASE_URL}/${id}`, dto);
    return data;
  },

  // Обновить сообщение по ключу
  updateByKey: async (
    key: BotMessageKey,
    dto: UpdateBotMessageDto,
  ): Promise<BotMessage> => {
    const { data } = await api.put<BotMessage>(`${BASE_URL}/key/${key}`, dto);
    return data;
  },

  // Сбросить сообщение к дефолтному значению
  resetToDefault: async (key: BotMessageKey): Promise<BotMessage> => {
    const { data } = await api.post<BotMessage>(`${BASE_URL}/${key}/reset`);
    return data;
  },

  // Обновить кэш сообщений
  refreshCache: async (): Promise<void> => {
    await api.post(`${BASE_URL}/refresh-cache`);
  },
};
