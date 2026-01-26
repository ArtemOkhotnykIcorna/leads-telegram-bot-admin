import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/lib/cn";

export function MainLayout() {
  const { sidebarOpen, sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen
            ? sidebarCollapsed
              ? "lg:ml-20"
              : "lg:ml-64"
            : "lg:ml-0",
        )}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
