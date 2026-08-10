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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { syncConsent } from "./security";
import {
  EMPTY_DATA,
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
  avatar_url?: string | null;
  email?: string | null;
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
    avatarUrl: r.avatar_url ?? undefined,
    email: r.email ?? undefined,
  };
}

/** Surface backend failures instead of silently swallowing them. */
function check(error: { message: string } | null, what: string) {
  if (error) {
    console.error(`[StudyRadar] ${what} failed:`, error.message);
    toast.error(`Could not ${what}`, { description: error.message });
    return false;
  }
  return true;
}

interface Store {
  ready: boolean;
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  profile: Profile | null;
  avatarSrc: string | null;
  data: StudyOSData;
  refresh: () => Promise<void>;
  updateProfile: (p: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
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
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<StudyOSData>(EMPTY_DATA);

  const userId = session?.user?.id ?? null;

  const load = useCallback(async (uid: string) => {
    const [p, roles, sessions, marks, chapters] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", uid)
        .order("date", { ascending: false }),
      supabase.from("marks").select("*").eq("user_id", uid).order("date", { ascending: true }),
      supabase
        .from("chapters")
        .select("*")
        .eq("user_id", uid)
        .order("position", { ascending: true }),
    ]);

    check(p.error, "load your profile");

    const prof = p.data ? rowToProfile(p.data as ProfileRow) : null;
    setProfile(prof);

    // Consent captured before an OAuth redirect lands on the profile row here.
    void syncConsent(uid, Boolean((p.data as { terms_accepted_at?: string } | null)?.terms_accepted_at));

    // Avatars live in a private bucket, so stored paths need a signed URL.
    const raw = prof?.avatarUrl;
    if (!raw) {
      setAvatarSrc(null);
    } else if (raw.startsWith("http")) {
      setAvatarSrc(raw);
    } else {
      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(raw, 60 * 60 * 24 * 7);
      setAvatarSrc(signed?.signedUrl ?? null);
    }

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
        setAvatarSrc(null);
        setIsAdmin(false);
        setData(EMPTY_DATA);
        setReady(true);
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
      avatarSrc,
      data,
      refresh,
      updateProfile: async (p) => {
        if (!userId) return;
        const patch: Record<string, unknown> = {};
        if (p.name !== undefined) patch["name"] = p.name;
        if (p.track !== undefined) patch["track"] = p.track;
        if (p.examYear !== undefined) patch["exam_year"] = p.examYear;
        if (p.examDate !== undefined) patch["exam_date"] = p.examDate;
        if (p.stream !== undefined) patch["stream"] = p.stream ?? null;
        if (p.subjects !== undefined) patch["subjects"] = p.subjects;
        if (p.dailyGoalHours !== undefined) patch["daily_target_hours"] = p.dailyGoalHours;
        if (p.onboarded !== undefined) patch["onboarded"] = p.onboarded;
        if (p.avatarUrl !== undefined) patch["avatar_url"] = p.avatarUrl ?? null;

        // The signup trigger creates the row, but upsert keeps older accounts
        // and edge cases (missing row) working instead of silently no-op-ing.
        const { error } = await supabase
          .from("profiles")
          .upsert({ id: userId, ...patch } as never, { onConflict: "id" });
        if (!check(error, "save your profile")) return;
        await load(userId);
      },
      uploadAvatar: async (file) => {
        if (!userId) return;
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/avatar-${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true, contentType: file.type });
        if (!check(error, "upload your picture")) return;
        const { error: pErr } = await supabase
          .from("profiles")
          .update({ avatar_url: path })
          .eq("id", userId);
        if (!check(pErr, "save your picture")) return;
        await load(userId);
        toast.success("Profile picture updated");
      },
      addSession: async (s) => {
        if (!userId) return;
        const { error } = await supabase.from("study_sessions").insert({
          user_id: userId,
          date: s.date,
          subject: s.subject,
          minutes: s.minutes,
          note: s.note ?? null,
        });
        if (!check(error, "save that study session")) return;
        await load(userId);
      },
      removeSession: async (id) => {
        if (!userId) return;
        const { error } = await supabase.from("study_sessions").delete().eq("id", id);
        if (!check(error, "delete that session")) return;
        await load(userId);
      },
      addMark: async (m) => {
        if (!userId) return;
        const { error } = await supabase.from("marks").insert({
          user_id: userId,
          subject: m.subject,
          exam_name: m.examName,
          marks: m.marks,
          total: m.total,
          date: m.date,
        });
        if (!check(error, "save that result")) return;
        await load(userId);
      },
      removeMark: async (id) => {
        if (!userId) return;
        const { error } = await supabase.from("marks").delete().eq("id", id);
        if (!check(error, "delete that result")) return;
        await load(userId);
      },
      addChapter: async (subject, title) => {
        if (!userId) return;
        const { error } = await supabase
          .from("chapters")
          .insert({ user_id: userId, subject, title });
        if (!check(error, "add that chapter")) return;
        await load(userId);
      },
      setChapterStatus: async (id, status) => {
        if (!userId) return;
        const { error } = await supabase.from("chapters").update({ status }).eq("id", id);
        if (!check(error, "update that chapter")) return;
        await load(userId);
      },
      removeChapter: async (id) => {
        if (!userId) return;
        const { error } = await supabase.from("chapters").delete().eq("id", id);
        if (!check(error, "delete that chapter")) return;
        await load(userId);
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [ready, session, isAdmin, profile, avatarSrc, data, refresh, userId, load],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudyOS(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStudyOS must be used inside StudyOSProvider");
  return ctx;
}
