/**
 * Client-side write throttle.
 *
 * The admin "max writes per minute" site setting is applied here, so a runaway
 * loop or a stuck retry is slowed in this tab. This is NOT server enforcement:
 * separate tabs and direct requests can bypass it. Study
 * writes tell the student plainly to retry; background telemetry is dropped
 * silently.
 */

let limit = 60;
const stamps: number[] = [];

export function setWriteLimit(n: number) {
  if (Number.isFinite(n) && n > 0) limit = Math.floor(n);
}

export function getWriteLimit() {
  return limit;
}

/** True when another write is allowed right now (and records it). */
export function allowWrite(): boolean {
  const now = Date.now();
  while (stamps[0] !== undefined && now - stamps[0] > 60_000) stamps.shift();
  if (stamps.length >= limit) return false;
  stamps.push(now);
  return true;
}

/** Seconds until the oldest write in the window frees a slot. */
export function retryInSeconds(): number {
  const oldest = stamps[0];
  if (oldest === undefined) return 1;
  return Math.max(1, Math.ceil((60_000 - (Date.now() - oldest)) / 1000));
}
