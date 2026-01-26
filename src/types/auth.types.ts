export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: Admin;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Admin types are defined in admin.types.ts
import type { Admin, AdminPermissions } from "./admin.types";
export type { Admin, AdminPermissions };
