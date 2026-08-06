import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { EMPTY_DATA, type Lesson, type LessonStatus, type MarkEntry, type Profile, type StudyOSData, type StudySession } from "./types";

const KEY = "studyos:v1";

/**
 * Local-first persistence layer. Everything funnels through this module so a
 * cloud sync / multi-device backend can replace it without touching the UI.
 */
function read(): StudyOSData {
  if (typeof window === "undefined") return EMPTY_DATA;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_DATA;
    return { ...EMPTY_DATA, ...(JSON.parse(raw) as StudyOSData) };
  } catch {
    return EMPTY_DATA;
  }
}

function write(data: StudyOSData) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full or unavailable */
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);

interface Store {
  ready: boolean;
  data: StudyOSData;
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  updateProfile: (p: Partial<Profile>) => void;
  addSession: (s: Omit<StudySession, "id" | "createdAt">) => void;
  removeSession: (id: string) => void;
  addMark: (m: Omit<MarkEntry, "id">) => void;
  removeMark: (id: string) => void;
  addLesson: (subject: string, title: string) => void;
  setLessonStatus: (id: string, status: LessonStatus) => void;
  removeLesson: (id: string) => void;
  unlock: (id: string) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StudyOSProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StudyOSData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(read());
    setReady(true);
  }, []);

  const mutate = useCallback((fn: (d: StudyOSData) => StudyOSData) => {
    setData((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    const theme = data.profile?.theme ?? "dark";
    document.documentElement.classList.toggle("light", theme === "light");
  }, [ready, data.profile?.theme]);

  const value = useMemo<Store>(
    () => ({
      ready,
      data,
      profile: data.profile,
      setProfile: (p) => mutate((d) => ({ ...d, profile: p })),
      updateProfile: (p) =>
        mutate((d) => (d.profile ? { ...d, profile: { ...d.profile, ...p } } : d)),
      addSession: (s) =>
        mutate((d) => ({
          ...d,
          sessions: [...d.sessions, { ...s, id: uid(), createdAt: Date.now() }],
        })),
      removeSession: (id) =>
        mutate((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) })),
      addMark: (m) => mutate((d) => ({ ...d, marks: [...d.marks, { ...m, id: uid() }] })),
      removeMark: (id) => mutate((d) => ({ ...d, marks: d.marks.filter((m) => m.id !== id) })),
      addLesson: (subject, title) =>
        mutate((d) => ({
          ...d,
          lessons: [...d.lessons, { id: uid(), subject, title, status: "Not Started" as LessonStatus }],
        })),
      setLessonStatus: (id, status) =>
        mutate((d) => ({
          ...d,
          lessons: d.lessons.map((l: Lesson) => (l.id === id ? { ...l, status } : l)),
        })),
      removeLesson: (id) =>
        mutate((d) => ({ ...d, lessons: d.lessons.filter((l) => l.id !== id) })),
      unlock: (id) =>
        mutate((d) =>
          d.unlocked.includes(id) ? d : { ...d, unlocked: [...d.unlocked, id] },
        ),
      reset: () => mutate(() => EMPTY_DATA),
    }),
    [data, mutate, ready],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudyOS(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStudyOS must be used inside StudyOSProvider");
  return ctx;
}

/** Convenience hook for pages that require a completed onboarding. */
export function useProfile(): Profile {
  const { profile } = useStudyOS();
  if (!profile) throw new Error("Profile not ready");
  return profile;
}
