/**
 * In-app product activity tracking is intentionally disabled.
 * Site-level aggregate traffic metrics are supplied by the hosting platform;
 * do not write student page activity into device_events from the browser.
 */
export function pageCategory(path: string) {
  return path.split("/")[1] ?? "other";
}

/** Kept as a no-op for existing call sites while the feature remains disabled. */
export async function recordActivity(
  _kind: string,
  _opts: { userId?: string | null; email?: string | null; path?: string } = {},
) {
  return;
}

/** Kept as a no-op for existing call sites while the feature remains disabled. */
export function recordVisitOnce(
  _path: string,
  _userId: string | null,
  _email?: string | null,
) {
  return;
}
