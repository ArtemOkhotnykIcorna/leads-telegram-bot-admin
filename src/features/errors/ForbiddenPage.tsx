import { Link } from "react-router-dom";
import { ShieldOff, Home } from "lucide-react";
import { Button } from "@/components/ui";

export function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <ShieldOff className="mx-auto h-16 w-16 text-red-400" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">403</h1>
        <p className="mt-2 text-lg text-gray-600">Доступ запрещён</p>
        <p className="mt-1 text-gray-500">
          У вас нет прав для просмотра этой страницы
        </p>
        <Link to="/" className="inline-block mt-6">
          <Button leftIcon={<Home size={16} />}>На главную</Button>
        </Link>
      </div>
    </div>
  );
}
