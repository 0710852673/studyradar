import { supabase } from "@/integrations/supabase/client";

/** Row shapes as they come back from the database for the admin workspace. */
export type AdminProfile = {
  id: string;
  name: string;
  email: string | null;
  track: string;
  exam_year: number;
  exam_date: string | null;
  stream: string | null;
  subjects: string[] | null;
  daily_target_hours: number;
  onboarded: boolean;
  avatar_url: string | null;
  city: string | null;
  district: string | null;
  mobile: string | null;
  school: string | null;
  grade: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  bio: string | null;
  suspended: boolean | null;
  suspended_reason: string | null;
  suspended_at: string | null;
  is_demo: boolean | null;
  terms_accepted_at: string | null;
  last_seen_at: string | null;
  created_at: string;
};

export type AdminSession = {
  id: string;
  user_id: string;
  date: string;
  subject: string;
  minutes: number;
  note: string | null;
  created_at: string;
};

export type AdminMark = {
  id: string;
  user_id: string;
  subject: string;
  exam_name: string;
  marks: number;
  total: number;
  date: string;
};

export type AdminChapter = {
  id: string;
  user_id: string;
  subject: string;
  title: string;
  status: string;
};

export type AdminEvent = {
  id: string;
  user_id: string | null;
  kind: string;
  severity: string;
  email: string | null;
  detail: string | null;
  path: string | null;
  created_at: string;
};

export type AdminDevice = {
  id: string;
  user_id: string | null;
  email: string | null;
  ip: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  user_agent: string | null;
  platform: string | null;
  screen: string | null;
  timezone: string | null;
  language: string | null;
  path: string | null;
  kind: string;
  created_at: string;
};

export type AdminRole = { user_id: string; role: string };

export interface AdminSnapshot {
  profiles: AdminProfile[];
  sessions: AdminSession[];
  marks: AdminMark[];
  chapters: AdminChapter[];
  events: AdminEvent[];
  devices: AdminDevice[];
  roles: AdminRole[];
}

export const EMPTY_SNAPSHOT: AdminSnapshot = {
  profiles: [],
  sessions: [],
  marks: [],
  chapters: [],
  events: [],
  devices: [],
  roles: [],
};

/** One round trip for the entire platform — admin RLS policies allow the reads. */
export async function loadSnapshot(): Promise<AdminSnapshot> {
  const [p, s, m, c, e, d, r] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("study_sessions").select("*"),
    supabase.from("marks").select("*"),
    supabase.from("chapters").select("id, user_id, subject, title, status"),
    supabase
      .from("security_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("device_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  return {
    profiles: (p.data ?? []) as AdminProfile[],
    sessions: (s.data ?? []) as AdminSession[],
    marks: (m.data ?? []) as AdminMark[],
    chapters: (c.data ?? []) as AdminChapter[],
    events: (e.data ?? []) as AdminEvent[],
    devices: (d.data ?? []) as AdminDevice[],
    roles: (r.data ?? []) as AdminRole[],
  };
}

// ---------------------------------------------------------------- exports --

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]!);
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
}

export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------- analytics --

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Distinct users who logged a session within the last `days` days. */
export function activeWithin(sessions: AdminSession[], days: number) {
  const since = dayKey(new Date(Date.now() - days * 864e5));
  return new Set(sessions.filter((s) => s.date >= since).map((s) => s.user_id)).size;
}

/** Minutes studied per day for the last `days` days, oldest first. */
export function dailyMinutes(sessions: AdminSession[], days: number) {
  const out: { date: string; minutes: number }[] = [];
  const map = new Map<string, number>();
  for (const s of sessions) map.set(s.date, (map.get(s.date) ?? 0) + s.minutes);
  for (let i = days - 1; i >= 0; i--) {
    const key = dayKey(new Date(Date.now() - i * 864e5));
    out.push({ date: key, minutes: map.get(key) ?? 0 });
  }
  return out;
}

/** Signups per day for the last `days` days, oldest first. */
export function dailySignups(profiles: AdminProfile[], days: number) {
  const map = new Map<string, number>();
  for (const p of profiles) {
    const k = p.created_at.slice(0, 10);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from({ length: days }, (_, i) => {
    const key = dayKey(new Date(Date.now() - (days - 1 - i) * 864e5));
    return { date: key, count: map.get(key) ?? 0 };
  });
}

export function countBy<T>(rows: T[], pick: (row: T) => string | null | undefined) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const k = pick(row);
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}
