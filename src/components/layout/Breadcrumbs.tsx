import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/cn";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  admins: "Администраторы",
  countries: "Страны",
  directions: "Направления",
  groups: "Группы",
  sources: "Источники",
  routing: "Маршрутизация",
  leads: "Лиды",
  analytics: "Аналитика",
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const location = useLocation();

  // Auto-generate breadcrumbs from path if not provided
  const breadcrumbs =
    items ||
    location.pathname
      .split("/")
      .filter(Boolean)
      .map((segment, index, arr) => ({
        label: routeLabels[segment] || segment,
        href:
          index < arr.length - 1
            ? `/${arr.slice(0, index + 1).join("/")}`
            : undefined,
      }));

  return (
    <nav className={cn("flex items-center gap-2 text-sm", className)}>
      <Link
        to="/"
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Home size={16} />
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={14} className="text-gray-400" />
          {item.href ? (
            <Link
              to={item.href}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
