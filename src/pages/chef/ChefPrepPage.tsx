import { ChefHat } from "lucide-react";

import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyMealCounts, useMealPlans } from "@/hooks/useDormflowData";

const ChefPrepPage = () => {
  const { activeMembership } = useAuth();
  const dormId = activeMembership?.dormId;
  const todayIso = new Date().toISOString().slice(0, 10);
  const plansQuery = useMealPlans(dormId, todayIso, todayIso);
  const countsQuery = useDailyMealCounts(dormId, todayIso, todayIso);

  if (plansQuery.isLoading || countsQuery.isLoading) {
    return <LoadingScreen message="Loading today's prep..." />;
  }

  const plan = plansQuery.data?.[0];
  const count = countsQuery.data?.[0];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="page-header">Today&apos;s Prep</h2>
        <p className="page-subheader">Live meal counts from tenant toggles for the current day.</p>
      </div>

      <div className="space-y-4">
        {[
          { label: "Breakfast", count: count?.breakfastCount ?? 0, menu: plan?.breakfast || "Not set" },
          { label: "Lunch", count: count?.lunchCount ?? 0, menu: plan?.lunch || "Not set" },
          { label: "Dinner", count: count?.dinnerCount ?? 0, menu: plan?.dinner || "Not set" },
        ].map((meal) => (
          <div key={meal.label} className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <ChefHat className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold text-foreground">{meal.label}</h4>
                <p className="text-xs text-muted-foreground">{meal.menu}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Servings Needed</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{meal.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChefPrepPage;
