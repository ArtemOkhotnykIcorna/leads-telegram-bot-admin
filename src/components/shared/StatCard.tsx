import { cn } from "@/lib/cn";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  trend?:
    | {
        value: number;
        isPositive: boolean;
      }
    | number;
  variant?: "default" | "danger";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  description,
  icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const trendData =
    typeof trend === "number"
      ? { value: trend, isPositive: trend >= 0 }
      : trend;

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
        variant === "danger" && "border-red-200 bg-red-50",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
          {trendData && (
            <div className="mt-2 flex items-center">
              <span
                className={cn(
                  "text-sm font-medium",
                  trendData.isPositive ? "text-green-600" : "text-red-600",
                )}
              >
                {trendData.isPositive ? "+" : ""}
                {trendData.value}%
              </span>
              <span className="ml-2 text-sm text-gray-500">
                vs прошлый период
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "p-3 rounded-lg",
              variant === "danger"
                ? "bg-red-100 text-red-600"
                : "bg-blue-50 text-blue-600",
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
