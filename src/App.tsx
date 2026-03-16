import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingScreen from "@/components/LoadingScreen";
import SetupRequired from "@/components/SetupRequired";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import type { UserRole } from "@/types/domain";

const DashboardLayout = lazyWithRetry(() => import("@/components/DashboardLayout"), "DashboardLayout");
const IndexPage = lazyWithRetry(() => import("@/pages/Index"), "IndexPage");
const LoginPage = lazyWithRetry(() => import("@/pages/LoginPage"), "LoginPage");
const RegisterPage = lazyWithRetry(() => import("@/pages/RegisterPage"), "RegisterPage");
const ForgotPasswordPage = lazyWithRetry(() => import("@/pages/ForgotPasswordPage"), "ForgotPasswordPage");
const DashboardPage = lazyWithRetry(() => import("@/pages/DashboardPage"), "DashboardPage");
const RoomsPage = lazyWithRetry(() => import("@/pages/landlord/RoomsPage"), "RoomsPage");
const TenantsPage = lazyWithRetry(() => import("@/pages/landlord/TenantsPage"), "TenantsPage");
const MealManagementPage = lazyWithRetry(() => import("@/pages/landlord/MealManagementPage"), "MealManagementPage");
const PaymentsPage = lazyWithRetry(() => import("@/pages/landlord/PaymentsPage"), "PaymentsPage");
const MaintenancePage = lazyWithRetry(() => import("@/pages/landlord/MaintenancePage"), "MaintenancePage");
const ReportsPage = lazyWithRetry(() => import("@/pages/landlord/ReportsPage"), "ReportsPage");
const SettingsPage = lazyWithRetry(() => import("@/pages/landlord/SettingsPage"), "SettingsPage");
const MyRoomPage = lazyWithRetry(() => import("@/pages/tenant/MyRoomPage"), "MyRoomPage");
const MyMealsPage = lazyWithRetry(() => import("@/pages/tenant/MyMealsPage"), "MyMealsPage");
const MyInvoicesPage = lazyWithRetry(() => import("@/pages/tenant/MyInvoicesPage"), "MyInvoicesPage");
const MyMaintenancePage = lazyWithRetry(() => import("@/pages/tenant/MyMaintenancePage"), "MyMaintenancePage");
const ProfilePage = lazyWithRetry(() => import("@/pages/shared/ProfilePage"), "ProfilePage");
const ChefMealPlansPage = lazyWithRetry(() => import("@/pages/chef/ChefMealPlansPage"), "ChefMealPlansPage");
const ChefPrepPage = lazyWithRetry(() => import("@/pages/chef/ChefPrepPage"), "ChefPrepPage");
const NotFound = lazyWithRetry(() => import("@/pages/NotFound"), "NotFound");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => <LoadingScreen message="Loading page..." />;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isConfigured, isLoading, isAuthenticated } = useAuth();

  if (!isConfigured) return <SetupRequired />;
  if (isLoading) return <LoadingScreen message="Checking session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isConfigured, isAuthenticated } = useAuth();

  if (!isConfigured) return <SetupRequired />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const RoleRoute = ({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}) => {
  const { activeMembership } = useAuth();

  if (!activeMembership) return <Navigate to="/dashboard" replace />;
  if (!allowedRoles.includes(activeMembership.role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading application..." />;
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <IndexPage />}
        />
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute>
              <RegisterPage />
            </AuthRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthRoute>
              <ForgotPasswordPage />
            </AuthRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/rooms"
            element={
              <RoleRoute allowedRoles={["landlord"]}>
                <RoomsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/tenants"
            element={
              <RoleRoute allowedRoles={["landlord"]}>
                <TenantsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/meals"
            element={
              <RoleRoute allowedRoles={["landlord"]}>
                <MealManagementPage />
              </RoleRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <RoleRoute allowedRoles={["landlord"]}>
                <PaymentsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <RoleRoute allowedRoles={["landlord"]}>
                <MaintenancePage />
              </RoleRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <RoleRoute allowedRoles={["landlord"]}>
                <ReportsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <RoleRoute allowedRoles={["landlord"]}>
                <SettingsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/my-room"
            element={
              <RoleRoute allowedRoles={["tenant"]}>
                <MyRoomPage />
              </RoleRoute>
            }
          />
          <Route
            path="/my-meals"
            element={
              <RoleRoute allowedRoles={["tenant"]}>
                <MyMealsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/my-invoices"
            element={
              <RoleRoute allowedRoles={["tenant"]}>
                <MyInvoicesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/my-maintenance"
            element={
              <RoleRoute allowedRoles={["tenant"]}>
                <MyMaintenancePage />
              </RoleRoute>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/chef-meals"
            element={
              <RoleRoute allowedRoles={["chef"]}>
                <ChefMealPlansPage />
              </RoleRoute>
            }
          />
          <Route
            path="/chef-prep"
            element={
              <RoleRoute allowedRoles={["chef"]}>
                <ChefPrepPage />
              </RoleRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
