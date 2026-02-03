import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { botMessagesApi } from "@/api/bot-messages.api";
import type {
  BotMessageKey,
  UpdateBotMessageDto,
} from "@/types/bot-message.types";

const QUERY_KEY = ["bot-messages"];

// Получить все сообщения
export function useBotMessages() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: botMessagesApi.getAll,
  });
}

// Получить сообщение по ключу
export function useBotMessage(key: BotMessageKey) {
  return useQuery({
    queryKey: [...QUERY_KEY, key],
    queryFn: () => botMessagesApi.getByKey(key),
    enabled: !!key,
  });
}

// Получить сообщение по ID
export function useBotMessageById(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, "id", id],
    queryFn: () => botMessagesApi.getById(id),
    enabled: !!id,
  });
}

// Обновить сообщение по ID
export function useUpdateBotMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBotMessageDto }) =>
      botMessagesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// Обновить сообщение по ключу
export function useUpdateBotMessageByKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      key,
      data,
    }: {
      key: BotMessageKey;
      data: UpdateBotMessageDto;
    }) => botMessagesApi.updateByKey(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// Сбросить сообщение к дефолту
export function useResetBotMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: BotMessageKey) => botMessagesApi.resetToDefault(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// Обновить кэш сообщений
export function useRefreshBotMessagesCache() {
  return useMutation({
    mutationFn: botMessagesApi.refreshCache,
  });
}
