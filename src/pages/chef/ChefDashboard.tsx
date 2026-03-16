import StatCard from "@/components/StatCard";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateLabel, getWeekRange } from "@/lib/date";
import { useDailyMealCounts, useMealPlans } from "@/hooks/useDormflowData";
import { ChefHat, Utensils } from "lucide-react";

const ChefDashboard = () => {
  const { activeMembership } = useAuth();
  const dormId = activeMembership?.dormId;
  const weekRange = getWeekRange();
  const plansQuery = useMealPlans(dormId, weekRange.startIso, weekRange.endIso);
  const countsQuery = useDailyMealCounts(dormId, weekRange.startIso, weekRange.endIso);

  if (plansQuery.isLoading || countsQuery.isLoading) {
    return <LoadingScreen message="Loading chef dashboard..." />;
  }

  const plans = plansQuery.data ?? [];
  const counts = countsQuery.data ?? [];
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayCount = counts.find((entry) => entry.serviceDate === todayIso);
  const todayPlan = plans.find((entry) => entry.serviceDate === todayIso);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <h2 className="page-header">Chef Dashboard</h2>
        <p className="page-subheader">Today&apos;s prep counts and this week&apos;s live menu.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Meals Today" value={todayCount?.totalCount ?? 0} icon={<Utensils className="h-5 w-5" />} />
        <StatCard label="Breakfast Count" value={todayCount?.breakfastCount ?? 0} subtext={todayPlan?.breakfast || "Menu not set"} />
        <StatCard label="Lunch Count" value={todayCount?.lunchCount ?? 0} subtext={todayPlan?.lunch || "Menu not set"} />
      </div>

      <div className="stat-card">
        <h4 className="font-semibold text-foreground mb-4">Today&apos;s Meal Counts</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Breakfast", count: todayCount?.breakfastCount ?? 0, menu: todayPlan?.breakfast || "Not set" },
            { label: "Lunch", count: todayCount?.lunchCount ?? 0, menu: todayPlan?.lunch || "Not set" },
            { label: "Dinner", count: todayCount?.dinnerCount ?? 0, menu: todayPlan?.dinner || "Not set" },
          ].map((meal) => (
            <div key={meal.label} className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{meal.label}</span>
                <ChefHat className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground tabular-nums">{meal.count}</p>
              <p className="text-sm text-muted-foreground mt-1">{meal.menu}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="stat-card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h4 className="font-semibold text-foreground">This Week&apos;s Meal Plan</h4>
        </div>
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
              {plans.map((plan) => (
                <tr key={plan.serviceDate} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-foreground">{formatDateLabel(plan.serviceDate)}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{plan.breakfast || "Not set"}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{plan.lunch || "Not set"}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{plan.dinner || "Not set"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;
