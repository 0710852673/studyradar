import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, BookOpenCheck, Clock, Download,
  Globe, Link2, Mail, Radar, ShieldAlert, Trophy, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { fmtHours } from "@/lib/studyos/analytics";
import {
  activeWithin, countBy, dailyMinutes, dailySignups, download, sumMinutes,
  summarizeActivity, toCsv, withinDays,
  type AdminAchievement, type AdminAudit, type AdminChapter, type AdminDevice, type AdminEvent, type type AdminMark, type AdminProfile, type AdminReferral, type AdminSession,
  type AdminSnapshot, type AdminWaste,
} from "@/lib/studyos/admin-data";
import { cn } from "@/lib/utils";

export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="relative block w-full max-w-lg"><span className="sr-only">{placeholder}</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="pl-9" /></label>;
}
export function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</div>;
}
export function Tag({ children, tone }: { children: React.ReactNode; tone?: "good" | "bad" | undefined }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wide", tone === "bad" ? "border-destructive/35 bg-destructive/[0.07] text-destructive" : tone === "good" ? "border-primary/30 bg-primary/[0.07] text-primary" : "border-border bg-background/50 text-muted-foreground")}>{children}</span>;
}
export function Card({ label, value, icon: Icon, hint }: { label: string; value: string; icon: typeof Users; hint?: string | undefined }) {
  return <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-white/[0.075] bg-gradient-to-br from-[#17222e] to-[#101923] p-4 shadow-[0_12px_35px_-28px_rgba(0,0,0,.8)] transition-all hover:-translate-y-0.5 hover:border-primary/25 sm:p-5">
    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/[0.055] blur-2xl transition-opacity group-hover:opacity-100" />
    <div className="relative flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-[10px] font-semibold uppercase tracking-[.14em] text-white/45">{label}</p><p className="num mt-3 break-words font-display text-2xl font-bold tracking-tight text-white sm:text-[28px]">{value}</p></div><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.09] text-primary"><Icon className="h-4 w-4" /></span></div>
    {hint ? <p className="relative mt-2 text-[10px] leading-relaxed text-white/40">{hint}</p> : null}
    <div className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-primary/35 via-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
  </div>;
}
export function Block({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <section className="min-w-0 rounded-2xl border border-white/[0.075] bg-[#101923] p-4 shadow-[0_12px_35px_-30px_rgba(0,0,0,.8)] sm:p-5"><div className="mb-4 flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3"><h2 className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/45">{title}</h2>{action}</div>{children}</section>;
}
export function Bars({ data, format, tone = "primary" }: { data: { label: string; value: number }[]; format: (value: number) => string; tone?: "primary" | "muted" }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return <div className="flex h-32 items-end gap-[3px]" role="img" aria-label={data.map((item) => `${item.label}: ${format(item.value)}`).join(", ")}>{data.map((item, index) => <div key={`${item.label}-${index}`} className="group relative min-w-0 flex-1" title={`${item.label}: ${format(item.value)}`}><div className={cn("w-full rounded-t transition-colors", tone === "primary" ? "bg-primary/70 group-hover:bg-primary" : "bg-muted-foreground/35 group-hover:bg-muted-foreground/55")} style={{ height: `${Math.max(2, (item.value / max) * 100)}%` }} /></div>)}</div>;
}
export function KV({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-xs"><span className="text-muted-foreground">{label}</span><span className="num truncate text-right">{value}</span></div>;
}

export function Overview({ people, allSessions, sessions, wasted, marks, chapters, snap, rangeDays }: {
  people: AdminProfile[]; allSessions: AdminSession[]; sessions: AdminSession[]; wasted: AdminWaste[];
  marks: AdminMark[]; chapters: AdminChapter[]; snap: AdminSnapshot; rangeDays: number | null;
}) {
  const studyMinutes = sumMinutes(sessions);
  const wasteMinutes = sumMinutes(wasted);
  const active7 = activeWithin(allSessions, 7);
  const active30 = activeWithin(allSessions, 30);
  const signups = people.filter((person) => withinDays(person.created_at, rangeDays)).length;
  const done = chapters.filter((chapter) => chapter.status === "done").length;
  const pendingSuggestions = snap.suggestions.filter((row) => row.status === "pending").length;
  const openInbox = [...snap.contacts, ...snap.feedback].filter((row) => row.status !== "done").length;
  const alerts = snap.events.filter((event) => ["warning", "critical"].includes(event.severity) && withinDays(event.created_at, rangeDays)).length;
  const failedEmails = snap.achievements.filter((award) => award.email_status === "failed").length;
  const chartDays = rangeDays ?? 30;
  const trackCounts = countBy(people, (person) => person.track);
  const subjectStudy = countBy(sessions, (session) => session.subject).slice(0, 8);
  const subjectMax = Math.max(1, ...subjectStudy.map((row) => row[1]));
  const rangeLabel = rangeDays ? `last ${rangeDays} days` : "all recorded time";
  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card label="Registered students" value={String(people.length)} icon={Users} hint="Real, non-demo profiles; all time" />
      <Card label="Active students · 7 days" value={String(active7)} icon={Activity} hint="Distinct students with a study log" />
      <Card label="Active students · 30 days" value={String(active30)} icon={Radar} hint="Distinct students with a study log" />
      <Card label={`New registrations · ${rangeLabel}`} value={String(signups)} icon={Users} />
      <Card label={`Study time · ${rangeLabel}`} value={fmtHours(studyMinutes)} icon={Clock} />
      <Card label={`Wasted time · ${rangeLabel}`} value={fmtHours(wasteMinutes)} icon={AlertTriangle} hint="Separate from study hours; never combined" />
      <Card label="Syllabus chapters completed" value={`${done} / ${chapters.length}`} icon={BookOpenCheck} hint={rangeDays ? "Current chapter state, not date-filtered" : undefined} />
      <Card label="Marks recorded" value={String(marks.length)} icon={BarChart3} hint={rangeDays ? `Exams dated within ${rangeLabel}` : "All recorded exams"} />
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      <Block title={`Study minutes · ${rangeLabel}`}><Bars data={dailyMinutes(sessions, chartDays).map((row) => ({ label: row.date.slice(5), value: row.minutes }))} format={fmtHours} /><ChartCaption days={chartDays} /></Block>
      <Block title={`Wasted minutes · ${rangeLabel}`}><Bars tone="muted" data={dailyMinutes(wasted, chartDays).map((row) => ({ label: row.date.slice(5), value: row.minutes }))} format={fmtHours} /><ChartCaption days={chartDays} /></Block>
    </div>
    <div className="grid gap-4 xl:grid-cols-3">
      <Block title="Operations needing attention"><div className="space-y-2"><KV label="Pending resource suggestions" value={String(pendingSuggestions)} /><KV label="Open contact + feedback messages" value={String(openInbox)} /><KV label="Security warnings / critical events" value={String(alerts)} /><KV label="Historical failed achievement emails" value={String(failedEmails)} /><KV label="New achievement awards" value={String(snap.achievements.filter((award) => withinDays(award.awarded_at, rangeDays)).length)} /></div><p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">Achievement email sending is disabled. Failed/pending historical states are not a live delivery queue.</p></Block>
      <Block title="Study by subject"><div className="space-y-3">{subjectStudy.map(([subject, minutes]) => <div key={subject}><div className="mb-1 flex justify-between gap-2 text-xs"><span className="truncate">{subject}</span><span className="num text-muted-foreground">{fmtHours(minutes)}</span></div><div className="h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${minutes / subjectMax * 100}%` }} /></div></div>)}{!subjectStudy.length ? <Empty text="No study sessions in this range." /> : null}</div></Block>
      <Block title="Registration & track"><Bars data={dailySignups(people, Math.min(chartDays, 30)).map((row) => ({ label: row.date.slice(5), value: row.count }))} format={String} /><div className="mt-3 flex flex-wrap gap-1.5">{trackCounts.map(([track, count]) => <Tag key={track}>{track} · {count}</Tag>)}</div><p className="mt-3 text-[10px] text-muted-foreground">Registration chart shows up to the latest 30 days. Cards use the selected range.</p></Block>
    </div>
    <p className="text-[10px] leading-relaxed text-muted-foreground">Metric definitions: active means at least one study entry in the stated window, not a page view. Study and wasted-time totals use entry dates. Demo and browser-only admin preview records are excluded.</p>
  </div>;
}
function ChartCaption({ days }: { days: number }) { return <div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>{days} days ago</span><span>Today</span></div>; }

export function Analytics({ people, sessions, wasted, marks, chapters, devices, referrals, rangeDays }: {
  people: AdminProfile[]; sessions: AdminSession[]; wasted: AdminWaste[]; marks: AdminMark[]; chapters: AdminChapter[];
  devices: AdminDevice[]; referrals: AdminReferral[]; rangeDays: number | null;
}) {
  const chartDays = rangeDays ?? 30;
  const subjectMinutes = countBy(sessions, (row) => row.subject);
  const subjectWaste = countBy(wasted, () => "All wasted time");
  const markRows = marks.map((mark) => ({ subject: mark.subject, exam: mark.exam_name, percentage: mark.total ? Math.round(mark.marks / mark.total * 1000) / 10 : 0, date: mark.date }));
  const featureUsage = countBy(devices.filter((row) => withinDays(row.created_at, rangeDays)), (row) => row.path);
  const exportDaily = () => {
    const study = new Map(dailyMinutes(sessions, chartDays).map((row) => [row.date, row.minutes]));
    const rows = dailyMinutes(wasted, chartDays).map((row) => ({ date: row.date, study_minutes: study.get(row.date) ?? 0, wasted_minutes: row.minutes }));
    download("study-radar-daily-metrics.csv", toCsv(rows), "text/csv");
  };
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-elevated p-4"><div><h2 className="text-sm font-semibold">Metric exports</h2><p className="mt-1 text-xs text-muted-foreground">Aggregates only. Study and wasted minutes are exported in separate columns.</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={exportDaily}><Download className="mr-1.5 h-3.5 w-3.5" />Daily CSV</Button><Button size="sm" variant="outline" disabled={!markRows.length} onClick={() => download("study-radar-marks-aggregate.csv", toCsv(markRows), "text/csv")}><Download className="mr-1.5 h-3.5 w-3.5" />Marks CSV</Button></div></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Card label="Study sessions" value={String(sessions.length)} icon={Activity} /><Card label="Average study entry" value={fmtHours(sessions.length ? Math.round(sumMinutes(sessions) / sessions.length) : 0)} icon={Clock} /><Card label="Wasted-time entries" value={String(wasted.length)} icon={AlertTriangle} /><Card label="Recorded referral signups" value={String(referrals.length)} icon={Link2} hint="Only completed, database-recorded attribution" /></div>
    <div className="grid gap-4 xl:grid-cols-2"><Block title="Study time by subject"><SubjectBars rows={subjectMinutes} /></Block><Block title="Exam track comparison"><div className="space-y-2">{countBy(people, (row) => row.track).map(([track, count]) => { const ids = new Set(people.filter((p) => p.track === track).map((p) => p.id)); return <KV key={track} label={`${track} · ${count} students`} value={`${fmtHours(sumMinutes(sessions.filter((s) => ids.has(s.user_id))))} study · ${fmtHours(sumMinutes(wasted.filter((w) => ids.has(w.user_id))))} wasted`} />; })}</div></Block></div>
    <div className="grid gap-4 xl:grid-cols-2"><Block title="Average marks by subject"><MarkAverages marks={marks} /></Block><Block title="Consented feature usage"><div className="space-y-2">{featureUsage.slice(0, 12).map(([page, count]) => <KV key={page} label={page} value={`${count} events`} />)}{!featureUsage.length ? <Empty text="No consented feature activity in this range." /> : null}</div><p className="mt-3 text-[10px] text-muted-foreground">Optional product analytics only; not total feature adoption.</p></Block></div>
    <Block title="Syllabus progress"><div className="grid gap-2 sm:grid-cols-3"><KV label="Completed" value={String(chapters.filter((c) => c.status === "done").length)} /><KV label="In progress" value={String(chapters.filter((c) => c.status === "doing" || c.status === "in_progress").length)} /><KV label="Not started" value={String(chapters.filter((c) => c.status === "todo").length)} /></div></Block>
    <p className="text-[10px] text-muted-foreground">Marks are record-level exports, not student identifiers. Subject wasted-time total: {fmtHours(subjectWaste[0]?.[1] ?? 0)}. No referral conversion rate is inferred beyond recorded signups.</p>
  </div>;
}
function SubjectBars({ rows }: { rows: [string, number][] }) { const max = Math.max(1, ...rows.map((row) => row[1])); return <div className="space-y-3">{rows.slice(0, 12).map(([subject, minutes]) => <div key={subject}><div className="mb-1 flex justify-between gap-2 text-xs"><span>{subject}</span><span className="num text-muted-foreground">{fmtHours(minutes)}</span></div><div className="h-2 rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${minutes / max * 100}%` }} /></div></div>)}{!rows.length ? <Empty text="No study data in this range." /> : null}</div>; }
function MarkAverages({ marks }: { marks: AdminMark[] }) { const values = new Map<string, { sum: number; count: number }>(); for (const mark of marks) { if (!mark.total) continue; const value = values.get(mark.subject) ?? { sum: 0, count: 0 }; values.set(mark.subject, { sum: value.sum + mark.marks / mark.total * 100, count: value.count + 1 }); } return <div className="space-y-2">{[...values.entries()].map(([subject, value]) => <KV key={subject} label={subject} value={`${Math.round(value.sum / value.count)}% · ${value.count} records`} />)}{!values.size ? <Empty text="No marks in this range." /> : null}</div>; }

export function VisitorPanel() {
  return <div className="space-y-4">
    <div className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-5">
      <div className="flex items-start gap-3"><Globe className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h2 className="text-sm font-semibold">Anonymous visitor analytics are not connected to this admin dataset</h2><p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">The current first-party app telemetry records consented activity for signed-in accounts. It does not create anonymous visitor IDs, source attribution or an anonymous conversion funnel. We keep those metrics unavailable rather than presenting registered-user activity as website visitors.</p></div></div>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <Card label="Anonymous unique visitors" value="Unavailable" icon={Globe} hint="No anonymous visitor identifier is collected." />
      <Card label="Referral source attribution" value="Unavailable" icon={Link2} hint="Source and campaign parameters are not retained as visitor analytics." />
      <Card label="Registration funnel" value="Not instrumented" icon={Activity} hint="No complete, verified visitor-to-registration event chain exists." />
    </div>
    <Block title="What is available today">
      <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
        <KV label="Registered student activity" value="Available in Activity & devices" />
        <KV label="Consented page-category events" value="Available in Activity & devices" />
        <KV label="Real account registrations" value="Available in Overview and Analytics" />
        <KV label="Anonymous visitor and acquisition metrics" value="Not collected" />
      </div>
    </Block>
    <div className="rounded-xl border border-border bg-elevated p-4"><p className="text-xs font-semibold">Privacy-first next step</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">If visitor analytics are needed, connect a privacy-respecting aggregate analytics source and disclose it in the privacy policy before enabling collection. Until then, do not infer unique visitors from device events or account activity.</p></div>
  </div>;
}
function AggregateBlock({ title, rows }: { title: string; rows: [string, number][] }) { return <Block title={title}><div className="space-y-2">{rows.slice(0, 10).map(([label, count]) => <KV key={label} label={label} value={String(count)} />)}{!rows.length ? <p className="text-xs text-muted-foreground">No consented events.</p> : null}</div></Block>; }

export function ActivityPanel({ devices, people, query, onQuery }: { devices: AdminDevice[]; people: AdminProfile[]; query: string; onQuery: (value: string) => void }) {
  const names = new Map(people.map((person) => [person.id, person.name]));
  const term = query.trim().toLowerCase();
  const rows = devices.filter((row) => `${row.kind} ${row.path ?? ""} ${row.platform ?? ""} ${row.user_id ? names.get(row.user_id) ?? "registered" : "account not stored"}`.toLowerCase().includes(term));
  return <div className="space-y-4"><div className="rounded-xl border border-border bg-elevated p-4 text-xs leading-relaxed text-muted-foreground">Minimal activity records only. “Account not stored” means the event cannot be classified as anonymous or registered; it is not counted as a unique visitor. No IP, city, screen size, timezone or raw user agent is queried.</div><SearchBar value={query} onChange={onQuery} placeholder="Event, student, page or device class…" /><div className="space-y-1.5">{rows.slice(0, 400).map((row) => <div key={row.id} className="rounded-lg border border-border bg-elevated px-3 py-2 text-xs"><div className="flex flex-wrap items-center justify-between gap-2"><span>{row.kind} · {row.user_id ? names.get(row.user_id) ?? "Registered student" : "Account not stored"} · {row.path ?? "other"}</span><span className="num text-muted-foreground">{new Date(row.created_at).toLocaleString()}</span></div><p className="mt-1 text-muted-foreground">{row.platform || "No coarse device label"}</p></div>)}{!rows.length ? <Empty text="No matching consented activity." /> : null}</div></div>;
}

export function SecurityPanel({ events, audit, query, onQuery }: { events: AdminEvent[]; audit: AdminAudit[]; query: string; onQuery: (value: string) => void }) {
  const [tab, setTab] = useState<"security" | "audit">("security");
  const term = query.trim().toLowerCase();
  const visibleEvents = events.filter((event) => `${event.kind} ${event.severity} ${event.detail ?? ""}`.toLowerCase().includes(term));
  const visibleAudit = audit.filter((event) => `${event.action} ${event.entity_type} ${event.detail ?? ""}`.toLowerCase().includes(term));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={tab === "security" ? "default" : "outline"} onClick={() => setTab("security")}>Security events ({events.length})</Button>
        <Button size="sm" variant={tab === "audit" ? "default" : "outline"} onClick={() => setTab("audit")}>Admin audit ({audit.length})</Button>
      </div>
      <SearchBar value={query} onChange={onQuery} placeholder="Filter event, severity or detail…" />
      {tab === "security" ? (
        <div className="space-y-1.5">
          {visibleEvents.map((event) => (
            <div key={event.id} className="rounded-lg border border-border bg-elevated px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <ShieldAlert className={cn("h-3.5 w-3.5", event.severity === "critical" ? "text-destructive" : event.severity === "warning" ? "text-primary" : "text-muted-foreground")} />
                  {event.kind} · {event.severity}
                </span>
                <span className="num text-muted-foreground">{new Date(event.created_at).toLocaleString()}</span>
              </div>
              {event.detail ? <p className="mt-1 break-words text-muted-foreground">{event.detail}</p> : null}
            </div>
          ))}
          {!visibleEvents.length ? <Empty text="No matching security events." /> : null}
        </div>
      ) : (
        <div className="space-y-1.5">
          {visibleAudit.map((event) => (
            <div key={event.id} className="rounded-lg border border-border bg-elevated px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>{event.entity_type} · {event.action}</span>
                <span className="num text-muted-foreground">{new Date(event.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-muted-foreground">{event.detail ?? "Privileged change recorded"}</p>
            </div>
          ))}
          {!visibleAudit.length ? <Empty text="No matching admin audit events." /> : null}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">Client-reported security events can be incomplete. Privileged changes are recorded separately in the admin audit.</p>
    </div>
  );
}

export function AchievementsPanel({ awards, people, query, onQuery }: { awards: AdminAchievement[]; people: AdminProfile[]; query: string; onQuery: (value: string) => void }) {
  const names = new Map(people.map((person) => [person.id, person.name]));
  const term = query.trim().toLowerCase();
  const visible = awards.filter((award) => `${names.get(award.user_id) ?? "unknown"} ${award.title} ${award.description} ${award.email_status}`.toLowerCase().includes(term));
  const sent = awards.filter((award) => award.email_status === "sent").length;
  const failed = awards.filter((award) => award.email_status === "failed").length;
  return <div className="space-y-4"><div className="rounded-xl border border-border bg-elevated p-4 text-xs leading-relaxed text-muted-foreground">Outbound achievement email is disabled. New awards are recorded as skipped. Sent/failed values below are preserved historical delivery states, not a queue, and no send or retry action is available.</div><div className="grid gap-3 sm:grid-cols-3"><Card label="Achievements earned" value={String(awards.length)} icon={Trophy} /><Card label="Historical emails delivered" value={String(sent)} icon={Mail} /><Card label="Historical failed deliveries" value={String(failed)} icon={AlertTriangle} /></div><SearchBar value={query} onChange={onQuery} placeholder="Student, achievement or email state…" /><div className="space-y-2">{visible.map((award) => <div key={award.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-elevated p-3"><div className="flex min-w-0 items-start gap-3"><Trophy className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div className="min-w-0"><p className="text-sm font-medium">{award.title}</p><p className="text-xs text-muted-foreground">{names.get(award.user_id) ?? "Unknown student"} · {award.description}</p><p className="mt-1 text-[11px] text-muted-foreground">Recorded {new Date(award.awarded_at).toLocaleString()}</p></div></div><Tag tone={award.email_status === "sent" ? "good" : award.email_status === "failed" ? "bad" : undefined}>Email {award.email_status}</Tag></div>)}{!visible.length ? <Empty text="No matching achievements." /> : null}</div></div>;
}
