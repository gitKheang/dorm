import { Home, Receipt, Utensils, Wrench } from "lucide-react";

import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { getUpcomingWindow } from "@/lib/business-rules";
import { formatDateLabel } from "@/lib/date";
import { useInvoicesForMembership, useMaintenanceForMembership, useMealPlans, useMealToggles, useMemberDirectory } from "@/hooks/useDormflowData";

const TenantDashboard = () => {
  const { activeMembership } = useAuth();
  const dormId = activeMembership?.dormId;
  const membershipId = activeMembership?.id;
  const upcomingDates = getUpcomingWindow().map((date) => date.toISOString().slice(0, 10));
  const startDate = upcomingDates[0];
  const endDate = upcomingDates[upcomingDates.length - 1];

  const membersQuery = useMemberDirectory(dormId);
  const invoicesQuery = useInvoicesForMembership(membershipId);
  const maintenanceQuery = useMaintenanceForMembership(membershipId);
  const mealPlansQuery = useMealPlans(dormId, startDate, endDate);
  const mealTogglesQuery = useMealToggles(dormId, membershipId, startDate, endDate, upcomingDates);

  if (
    membersQuery.isLoading ||
    invoicesQuery.isLoading ||
    maintenanceQuery.isLoading ||
    mealPlansQuery.isLoading ||
    mealTogglesQuery.isLoading
  ) {
    return <LoadingScreen message="Loading tenant dashboard..." />;
  }

  const member = (membersQuery.data ?? []).find((entry) => entry.membershipId === membershipId);
  const invoices = invoicesQuery.data ?? [];
  const maintenance = maintenanceQuery.data ?? [];
  const mealPlans = mealPlansQuery.data ?? [];
  const mealToggles = mealTogglesQuery.data ?? [];
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayMeals = mealToggles.find((toggle) => toggle.serviceDate === todayIso);
  const todayPlan = mealPlans.find((plan) => plan.serviceDate === todayIso);

  if (!member) {
    return (
      <EmptyState
        title="Your dorm access is still being prepared"
        description="Ask your landlord to assign your account to a room or resend your invitation."
      />
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <h2 className="page-header">Welcome back, {member.firstName}</h2>
        <p className="page-subheader">Here&apos;s your room, meals, billing, and maintenance summary.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My Room"
          value={member.roomNumber ? `Room ${member.roomNumber}` : "Unassigned"}
          subtext={member.roomFloor ? `Floor ${member.roomFloor}` : "Waiting for assignment"}
          icon={<Home className="h-5 w-5" />}
        />
        <StatCard
          label="Today's Meals"
          value={
            todayMeals
              ? Number(todayMeals.breakfastEnabled) + Number(todayMeals.lunchEnabled) + Number(todayMeals.dinnerEnabled)
              : 0
          }
          subtext="Meals opted in"
          icon={<Utensils className="h-5 w-5" />}
        />
        <StatCard
          label="Current Invoice"
          value={`$${(invoices.find((invoice) => invoice.status !== "paid")?.totalAmount || 0).toFixed(2)}`}
          subtext={invoices.find((invoice) => invoice.status !== "paid")?.dueDate || "All paid"}
          icon={<Receipt className="h-5 w-5" />}
        />
        <StatCard
          label="Maintenance"
          value={maintenance.filter((ticket) => ticket.status !== "resolved").length}
          subtext="Open requests"
          icon={<Wrench className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h4 className="font-semibold text-foreground mb-4">Today&apos;s Meals</h4>
          <div className="space-y-3">
            {(["breakfast", "lunch", "dinner"] as const).map((mealKey) => (
              <div key={mealKey} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{mealKey}</p>
                  <p className="text-sm font-medium text-foreground">{todayPlan?.[mealKey] || "Not set yet"}</p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    todayMeals?.[`${mealKey}Enabled` as keyof typeof todayMeals]
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {todayMeals?.[`${mealKey}Enabled` as keyof typeof todayMeals] ? "ON" : "OFF"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h4 className="font-semibold text-foreground">Upcoming Meal Window</h4>
          </div>
          <div className="divide-y divide-border">
            {mealToggles.slice(0, 4).map((toggle) => (
              <div key={toggle.id} className="px-6 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-foreground">{formatDateLabel(toggle.serviceDate)}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(toggle.breakfastEnabled) + Number(toggle.lunchEnabled) + Number(toggle.dinnerEnabled)} meals selected
                  </p>
                </div>
                <span className={toggle.breakfastLocked || toggle.lunchLocked || toggle.dinnerLocked ? "badge-pending" : "badge-paid"}>
                  <span className={`w-1.5 h-1.5 rounded-full ${(toggle.breakfastLocked || toggle.lunchLocked || toggle.dinnerLocked) ? "bg-warning" : "bg-success"}`} />
                  {(toggle.breakfastLocked || toggle.lunchLocked || toggle.dinnerLocked) ? "locked" : "editable"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
