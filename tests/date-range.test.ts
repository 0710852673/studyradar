import { describe, expect, test } from "bun:test";
import { colomboDateKey, colomboDateKeyMinusDays, withinDays } from "../src/lib/studyos/date-range";

describe("Colombo date keys", () => {
  test("changes day at midnight in Sri Lanka, not UTC midnight", () => {
    expect(colomboDateKey(new Date("2026-11-10T18:29:59.000Z"))).toBe("2026-11-10");
    expect(colomboDateKey(new Date("2026-11-10T18:30:00.000Z"))).toBe("2026-11-11");
  });

  test("preserves valid database date-only values and rejects impossible dates", () => {
    expect(colomboDateKey("2028-02-29")).toBe("2028-02-29");
    expect(colomboDateKey("2027-02-29")).toBe("");
    expect(colomboDateKey("not-a-date")).toBe("");
  });

  test("subtracts calendar days from the Colombo day", () => {
    expect(colomboDateKeyMinusDays(new Date("2026-11-10T18:30:00.000Z"), 6)).toBe("2026-11-05");
    expect(colomboDateKeyMinusDays(new Date("2026-11-10T18:30:00.000Z"), -1)).toBe("");
  });
});

describe("withinDays", () => {
  const now = new Date("2026-11-10T18:30:00.000Z"); // 11 November in Colombo

  test("uses an inclusive Colombo calendar window", () => {
    expect(withinDays("2026-11-05", 7, now)).toBe(true);
    expect(withinDays("2026-11-04", 7, now)).toBe(false);
    expect(withinDays("2026-11-11", 7, now)).toBe(true);
    expect(withinDays("2026-11-12", 7, now)).toBe(false);
  });

  test("converts timestamps to the Colombo date before filtering", () => {
    expect(withinDays("2026-11-10T18:29:59.000Z", 1, now)).toBe(false);
    expect(withinDays("2026-11-10T18:30:00.000Z", 1, now)).toBe(true);
  });

  test("treats all-time as unbounded and rejects invalid ranges or dates", () => {
    expect(withinDays("not-a-date", null, now)).toBe(true);
    expect(withinDays("2026-11-11", 0, now)).toBe(false);
    expect(withinDays("2026-02-30", 7, now)).toBe(false);
    expect(withinDays(null, 7, now)).toBe(false);
  });
});
