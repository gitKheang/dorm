import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingScreen from "@/components/LoadingScreen";
import SetupRequired from "@/components/SetupRequired";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/domain";

const DashboardLayout = lazy(() => import("@/components/DashboardLayout"));
const IndexPage = lazy(() => import("@/pages/Index"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const RoomsPage = lazy(() => import("@/pages/landlord/RoomsPage"));
const TenantsPage = lazy(() => import("@/pages/landlord/TenantsPage"));
const MealManagementPage = lazy(() => import("@/pages/landlord/MealManagementPage"));
const PaymentsPage = lazy(() => import("@/pages/landlord/PaymentsPage"));
const MaintenancePage = lazy(() => import("@/pages/landlord/MaintenancePage"));
const ReportsPage = lazy(() => import("@/pages/landlord/ReportsPage"));
const SettingsPage = lazy(() => import("@/pages/landlord/SettingsPage"));
const MyRoomPage = lazy(() => import("@/pages/tenant/MyRoomPage"));
const MyMealsPage = lazy(() => import("@/pages/tenant/MyMealsPage"));
const MyInvoicesPage = lazy(() => import("@/pages/tenant/MyInvoicesPage"));
const MyMaintenancePage = lazy(() => import("@/pages/tenant/MyMaintenancePage"));
const ProfilePage = lazy(() => import("@/pages/shared/ProfilePage"));
const ChefMealPlansPage = lazy(() => import("@/pages/chef/ChefMealPlansPage"));
const ChefPrepPage = lazy(() => import("@/pages/chef/ChefPrepPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

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
