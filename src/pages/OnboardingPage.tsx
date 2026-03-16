import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

const OnboardingPage = () => {
  const { createDorm, actionLoading } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [mealRate, setMealRate] = useState(3.5);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createDorm({
      name,
      address,
      contact,
      mealRate,
      billingCycle: "monthly",
      breakfastCutoff: "20:00",
      lunchCutoff: "20:00",
      dinnerCutoff: "20:00",
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="page-header">Create your first dorm workspace</h2>
        <p className="page-subheader">
          Your account is ready. Create a dorm as the landlord workspace, then invite tenants and
          chefs into it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="stat-card space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Dorm name</label>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Address</label>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Contact</label>
          <input
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Meal rate (USD)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={mealRate}
            onChange={(event) => setMealRate(Number(event.target.value))}
            className="w-full h-10 px-4 border border-input rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          disabled={actionLoading}
          className="auth-button disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {actionLoading ? "Creating dorm..." : "Create dorm"}
        </button>
      </form>
    </div>
  );
};

export default OnboardingPage;
