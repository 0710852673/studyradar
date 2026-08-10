import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight audit trail. Anyone (including signed-out visitors) may append an
 * event; only admins can read the log back. Failures are swallowed on purpose —
 * security logging must never break a user flow.
 */
export type SecuritySeverity = "info" | "warning" | "critical";

export async function logSecurityEvent(
  kind: string,
  opts: {
    severity?: SecuritySeverity;
    email?: string | null;
    detail?: string;
    userId?: string | null;
  } = {},
) {
  try {
    await supabase.from("security_events").insert({
      kind,
      severity: opts.severity ?? "info",
      email: opts.email ?? null,
      detail: opts.detail ?? null,
      user_id: opts.userId ?? null,
      user_agent: typeof navigator === "undefined" ? null : navigator.userAgent.slice(0, 400),
      path: typeof window === "undefined" ? null : window.location.pathname,
    } as never);
  } catch {
    /* never surface logging failures to the student */
  }
}

const CONSENT_KEY = "sr_terms_consent";

/** Remember consent across an OAuth redirect. */
export function rememberConsent() {
  try {
    localStorage.setItem(CONSENT_KEY, new Date().toISOString());
  } catch {
    /* storage disabled */
  }
}

/** Persist a pending consent onto the profile once the session exists. */
export async function syncConsent(userId: string, alreadyAccepted: boolean) {
  if (alreadyAccepted) return;
  let when: string | null = null;
  try {
    when = localStorage.getItem(CONSENT_KEY);
  } catch {
    /* storage disabled */
  }
  if (!when) return;
  await supabase
    .from("profiles")
    .update({ terms_accepted_at: when } as never)
    .eq("id", userId);
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* ignore */
  }
}
