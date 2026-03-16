import { addDays, format, isBefore, parseISO, startOfMonth } from "date-fns";

import type { Invoice, MealToggle } from "@/types/domain";

export type MealKind = "breakfast" | "lunch" | "dinner";

export function getMealCutoffTimestamp(serviceDate: string, cutoffTime: string) {
  const [hours = "20", minutes = "00"] = cutoffTime.split(":");
  const date = parseISO(`${serviceDate}T00:00:00`);
  date.setDate(date.getDate() - 1);
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date;
}

export function isMealLocked(serviceDate: string, cutoffTime: string, currentDate = new Date()) {
  return currentDate >= getMealCutoffTimestamp(serviceDate, cutoffTime);
}

export function sumEnabledMeals(toggles: MealToggle[]) {
  return toggles.reduce(
    (total, toggle) =>
      total +
      Number(toggle.breakfastEnabled) +
      Number(toggle.lunchEnabled) +
      Number(toggle.dinnerEnabled),
    0,
  );
}

export function estimateMealCost(toggles: MealToggle[], mealRate: number) {
  return sumEnabledMeals(toggles) * mealRate;
}

export function resolveInvoiceStatus(invoice: Invoice, referenceDate = new Date()) {
  if (invoice.amountPaid >= invoice.totalAmount && invoice.totalAmount > 0) {
    return "paid" as const;
  }

  if (invoice.amountPaid > 0) {
    return "partial" as const;
  }

  if (isBefore(parseISO(invoice.dueDate), referenceDate)) {
    return "overdue" as const;
  }

  return "issued" as const;
}

export function getUpcomingWindow(startDate = new Date(), days = 7) {
  return Array.from({ length: days }, (_, index) => addDays(startDate, index));
}

export function getMonthLabel(value: string) {
  return format(startOfMonth(parseISO(value)), "MMMM yyyy");
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
