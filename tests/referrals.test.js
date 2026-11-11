import { describe, expect, test } from "bun:test";
import { buildReferralSignupUrl } from "../src/lib/studyos/referrals";
describe("referral signup links", () => {
  test("opens account creation and preserves the referral code", () => {
    const url = new URL(buildReferralSignupUrl("https://studyradar.lovable.app", "abc123"));
    expect(url.pathname).toBe("/auth");
    expect(url.searchParams.get("mode")).toBe("signup");
    expect(url.searchParams.get("ref")).toBe("abc123");
  });
});
