export interface Admin {
  _id: string;
  email: string;
  role: "admin" | "manager";
  permissions: AdminPermissions;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermissions {
  manageCountries: boolean;
  manageDirections: boolean;
  manageGroups: boolean;
  manageSources: boolean;
  manageRouting: boolean;
  manageAdmins: boolean;
  viewAnalytics: boolean;
}

export interface CreateAdminDto {
  email: string;
  password: string;
  role: "admin" | "manager";
  permissions?: Partial<AdminPermissions>;
}

export interface UpdateAdminDto {
  email?: string;
  role?: "admin" | "manager";
  isActive?: boolean;
}

export interface UpdatePermissionsDto {
  permissions: AdminPermissions;
}

export interface ChangePasswordDto {
  password: string;
}
