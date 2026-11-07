import { afterEach, describe, expect, mock, test } from "bun:test";
import { analyticsAllowed, setAnalyticsAllowed, googleConsentAction } from "../src/lib/studyos/privacy-preferences";

const values = new Map<string, string>();
const insert = mock(async () => ({ error: null }));
mock.module("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert }) } }));
const { recordActivity } = await import("../src/lib/studyos/telemetry");
Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { pathname: "/dashboard" } } });
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: (k) => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) } });
afterEach(() => { values.clear(); insert.mockClear(); });

describe("affirmative Google consent", () => {
  test("signup without acknowledgement is blocked", () => { expect(googleConsentAction("up", false)).toBe("block"); });
  test("signup with acknowledgement records consent", () => { expect(googleConsentAction("up", true)).toBe("remember"); });
  test("returning sign-in never records signup consent", () => { expect(googleConsentAction("in", false)).toBe("sign_in"); expect(googleConsentAction("in", true)).toBe("sign_in"); });
});
describe("optional analytics", () => {
  test("new users are off and do not transmit", async () => { expect(analyticsAllowed("student-a")).toBe(false); await recordActivity("visit", { userId: "student-a" }); expect(insert).not.toHaveBeenCalled(); });
  test("withdrawal stops subsequent events", async () => { setAnalyticsAllowed("student-a", true); setAnalyticsAllowed("student-a", false); await recordActivity("visit", { userId: "student-a" }); expect(insert).not.toHaveBeenCalled(); });
  test("one account's choice never opts another in", () => { setAnalyticsAllowed("student-a", true); expect(analyticsAllowed("student-b")).toBe(false); });
  test("consented payload contains only coarse fields", async () => { setAnalyticsAllowed("student-a", true); await recordActivity("visit", { userId: "student-a", email: "synthetic@example.invalid", path: "/subjects/private-detail" }); expect(insert).toHaveBeenCalledTimes(1); expect(Object.keys(insert.mock.calls[0]?.[0] ?? {}).sort()).toEqual(["kind", "path", "platform", "user_agent"]); });
});