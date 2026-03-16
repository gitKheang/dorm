import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useMemberDirectory } from "@/hooks/useDormflowData";

const MyRoomPage = () => {
  const { activeMembership } = useAuth();
  const dormId = activeMembership?.dormId;
  const membershipId = activeMembership?.id;
  const directoryQuery = useMemberDirectory(dormId);

  if (directoryQuery.isLoading) {
    return <LoadingScreen message="Loading room details..." />;
  }

  const directory = directoryQuery.data ?? [];
  const me = directory.find((entry) => entry.membershipId === membershipId);

  if (!me?.roomId) {
    return (
      <EmptyState
        title="Room assignment pending"
        description="Your landlord has not assigned you to a room yet."
      />
    );
  }

  const roommates = directory.filter((entry) => entry.roomId === me.roomId);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="page-header">My Room</h2>
        <p className="page-subheader">Your room details and current roommate list.</p>
      </div>

      <div className="stat-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{me.roomNumber}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Room {me.roomNumber}</h3>
            <p className="text-sm text-muted-foreground">{activeMembership?.dorm.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">Floor</p>
            <p className="text-lg font-semibold text-foreground">{me.roomFloor}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">Monthly Rent</p>
            <p className="text-lg font-semibold text-foreground">${me.monthlyRent?.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted col-span-2">
            <p className="text-xs text-muted-foreground">Move In Date</p>
            <p className="text-lg font-semibold text-foreground">{me.startDate || "-"}</p>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <h4 className="font-semibold text-foreground mb-4">Roommates</h4>
        <div className="space-y-3">
          {roommates.map((roommate) => (
            <div key={roommate.membershipId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                {roommate.firstName[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {roommate.firstName} {roommate.lastName}
                </p>
                <p className="text-xs text-muted-foreground">Since {roommate.startDate || "-"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyRoomPage;
