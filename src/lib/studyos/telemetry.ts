import { supabase } from "@/integrations/supabase/client";
import { analyticsAllowed } from "./privacy-preferences";

/** Optional product metrics only. Essential security uses security.ts instead. */
const CATEGORIES = new Set(["dashboard", "subjects", "analytics", "marks", "revision", "calendar", "achievements", "settings", "ai"]);
export function pageCategory(path: string) {
  const first = path.split("/")[1] ?? "other";
  return CATEGORIES.has(first) ? first : "other";
}

/** Records coarse, consent-based page activity for the signed-in member only. */
export async function recordActivity(
  kind: string,
  opts: { userId?: string | null; email?: string | null; path?: string } = {},
) {
  if (typeof window === "undefined" || !opts.userId) return;
  if (!analyticsAllowed(opts.userId) || kind !== "visit") return;
  try {
    const ua = navigator.userAgent;
    const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Other";
    await supabase.from("device_events").insert({
      kind: "visit",
      path: pageCategory(opts.path ?? window.location.pathname),
      user_agent: browser,
      platform: /Mobi|Android/i.test(ua) ? "mobile" : "desktop",
    });
  } catch {
    /* analytics must never surface to the student */
  }
}

const seen = new Set<string>();

/** Records a page view at most once per path category per tab. */
export function recordVisitOnce(path: string, userId: string | null, email?: string | null) {
  if (!userId || !analyticsAllowed(userId)) return;
  const key = `${userId}:${pageCategory(path)}`;
  if (seen.has(key)) return;
  seen.add(key);
  void recordActivity("visit", { userId, email: email ?? null, path });
}
