import { describe, expect, test } from "bun:test";
import { defaultExamDate } from "../src/lib/studyos/subjects";

describe("defaultExamDate", () => {
  test("uses the confirmed 2026 O/L date", () => {
    expect(defaultExamDate("OL", 2026)).toBe("2026-12-08");
  });

  test("uses the confirmed 2027 A/L date", () => {
    expect(defaultExamDate("AL", 2027)).toBe("2027-08-03");
  });

  test("uses provisional first-of-month dates for 2028", () => {
    expect(defaultExamDate("AL", 2028)).toBe("2028-08-01");
    expect(defaultExamDate("OL", 2028)).toBe("2028-12-01");
  });

  test("preserves the established defaults for other years", () => {
    expect(defaultExamDate("AL", 2029)).toBe("2029-08-03");
    expect(defaultExamDate("OL", 2029)).toBe("2029-12-08");
  });
});
