import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  loadAdminPersonalPreview,
  resetAdminPersonalPreview,
  saveAdminPersonalPreview,
} from "../src/lib/studyos/admin-personal-preview";

const storage = new Map<string, string>();
const fakeWindow = {
  localStorage: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
};

const profile = (track: "OL" | "AL") => ({
  id: "admin-preview:test:" + track,
  name: "Sample " + track,
  track,
  examYear: 2027,
  examDate: "2027-11-01",
  subjects: track === "OL" ? ["Mathematics", "Science"] : ["Physics", "Chemistry"],
  dailyGoalHours: 6,
  weeklyGoalHours: 42,
  onboarded: true,
}) as any;

describe("admin preview isolation", () => {
  beforeEach(() => {
    storage.clear();
    Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  });
  afterEach(() => {
    Reflect.deleteProperty(globalThis, "window");
  });

  test("O/L and A/L previews are stored under independent keys", () => {
    const ol = loadAdminPersonalPreview("admin-1", profile("OL"));
    const al = loadAdminPersonalPreview("admin-1", profile("AL"));
    expect(ol.sessions.length).toBeGreaterThan(0);
    expect(al.sessions.length).toBeGreaterThan(0);
    expect(ol.sessions.every((row) => row.subject === "Mathematics" || row.subject === "Science")).toBe(true);
    expect(al.sessions.every((row) => row.subject === "Physics" || row.subject === "Chemistry")).toBe(true);
    expect(storage.size).toBe(2);
  });

  test("saving and resetting one track never changes the other", () => {
    const ol = loadAdminPersonalPreview("admin-1", profile("OL"));
    const al = loadAdminPersonalPreview("admin-1", profile("AL"));
    saveAdminPersonalPreview("admin-1", "OL", { ...ol, sessions: [] });
    expect(loadAdminPersonalPreview("admin-1", profile("OL")).sessions).toHaveLength(0);
    expect(loadAdminPersonalPreview("admin-1", profile("AL")).sessions.length).toBe(al.sessions.length);
    resetAdminPersonalPreview("admin-1", "OL");
    expect(loadAdminPersonalPreview("admin-1", profile("AL")).sessions.length).toBe(al.sessions.length);
  });
});
