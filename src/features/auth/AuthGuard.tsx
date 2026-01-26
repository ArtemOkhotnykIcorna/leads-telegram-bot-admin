import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui";
import type { AdminPermissions } from "@/types";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermission?: keyof AdminPermissions;
}

export function AuthGuard({ children, requiredPermission }: AuthGuardProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, admin, _hasHydrated } = useAuthStore();
  const { checkAuth } = useAuth();

  // Загружаем данные об админе если токен есть, но админ не загружен
  useEffect(() => {
    if (_hasHydrated && isAuthenticated && !admin && !isLoading) {
      checkAuth();
    }
  }, [_hasHydrated, isAuthenticated, admin, isLoading, checkAuth]);

  // Показываем загрузку пока данные не загрузятся из localStorage
  if (!_hasHydrated || isLoading || (isAuthenticated && !admin)) {
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
