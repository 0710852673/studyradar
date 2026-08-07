import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  EMPTY_DATA,
  type Chapter,
  type ChapterStatus,
  type MarkEntry,
  type Profile,
  type StudyOSData,
  type StudySession,
} from "./types";

/**
 * Cloud-backed data layer. Every read/write for the signed-in student funnels
 * through here, so pages never touch the backend directly.
 */

type ProfileRow = {
  id: string;
  name: string;
  track: string;
  exam_year: number;
  exam_date: string | null;
  stream: string | null;
  subjects: string[] | null;
  daily_target_hours: number;
  onboarded: boolean;
};

export function rowToProfile(r: ProfileRow): Profile {
  const track = (r.track === "OL" ? "OL" : "AL") as Profile["track"];
  return {
    id: r.id,
    name: r.name,
    track,
    examYear: r.exam_year,
    examDate: r.exam_date ?? `${r.exam_year}-${track === "AL" ? "11" : "12"}-01`,
    stream: r.stream ?? undefined,
    subjects: r.subjects ?? [],
    dailyGoalHours: Number(r.daily_target_hours),
    weeklyGoalHours: Math.round(Number(r.daily_target_hours) * 7),
    onboarded: r.onboarded,
  };
}

interface Store {
  ready: boolean;
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  profile: Profile | null;
  data: StudyOSData;
  refresh: () => Promise<void>;
  updateProfile: (p: Partial<Profile>) => Promise<void>;
  addSession: (s: Omit<StudySession, "id" | "createdAt">) => Promise<void>;
  removeSession: (id: string) => Promise<void>;
  addMark: (m: Omit<MarkEntry, "id">) => Promise<void>;
  removeMark: (id: string) => Promise<void>;
  addChapter: (subject: string, title: string) => Promise<void>;
  setChapterStatus: (id: string, status: ChapterStatus) => Promise<void>;
  removeChapter: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

export function StudyOSProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<StudyOSData>(EMPTY_DATA);

  const userId = session?.user?.id ?? null;

  const load = useCallback(async (uid: string) => {
    const [p, roles, sessions, marks, chapters] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("study_sessions").select("*").eq("user_id", uid).order("date", { ascending: false }),
      supabase.from("marks").select("*").eq("user_id", uid).order("date", { ascending: true }),
      supabase.from("chapters").select("*").eq("user_id", uid).order("position", { ascending: true }),
    ]);

    setProfile(p.data ? rowToProfile(p.data as ProfileRow) : null);
    setIsAdmin((roles.data ?? []).some((r: { role: string }) => r.role === "admin"));
    setData({
      sessions: (sessions.data ?? []).map((s: any) => ({
        id: s.id,
        date: s.date,
        subject: s.subject,
        minutes: s.minutes,
        note: s.note ?? undefined,
        createdAt: new Date(s.created_at).getTime(),
      })),
      marks: (marks.data ?? []).map((m: any) => ({
        id: m.id,
        subject: m.subject,
        examName: m.exam_name,
        date: m.date,
        marks: Number(m.marks),
        total: Number(m.total),
      })),
      chapters: (chapters.data ?? []).map((c: any) => ({
        id: c.id,
        subject: c.subject,
        title: c.title,
        status: c.status as ChapterStatus,
      })),
    });
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) {
        setProfile(null);
        setIsAdmin(false);
        setData(EMPTY_DATA);
      }
    });
    supabase.auth.getSession().then(({ data: d }) => {
      setSession(d.session);
      if (!d.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    void load(userId).finally(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [userId, load]);

  const refresh = useCallback(async () => {
    if (userId) await load(userId);
  }, [userId, load]);

  const value = useMemo<Store>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      isAdmin,
      profile,
      data,
      refresh,
      updateProfile: async (p) => {
        if (!userId) return;
        const patch: Record<string, unknown> = {};
        if (p.name !== undefined) patch['name'] = p.name;
        if (p.track !== undefined) patch['track'] = p.track;
        if (p.examYear !== undefined) patch['exam_year'] = p.examYear;
        if (p.examDate !== undefined) patch['exam_date'] = p.examDate;
        if (p.stream !== undefined) patch['stream'] = p.stream;
        if (p.subjects !== undefined) patch['subjects'] = p.subjects;
        if (p.dailyGoalHours !== undefined) patch['daily_target_hours'] = p.dailyGoalHours;
        if (p.onboarded !== undefined) patch['onboarded'] = p.onboarded;
        await supabase.from("profiles").update(patch).eq("id", userId);
        await load(userId);
      },
      addSession: async (s) => {
        if (!userId) return;
        await supabase.from("study_sessions").insert({
          user_id: userId,
          date: s.date,
          subject: s.subject,
          minutes: s.minutes,
          note: s.note ?? null,
        });
        await load(userId);
      },
      removeSession: async (id) => {
        if (!userId) return;
        await supabase.from("study_sessions").delete().eq("id", id);
        await load(userId);
      },
      addMark: async (m) => {
        if (!userId) return;
        await supabase.from("marks").insert({
          user_id: userId,
          subject: m.subject,
          exam_name: m.examName,
          marks: m.marks,
          total: m.total,
          date: m.date,
        });
        await load(userId);
      },
      removeMark: async (id) => {
        if (!userId) return;
        await supabase.from("marks").delete().eq("id", id);
        await load(userId);
      },
      addChapter: async (subject, title) => {
        if (!userId) return;
        await supabase.from("chapters").insert({ user_id: userId, subject, title });
        await load(userId);
      },
      setChapterStatus: async (id, status) => {
        if (!userId) return;
        await supabase.from("chapters").update({ status }).eq("id", id);
        await load(userId);
      },
      removeChapter: async (id) => {
        if (!userId) return;
        await supabase.from("chapters").delete().eq("id", id);
        await load(userId);
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [ready, session, isAdmin, profile, data, refresh, userId, load],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudyOS(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStudyOS must be used inside StudyOSProvider");
  return ctx;
}
