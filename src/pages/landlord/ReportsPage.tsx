import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, getMonthLabel } from "@/lib/business-rules";
import { getMonthRange, getWeekRange } from "@/lib/date";
import { useDailyMealCounts, useInvoicesForDorm, useRooms } from "@/hooks/useDormflowData";

const pieColors = ["hsl(217 91% 50%)", "hsl(142 76% 36%)", "hsl(38 92% 50%)"];

const ReportsPage = () => {
  const { activeMembership } = useAuth();
  const dormId = activeMembership?.dormId;
  const monthRange = getMonthRange();
  const weekRange = getWeekRange();

  const roomsQuery = useRooms(dormId);
  const invoicesQuery = useInvoicesForDorm(dormId);
  const mealCountsQuery = useDailyMealCounts(dormId, weekRange.startIso, weekRange.endIso);

  if (roomsQuery.isLoading || invoicesQuery.isLoading || mealCountsQuery.isLoading) {
    return <LoadingScreen message="Loading reports..." />;
  }

  const rooms = roomsQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];
  const mealCounts = mealCountsQuery.data ?? [];

  const occupancySummary = useMemo(() => {
    const occupied = rooms.filter((room) => room.activeTenants > 0).length;
    const available = Math.max(rooms.length - occupied, 0);
    return [
      { name: "Occupied", value: occupied },
      { name: "Available", value: available },
    ];
  }, [rooms]);

  const financialData = useMemo(() => {
    const currentMonth = invoices.filter((invoice) => invoice.billingMonth === monthRange.startIso);
    return [
      {
        name: "Billed",
        amount: currentMonth.reduce((sum, invoice) => sum + invoice.totalAmount, 0),
      },
      {
        name: "Collected",
        amount: currentMonth.reduce((sum, invoice) => sum + invoice.amountPaid, 0),
      },
      {
        name: "Outstanding",
        amount: currentMonth.reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.amountPaid), 0),
      },
    ];
  }, [invoices, monthRange.startIso]);

  const mealTrend = mealCounts.map((entry) => ({
    day: entry.serviceDate.slice(5),
    breakfast: entry.breakfastCount,
    lunch: entry.lunchCount,
    dinner: entry.dinnerCount,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="page-header">Reports & Analytics</h2>
        <p className="page-subheader">Live operational metrics from rooms, invoices, and meal toggles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h4 className="font-semibold text-foreground mb-4">Financial Summary ({getMonthLabel(monthRange.startIso)})</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="amount" fill="hsl(217 91% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h4 className="font-semibold text-foreground mb-4">Occupancy Snapshot</h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={occupancySummary} dataKey="value" nameKey="name" outerRadius={90} label>
                {occupancySummary.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card lg:col-span-2">
          <h4 className="font-semibold text-foreground mb-4">Weekly Meal Consumption</h4>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={mealTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="breakfast" fill="hsl(217 91% 90%)" stroke="hsl(217 91% 50%)" />
              <Area type="monotone" dataKey="lunch" fill="hsl(142 76% 90%)" stroke="hsl(142 76% 36%)" />
              <Area type="monotone" dataKey="dinner" fill="hsl(38 92% 90%)" stroke="hsl(38 92% 50%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
