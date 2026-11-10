import { supabase } from "@/integrations/supabase/client";

/** Operational row shapes for the admin workspace. Broad reads intentionally omit guardian/contact details. */
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
  school: string | null;
  grade: string | null;
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
export type AdminWaste = {
  id: string;
  user_id: string;
  date: string;
  minutes: number;
  reason: string | null;
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
/** Coarse, consented activity only. Raw IP, location, email and device fingerprints are never selected. */
export type AdminDevice = {
  id: string;
  user_id: string | null;
  kind: string;
  path: string | null;
  platform: string | null;
  created_at: string;
};
export type AdminRole = { user_id: string; role: string };
export type AdminAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  title: string;
  description: string;
  awarded_at: string;
  email_status: "pending" | "sending" | "sent" | "failed" | "skipped";
  email_sent_at: string | null;
};
export type AdminAudit = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  detail: string | null;
  created_at: string;
};
export type AdminOperation = { id: string; status: string; created_at: string };
export type AdminReferral = {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  created_at: string;
};

export interface AdminSnapshot {
  profiles: AdminProfile[];
  sessions: AdminSession[];
  wasted: AdminWaste[];
  marks: AdminMark[];
  chapters: AdminChapter[];
  events: AdminEvent[];
  devices: AdminDevice[];
  roles: AdminRole[];
  achievements: AdminAchievement[];
  audit: AdminAudit[];
  contacts: AdminOperation[];
  feedback: AdminOperation[];
  suggestions: AdminOperation[];
  resources: AdminOperation[];
  referrals: AdminReferral[];
}

export const EMPTY_SNAPSHOT: AdminSnapshot = {
  profiles: [], sessions: [], wasted: [], marks: [], chapters: [], events: [], devices: [],
  roles: [], achievements: [], audit: [], contacts: [], feedback: [], suggestions: [],
  resources: [], referrals: [],
};

const PROFILE_COLUMNS = "id,name,email,track,exam_year,exam_date,stream,subjects,daily_target_hours,onboarded,avatar_url,city,district,school,grade,bio,suspended,suspended_reason,suspended_at,is_demo,terms_accepted_at,last_seen_at,created_at";
const DEVICE_COLUMNS = "id,user_id,kind,path,platform,created_at";

/** All admin reads are checked together; partial data is never presented as a complete platform snapshot. */
export async function loadSnapshot(): Promise<AdminSnapshot> {
  const [p, s, w, m, c, e, d, r, a, audit, contacts, feedback, suggestions, resources, referrals] = await Promise.all([
    supabase.from("profiles").select(PROFILE_COLUMNS).order("created_at", { ascending: false }),
    supabase.from("study_sessions").select("*"),
    supabase.from("wasted_time").select("*"),
    supabase.from("marks").select("*"),
    supabase.from("chapters").select("id,user_id,subject,title,status"),
    supabase.from("security_events").select("id,user_id,kind,severity,email,detail,path,created_at").order("created_at", { ascending: false }).limit(1000),
    supabase.from("device_events").select(DEVICE_COLUMNS).order("created_at", { ascending: false }).limit(1000),
    supabase.from("user_roles").select("user_id,role"),
    supabase.from("achievement_awards").select("*").order("awarded_at", { ascending: false }).limit(1000),
    supabase.from("admin_audit_events").select("*").order("created_at", { ascending: false }).limit(1000),
    supabase.from("contact_messages").select("id,status,created_at"),
    supabase.from("feedback").select("id,status,created_at"),
    supabase.from("resource_suggestions").select("id,status,created_at"),
    supabase.from("resources").select("id,status,created_at"),
    supabase.from("referral_signups").select("id,referrer_id,referred_user_id,created_at"),
  ]);
  const results = { profiles: p, sessions: s, wasted: w, marks: m, chapters: c, security: e, activity: d, roles: r, achievements: a, audit, contacts, feedback, suggestions, resources, referrals };
  const failures = Object.entries(results).filter(([, result]) => result.error).map(([name, result]) => `${name}: ${result.error?.message ?? "unknown error"}`);
  if (failures.length) throw new Error(`Some admin data could not be loaded. ${failures.join(" · ")}`);
  return {
    profiles: (p.data ?? []) as AdminProfile[],
    sessions: (s.data ?? []) as AdminSession[],
    wasted: (w.data ?? []) as AdminWaste[],
    marks: (m.data ?? []) as AdminMark[],
    chapters: (c.data ?? []) as AdminChapter[],
    events: (e.data ?? []) as AdminEvent[],
    devices: (d.data ?? []) as AdminDevice[],
    roles: (r.data ?? []) as AdminRole[],
    achievements: (a.data ?? []) as AdminAchievement[],
    audit: (audit.data ?? []) as AdminAudit[],
    contacts: (contacts.data ?? []) as AdminOperation[],
    feedback: (feedback.data ?? []) as AdminOperation[],
    suggestions: (suggestions.data ?? []) as AdminOperation[],
    resources: (resources.data ?? []) as AdminOperation[],
    referrals: (referrals.data ?? []) as AdminReferral[],
  };
}

