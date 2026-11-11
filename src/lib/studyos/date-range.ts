const COLOMBO_TIME_ZONE = "Asia/Colombo";
const DATE_ONLY = /^\\d{4}-\\d{2}-\\d{2}$/;

function isValidDateKey(value: string): boolean {
  if (!DATE_ONLY.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month! - 1 && date.getUTCDate() === day;
}

/** Convert a Date or timestamp to the calendar day used by students in Sri Lanka. */
export function colomboDateKey(value: Date | string): string {
  if (typeof value === "string" && DATE_ONLY.test(value)) return isValidDateKey(value) ? value : "";
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: COLOMBO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Subtract calendar days in Colombo, not fixed 24-hour intervals in the host timezone. */
export function colomboDateKeyMinusDays(now: Date, days: number): string {
  if (!Number.isSafeInteger(days) || days < 0) return "";
  const today = colomboDateKey(now);
  if (!today) return "";
  const [year, month, day] = today.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day! - days)).toISOString().slice(0, 10);
}

/** Inclusive rolling calendar window ending today in Asia/Colombo. */
export function withinDays(
  value: string | Date | null | undefined,
  days: number | null,
  now: Date = new Date(),
): boolean {
  if (days === null) return true;
  if (!Number.isSafeInteger(days) || days < 1) return false;
  if (value == null) return false;
  const date = colomboDateKey(value);
  const today = colomboDateKey(now);
  const since = colomboDateKeyMinusDays(now, days - 1);
  return Boolean(date && today && since && date >= since && date <= today);
}
