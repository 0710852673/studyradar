import { describe, expect, test } from "bun:test";
import { defaultExamDate, daysUntilExamDate } from "../src/lib/studyos/subjects";

describe("defaultExamDate", () => {
  test("uses the confirmed 2026 O/L date", () => {
    expect(defaultExamDate("OL", 2026)).toBe("2026-12-08");
  });

  test("uses the announced 2027 A/L and O/L start dates", () => {
    expect(defaultExamDate("AL", 2027)).toBe("2027-08-03");
    expect(defaultExamDate("OL", 2027)).toBe("2027-12-07");
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


describe("daysUntilExamDate", () => {
  test("uses the Asia/Colombo calendar, including its midnight boundary", () => {
    expect(daysUntilExamDate("2026-12-08", new Date("2026-12-07T18:29:00.000Z"))).toBe(1);
    expect(daysUntilExamDate("2026-12-08", new Date("2026-12-07T18:30:00.000Z"))).toBe(0);
  });

  test("does not depend on the browser's local timezone", () => {
    expect(daysUntilExamDate("2026-12-08", new Date("2026-12-07T12:00:00.000Z"))).toBe(1);
    expect(daysUntilExamDate("2026-12-08", new Date("2026-12-08T12:00:00.000Z"))).toBe(0);
  });

  test("handles leap days and invalid date-only values", () => {
    expect(daysUntilExamDate("2028-02-29", new Date("2028-02-27T12:00:00.000Z"))).toBe(2);
    expect(daysUntilExamDate("2027-02-29", new Date("2027-02-27T12:00:00.000Z"))).toBe(0);
    expect(daysUntilExamDate("not-a-date", new Date("2026-12-07T12:00:00.000Z"))).toBe(0);
  });

  test("returns negative values for dates that have passed", () => {
    expect(daysUntilExamDate("2026-12-07", new Date("2026-12-07T18:30:00.000Z"))).toBe(-1);
  });
});
