import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import { AuthGuard, LoginPage } from "@/features/auth";
import { ProtectedRoute } from "./ProtectedRoute";

// Pages - lazy load
import { DashboardPage } from "@/features/dashboard";
import { AdminsPage } from "@/features/admins";
import { CountriesPage } from "@/features/countries";
import { DirectionsPage } from "@/features/directions";
import { GroupsPage } from "@/features/groups";
import { SourcesPage } from "@/features/sources";
import { RoutingPage } from "@/features/routing";
import { LeadsPage } from "@/features/leads";
import { PaymentsPage } from "@/features/payments";
import { PlansPage } from "@/features/subscription-plans";
import { AnalyticsPage } from "@/features/analytics";
import { UsersPage } from "@/features/users";
import { NotFoundPage, ForbiddenPage } from "@/features/errors";

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: <LoginPage />,
  },

  // Protected routes
  {
    path: "/",
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      // Dashboard
      {
        index: true,
        element: <DashboardPage />,
      },

      // Admins (только для admin роли)
      {
        path: "admins",
        element: (
          <ProtectedRoute permission="manageAdmins">
            <AdminsPage />
          </ProtectedRoute>
        ),
      },

      // Countries
      {
        path: "countries",
        element: (
          <ProtectedRoute permission="manageCountries">
            <CountriesPage />
          </ProtectedRoute>
        ),
      },

      // Directions
      {
        path: "directions",
        element: (
          <ProtectedRoute permission="manageDirections">
            <DirectionsPage />
          </ProtectedRoute>
        ),
      },

      // Groups
      {
        path: "groups",
        element: (
          <ProtectedRoute permission="manageGroups">
            <GroupsPage />
          </ProtectedRoute>
        ),
      },

      // Sources
      {
        path: "sources",
        element: (
          <ProtectedRoute permission="manageSources">
            <SourcesPage />
          </ProtectedRoute>
        ),
      },

      // Routing
      {
        path: "routing",
        element: (
          <ProtectedRoute permission="manageRouting">
            <RoutingPage />
          </ProtectedRoute>
        ),
      },

      // Leads
      {
        path: "leads",
        element: (
          <ProtectedRoute permission="manageSources">
            <LeadsPage />
          </ProtectedRoute>
        ),
      },

      // Users
      {
        path: "users",
        element: (
          <ProtectedRoute permission="viewAnalytics">
            <UsersPage />
          </ProtectedRoute>
        ),
      },

      // Payments
      {
        path: "payments",
        element: (
          <ProtectedRoute permission="viewAnalytics">
            <PaymentsPage />
          </ProtectedRoute>
        ),
      },

      // Subscription Plans
      {
        path: "plans",
        element: (
          <ProtectedRoute permission="viewAnalytics">
            <PlansPage />
          </ProtectedRoute>
        ),
      },

      // Analytics
      {
        path: "analytics",
        element: (
          <ProtectedRoute permission="viewAnalytics">
            <AnalyticsPage />
          </ProtectedRoute>
        ),
      },

      // Error pages
      {
        path: "403",
        element: <ForbiddenPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
