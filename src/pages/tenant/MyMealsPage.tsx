import { useMemo } from "react";
import { DollarSign, Lock, Utensils } from "lucide-react";
import { toast } from "sonner";

import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { estimateMealCost, getUpcomingWindow, sumEnabledMeals } from "@/lib/business-rules";
import { formatDateLabel } from "@/lib/date";
import { useMealPlans, useMealToggles, useTenantMutations } from "@/hooks/useDormflowData";

const MyMealsPage = () => {
  const { activeMembership } = useAuth();
  const dormId = activeMembership?.dormId;
  const membershipId = activeMembership?.id;
  const upcomingDates = getUpcomingWindow().map((date) => date.toISOString().slice(0, 10));
  const startDate = upcomingDates[0];
  const endDate = upcomingDates[upcomingDates.length - 1];

  const plansQuery = useMealPlans(dormId, startDate, endDate);
  const togglesQuery = useMealToggles(dormId, membershipId, startDate, endDate, upcomingDates);
  const mutations = useTenantMutations(dormId, membershipId);

  if (plansQuery.isLoading || togglesQuery.isLoading) {
    return <LoadingScreen message="Loading meal preferences..." />;
  }

  const mealPlans = new Map((plansQuery.data ?? []).map((plan) => [plan.serviceDate, plan]));
  const toggles = togglesQuery.data ?? [];
  const totalMeals = sumEnabledMeals(toggles);
  const estimatedCost = estimateMealCost(toggles, activeMembership?.dorm.mealRate ?? 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="page-header">My Meals</h2>
        <p className="page-subheader">Toggle your meal preferences for the upcoming week.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Utensils className="h-4 w-4" />
            <p className="text-sm font-medium">Total Meals This Window</p>
          </div>
          <h3 className="text-2xl font-bold text-foreground tabular-nums">{totalMeals}</h3>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <p className="text-sm font-medium">Estimated Meal Cost</p>
          </div>
          <h3 className="text-2xl font-bold text-foreground tabular-nums">${estimatedCost.toFixed(2)}</h3>
        </div>
      </div>

      <div className="space-y-3">
        {toggles.map((toggle) => {
          const plan = mealPlans.get(toggle.serviceDate);

          return (
            <div key={toggle.id} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{formatDateLabel(toggle.serviceDate)}</h4>
                  {(toggle.breakfastLocked || toggle.lunchLocked || toggle.dinnerLocked) ? (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Some meals locked
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  ["breakfast", "breakfastEnabled", "breakfastLocked"],
                  ["lunch", "lunchEnabled", "lunchLocked"],
                  ["dinner", "dinnerEnabled", "dinnerLocked"],
                ] as const).map(([mealKey, enabledKey, lockedKey]) => (
                  <div key={mealKey} className="flex items-center justify-between p-3 rounded-lg border bg-card border-border">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{mealKey}</p>
                      <p className="text-xs text-foreground mt-0.5">{plan?.[mealKey] || "Not set"}</p>
                    </div>
                    <button
                      disabled={toggle[lockedKey]}
                      onClick={async () => {
                        try {
                          await mutations.updateMealToggle.mutateAsync({
                            toggleId: toggle.id,
                            patch: { [enabledKey]: !toggle[enabledKey] },
                          });
                        } catch (error: any) {
                          toast.error(error.message);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                        toggle[enabledKey] ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      } ${toggle[lockedKey] ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {toggle[lockedKey] ? "LOCKED" : toggle[enabledKey] ? "ON" : "OFF"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyMealsPage;
