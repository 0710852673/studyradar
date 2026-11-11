import { describe, expect, test } from "bun:test";
import {
  isValidDateKey,
  validateMarkEntry,
  validateMinutes,
  validateStudyEntry,
  validateWasteEntry,
} from "../src/lib/studyos/validation";

describe("Study Radar entry validation", () => {
  test("accepts real calendar dates and rejects impossible dates", () => {
    expect(isValidDateKey("2028-02-29")).toBe(true);
    expect(isValidDateKey("2027-02-29")).toBe(false);
    expect(isValidDateKey("2027-13-01")).toBe(false);
  });

  test("limits each time entry to one day", () => {
    expect(validateMinutes(1440)).toBeNull();
    expect(validateMinutes(0)).not.toBeNull();
    expect(validateMinutes(1441)).not.toBeNull();
    expect(validateMinutes(15.5)).not.toBeNull();
  });

  test("validates study and wasted-time entries", () => {
    expect(validateStudyEntry({ date: "2026-11-11", subject: "Physics", minutes: 60 })).toBeNull();
    expect(validateStudyEntry({ date: "2026-02-30", subject: "Physics", minutes: 60 })).not.toBeNull();
    expect(validateWasteEntry({ date: "2026-11-11", minutes: 30 })).toBeNull();
    expect(validateWasteEntry({ date: "2026-11-11", minutes: 1441 })).not.toBeNull();
  });

  test("prevents impossible marks and malformed exam names", () => {
    expect(validateMarkEntry({ subject: "Physics", examName: "Term 2", date: "2026-11-11", marks: 72, total: 100 })).toBeNull();
    expect(validateMarkEntry({ subject: "Physics", examName: "Term 2", date: "2026-11-11", marks: 101, total: 100 })).not.toBeNull();
    expect(validateMarkEntry({ subject: "Physics", examName: "A", date: "2026-11-11", marks: 10, total: 20 })).not.toBeNull();
  });
});
