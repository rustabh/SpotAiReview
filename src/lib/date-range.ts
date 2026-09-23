import { startOfDay, subDays } from "date-fns";

export type DateRangeKey = "today" | "yesterday" | "7d" | "30d" | "this_month" | "last_month" | "all";

export function resolveDateRange(key: DateRangeKey): { from: Date; to: Date } {
  const now = new Date();
  switch (key) {
    case "today":
      return { from: startOfDay(now), to: now };
    case "yesterday": {
      const y = subDays(now, 1);
      return { from: startOfDay(y), to: startOfDay(now) };
    }
    case "7d":
      return { from: subDays(now, 7), to: now };
    case "30d":
      return { from: subDays(now, 30), to: now };
    case "this_month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    case "last_month":
      return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 1) };
    case "all":
    default:
      return { from: new Date(2020, 0, 1), to: now };
  }
}
