import { supabase } from "@/integrations/supabase/client";
import { analyticsAllowed } from "./privacy-preferences";

/** Optional product metrics only. Essential security uses security.ts instead. */
const CATEGORIES = new Set(["dashboard", "subjects", "analytics", "marks", "revision", "calendar", "achievements", "settings", "ai"]);
export function pageCategory(path: string) {
  const first = path.split("/")[1] ?? "other";
  return CATEGORIES.has(first) ? first : "other";
}

/** Fire-and-forget activity record. `kind` is e.g. "visit", "login", "signup". */
export async function recordActivity(
  kind: string,
  opts: { userId?: string | null; email?: string | null; path?: string } = {},
) {
  if (typeof window === "undefined") return;
  if (!analyticsAllowed(opts.userId)) return;
  if (kind !== "visit" && kind !== "login") return;
  try {
    const ua = navigator.userAgent;
    const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Other";
    // Reuse existing nullable columns for coarse labels, never raw device details.
    await supabase.from("device_events").insert({
      kind,
      path: pageCategory(opts.path ?? window.location.pathname),
      user_agent: browser,
      platform: /Mobi|Android/i.test(ua) ? "mobile" : "desktop",
    });
  } catch {
    /* analytics must never surface to the student */
  }
}

const seen = new Set<string>();

/** Records a page view at most once per path per tab, to keep the log readable. */
export function recordVisitOnce(path: string, userId: string | null, email?: string | null) {
  if (!analyticsAllowed(userId)) return;
  const key = `${userId}:${pageCategory(path)}`;
  if (seen.has(key)) return;
  seen.add(key);
  void recordActivity("visit", { userId, email: email ?? null, path });
}
