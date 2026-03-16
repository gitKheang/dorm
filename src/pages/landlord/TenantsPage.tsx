import { useMemo, useState } from "react";
import { Link2, Mail, Plus, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useDormMutations, useInvitations, useMemberDirectory, useRooms } from "@/hooks/useDormflowData";
import { toDateInputValue } from "@/lib/date";
import type { AssignmentFormValues, InviteFormValues, UserRole } from "@/types/domain";

const inviteDefaults: InviteFormValues = {
  email: "",
  role: "tenant",
};

const assignmentDefaults = (roomId = "", tenantMembershipId = ""): AssignmentFormValues => ({
  roomId,
  tenantMembershipId,
  startDate: toDateInputValue(),
  endDate: null,
});

const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

const TenantsPage = () => {
  const { activeMembership, user } = useAuth();
  const dormId = activeMembership?.dormId;

  const membersQuery = useMemberDirectory(dormId);
  const roomsQuery = useRooms(dormId);
  const invitationsQuery = useInvitations(dormId);
  const mutations = useDormMutations(dormId);

  const [searchTerm, setSearchTerm] = useState("");
  const [inviteForm, setInviteForm] = useState<InviteFormValues>(inviteDefaults);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormValues | null>(null);

  const members = membersQuery.data ?? [];
  const rooms = roomsQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];

  const staffAndTenants = useMemo(
    () =>
      members.filter((entry) => {
        if (entry.role === "landlord") return false;
        const haystack = `${entry.firstName} ${entry.lastName} ${entry.email}`.toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
      }),
    [members, searchTerm],
  );

  const availableRooms = rooms.filter((room) => room.status !== "maintenance" && room.activeTenants < room.capacity);

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const invitation = await mutations.inviteMember.mutateAsync({
        values: inviteForm,
        invitedBy: user!.id,
      });

      await navigator.clipboard.writeText(`${appUrl}/register?invite=${invitation.inviteToken}`);
      setInviteForm(inviteDefaults);
      toast.success("Invitation created and link copied to clipboard");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assignmentForm) return;

    try {
      await mutations.assignRoom.mutateAsync(assignmentForm);
      setAssignmentForm(null);
      toast.success("Room assignment updated");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (membersQuery.isLoading || roomsQuery.isLoading || invitationsQuery.isLoading) {
    return <LoadingScreen message="Loading tenants..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="page-header">People & Assignments</h2>
          <p className="page-subheader">
            Manage invited users, room assignments, and active tenant records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form onSubmit={handleInvite} className="stat-card space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Invite tenant or chef</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="email"
              required
              placeholder="email@example.com"
              value={inviteForm.email}
              onChange={(event) => setInviteForm({ ...inviteForm, email: event.target.value })}
              className="h-10 px-4 border border-input rounded-lg bg-card text-sm"
            />
            <select
              value={inviteForm.role}
              onChange={(event) => setInviteForm({ ...inviteForm, role: event.target.value as UserRole })}
              className="h-10 px-4 border border-input rounded-lg bg-card text-sm"
            >
              <option value="tenant">Tenant</option>
              <option value="chef">Chef</option>
            </select>
          </div>
          <button type="submit" disabled={mutations.inviteMember.isPending} className="auth-button max-w-fit">
            {mutations.inviteMember.isPending ? "Creating invite..." : "Create invite link"}
          </button>
        </form>

        <div className="stat-card space-y-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Recent invitations</h3>
          </div>
          <div className="space-y-3">
            {invitations.slice(0, 5).map((invitation) => (
              <div key={invitation.id} className="p-3 rounded-lg border border-border flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{invitation.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {invitation.role} · {invitation.status}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${appUrl}/register?invite=${invitation.inviteToken}`);
                    toast.success("Invite link copied");
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Copy link
                </button>
              </div>
            ))}
            {!invitations.length ? (
              <p className="text-sm text-muted-foreground">No invitations sent yet.</p>
            ) : null}
          </div>
        </div>
      </div>

      {assignmentForm ? (
        <form onSubmit={handleAssignment} className="stat-card grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={assignmentForm.tenantMembershipId}
            onChange={(event) =>
              setAssignmentForm({ ...assignmentForm, tenantMembershipId: event.target.value })
            }
            className="h-10 px-4 border border-input rounded-lg bg-card text-sm"
          >
            {staffAndTenants
              .filter((entry) => entry.role === "tenant")
              .map((entry) => (
                <option key={entry.membershipId} value={entry.membershipId}>
                  {entry.firstName} {entry.lastName}
                </option>
              ))}
          </select>
          <select
            value={assignmentForm.roomId}
            onChange={(event) => setAssignmentForm({ ...assignmentForm, roomId: event.target.value })}
            className="h-10 px-4 border border-input rounded-lg bg-card text-sm"
          >
            {availableRooms.map((room) => (
              <option key={room.id} value={room.id}>
                Room {room.number}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={assignmentForm.startDate}
            onChange={(event) => setAssignmentForm({ ...assignmentForm, startDate: event.target.value })}
            className="h-10 px-4 border border-input rounded-lg bg-card text-sm"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setAssignmentForm(null)} className="auth-button-outline px-4">
              Cancel
            </button>
            <button type="submit" disabled={mutations.assignRoom.isPending} className="auth-button px-4">
              {mutations.assignRoom.isPending ? "Saving..." : "Assign room"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search people..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full h-10 pl-10 pr-4 border border-input rounded-lg bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {staffAndTenants.length ? (
        <div className="stat-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 table-header">Person</th>
                  <th className="px-6 py-3 table-header">Role</th>
                  <th className="px-6 py-3 table-header">Room</th>
                  <th className="px-6 py-3 table-header">Contact</th>
                  <th className="px-6 py-3 table-header">Move In</th>
                  <th className="px-6 py-3 table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffAndTenants.map((entry) => (
                  <tr key={entry.membershipId} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {entry.firstName} {entry.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{entry.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-foreground">{entry.role}</td>
                    <td className="px-6 py-4 text-foreground">
                      {entry.roomNumber ? `Room ${entry.roomNumber}` : "Unassigned"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{entry.phone || entry.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{entry.startDate || "-"}</td>
                    <td className="px-6 py-4">
                      {entry.role === "tenant" ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              setAssignmentForm(
                                assignmentDefaults(entry.roomId || availableRooms[0]?.id || "", entry.membershipId),
                              )
                            }
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            {entry.roomId ? "Reassign" : "Assign room"}
                          </button>
                          {entry.assignmentId ? (
                            <button
                              onClick={async () => {
                                try {
                                  await mutations.moveOut.mutateAsync({
                                    assignmentId: entry.assignmentId!,
                                    endDate: toDateInputValue(),
                                  });
                                  toast.success("Tenant moved out");
                                } catch (error: any) {
                                  toast.error(error.message);
                                }
                              }}
                              className="text-xs font-medium text-destructive hover:underline"
                            >
                              Move out
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Chef assignment optional</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No people found"
          description="Invite tenants or chefs to start managing assignments."
          action={
            <button onClick={() => setInviteForm(inviteDefaults)} className="auth-button max-w-fit">
              Invite person
            </button>
          }
        />
      )}
    </div>
  );
};

export default TenantsPage;
