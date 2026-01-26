import { useAuthStore } from "@/store/auth.store";
import type { AdminPermissions } from "@/types";

export function usePermissions() {
  const { admin } = useAuthStore();

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    if (!admin) return false;

    // Admin имеет все права
    if (admin.role === "admin") return true;

    return admin.permissions[permission] === true;
  };

  const canManageCountries = hasPermission("manageCountries");
  const canManageDirections = hasPermission("manageDirections");
  const canManageGroups = hasPermission("manageGroups");
  const canManageSources = hasPermission("manageSources");
  const canManageRouting = hasPermission("manageRouting");
  const canManageAdmins = hasPermission("manageAdmins");
  const canViewAnalytics = hasPermission("viewAnalytics");

  const isAdmin = admin?.role === "admin";

  return {
    hasPermission,
    canManageCountries,
    canManageDirections,
    canManageGroups,
    canManageSources,
    canManageRouting,
    canManageAdmins,
    canViewAnalytics,
    isAdmin,
  };
}
