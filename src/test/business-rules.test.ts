import { describe, expect, it } from "vitest";

import { estimateMealCost, getMealCutoffTimestamp, isMealLocked, resolveInvoiceStatus, sumEnabledMeals } from "@/lib/business-rules";
import { hasRoleAccess } from "@/lib/permissions";
import type { Invoice, MealToggle } from "@/types/domain";

const toggles: MealToggle[] = [
  {
    id: "1",
    dormId: "d1",
    tenantMembershipId: "m1",
    serviceDate: "2026-03-14",
    breakfastEnabled: true,
    lunchEnabled: false,
    dinnerEnabled: true,
    breakfastLocked: false,
    lunchLocked: false,
    dinnerLocked: false,
  },
  {
    id: "2",
    dormId: "d1",
    tenantMembershipId: "m1",
    serviceDate: "2026-03-15",
    breakfastEnabled: true,
    lunchEnabled: true,
    dinnerEnabled: true,
    breakfastLocked: false,
    lunchLocked: false,
    dinnerLocked: false,
  },
];

const baseInvoice: Invoice = {
  id: "inv-1",
  dormId: "d1",
  tenantMembershipId: "m1",
  billingMonth: "2026-03-01",
  dueDate: "2026-03-31",
  rentAmount: 150,
  mealAmount: 36,
  adjustmentsAmount: 0,
  totalAmount: 186,
  amountPaid: 0,
  status: "issued",
  paidAt: null,
};

describe("business rules", () => {
  it("counts enabled meals and estimates meal cost", () => {
    expect(sumEnabledMeals(toggles)).toBe(5);
    expect(estimateMealCost(toggles, 3.5)).toBe(17.5);
  });

  it("marks meals locked only after the previous-day cutoff", () => {
    const cutoff = getMealCutoffTimestamp("2026-03-14", "20:00");
    expect(cutoff.getDate()).toBe(13);
    expect(cutoff.getHours()).toBe(20);
    expect(cutoff.getMinutes()).toBe(0);
    expect(isMealLocked("2026-03-14", "20:00", new Date("2026-03-13T19:59:59"))).toBe(false);
    expect(isMealLocked("2026-03-14", "20:00", new Date("2026-03-13T20:00:00"))).toBe(true);
  });

  it("resolves invoice states from amounts paid and due dates", () => {
    expect(resolveInvoiceStatus(baseInvoice, new Date("2026-03-01"))).toBe("issued");
    expect(resolveInvoiceStatus({ ...baseInvoice, amountPaid: 20 }, new Date("2026-03-01"))).toBe("partial");
    expect(resolveInvoiceStatus({ ...baseInvoice, amountPaid: 186 }, new Date("2026-03-01"))).toBe("paid");
    expect(resolveInvoiceStatus(baseInvoice, new Date("2026-04-02"))).toBe("overdue");
  });

  it("checks role access for protected routes", () => {
    expect(hasRoleAccess("landlord", ["landlord"])).toBe(true);
    expect(hasRoleAccess("tenant", ["landlord", "chef"])).toBe(false);
    expect(hasRoleAccess(undefined, ["tenant"])).toBe(false);
  });
});
