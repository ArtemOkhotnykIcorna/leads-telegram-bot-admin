import api from "./axios";
import type { LoginRequest, LoginResponse, Admin } from "@/types";

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", { refreshToken });
  },

  getMe: async (): Promise<Admin> => {
    const response = await api.get<Admin>("/auth/me");
    return response.data;
  },
};
