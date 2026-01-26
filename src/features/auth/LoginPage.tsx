import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Редирект если уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Bot Admin</h1>
          <p className="text-gray-600 mt-2">Войдите в панель управления</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-gray-500 mt-6">
          По умолчанию: admin@default.com / StrongPassword123!
        </p>
      </div>
    </div>
  );
}
