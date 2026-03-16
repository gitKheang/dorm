import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useDormMutations, useMaintenanceForDorm } from "@/hooks/useDormflowData";
import type { MaintenanceStatus } from "@/types/domain";

const MaintenancePage = () => {
  const { activeMembership } = useAuth();
  const dormId = activeMembership?.dormId;
  const maintenanceQuery = useMaintenanceForDorm(dormId);
  const mutations = useDormMutations(dormId);
  const [filter, setFilter] = useState<"all" | MaintenanceStatus>("all");

  const tickets = maintenanceQuery.data ?? [];
  const filtered = tickets.filter((ticket) => filter === "all" || ticket.status === filter);

  const statusIcon = (status: string) => {
    if (status === "open") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (status === "in_progress") return <Clock className="h-4 w-4 text-warning" />;
    return <CheckCircle className="h-4 w-4 text-success" />;
  };

  if (maintenanceQuery.isLoading) {
    return <LoadingScreen message="Loading maintenance..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="page-header">Maintenance</h2>
        <p className="page-subheader">Track and resolve tenant maintenance requests.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm font-medium text-muted-foreground">Open</p>
          <h3 className="text-2xl font-bold text-destructive mt-1">
            {tickets.filter((ticket) => ticket.status === "open").length}
          </h3>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-muted-foreground">In Progress</p>
          <h3 className="text-2xl font-bold text-warning mt-1">
            {tickets.filter((ticket) => ticket.status === "in_progress").length}
          </h3>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-muted-foreground">Resolved</p>
          <h3 className="text-2xl font-bold text-success mt-1">
            {tickets.filter((ticket) => ticket.status === "resolved").length}
          </h3>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "open", "in_progress", "resolved"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-2 text-xs font-medium rounded-lg capitalize transition-colors ${
              filter === value
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {value.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((ticket: any) => (
          <div key={ticket.id} className="stat-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {statusIcon(ticket.status)}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
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
                  {ticket.roomNumber ? `Room ${ticket.roomNumber}` : "No room"} · {ticket.tenantName} · {ticket.category} ·{" "}
                  {ticket.createdAt.slice(0, 10)}
                </p>
              </div>
            </div>
            <select
              value={ticket.status}
              onChange={async (event) => {
                try {
                  await mutations.updateMaintenance.mutateAsync({
                    ticketId: ticket.id,
                    patch: { status: event.target.value as MaintenanceStatus },
                  });
                  toast.success("Maintenance status updated");
                } catch (error: any) {
                  toast.error(error.message);
                }
              }}
              className="text-xs px-3 py-1.5 rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenancePage;
