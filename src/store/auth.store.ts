import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Admin } from "@/types";

interface AuthState {
  // State
  accessToken: string | null;
  refreshToken: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAdmin: (admin: Admin) => void;
  login: (accessToken: string, refreshToken: string, admin: Admin) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      accessToken: null,
      refreshToken: null,
      admin: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      // Actions
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setAdmin: (admin) => set({ admin, isAuthenticated: true }),

      login: (accessToken, refreshToken, admin) =>
        set({
          accessToken,
          refreshToken,
          admin,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          admin: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
