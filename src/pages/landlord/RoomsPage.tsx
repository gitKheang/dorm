import { useMemo, useState } from "react";
import { Home, Pencil, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/business-rules";
import { useDormMutations, useEntitlement, useRooms } from "@/hooks/useDormflowData";
import type { RoomFormValues, RoomStatus } from "@/types/domain";

const defaultForm: RoomFormValues = {
  number: "",
  floor: 1,
  capacity: 2,
  monthlyRent: 0,
  status: "available",
};

const RoomsPage = () => {
  const { activeMembership } = useAuth();
  const dormId = activeMembership?.dormId;
  const roomsQuery = useRooms(dormId);
  const entitlementQuery = useEntitlement(dormId);
  const mutations = useDormMutations(dormId);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | RoomStatus>("all");
  const [editing, setEditing] = useState<RoomFormValues | null>(null);

  const rooms = roomsQuery.data ?? [];
  const entitlement = entitlementQuery.data;

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) => {
        if (filter !== "all" && room.status !== filter) return false;
        if (searchTerm && !room.number.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      }),
    [filter, rooms, searchTerm],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;

    try {
      await mutations.saveRoom.mutateAsync(editing);
      setEditing(null);
      toast.success("Room saved");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (roomsQuery.isLoading || entitlementQuery.isLoading) {
    return <LoadingScreen message="Loading rooms..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="page-header">Rooms</h2>
          <p className="page-subheader">
            {rooms.length} rooms configured
            {entitlement ? ` · ${rooms.length}/${entitlement.roomLimit} plan limit used` : ""}
          </p>
        </div>
        <button
          onClick={() => setEditing(defaultForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" /> Add Room
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="stat-card grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            required
            placeholder="Room number"
            value={editing.number}
            onChange={(event) => setEditing({ ...editing, number: event.target.value })}
            className="h-10 px-4 border border-input rounded-lg bg-card text-sm"
          />
          <input
            type="number"
            min="1"
            value={editing.floor}
            onChange={(event) => setEditing({ ...editing, floor: Number(event.target.value) })}
            className="h-10 px-4 border border-input rounded-lg bg-card text-sm"
          />
          <input
            type="number"
            min="1"
            value={editing.capacity}
            onChange={(event) => setEditing({ ...editing, capacity: Number(event.target.value) })}
            className="h-10 px-4 border border-input rounded-lg bg-card text-sm"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={editing.monthlyRent}
            onChange={(event) => setEditing({ ...editing, monthlyRent: Number(event.target.value) })}
            className="h-10 px-4 border border-input rounded-lg bg-card text-sm"
          />
          <select
            value={editing.status}
            onChange={(event) => setEditing({ ...editing, status: event.target.value as RoomStatus })}
            className="h-10 px-4 border border-input rounded-lg bg-card text-sm"
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <div className="md:col-span-5 flex gap-2 justify-end">
            <button type="button" onClick={() => setEditing(null)} className="auth-button-outline px-4">
              Cancel
            </button>
            <button type="submit" disabled={mutations.saveRoom.isPending} className="auth-button px-4">
              {mutations.saveRoom.isPending ? "Saving..." : "Save Room"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search room number..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full h-10 pl-10 pr-4 border border-input rounded-lg bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "available", "occupied", "maintenance"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-2 text-xs font-medium rounded-lg capitalize transition-colors ${
                filter === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {filteredRooms.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <div key={room.id} className="stat-card hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">Room {room.number}</h3>
                </div>
                <button
                  onClick={() =>
                    setEditing({
                      id: room.id,
                      number: room.number,
                      floor: room.floor,
                      capacity: room.capacity,
                      monthlyRent: room.monthlyRent,
                      status: room.status,
                    })
                  }
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Floor</span>
                  <span className="font-medium text-foreground">{room.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Occupancy</span>
                  <span className="font-medium text-foreground">
                    {room.activeTenants}/{room.capacity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rent</span>
                  <span className="font-semibold text-foreground">{formatCurrency(room.monthlyRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-foreground capitalize">{room.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No rooms found"
          description="Add your first room to start assigning tenants and generating rent invoices."
          action={
            <button onClick={() => setEditing(defaultForm)} className="auth-button max-w-fit">
              Add room
            </button>
          }
        />
      )}
    </div>
  );
};

export default RoomsPage;
