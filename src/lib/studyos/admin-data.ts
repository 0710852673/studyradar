import { supabase } from "@/integrations/supabase/client";
import { fetchAllPages } from "./pagination";
import { colomboDateKey, colomboDateKeyMinusDays } from "./date-range";
export { withinDays } from "./date-range";

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
  user_agent?: string | null;
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
    fetchAllPages((from, to) => supabase.from("profiles").select(PROFILE_COLUMNS).order("created_at", { ascending: false }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("study_sessions").select("*").order("date", { ascending: false }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("wasted_time").select("*").order("date", { ascending: false }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("marks").select("*").order("date", { ascending: false }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("chapters").select("id,user_id,subject,title,status").order("user_id", { ascending: true }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("security_events").select("id,user_id,kind,severity,email,detail,path,created_at").order("created_at", { ascending: false }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("device_events").select(DEVICE_COLUMNS).order("created_at", { ascending: false }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("user_roles").select("user_id,role").order("user_id", { ascending: true }).order("role", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("achievement_awards").select("*").order("awarded_at", { ascending: false }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("admin_audit_events").select("*").order("created_at", { ascending: false }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("contact_messages").select("id,status,created_at").order("created_at", { ascending: false }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("feedback").select("id,status,created_at").order("created_at", { ascending: false }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("resource_suggestions").select("id,status,created_at").order("created_at", { ascending: false }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("resources").select("id,status,created_at").order("created_at", { ascending: false }).order("id", { ascending: true }).range(from, to)),
    fetchAllPages((from, to) => supabase.from("referral_signups").select("id,referrer_id,referred_user_id,created_at").order("created_at", { ascending: false }).order("id", { ascending: true }).range(from, to)),
  ]);
  const results = [
    ["profiles", p], ["sessions", s], ["wasted time", w], ["marks", m], ["chapters", c],
    ["security events", e], ["activity", d], ["roles", r], ["achievements", a], ["admin audit", audit],
    ["contacts", contacts], ["feedback", feedback], ["suggestions", suggestions], ["resources", resources], ["referrals", referrals],
  ] as const;
  const failures = results.filter(([, result]) => result.error).map(([name, result]) => `${name}: ${result.error?.message ?? "unknown error"}`);
  if (failures.length) throw new Error(`Some admin data could not be loaded. ${failures.join(" · ")}`);
  return {
    profiles: (p.data ?? []) as AdminProfile[], sessions: (s.data ?? []) as AdminSession[],
    wasted: (w.data ?? []) as AdminWaste[], marks: (m.data ?? []) as AdminMark[],
    chapters: (c.data ?? []) as AdminChapter[], events: (e.data ?? []) as AdminEvent[],
    devices: (d.data ?? []) as AdminDevice[], roles: (r.data ?? []) as AdminRole[],
    achievements: (a.data ?? []) as AdminAchievement[], audit: (audit.data ?? []) as AdminAudit[],
    contacts: (contacts.data ?? []) as AdminOperation[], feedback: (feedback.data ?? []) as AdminOperation[],
    suggestions: (suggestions.data ?? []) as AdminOperation[], resources: (resources.data ?? []) as AdminOperation[],
    referrals: (referrals.data ?? []) as AdminReferral[],
  };
}

/** Explicit full-backup action re-fetches every profile column at download time. */
export async function createFullBackup(snap: AdminSnapshot) {
  const { data, error } = await fetchAllPages((from, to) => supabase.from("profiles").select("*").order("created_at", { ascending: false }).order("id", { ascending: true }).range(from, to));
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

const dayKey = colomboDateKey;
export function activeWithin(sessions: AdminSession[], days: number) {
  const now = new Date();
  const since = colomboDateKeyMinusDays(now, Math.max(0, days - 1));
  const today = colomboDateKey(now);
  return new Set(sessions.filter((s) => s.date >= since && s.date <= today).map((s) => s.user_id)).size;
}
export function dailyMinutes<T extends { date: string; minutes: number }>(sessions: T[], days: number) {
  const map = new Map<string, number>();
  for (const s of sessions) map.set(s.date, (map.get(s.date) ?? 0) + s.minutes);
  return Array.from({ length: days }, (_, i) => {
    const date = dayKey(new Date(Date.now() - (days - 1 - i) * 864e5));
    return { date, minutes: map.get(date) ?? 0 };
  });
}
export function dailySignups(profiles: AdminProfile[], days: number) {
  const map = new Map<string, number>();
  for (const p of profiles) { const date = dayKey(p.created_at); if (date) map.set(date, (map.get(date) ?? 0) + 1); }
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

export type PdfReportSection = { heading: string; rows: string[][] };
const escapePdfHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

/** Browser-native print flow produces a real PDF via Save as PDF and works without a server upload. */
export function openPdfReport(title: string, subtitle: string, sections: PdfReportSection[]) {
  const popup = window.open("", "_blank");
  if (!popup) return false;
  const body = sections.map((section) => `
    <section><h2>${escapePdfHtml(section.heading)}</h2>
    <table><tbody>${section.rows.map((row) => `<tr><th>${escapePdfHtml(row[0])}</th><td>${escapePdfHtml(row[1])}</td></tr>`).join("")}</tbody></table></section>
  `).join("");
  popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapePdfHtml(title)}</title>
  <style>
    @page{size:A4;margin:16mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#17212b;margin:0;font-size:11px;line-height:1.5}
    header{border-bottom:3px solid #22c997;padding-bottom:14px;margin-bottom:20px}header p{margin:0;color:#64748b;font-size:10px;letter-spacing:1.5px;text-transform:uppercase}
    h1{font-size:24px;margin:8px 0 3px}header small{color:#64748b}section{margin:0 0 20px;break-inside:avoid}h2{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#0b8060;border-bottom:1px solid #dbe4e8;padding-bottom:7px}
    table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:7px 9px;border-bottom:1px solid #e7edf0;vertical-align:top}th{width:38%;color:#52616b;font-weight:600}td{color:#17212b}
    footer{margin-top:28px;border-top:1px solid #dbe4e8;padding-top:9px;color:#71808a;font-size:9px}
    @media print{section{break-inside:avoid}a{color:inherit;text-decoration:none}}
  </style></head><body><header><p>Study Radar · Control Centre</p><h1>${escapePdfHtml(title)}</h1><small>${escapePdfHtml(subtitle)} · Generated ${escapePdfHtml(new Date().toLocaleString())}</small></header>${body}<footer>Confidential operational report. Contains student learning data. Handle and store securely.</footer><script>window.onload=()=>setTimeout(()=>window.print(),250);window.onafterprint=()=>window.close();</script></body></html>`);
  popup.document.close();
  return true;
}
