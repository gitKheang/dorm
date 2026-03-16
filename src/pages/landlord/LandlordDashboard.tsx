import { Link } from "react-router-dom";
import { AlertTriangle, Home, Receipt, Utensils } from "lucide-react";

import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/business-rules";
import { formatDateLabel, getWeekRange } from "@/lib/date";
import { useDailyMealCounts, useInvoicesForDorm, useMaintenanceForDorm, useMealPlans, useRooms } from "@/hooks/useDormflowData";

const LandlordDashboard = () => {
  const { activeMembership } = useAuth();
  const dormId = activeMembership?.dormId;
  const today = new Date();
  const weekRange = getWeekRange(today);

  const roomsQuery = useRooms(dormId);
  const invoicesQuery = useInvoicesForDorm(dormId);
  const maintenanceQuery = useMaintenanceForDorm(dormId);
  const mealPlansQuery = useMealPlans(dormId, weekRange.startIso, weekRange.endIso);
  const mealCountsQuery = useDailyMealCounts(dormId, weekRange.startIso, weekRange.endIso);

  if (
    roomsQuery.isLoading ||
    invoicesQuery.isLoading ||
    maintenanceQuery.isLoading ||
    mealPlansQuery.isLoading ||
    mealCountsQuery.isLoading
  ) {
    return <LoadingScreen message="Loading landlord dashboard..." />;
  }

  const rooms = roomsQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];
  const maintenanceTickets = maintenanceQuery.data ?? [];
  const mealPlans = mealPlansQuery.data ?? [];
  const mealCounts = mealCountsQuery.data ?? [];
  const todayIso = today.toISOString().slice(0, 10);
  const todayMeals =
    mealCounts.find((count) => count.serviceDate === todayIso) ??
    {
      breakfastCount: 0,
      lunchCount: 0,
      dinnerCount: 0,
      totalCount: 0,
    };

  const occupiedRooms = rooms.filter((room) => room.activeTenants > 0).length;
  const occupancyRate = rooms.length ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== "paid");
  const pendingAmount = pendingInvoices.reduce((sum, invoice) => sum + invoice.totalAmount - invoice.amountPaid, 0);
  const openTickets = maintenanceTickets.filter((ticket) => ticket.status !== "resolved");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header>
        <h2 className="page-header">{activeMembership?.dorm.name}</h2>
        <p className="page-subheader">Real-time overview for your active dormitory workspace.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Today's Meals"
          value={todayMeals.totalCount}
          subtext={`B: ${todayMeals.breakfastCount} · L: ${todayMeals.lunchCount} · D: ${todayMeals.dinnerCount}`}
          icon={<Utensils className="h-5 w-5" />}
        />
        <StatCard
          label="Occupancy"
          value={`${occupancyRate}%`}
          subtext={`${occupiedRooms} of ${rooms.length} rooms occupied`}
          icon={<Home className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Payments"
          value={formatCurrency(pendingAmount)}
          subtext={`${pendingInvoices.length} open invoices`}
          icon={<Receipt className="h-5 w-5" />}
        />
        <StatCard
          label="Maintenance"
          value={openTickets.length}
          subtext={`${openTickets.filter((ticket: any) => ticket.priority === "high").length} high priority`}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 stat-card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h4 className="font-semibold text-foreground">This Week&apos;s Meal Plan</h4>
            <Link to="/meals" className="text-sm font-medium text-primary hover:underline">
              Manage Plans
            </Link>
          </div>
          {mealPlans.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 table-header">Date</th>
                    <th className="px-6 py-3 table-header">Breakfast</th>
                    <th className="px-6 py-3 table-header">Lunch</th>
                    <th className="px-6 py-3 table-header">Dinner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mealPlans.map((mealPlan) => (
                    <tr key={mealPlan.serviceDate} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-foreground">{formatDateLabel(mealPlan.serviceDate)}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{mealPlan.breakfast || "Not set"}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{mealPlan.lunch || "Not set"}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{mealPlan.dinner || "Not set"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                title="No meal plan for this week"
                description="Create a weekly plan so tenants and chefs can view upcoming meals."
                action={
                  <Link to="/meals" className="auth-button max-w-fit">
                    Create meal plan
                  </Link>
                }
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Link to="/tenants" className="block w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-center">
            Invite Tenant or Chef
          </Link>
          <Link to="/payments" className="block w-full py-3 px-4 bg-card border border-border text-foreground rounded-lg font-medium text-center">
            Generate Invoices
          </Link>
          <Link to="/maintenance" className="block w-full py-3 px-4 bg-card border border-border text-foreground rounded-lg font-medium text-center">
            Review Maintenance
          </Link>

          <div className="stat-card p-0">
            <div className="px-4 py-3 border-b border-border">
              <h5 className="text-sm font-semibold text-foreground">Open Invoices</h5>
            </div>
            <div className="divide-y divide-border">
              {pendingInvoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-foreground">{invoice.tenantName || "Tenant"}</p>
                    <p className="text-xs text-muted-foreground">{invoice.billingMonth}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(invoice.totalAmount - invoice.amountPaid)}
                    </p>
                    <span className={invoice.status === "overdue" ? "badge-unpaid" : "badge-pending"}>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          invoice.status === "overdue" ? "bg-destructive" : "bg-warning"
                        }`}
                      />
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
              {!pendingInvoices.length ? (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">No pending invoices.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
