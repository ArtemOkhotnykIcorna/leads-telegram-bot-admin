import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { MainLayout } from "@/components/layout";
import { AuthGuard, LoginPage } from "@/features/auth";
import { ProtectedRoute } from "./ProtectedRoute";
import { PageLoader } from "@/components/shared";

// Pages - lazy load
const DashboardPage = lazy(() =>
  import("@/features/dashboard").then((m) => ({ default: m.DashboardPage })),
);
const AdminsPage = lazy(() =>
  import("@/features/admins").then((m) => ({ default: m.AdminsPage })),
);
const CountriesPage = lazy(() =>
  import("@/features/countries").then((m) => ({ default: m.CountriesPage })),
);
const DirectionsPage = lazy(() =>
  import("@/features/directions").then((m) => ({ default: m.DirectionsPage })),
);
const GroupsPage = lazy(() =>
  import("@/features/groups").then((m) => ({ default: m.GroupsPage })),
);
const SourcesPage = lazy(() =>
  import("@/features/sources").then((m) => ({ default: m.SourcesPage })),
);
const RoutingPage = lazy(() =>
  import("@/features/routing").then((m) => ({ default: m.RoutingPage })),
);
const LeadsPage = lazy(() =>
  import("@/features/leads").then((m) => ({ default: m.LeadsPage })),
);
const PaymentsPage = lazy(() =>
  import("@/features/payments").then((m) => ({ default: m.PaymentsPage })),
);
const PlansPage = lazy(() =>
  import("@/features/subscription-plans").then((m) => ({
    default: m.PlansPage,
  })),
);
const AnalyticsPage = lazy(() =>
  import("@/features/analytics").then((m) => ({ default: m.AnalyticsPage })),
);
const UsersPage = lazy(() =>
  import("@/features/users").then((m) => ({ default: m.UsersPage })),
);
const BotMessagesPage = lazy(() =>
  import("@/features/bot-messages").then((m) => ({
    default: m.BotMessagesPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("@/features/errors").then((m) => ({ default: m.NotFoundPage })),
);
const ForbiddenPage = lazy(() =>
  import("@/features/errors").then((m) => ({ default: m.ForbiddenPage })),
);

// Wrapper для Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

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
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },

      // Admins (только для admin роли)
      {
        path: "admins",
        element: (
          <SuspenseWrapper>
            <ProtectedRoute permission="manageAdmins">
              <AdminsPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // Countries
      {
        path: "countries",
        element: (
          <SuspenseWrapper>
            <ProtectedRoute permission="manageCountries">
              <CountriesPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // Directions
      {
        path: "directions",
        element: (
          <SuspenseWrapper>
            <ProtectedRoute permission="manageDirections">
              <DirectionsPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // Groups
      {
        path: "groups",
        element: (
          <SuspenseWrapper>
            <ProtectedRoute permission="manageGroups">
              <GroupsPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // Sources
      {
        path: "sources",
        element: (
          <SuspenseWrapper>
            <ProtectedRoute permission="manageSources">
              <SourcesPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // Routing
      {
        path: "routing",
        element: (
          <SuspenseWrapper>
            <ProtectedRoute permission="manageRouting">
              <RoutingPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // Leads
      {
        path: "leads",
        element: (
          <SuspenseWrapper>
            <ProtectedRoute permission="manageSources">
              <LeadsPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // Users
      {
        path: "users",
        element: (
          <SuspenseWrapper>
            <ProtectedRoute permission="viewAnalytics">
              <UsersPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // Payments
      {
        path: "payments",
        element: (
          <SuspenseWrapper>
            <ProtectedRoute permission="viewAnalytics">
              <PaymentsPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // Subscription Plans
      {
        path: "plans",
        element: (
          <SuspenseWrapper>
            <ProtectedRoute permission="viewAnalytics">
              <PlansPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // Analytics
      {
        path: "analytics",
        element: (
          <SuspenseWrapper>
            <ProtectedRoute permission="viewAnalytics">
              <AnalyticsPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // Bot Messages
      {
        path: "bot-messages",
        element: (
          <SuspenseWrapper>
            <ProtectedRoute permission="viewAnalytics">
              <BotMessagesPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // Error pages
      {
        path: "403",
        element: (
          <SuspenseWrapper>
            <ForbiddenPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "*",
        element: (
          <SuspenseWrapper>
            <NotFoundPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);
