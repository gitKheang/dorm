import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Building2,
  ChefHat,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Search,
  Settings,
  Users,
  Utensils,
  Wrench,
} from "lucide-react";
import { useState } from "react";

import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/domain";

const navConfig: Record<UserRole, { label: string; href: string; icon: React.ElementType }[]> = {
  landlord: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Home, label: "Rooms", href: "/rooms" },
    { icon: Users, label: "Tenants", href: "/tenants" },
    { icon: Utensils, label: "Meal Management", href: "/meals" },
    { icon: Receipt, label: "Payments", href: "/payments" },
    { icon: Wrench, label: "Maintenance", href: "/maintenance" },
    { icon: BarChart3, label: "Reports", href: "/reports" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
  tenant: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Home, label: "My Room", href: "/my-room" },
    { icon: Utensils, label: "My Meals", href: "/my-meals" },
    { icon: Receipt, label: "Invoices", href: "/my-invoices" },
    { icon: Wrench, label: "Maintenance", href: "/my-maintenance" },
    { icon: Settings, label: "Profile", href: "/profile" },
  ],
  chef: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Utensils, label: "Meal Plans", href: "/chef-meals" },
    { icon: ChefHat, label: "Today's Prep", href: "/chef-prep" },
    { icon: Settings, label: "Profile", href: "/profile" },
  ],
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, memberships, activeMembership, switchMembership, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const items = activeMembership ? navConfig[activeMembership.role] : [];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto
      `}
      >
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-semibold tracking-tight text-foreground">DormFlow</span>
          </div>

          {memberships.length ? (
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block mb-2">
                Active Dorm
              </label>
              <select
                value={activeMembership?.id ?? ""}
                onChange={(event) => switchMembership(event.target.value)}
                className="w-full h-10 px-3 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {memberships.map((membership) => (
                  <option key={membership.id} value={membership.id}>
                    {membership.dorm.name} · {membership.role}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive ? "nav-item-active" : "nav-item-inactive"}`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="nav-item nav-item-inactive w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-64 lg:w-80">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-muted relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                {user?.firstName?.[0] || "U"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user?.firstName || "User"}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {activeMembership?.role || "No membership"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {activeMembership || location.pathname === "/dashboard" ? (
            <Outlet />
          ) : (
            <EmptyState
              title="No active dorm yet"
              description="Create a dorm or accept an invitation before accessing workspace pages."
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
