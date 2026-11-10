import type { Profile, StudyOSData, StudySession } from "./types";

const KEY_PREFIX = "study-radar:admin-personal-preview:v2:";
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const fallbackSubjects = (track: Profile["track"]) =>
  track === "OL"
    ? ["Mathematics", "Science", "English", "History", "Sinhala"]
    : ["Combined Mathematics", "Physics", "Chemistry", "English", "General English"];

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function makePreviewData(profile: Profile): StudyOSData {
  const subjects = profile.subjects.length ? profile.subjects : fallbackSubjects(profile.track);
  const random = seededRandom(20261109);
  const sessions: StudySession[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 179);

  for (let day = new Date(start); day <= today; day.setDate(day.getDate() + 1)) {
    const weekday = day.getDay();
    const chance = weekday === 0 ? 0.18 : weekday === 6 ? 0.72 : 0.58;
    if (random() > chance) continue;
    const count = random() > 0.78 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const subject = subjects[Math.floor(random() * subjects.length)]!;
      const minutes = 35 + Math.floor(random() * 86);
      const date = dateKey(day);
      sessions.push({
        id: `admin-preview:session:${date}:${sessions.length}`,
        date,
        subject,
        minutes,
        note: ["Past paper practice", "Reviewed class notes", "Worked through examples", "Revision and recall"][Math.floor(random() * 4)],
        createdAt: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 17 + Math.floor(random() * 5)).getTime(),
      });
    }
  }

  // Add a few recent days so the dashboard's current streak and weekly cards are useful.
  for (let offset = 0; offset < 5; offset++) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    if (day.getDay() === 0) continue;
    const date = day.toISOString().slice(0, 10);
    if (sessions.some((session) => session.date === date)) continue;
    const subject = subjects[offset % subjects.length]!;
    sessions.push({
      id: `admin-preview:recent:${date}`,
      date,
      subject,
      minutes: 55 + offset * 9,
      note: "Focused revision session",
      createdAt: day.getTime(),
    });
  }

  const marks = subjects.slice(0, 5).flatMap((subject, index) =>
    [0, 1, 2].map((attempt) => {
      const date = new Date(today);
      date.setMonth(today.getMonth() - (5 - attempt));
      date.setDate(5 + index * 3);
      const total = 100;
      const base = 48 + index * 5 + attempt * (3 + (index % 3));
      return {
        id: `admin-preview:mark:${index}:${attempt}`,
        subject,
        examName: ["Monthly test", "Timed paper", "Term assessment"][attempt]!,
        date: dateKey(date),
        marks: Math.min(96, base),
        total,
      };
    }),
  );

  const chapters = subjects.flatMap((subject, subjectIndex) =>
    Array.from({ length: 6 }, (_, index) => ({
      id: `admin-preview:chapter:${subjectIndex}:${index}`,
      subject,
      title: `Unit ${String(index + 1).padStart(2, "0")} · ${["Core concepts", "Structured questions", "Applications", "Past-paper practice", "Revision notes", "Mixed exercises"][index]}`,
      status: (index < 2 ? "done" : index === 2 || (subjectIndex + index) % 4 === 0 ? "doing" : "todo") as "done" | "doing" | "todo",
    })),
  );

  const wasted = sessions
    .filter((_, index) => index % 7 === 0)
    .slice(0, 18)
    .map((session, index) => ({
      id: `admin-preview:waste:${index}`,
      date: session.date,
      minutes: 10 + (index % 4) * 10,
      reason: ["Unplanned phone break", "Got distracted", "Delayed getting started"][index % 3],
    }));

  return { sessions, marks, chapters, wasted };
}

export function loadAdminPersonalPreview(uid: string, profile: Profile): StudyOSData {
  if (typeof window === "undefined") return makePreviewData(profile);
  const key = KEY_PREFIX + uid + ":" + profile.track;
  try {
    const stored = window.localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as StudyOSData;
    const created = makePreviewData(profile);
    window.localStorage.setItem(key, JSON.stringify(created));
    return created;
  } catch {
    return makePreviewData(profile);
  }
}

export function saveAdminPersonalPreview(uid: string, track: Profile["track"], data: StudyOSData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_PREFIX + uid + ":" + track, JSON.stringify(data));
  } catch {
    // The preview is optional; never block the real student account on storage errors.
  }
}

export function isAdminPreviewId(id: string) {
  return id.startsWith("admin-preview:");
}

export function resetAdminPersonalPreview(uid: string, track: Profile["track"]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY_PREFIX + uid + ":" + track);
  } catch {
    // Reset is best-effort and never affects platform data.
  }
}
