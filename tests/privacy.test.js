import { afterEach, describe, expect, mock, test } from "bun:test";
import { googleConsentAction } from "../src/lib/studyos/privacy-preferences";

const values = new Map();
const insert = mock(async () => ({ error: null }));
mock.module("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert }) } }));
const { recordActivity } = await import("../src/lib/studyos/telemetry");
Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { pathname: "/dashboard" } } });
afterEach(() => { insert.mockClear(); });

describe("affirmative Google consent", () => {
  test("signup without acknowledgement is blocked", () => { expect(googleConsentAction("up", false)).toBe("block"); });
  test("signup with acknowledgement records consent", () => { expect(googleConsentAction("up", true)).toBe("remember"); });
  test("returning sign-in never records signup consent", () => { expect(googleConsentAction("in", false)).toBe("sign_in"); expect(googleConsentAction("in", true)).toBe("sign_in"); });
});
describe("in-app product activity tracking", () => {
  test("does not write device activity events", async () => {
    await recordActivity("visit", { userId: "student-a", email: "synthetic@example.invalid", path: "/dashboard" });
    expect(insert).not.toHaveBeenCalled();
  });
});