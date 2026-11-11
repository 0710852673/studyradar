/** Device-local, per-account preference. Storage failure always means no analytics. */
export function analyticsAllowed(userId?: string | null): boolean {
  if (typeof window === "undefined" || !userId) return false;
  try {
    return localStorage.getItem(`sr_optional_analytics_v1:${userId}`) === "yes";
  } catch { return false; }
}

export function setAnalyticsAllowed(userId: string, enabled: boolean): boolean {
  try {
    localStorage.setItem(`sr_optional_analytics_v1:${userId}`, enabled ? "yes" : "no");
    return true;
  } catch { return false; }
}

export function googleAuthAvailable(mode: "in" | "up" | "forgot", settings: { signupsEnabled: boolean; googleLoginEnabled: boolean } | null) {
  return Boolean(settings?.googleLoginEnabled) && (mode === "in" || (mode === "up" && Boolean(settings?.signupsEnabled)));
}

export function googleConsentAction(mode: "in" | "up" | "forgot", agreed: boolean) {
  return mode === "up" ? (agreed ? "remember" : "block") : "sign_in";
}