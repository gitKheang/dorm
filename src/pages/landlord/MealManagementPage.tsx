import { useEffect, useMemo, useState } from "react";
import { Clock, Utensils } from "lucide-react";
import { toast } from "sonner";

import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateLabel, getWeekRange } from "@/lib/date";
import { useDailyMealCounts, useDormMutations, useMealPlans, useMemberDirectory } from "@/hooks/useDormflowData";
import type { MealPlan } from "@/types/domain";

const MealManagementPage = () => {
  const { activeMembership, user } = useAuth();
  const dormId = activeMembership?.dormId;
  const weekRange = getWeekRange();

  const membersQuery = useMemberDirectory(dormId);
  const plansQuery = useMealPlans(dormId, weekRange.startIso, weekRange.endIso);
  const countsQuery = useDailyMealCounts(dormId, weekRange.startIso, weekRange.endIso);
  const mutations = useDormMutations(dormId);

  const [draftPlans, setDraftPlans] = useState<Array<Pick<MealPlan, "serviceDate" | "breakfast" | "lunch" | "dinner">>>([]);

  useEffect(() => {
    if (!plansQuery.data) return;

    const existingPlans = new Map(plansQuery.data.map((plan) => [plan.serviceDate, plan]));
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekRange.start);
      date.setDate(weekRange.start.getDate() + index);
      const serviceDate = date.toISOString().slice(0, 10);
      const existing = existingPlans.get(serviceDate);

      return {
        serviceDate,
        breakfast: existing?.breakfast || "",
        lunch: existing?.lunch || "",
        dinner: existing?.dinner || "",
      };
    });

    setDraftPlans(days);
  }, [plansQuery.data, weekRange.start]);

  const counts = countsQuery.data ?? [];
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayCount = counts.find((entry) => entry.serviceDate === todayIso);
  const tenants = (membersQuery.data ?? []).filter((entry) => entry.role === "tenant");

  const handleSave = async () => {
    try {
      await mutations.saveMealPlans.mutateAsync({
        createdBy: user!.id,
        plans: draftPlans,
      });
      toast.success("Meal plan saved");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (membersQuery.isLoading || plansQuery.isLoading || countsQuery.isLoading) {
    return <LoadingScreen message="Loading meal management..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="page-header">Meal Management</h2>
        <p className="page-subheader">Configure weekly plans, cutoffs, and live serving counts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Meals Today" value={todayCount?.totalCount ?? 0} icon={<Utensils className="h-5 w-5" />} />
        <StatCard label="Breakfast" value={todayCount?.breakfastCount ?? 0} subtext={`of ${tenants.length} tenants`} />
        <StatCard label="Lunch" value={todayCount?.lunchCount ?? 0} subtext={`of ${tenants.length} tenants`} />
        <StatCard label="Dinner" value={todayCount?.dinnerCount ?? 0} subtext={`of ${tenants.length} tenants`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="stat-card">
          <h4 className="font-semibold text-foreground mb-3">Meal Pricing</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billing Cycle</span>
              <span className="font-medium text-foreground capitalize">{activeMembership?.dorm.billingCycle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate per Meal</span>
              <span className="font-semibold text-foreground">${activeMembership?.dorm.mealRate.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <h4 className="font-semibold text-foreground mb-3">Cut-off Settings</h4>
          <div className="space-y-3 text-sm">
            {[
              ["Breakfast", activeMembership?.dorm.breakfastCutoff],
              ["Lunch", activeMembership?.dorm.lunchCutoff],
              ["Dinner", activeMembership?.dorm.dinnerCutoff],
            ].map(([label, time]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-muted-foreground">{label} Cut-off</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="stat-card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-foreground">Weekly Meal Plan</h4>
            <p className="text-xs text-muted-foreground mt-1">Changes save directly to Supabase.</p>
          </div>
          <button onClick={handleSave} disabled={mutations.saveMealPlans.isPending} className="auth-button px-4 py-2">
            {mutations.saveMealPlans.isPending ? "Saving..." : "Save Week"}
          </button>
        </div>
        {draftPlans.length ? (
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
                {draftPlans.map((plan, index) => (
                  <tr key={plan.serviceDate} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-foreground">{formatDateLabel(plan.serviceDate)}</td>
                    {(["breakfast", "lunch", "dinner"] as const).map((mealKey) => (
                      <td key={mealKey} className="px-6 py-3.5">
                        <input
                          value={plan[mealKey]}
                          onChange={(event) => {
                            const next = [...draftPlans];
                            next[index] = { ...next[index], [mealKey]: event.target.value };
                            setDraftPlans(next);
                          }}
                          placeholder={`Set ${mealKey}`}
                          className="w-full h-10 px-3 border border-input rounded-lg bg-card text-sm"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No dates in this week"
              description="The selected week is empty. Refresh the page and try again."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MealManagementPage;
