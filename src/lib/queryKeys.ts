export const queryKeys = {
  rooms: (dormId?: string) => ["rooms", dormId],
  memberDirectory: (dormId?: string) => ["member-directory", dormId],
  invitations: (dormId?: string) => ["invitations", dormId],
  mealPlans: (dormId?: string, start?: string, end?: string) => ["meal-plans", dormId, start, end],
  mealToggles: (membershipId?: string, start?: string, end?: string) => ["meal-toggles", membershipId, start, end],
  dailyMealCounts: (dormId?: string, start?: string, end?: string) => ["daily-meal-counts", dormId, start, end],
  invoicesForDorm: (dormId?: string) => ["invoices", "dorm", dormId],
  invoicesForMembership: (membershipId?: string) => ["invoices", "membership", membershipId],
  maintenanceForDorm: (dormId?: string) => ["maintenance", "dorm", dormId],
  maintenanceForMembership: (membershipId?: string) => ["maintenance", "membership", membershipId],
  entitlements: (dormId?: string) => ["entitlements", dormId],
};
