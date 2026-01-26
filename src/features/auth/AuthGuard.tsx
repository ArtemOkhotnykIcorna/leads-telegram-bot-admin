import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { Spinner } from "@/components/ui";
import type { AdminPermissions } from "@/types";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermission?: keyof AdminPermissions;
}

export function AuthGuard({ children, requiredPermission }: AuthGuardProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, admin } = useAuthStore();

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" className="text-blue-600" />
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Не авторизован - редирект на логин
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверка прав доступа
  if (requiredPermission && admin) {
    const hasPermission = admin.permissions[requiredPermission];
    if (!hasPermission && admin.role !== "admin") {
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
}
