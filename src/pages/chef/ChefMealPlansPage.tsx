import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateLabel, getWeekRange } from "@/lib/date";
import { useDormMutations, useMealPlans } from "@/hooks/useDormflowData";
import type { MealPlan } from "@/types/domain";

  const ChefMealPlansPage = () => {
    const { activeMembership, user } = useAuth();
    const dormId = activeMembership?.dormId;
    const weekRange = useMemo(() => getWeekRange(), []);
  const plansQuery = useMealPlans(dormId, weekRange.startIso, weekRange.endIso);
  const mutations = useDormMutations(dormId);
  const [draftPlans, setDraftPlans] = useState<Array<Pick<MealPlan, "serviceDate" | "breakfast" | "lunch" | "dinner">>>([]);

  useEffect(() => {
    if (!plansQuery.data) return;
    setDraftPlans(
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekRange.start);
        date.setDate(weekRange.start.getDate() + index);
        const serviceDate = date.toISOString().slice(0, 10);
        const existing = plansQuery.data?.find((plan) => plan.serviceDate === serviceDate);
        return {
          serviceDate,
          breakfast: existing?.breakfast || "",
          lunch: existing?.lunch || "",
          dinner: existing?.dinner || "",
        };
      }),
    );
  }, [plansQuery.data, weekRange.start]);

  if (plansQuery.isLoading) {
    return <LoadingScreen message="Loading chef meal plans..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="page-header">Meal Plans</h2>
        <p className="page-subheader">Coordinate the weekly menu with live plan edits.</p>
      </div>

      <div className="stat-card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h4 className="font-semibold text-foreground">Weekly Menu</h4>
          <button
            onClick={async () => {
              try {
                await mutations.saveMealPlans.mutateAsync({
                  createdBy: user!.id,
                  plans: draftPlans,
                });
                toast.success("Meal plan saved");
              } catch (error: any) {
                toast.error(error.message);
              }
            }}
            disabled={mutations.saveMealPlans.isPending}
            className="auth-button w-auto min-w-[10rem] px-4 py-2"
          >
            {mutations.saveMealPlans.isPending ? "Saving..." : "Save"}
          </button>
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
                        className="w-full h-10 px-3 border border-input rounded-lg bg-card text-sm"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChefMealPlansPage;
