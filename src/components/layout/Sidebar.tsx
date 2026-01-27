import { NavLink } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  Users,
  Globe,
  Compass,
  MessageSquare,
  Database,
  GitBranch,
  FileText,
  BarChart3,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import type { AdminPermissions } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: keyof AdminPermissions;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Администраторы",
    href: "/admins",
    icon: <Users size={20} />,
    permission: "manageAdmins",
  },
  {
    label: "Страны",
    href: "/countries",
    icon: <Globe size={20} />,
    permission: "manageCountries",
  },
  {
    label: "Направления",
    href: "/directions",
    icon: <Compass size={20} />,
    permission: "manageDirections",
  },
  {
    label: "Группы",
    href: "/groups",
    icon: <MessageSquare size={20} />,
    permission: "manageGroups",
  },
  {
    label: "Источники",
    href: "/sources",
    icon: <Database size={20} />,
    permission: "manageSources",
  },
  {
    label: "Маршрутизация",
    href: "/routing",
    icon: <GitBranch size={20} />,
    permission: "manageRouting",
  },
  {
    label: "Лиды",
    href: "/leads",
    icon: <FileText size={20} />,
    permission: "manageSources",
  },
  {
    label: "Платежи",
    href: "/payments",
    icon: <CreditCard size={20} />,
    permission: "viewAnalytics",
  },
  {
    label: "Аналитика",
    href: "/analytics",
    icon: <BarChart3 size={20} />,
    permission: "viewAnalytics",
  },
];

export function Sidebar() {
  const { hasPermission } = usePermissions();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, setSidebarCollapsed } =
    useUIStore();

  const filteredItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-gray-900 z-50 transition-all duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {!sidebarCollapsed && (
            <span className="text-xl font-bold text-white">Leads Bot</span>
          )}
          {sidebarCollapsed && (
            <span className="text-xl font-bold text-white mx-auto">LB</span>
          )}

          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors",
                  "text-gray-400 hover:text-white hover:bg-gray-800",
                  isActive && "bg-blue-600 text-white hover:bg-blue-700",
                  sidebarCollapsed && "justify-center",
                )
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:block p-3 border-t border-gray-800">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
              "text-gray-400 hover:text-white hover:bg-gray-800 transition-colors",
              sidebarCollapsed && "justify-center",
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span>Свернуть</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
