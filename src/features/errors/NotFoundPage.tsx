import { Link } from "react-router-dom";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui";

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <FileQuestion className="mx-auto h-16 w-16 text-gray-400" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-lg text-gray-600">Страница не найдена</p>
        <p className="mt-1 text-gray-500">
          Запрашиваемая страница не существует или была удалена
        </p>
        <Link to="/" className="inline-block mt-6">
          <Button leftIcon={<Home size={16} />}>На главную</Button>
        </Link>
      </div>
    </div>
  );
}