/** Explicit full-backup action fetches the complete profile rows only at download time. */
export async function createFullBackup(snap: AdminSnapshot) {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Backup could not read profiles: ${error.message}`);
  return { exportedAt: new Date().toISOString(), ...snap, profiles: data ?? [] };
}

export function isPlatformProfile(profile: Pick<AdminProfile, "is_demo">) {
  return profile.is_demo !== true;
}

/** Demo/preview accounts are permanently excluded from platform metrics, regardless of UI filters. */
export function platformRows<T extends { user_id: string }>(rows: T[], profiles: AdminProfile[]) {
  const ids = new Set(profiles.filter(isPlatformProfile).map((p) => p.id));
  return rows.filter((row) => ids.has(row.user_id));
}

export function withinDays(value: string, days: number | null, now = new Date()) {
  if (days === null) return true;
  const time = new Date(value.length === 10 ? `${value}T00:00:00Z` : value).getTime();
  if (!Number.isFinite(time)) return false;
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return time >= start.getTime() && time <= now.getTime() + 86400000;
}

export function sumMinutes(rows: { minutes: number }[]) {
  return rows.reduce((total, row) => total + Number(row.minutes || 0), 0);
}

export function summarizeActivity(rows: AdminDevice[]) {
  return {
    events: rows.length,
    visits: rows.filter((row) => row.kind === "visit").length,
    logins: rows.filter((row) => row.kind === "login").length,
    byPage: countBy(rows, (row) => row.path),
    byDevice: countBy(rows, (row) => row.platform),
    uniqueVisitors: null,
  };
}

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

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
export function activeWithin(sessions: AdminSession[], days: number) {
  const since = dayKey(new Date(Date.now() - (days - 1) * 864e5));
  return new Set(sessions.filter((s) => s.date >= since).map((s) => s.user_id)).size;
}
export function dailyMinutes(sessions: AdminSession[], days: number) {
  const map = new Map<string, number>();
  for (const s of sessions) map.set(s.date, (map.get(s.date) ?? 0) + s.minutes);
  return Array.from({ length: days }, (_, i) => {
    const date = dayKey(new Date(Date.now() - (days - 1 - i) * 864e5));
    return { date, minutes: map.get(date) ?? 0 };
  });
}
export function dailySignups(profiles: AdminProfile[], days: number) {
  const map = new Map<string, number>();
  for (const p of profiles) map.set(p.created_at.slice(0, 10), (map.get(p.created_at.slice(0, 10)) ?? 0) + 1);
  return Array.from({ length: days }, (_, i) => {
    const date = dayKey(new Date(Date.now() - (days - 1 - i) * 864e5));
    return { date, count: map.get(date) ?? 0 };
  });
}
export function countBy<T>(rows: T[], pick: (row: T) => string | null | undefined) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = pick(row);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}
