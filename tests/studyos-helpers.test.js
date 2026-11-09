import { describe, expect, test } from "bun:test";
import {
  examLabel,
  normalizeWebUrl,
  resourceUrlKey,
  splitSubjects,
} from "../src/lib/studyos/resources";
import { buildInviteUrl, shareLink } from "../src/lib/studyos/share";
import { sanitizeSecurityEvent } from "../src/lib/studyos/security-events";

describe("resource URL helpers", () => {
  test("accepts public HTTP and HTTPS URLs and removes fragments", () => {
    expect(normalizeWebUrl(" https://example.com/learn#chapter-2 ")).toBe(
      "https://example.com/learn",
    );
    expect(normalizeWebUrl("http://example.com")).toBe("http://example.com/");
  });

  test("rejects non-web protocols and credential-bearing URLs", () => {
    expect(() => normalizeWebUrl("javascript:alert(1)")).toThrow();
    expect(() => normalizeWebUrl("https://user:pass@example.com")).toThrow();
  });

  test("normalizes duplicate keys independent of scheme, case and trailing slash", () => {
    expect(resourceUrlKey("https://Example.com/Path/#section")).toBe(
      "example.com/path",
    );
    expect(resourceUrlKey("http://example.com/path///")).toBe(
      "example.com/path",
    );
  });

  test("splits, trims, deduplicates and caps subject lists", () => {
    expect(splitSubjects(" Physics, Chemistry,Physics, , ICT ")).toEqual([
      "Physics",
      "Chemistry",
      "ICT",
    ]);
    expect(splitSubjects(Array.from({ length: 14 }, (_, i) => `S${i}`).join(","))).toHaveLength(12);
  });

  test("labels exam codes clearly", () => {
    expect(examLabel("AL")).toBe("A/L");
    expect(examLabel("OL")).toBe("O/L");
  });
});

describe("invite sharing helpers", () => {
  test("builds a safe invite URL with an optional referral code", () => {
    expect(buildInviteUrl("https://studyradar.lovable.app", "abc123")).toBe(
      "https://studyradar.lovable.app/auth?ref=abc123",
    );
    expect(buildInviteUrl("https://studyradar.lovable.app")).toBe(
      "https://studyradar.lovable.app/",
    );
  });

  test("uses native sharing when it succeeds", async () => {
    const copy = async () => {
      throw new Error("copy should not run");
    };
    const result = await shareLink("https://studyradar.lovable.app", {
      share: async () => undefined,
      copy,
    });
    expect(result).toBe("shared");
  });

  test("falls back to copy when native sharing fails", async () => {
    let copied = "";
    const result = await shareLink("https://studyradar.lovable.app", {
      share: async () => {
        throw new Error("share unavailable");
      },
      copy: async (value) => {
        copied = value;
      },
    });
    expect(result).toBe("copied");
    expect(copied).toBe("https://studyradar.lovable.app");
  });

  test("treats a user-cancelled native share as cancellation", async () => {
    const result = await shareLink("https://studyradar.lovable.app", {
      share: async () => {
        throw new DOMException("Cancelled", "AbortError");
      },
      copy: async () => {
        throw new Error("cancelled shares must not copy");
      },
    });
    expect(result).toBe("cancelled");
  });
});


describe("security event validation", () => {
  test("accepts only known authentication failure events and bounds fields", () => {
    expect(sanitizeSecurityEvent({
      kind: "sign_in_failed",
      severity: "warning",
      email: " STUDENT@EXAMPLE.COM ",
      detail: "x".repeat(300),
    })).toEqual({
      kind: "sign_in_failed",
      severity: "warning",
      email: "student@example.com",
      detail: "x".repeat(160),
    });
  });

  test("rejects arbitrary event names", () => {
    expect(sanitizeSecurityEvent({ kind: "admin_role_granted", severity: "critical" })).toBeNull();
  });
});
