import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useMaintenanceForMembership, useTenantMutations } from "@/hooks/useDormflowData";
import type { MaintenancePriority } from "@/types/domain";

const MyMaintenancePage = () => {
  const { activeMembership } = useAuth();
  const maintenanceQuery = useMaintenanceForMembership(activeMembership?.id);
  const mutations = useTenantMutations(activeMembership?.dormId, activeMembership?.id);

  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("plumbing");
  const [priority, setPriority] = useState<MaintenancePriority>("medium");

  if (maintenanceQuery.isLoading) {
    return <LoadingScreen message="Loading maintenance requests..." />;
  }

  const tickets = maintenanceQuery.data ?? [];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await mutations.createMaintenance.mutateAsync({
        category,
        description,
        priority,
      });
      setDescription("");
      setCategory("plumbing");
      setPriority("medium");
      setShowForm(false);
      toast.success("Maintenance request submitted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-header">Maintenance Requests</h2>
          <p className="page-subheader">Submit issues and track progress in real time.</p>
        </div>
        <button
          onClick={() => setShowForm((current) => !current)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> New Request
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="stat-card space-y-4">
          <h4 className="font-semibold text-foreground">New Maintenance Request</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm"
            >
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="furniture">Furniture</option>
              <option value="other">Other</option>
            </select>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as MaintenancePriority)}
              className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-input rounded-lg bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            placeholder="Describe the issue..."
            required
          />
          <div className="flex gap-2">
            <button type="submit" disabled={mutations.createMaintenance.isPending} className="auth-button max-w-fit">
              {mutations.createMaintenance.isPending ? "Submitting..." : "Submit"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="auth-button-outline max-w-fit">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="stat-card flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{ticket.description}</h4>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                    ticket.priority === "high"
                      ? "bg-destructive/10 text-destructive"
                      : ticket.priority === "medium"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {ticket.priority}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {ticket.category} · {ticket.createdAt.slice(0, 10)} · <span className="capitalize">{ticket.status.replace("_", " ")}</span>
              </p>
            </div>
          </div>
        ))}
        {!tickets.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">No maintenance requests yet.</p>
        ) : null}
      </div>
    </div>
  );
};

export default MyMaintenancePage;
