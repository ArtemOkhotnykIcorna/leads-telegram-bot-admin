import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { countriesApi } from "@/api";
import type { CreateCountryDto, UpdateCountryDto } from "@/types";
import toast from "react-hot-toast";

const QUERY_KEY = ["countries"];

export function useCountries() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: countriesApi.getAll,
  });
}

export function useActiveCountries() {
  return useQuery({
    queryKey: [...QUERY_KEY, "active"],
    queryFn: countriesApi.getActive,
  });
}

export function useCountry(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => countriesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCountry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCountryDto) => countriesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Страна создана");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка создания");
    },
  });
}

export function useUpdateCountry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCountryDto }) =>
      countriesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Страна обновлена");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка обновления");
    },
  });
}

export function useToggleCountry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => countriesApi.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка изменения статуса");
    },
  });
}

export function useDeleteCountry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => countriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Страна удалена");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error.response?.data?.message || "Ошибка удаления");
    },
  });
}
