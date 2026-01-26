import { Spinner } from "@/components/ui";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Загрузка..." }: PageLoaderProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-500">{message}</p>
    </div>
  );
}
