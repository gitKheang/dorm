import {
  addDays,
  endOfMonth,
  format,
  formatISO,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export function toDateInputValue(value = new Date()) {
  return format(value, "yyyy-MM-dd");
}

export function formatDateLabel(value: string) {
  return format(parseISO(value), "EEE, MMM d");
}

export function formatLongDate(value: string) {
  return format(parseISO(value), "MMMM d, yyyy");
}

export function getWeekRange(anchor = new Date()) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const end = addDays(start, 6);

  return {
    start,
    end,
    startIso: formatISO(start, { representation: "date" }),
    endIso: formatISO(end, { representation: "date" }),
  };
}

export function getMonthRange(anchor = new Date()) {
  const start = startOfMonth(anchor);
  const end = endOfMonth(anchor);

  return {
    start,
    end,
    startIso: formatISO(start, { representation: "date" }),
    endIso: formatISO(end, { representation: "date" }),
  };
}
