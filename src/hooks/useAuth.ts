import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/api";
import type { LoginRequest } from "@/types";
import toast from "react-hot-toast";

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    admin,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
    setAdmin,
    setTokens,
    refreshToken,
  } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (response) => {
      // Сохраняем токены
      setTokens(response.accessToken, response.refreshToken);

      // Получаем данные об админе
      try {
        const adminData = await authApi.getMe();
        storeLogin(response.accessToken, response.refreshToken, adminData);
        toast.success("Добро пожаловать!");
        navigate("/");
      } catch {
        toast.error("Не удалось получить данные пользователя");
        storeLogout();
      }
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      const message = error.response?.data?.message || "Ошибка авторизации";
      toast.error(message);
    },
  });

  // Get current admin
  const { refetch: fetchMe } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
    enabled: false,
    retry: false,
  });

  // Logout
  const logout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore errors
    } finally {
      storeLogout();
      queryClient.clear();
      navigate("/login");
      toast.success("Вы вышли из системы");
    }
  };

  // Check auth on app load
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchMe();
      if (data) {
        setAdmin(data);
      } else {
        storeLogout();
      }
    } catch {
      storeLogout();
    } finally {
      setLoading(false);
    }
  }, [fetchMe, setAdmin, setLoading, storeLogout]);

  return {
    admin,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    logout,
    checkAuth,
  };
}
