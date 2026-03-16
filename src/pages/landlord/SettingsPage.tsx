import { useEffect, useState } from "react";
import { Building2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useDormMutations, useEntitlement } from "@/hooks/useDormflowData";
import type { DormFormValues } from "@/types/domain";

const defaultDormForm: DormFormValues = {
  name: "",
  address: "",
  contact: "",
  mealRate: 0,
  billingCycle: "monthly",
  breakfastCutoff: "20:00",
  lunchCutoff: "20:00",
  dinnerCutoff: "20:00",
};

const SettingsPage = () => {
  const { activeMembership, actionLoading, createDorm } = useAuth();
  const dormId = activeMembership?.dormId;
  const entitlementQuery = useEntitlement(dormId);
  const mutations = useDormMutations(dormId);

  const [form, setForm] = useState<DormFormValues>(defaultDormForm);
  const [newDormForm, setNewDormForm] = useState<DormFormValues>(defaultDormForm);

  useEffect(() => {
    if (!activeMembership) return;
    setForm({
      name: activeMembership.dorm.name,
      address: activeMembership.dorm.address,
      contact: activeMembership.dorm.contact,
      mealRate: activeMembership.dorm.mealRate,
      billingCycle: activeMembership.dorm.billingCycle,
      breakfastCutoff: activeMembership.dorm.breakfastCutoff,
      lunchCutoff: activeMembership.dorm.lunchCutoff,
      dinnerCutoff: activeMembership.dorm.dinnerCutoff,
    });
  }, [activeMembership]);

  if (entitlementQuery.isLoading) {
    return <LoadingScreen message="Loading settings..." />;
  }

  const entitlement = entitlementQuery.data;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h2 className="page-header">Dorm Settings</h2>
        <p className="page-subheader">Configure dormitory details, billing, and meal cutoffs.</p>
      </div>

      <div className="stat-card space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Dormitory Profile</h3>
        </div>

        <div className="space-y-4">
          {[
            ["Dorm Name", "name"],
            ["Address", "address"],
            ["Contact", "contact"],
          ].map(([label, field]) => (
            <div key={field}>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
              <input
                value={(form as any)[field]}
                onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="stat-card space-y-5">
        <h3 className="text-lg font-semibold text-foreground">Billing & Meal Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Billing Cycle</label>
            <select
              value={form.billingCycle}
              onChange={(event) => setForm({ ...form, billingCycle: event.target.value as DormFormValues["billingCycle"] })}
              className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Rate per Meal ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.mealRate}
              onChange={(event) => setForm({ ...form, mealRate: Number(event.target.value) })}
              className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {[
            ["Breakfast cutoff", "breakfastCutoff"],
            ["Lunch cutoff", "lunchCutoff"],
            ["Dinner cutoff", "dinnerCutoff"],
          ].map(([label, field]) => (
            <div key={field}>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
              <input
                type="time"
                value={(form as any)[field]}
                onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      </div>

      {entitlement ? (
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-3">Plan Entitlements</h3>
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div>
              <p className="font-semibold text-foreground capitalize">{entitlement.planTier} plan</p>
              <p className="text-sm text-muted-foreground">
                Up to {entitlement.roomLimit} rooms · Reports {entitlement.reportsEnabled ? "enabled" : "disabled"}
              </p>
            </div>
            <span className="badge-active">Active</span>
          </div>
        </div>
      ) : null}

      <div className="stat-card space-y-5">
        <div className="flex items-center gap-3">
          <Plus className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Create another dorm</h3>
            <p className="text-sm text-muted-foreground">
              Use this if one landlord manages multiple dorms in different places. The new dorm
              will appear in the active dorm switcher after creation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Dorm Name</label>
            <input
              value={newDormForm.name}
              onChange={(event) => setNewDormForm({ ...newDormForm, name: event.target.value })}
              className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Address</label>
            <input
              value={newDormForm.address}
              onChange={(event) => setNewDormForm({ ...newDormForm, address: event.target.value })}
              className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Contact</label>
            <input
              value={newDormForm.contact}
              onChange={(event) => setNewDormForm({ ...newDormForm, contact: event.target.value })}
              className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Billing Cycle</label>
            <select
              value={newDormForm.billingCycle}
              onChange={(event) =>
                setNewDormForm({
                  ...newDormForm,
                  billingCycle: event.target.value as DormFormValues["billingCycle"],
                })
              }
              className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Rate per Meal ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newDormForm.mealRate}
              onChange={(event) => setNewDormForm({ ...newDormForm, mealRate: Number(event.target.value) })}
              className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <button
          onClick={async () => {
            try {
              await createDorm(newDormForm);
              setNewDormForm(defaultDormForm);
            } catch (error: any) {
              toast.error(error.message);
            }
          }}
          disabled={actionLoading || !newDormForm.name.trim()}
          className="auth-button disabled:opacity-70"
        >
          <Plus className="h-4 w-4" /> {actionLoading ? "Creating..." : "Create Dorm"}
        </button>
      </div>

      <button
        onClick={async () => {
          try {
            await mutations.updateDorm.mutateAsync(form);
            toast.success("Settings updated");
          } catch (error: any) {
            toast.error(error.message);
          }
        }}
        disabled={mutations.updateDorm.isPending}
        className="auth-button disabled:opacity-70"
      >
        <Save className="h-4 w-4" /> {mutations.updateDorm.isPending ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default SettingsPage;
