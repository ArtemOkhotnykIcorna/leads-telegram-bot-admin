import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryError({
  message = "Не удалось загрузить данные",
  onRetry,
}: QueryErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      <p className="text-gray-600 text-center mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          leftIcon={<RefreshCw size={16} />}
        >
          Попробовать снова
        </Button>
      )}
    </div>
  );
}
