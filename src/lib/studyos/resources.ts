import type { Database } from "@/integrations/supabase/types";

export type Resource = Database["public"]["Tables"]["resources"]["Row"];
export type ResourceSuggestion = Database["public"]["Tables"]["resource_suggestions"]["Row"];

export const RESOURCE_CATEGORIES = [
  "Notes",
  "Learning platform",
  "Science practicals",
  "Science help",
  "Videos",
  "Past papers",
  "Other",
] as const;

/** Accept only browser-safe web links; publisher URLs remain external. */
export function normalizeWebUrl(input: string): string {
  const url = new URL(input.trim());
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Use a valid http:// or https:// link.");
  }
  if (!url.hostname.includes(".") || url.username || url.password) {
    throw new Error("Use a valid public website link.");
  }
  if (url.toString().length > 2048) throw new Error("That link is too long.");
  url.hash = "";
  return url.toString();
}

/** Matches the database duplicate key: scheme/hash/trailing slashes are ignored. */
export function resourceUrlKey(input: string): string {
  return normalizeWebUrl(input)
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

export function splitSubjects(value: string): string[] {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))].slice(0, 12);
}

export function examLabel(exam: string): string {
  return exam === "AL" ? "A/L" : exam === "OL" ? "O/L" : exam;
}

export function isRecentlyAdded(createdAt: string): boolean {
  const age = Date.now() - new Date(createdAt).getTime();
  return age >= 0 && age <= 30 * 864e5;
}
