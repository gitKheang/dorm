import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

const ProfilePage = () => {
  const { user, updateProfile, actionLoading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setPhone(user?.phone || "");
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateProfile({ firstName, lastName, phone });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="page-header">Profile</h2>
        <p className="page-subheader">Update your personal information</p>
      </div>

      <form onSubmit={handleSubmit} className="stat-card space-y-5">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
            {firstName[0] || "U"}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {firstName} {lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">First Name</label>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Last Name</label>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full h-10 px-4 border border-input rounded-lg bg-muted text-sm text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <button type="submit" disabled={actionLoading} className="auth-button disabled:opacity-70">
          <Save className="h-4 w-4" /> {actionLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
