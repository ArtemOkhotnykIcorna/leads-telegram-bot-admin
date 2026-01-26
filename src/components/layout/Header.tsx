import { Menu, LogOut, User, Settings } from "lucide-react";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/utils";

export function Header() {
  const { admin, logout } = useAuth();
  const { setSidebarOpen } = useUIStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>

        {/* Page title - can be customized via context */}
        <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
          Панель управления
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* User menu */}
        <HeadlessMenu as="div" className="relative">
          <HeadlessMenu.Button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {admin ? getInitials(admin.email) : "?"}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {admin?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {admin?.role === "admin" ? "Администратор" : "Менеджер"}
              </p>
            </div>
          </HeadlessMenu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <HeadlessMenu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 focus:outline-none z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {admin?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {admin?.role === "admin" ? "Администратор" : "Менеджер"}
                </p>
              </div>

              <HeadlessMenu.Item>
                {({ active }) => (
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700",
                      active && "bg-gray-50",
                    )}
                  >
                    <User size={16} />
                    Профиль
                  </button>
                )}
              </HeadlessMenu.Item>

              <HeadlessMenu.Item>
                {({ active }) => (
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700",
                      active && "bg-gray-50",
                    )}
                  >
                    <Settings size={16} />
                    Настройки
                  </button>
                )}
              </HeadlessMenu.Item>

              <div className="border-t border-gray-100 mt-1 pt-1">
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600",
                        active && "bg-gray-50",
                      )}
                    >
                      <LogOut size={16} />
                      Выйти
                    </button>
                  )}
                </HeadlessMenu.Item>
              </div>
            </HeadlessMenu.Items>
          </Transition>
        </HeadlessMenu>
      </div>
    </header>
  );
}
