import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import type { AdminPermissions } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: keyof AdminPermissions;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { hasPermission } = usePermissions();

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
