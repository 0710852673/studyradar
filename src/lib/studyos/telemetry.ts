import { supabase } from "@/integrations/supabase/client";
import { allowWrite } from "./ratelimit";

/**
 * Activity & device logging.
 *
 * This is DISCLOSED collection — the Privacy Policy tells students exactly what
 * is recorded here (IP, approximate location, browser/device, pages visited),
 * and account creation requires accepting it. Do not extend this to anything
 * the Privacy Policy does not already describe.
 *
 * Every failure is swallowed: analytics must never break a student's session.
 */

type NetInfo = { ip?: string; country_name?: string; region?: string; city?: string };

const GEO_KEY = "sr_geo_v1";
let geoPromise: Promise<NetInfo> | null = null;

/** IP + coarse city/country, fetched once per tab and cached. */
async function getNetwork(): Promise<NetInfo> {
  if (typeof window === "undefined") return {};
  try {
    const cached = sessionStorage.getItem(GEO_KEY);
    if (cached) return JSON.parse(cached) as NetInfo;
  } catch {
    /* storage disabled */
  }
  if (!geoPromise) {
    geoPromise = (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { cache: "force-cache" });
        if (!res.ok) return {};
        const j = (await res.json()) as NetInfo;
        const slim: NetInfo = {
          ...(j.ip ? { ip: j.ip } : {}),
          ...(j.country_name ? { country_name: j.country_name } : {}),
          ...(j.region ? { region: j.region } : {}),
          ...(j.city ? { city: j.city } : {}),
        };
        try {
          sessionStorage.setItem(GEO_KEY, JSON.stringify(slim));
        } catch {
          /* ignore */
        }
        return slim;
      } catch {
        return {};
      }
    })();
  }
  return geoPromise;
}

function device() {
  if (typeof window === "undefined") return {};
  return {
    user_agent: navigator.userAgent.slice(0, 500),
    platform: (navigator as { platform?: string }).platform ?? null,
    screen: `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    language: navigator.language ?? null,
    referrer: document.referrer ? document.referrer.slice(0, 300) : null,
  };
}

/** Fire-and-forget activity record. `kind` is e.g. "visit", "login", "signup". */
export async function recordActivity(
  kind: string,
  opts: { userId?: string | null; email?: string | null; path?: string } = {},
) {
  if (typeof window === "undefined") return;
  // Background analytics never get priority over the student's own writes.
  if (!allowWrite()) return;
  try {
    const net = await getNetwork();
    await supabase.from("device_events").insert({
      kind,
      user_id: opts.userId ?? null,
      email: opts.email ?? null,
      path: opts.path ?? window.location.pathname,
      ip: net.ip ?? null,
      country: net.country_name ?? null,
      region: net.region ?? null,
      city: net.city ?? null,
      ...device(),
    } as never);
  } catch {
    /* analytics must never surface to the student */
  }
}

const seen = new Set<string>();

/** Records a page view at most once per path per tab, to keep the log readable. */
export function recordVisitOnce(path: string, userId: string | null, email?: string | null) {
  const key = `${userId ?? "anon"}:${path}`;
  if (seen.has(key)) return;
  seen.add(key);
  void recordActivity("visit", { userId, email: email ?? null, path });
}
