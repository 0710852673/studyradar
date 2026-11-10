import { afterEach, describe, expect, test } from "bun:test";
import {
  isAdminPreviewId,
  loadAdminPersonalPreview,
  resetAdminPersonalPreview,
  saveAdminPersonalPreview,
} from "../src/lib/studyos/admin-personal-preview";

const values = new Map();
const localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
};
globalThis.window = { localStorage };

const profile = (track) => ({
  id: "admin-account",
  name: "Preview Student",
  track,
  examYear: 2027,
  examDate: "2027-11-01",
  subjects: track === "OL"
    ? ["Mathematics", "Science", "English", "History", "Sinhala"]
    : ["Combined Mathematics", "Physics", "Chemistry"],
  dailyGoalHours: 6,
  weeklyGoalHours: 42,
  onboarded: true,
});

afterEach(() => values.clear());

describe("isolated admin preview datasets", () => {
  test("creates independent O/L and A/L local datasets", () => {
    const ol = loadAdminPersonalPreview("admin-account", profile("OL"));
    const al = loadAdminPersonalPreview("admin-account", profile("AL"));

    expect(ol.sessions.length).toBeGreaterThan(20);
    expect(al.sessions.length).toBeGreaterThan(20);
    expect(ol.sessions.every((row) => profile("OL").subjects.includes(row.subject))).toBe(true);
    expect(al.sessions.every((row) => profile("AL").subjects.includes(row.subject))).toBe(true);
    expect(ol.wasted.length).toBeGreaterThan(0);
    expect(al.wasted.length).toBeGreaterThan(0);
    expect(ol.marks.length).toBeGreaterThan(0);
    expect(al.marks.length).toBeGreaterThan(0);
    expect(ol.chapters.length).toBeGreaterThan(0);
    expect(al.chapters.length).toBeGreaterThan(0);
    expect(values.has("study-radar:admin-personal-preview:v2:admin-account:OL")).toBe(true);
    expect(values.has("study-radar:admin-personal-preview:v2:admin-account:AL")).toBe(true);
  });

  test("keeps preview writes local to the selected track", () => {
    const ol = loadAdminPersonalPreview("admin-account", profile("OL"));
    const changed = { ...ol, sessions: [...ol.sessions, { id: "admin-preview:extra", date: "2026-11-10", subject: "Mathematics", minutes: 30, createdAt: Date.now() }] };
    saveAdminPersonalPreview("admin-account", "OL", changed);

    expect(loadAdminPersonalPreview("admin-account", profile("OL")).sessions).toHaveLength(changed.sessions.length);
    expect(loadAdminPersonalPreview("admin-account", profile("AL")).sessions).not.toHaveLength(changed.sessions.length);
    expect(isAdminPreviewId("admin-preview:extra")).toBe(true);
    expect(isAdminPreviewId("real-student-row")).toBe(false);
  });

  test("resets one preview without deleting the other track", () => {
    loadAdminPersonalPreview("admin-account", profile("OL"));
    loadAdminPersonalPreview("admin-account", profile("AL"));
    resetAdminPersonalPreview("admin-account", "OL");

    expect(values.has("study-radar:admin-personal-preview:v2:admin-account:OL")).toBe(false);
    expect(values.has("study-radar:admin-personal-preview:v2:admin-account:AL")).toBe(true);
  });
});
