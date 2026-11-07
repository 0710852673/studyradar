import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  Ban,
  BarChart3,
  Clock,
  Database,
  Download,
  Globe,
  LayoutGrid,
  Radar,
  RefreshCw,
  Search,
  ShieldAlert,
  Sliders,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useStudyOS } from "@/lib/studyos/store";
import { fmtHours } from "@/lib/studyos/analytics";
import {
  activeWithin,
  countBy,
  dailyMinutes,
  dailySignups,
  download,
  EMPTY_SNAPSHOT,
  loadSnapshot,
  toCsv,
  type AdminProfile,
  type AdminSnapshot,
} from "@/lib/studyos/admin-data";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { restoreBackup, type RestoreReport } from "@/lib/studyos/restore.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Control Room — Study Radar" },
      { name: "description", content: "Study Radar administration and platform analytics." },
      { property: "og:title", content: "Control Room — Study Radar" },
      { property: "og:description", content: "Platform analytics, students and moderation." },
    ],
  }),
  component: AdminPage,
});

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "students", label: "Students", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "activity", label: "Activity & devices", icon: Globe },
  { id: "security", label: "Security", icon: ShieldAlert },
  { id: "settings", label: "Site settings", icon: Sliders },
  { id: "data", label: "Data & backups", icon: Database },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

function AdminPage() {
  const { isAdmin, ready, settings, refreshSettings } = useStudyOS();
  const [snap, setSnap] = useState<AdminSnapshot>(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<SectionId>("overview");
  const [q, setQ] = useState("");
  const [excludeDemo, setExcludeDemo] = useState(true);
  const [focusId, setFocusId] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setSnap(await loadSnapshot());
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    void reload();
  }, [isAdmin]);

  const demoIds = useMemo(
    () => new Set(snap.profiles.filter((p) => p.is_demo).map((p) => p.id)),
    [snap.profiles],
  );
  const keep = (uid: string | null) => !excludeDemo || !uid || !demoIds.has(uid);

  const people = snap.profiles.filter((p) => keep(p.id));
  const sessions = snap.sessions.filter((s) => keep(s.user_id));
  const marks = snap.marks.filter((m) => keep(m.user_id));
  const chapters = snap.chapters.filter((c) => keep(c.user_id));
  const devices = snap.devices.filter((d) => keep(d.user_id));

  const adminIds = new Set(snap.roles.filter((r) => r.role === "admin").map((r) => r.user_id));
  const minutesByUser = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions) map.set(s.user_id, (map.get(s.user_id) ?? 0) + s.minutes);
    return map;
  }, [sessions]);

  const term = q.trim().toLowerCase();
  const match = (text: string) => !term || text.toLowerCase().includes(term);
  const nameOf = (uid: string | null) =>
    (uid && snap.profiles.find((p) => p.id === uid)?.name) || (uid ? uid.slice(0, 8) : "anonymous");

  if (!ready) return null;
  if (!isAdmin)
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="panel max-w-sm p-7 text-center">
          <h1 className="font-display text-lg font-semibold">Restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is for Study Radar administrators.
          </p>
          <Button asChild className="mt-5">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );

  const focus = focusId ? snap.profiles.find((p) => p.id === focusId) : null;

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* --- Control rail ------------------------------------------------ */}
      <aside className="border-b border-border bg-elevated/60 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 px-4 py-4">
          <Radar className="h-5 w-5 text-primary" />
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold leading-tight">Control Room</p>
            <p className="truncate text-[11px] text-muted-foreground">Study Radar admin</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSection(s.id);
                setFocusId(null);
              }}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors lg:w-full",
                section === s.id
                  ? "bg-brand-soft text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              {s.label}
            </button>
          ))}
        </nav>
        <div className="hidden px-3 pb-4 lg:block">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs">
            <Link to="/dashboard">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Exit to app
            </Link>
          </Button>
        </div>
      </aside>

      {/* --- Workspace ---------------------------------------------------- */}
      <main className="min-w-0 flex-1 px-4 py-5 lg:px-8 lg:py-7">
        <header className="mb-5 flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <h1 className="font-display text-xl font-semibold">
              {SECTIONS.find((s) => s.id === section)?.label}
            </h1>
            <p className="text-xs text-muted-foreground">
              {people.length} students · {sessions.length} sessions · {marks.length} marks
              {excludeDemo ? " · demo data hidden" : ""}
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={excludeDemo}
              onChange={(e) => setExcludeDemo(e.target.checked)}
              className="h-3.5 w-3.5 accent-primary"
            />
            Exclude demo
          </label>
          <Button size="sm" variant="outline" onClick={() => void reload()} disabled={loading}>
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </header>

        {loading ? (
          <div className="panel p-10 text-center text-sm text-muted-foreground">
            Loading platform data…
          </div>
        ) : focus ? (
          <StudentDetail
            profile={focus}
            snap={snap}
            isAdminUser={adminIds.has(focus.id)}
            onBack={() => setFocusId(null)}
            onChanged={() => void reload()}
          />
        ) : (
          <>
            {section === "overview" ? (
              <Overview
                people={people}
                sessions={sessions}
                marks={marks}
                chapters={chapters}
                devices={devices}
              />
            ) : null}

            {section === "students" ? (
              <>
                <SearchBar value={q} onChange={setQ} placeholder="Name, email, school, town…" />
                <div className="mt-4 space-y-2">
                  {people
                    .filter((p) =>
                      match(
                        `${p.name} ${p.email ?? ""} ${p.school ?? ""} ${p.city ?? ""} ${p.district ?? ""} ${p.track} ${(p.subjects ?? []).join(" ")}`,
                      ),
                    )
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setFocusId(p.id)}
                        className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-elevated p-3 text-left transition-colors hover:border-primary/40"
                      >
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 truncate text-sm font-medium">
                            {p.name}
                            {p.suspended ? <Tag tone="bad">suspended</Tag> : null}
                            {adminIds.has(p.id) ? <Tag tone="good">admin</Tag> : null}
                            {p.is_demo ? <Tag>demo</Tag> : null}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.email ?? "no email"} · {p.track} {p.exam_year}
                            {p.school ? ` · ${p.school}` : ""}
                            {p.city ? ` · ${p.city}` : ""}
                          </p>
                        </div>
                        <span className="num shrink-0 text-sm text-muted-foreground">
                          {fmtHours(minutesByUser.get(p.id) ?? 0)}
                        </span>
                      </button>
                    ))}
                </div>
              </>
            ) : null}

            {section === "analytics" ? (
              <Analytics people={people} sessions={sessions} marks={marks} chapters={chapters} />
            ) : null}

            {section === "activity" ? (
              <>
                <SearchBar value={q} onChange={setQ} placeholder="IP, city, browser, page…" />
                <div className="mt-4 space-y-1.5">
                  {devices
                    .filter((d) =>
                      match(
                        `${nameOf(d.user_id)} ${d.email ?? ""} ${d.ip ?? ""} ${d.city ?? ""} ${d.country ?? ""} ${d.user_agent ?? ""} ${d.path ?? ""}`,
                      ),
                    )
                    .slice(0, 400)
                    .map((d) => (
                      <div
                        key={d.id}
                        className="rounded-lg border border-border bg-elevated px-3 py-2 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="truncate">
                            {d.kind} · {nameOf(d.user_id)} · {d.path ?? "—"}
                          </span>
                          <span className="num shrink-0 text-muted-foreground">
                            {new Date(d.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-muted-foreground">
                          {[d.ip, [d.city, d.country].filter(Boolean).join(", "), d.timezone,
                            d.screen, d.platform, d.language]
                            .filter(Boolean)
                            .join(" · ") || "no device data"}
                        </p>
                      </div>
                    ))}
                  {devices.length === 0 ? <Empty text="No activity recorded yet." /> : null}
                </div>
              </>
            ) : null}

            {section === "security" ? (
              <>
                <SearchBar value={q} onChange={setQ} placeholder="Event, email, detail…" />
                <div className="mt-4 space-y-1.5">
                  {snap.events
                    .filter((e) =>
                      match(`${e.kind} ${e.severity} ${e.email ?? ""} ${e.detail ?? ""}`),
                    )
                    .map((e) => (
                      <div
                        key={e.id}
                        className="rounded-lg border border-border bg-elevated px-3 py-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 truncate">
                            <ShieldAlert
                              className={cn(
                                "h-3.5 w-3.5 shrink-0",
                                e.severity === "critical"
                                  ? "text-destructive"
                                  : e.severity === "warning"
                                    ? "text-primary"
                                    : "text-muted-foreground",
                              )}
                            />
                            {e.kind}
                            {e.email ? ` · ${e.email}` : ""}
                          </span>
                          <span className="num shrink-0 text-muted-foreground">
                            {new Date(e.created_at).toLocaleString()}
                          </span>
                        </div>
                        {e.detail ? (
                          <p className="mt-1 truncate text-muted-foreground">{e.detail}</p>
                        ) : null}
                      </div>
                    ))}
                  {snap.events.length === 0 ? <Empty text="Nothing suspicious recorded." /> : null}
                </div>
              </>
            ) : null}

            {section === "settings" ? (
              <SiteSettingsPanel settings={settings} onSaved={refreshSettings} />
            ) : null}

            {section === "data" ? <DataPanel snap={snap} /> : null}
          </>
        )}
      </main>
    </div>
  );
}

// ------------------------------------------------------------- fragments --

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "good" | "bad" }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-normal",
        tone === "bad"
          ? "border-destructive/40 text-destructive"
          : tone === "good"
            ? "border-primary/40 text-primary"
            : "border-border text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function Card({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Users }) {
  return (
    <div className="rounded-xl border border-border bg-elevated p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="num mt-2 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-elevated p-4">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Bars({ data, format }: { data: { label: string; value: number }[]; format: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-32 items-end gap-[3px]">
      {data.map((d) => (
        <div key={d.label} className="group relative flex-1" title={`${d.label}: ${format(d.value)}`}>
          <div
            className="w-full rounded-t bg-primary/70 transition-colors group-hover:bg-primary"
            style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="num truncate text-right">{value}</span>
    </div>
  );
}

// -------------------------------------------------------------- sections --

function Overview({
  people, sessions, marks, chapters, devices,
}: {
  people: AdminProfile[];
  sessions: AdminSnapshot["sessions"];
  marks: AdminSnapshot["marks"];
  chapters: AdminSnapshot["chapters"];
  devices: AdminSnapshot["devices"];
}) {
  const totalMins = sessions.reduce((a, s) => a + s.minutes, 0);
  const dau = activeWithin(sessions, 1);
  const wau = activeWithin(sessions, 7);
  const mau = activeWithin(sessions, 30);
  const onboarded = people.filter((p) => p.onboarded).length;
  const suspended = people.filter((p) => p.suspended).length;
  const neverStudied = people.filter((p) => !sessions.some((s) => s.user_id === p.id)).length;
  const now = Date.now();
  const inactive14 = people.filter((p) => {
    const last = p.last_seen_at ? new Date(p.last_seen_at).getTime() : 0;
    return !last || now - last > 14 * 864e5;
  }).length;
  const signup7 = people.filter((p) => now - new Date(p.created_at).getTime() <= 7 * 864e5).length;
  const signupPrev7 = people.filter((p) => {
    const age = now - new Date(p.created_at).getTime();
    return age > 7 * 864e5 && age <= 14 * 864e5;
  }).length;
  const signupDelta = signup7 - signupPrev7;
  const done = chapters.filter((c) => c.status === "done").length;
  const subjectStudy = countBy(sessions, (s) => s.subject).slice(0, 8);
  const subjectMax = Math.max(1, ...subjectStudy.map((x) => x[1]));
  const trackCounts = countBy(people, (p) => p.track);
  const districtCounts = countBy(people, (p) => p.district).slice(0, 8);
  const hoursByDay = dailyMinutes(sessions, 14);
  const averagePerActive = wau ? Math.round(totalMins / Math.max(1, new Set(sessions.filter(s => s.date >= new Date(now - 7 * 864e5).toISOString().slice(0,10)).map(s => s.user_id)).size)) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Registered students" value={String(people.length)} icon={Users} />
        <Card label="Active today · study logs" value={String(dau)} icon={Activity} />
        <Card label="Active 7 days · study logs" value={String(wau)} icon={Activity} />
        <Card label="Active 30 days · study logs" value={String(mau)} icon={Radar} />
        <Card label="Total study time" value={fmtHours(totalMins)} icon={Clock} />
        <Card label="Study sessions" value={String(sessions.length)} icon={BarChart3} />
        <Card label="Onboarding complete" value={people.length ? `${Math.round(onboarded / people.length * 100)}%` : "—"} icon={Users} />
        <Card label="Suspended accounts" value={String(suspended)} icon={Ban} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Block title="Study time · last 14 days">
          <Bars data={hoursByDay.map(d => ({label:d.date.slice(5), value:d.minutes}))} format={fmtHours} />
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>14 days ago</span><span>Today</span></div>
        </Block>
        <Block title="Student registrations · last 30 days">
          <Bars data={dailySignups(people, 30).map(d => ({label:d.date.slice(5), value:d.count}))} format={n => String(n)} />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Last 7 days: <strong className="text-foreground">{signup7}</strong></span>
            <span>{signupDelta >= 0 ? "+" : ""}{signupDelta} vs previous 7 days</span>
          </div>
        </Block>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Block title="Platform health">
          <div className="space-y-2">
            <KV label="Onboarded students" value={`${onboarded} / ${people.length}`} />
            <KV label="Never logged a study session" value={String(neverStudied)} />
            <KV label="No activity / last seen >14 days" value={String(inactive14)} />
            <KV label="Average study per active student · 7d" value={fmtHours(averagePerActive)} />
            <KV label="Syllabus marked done" value={chapters.length ? `${done} / ${chapters.length} · ${Math.round(done / chapters.length * 100)}%` : "No chapter data"} />
            <KV label="Marks recorded" value={String(marks.length)} />
            <KV label="Device / activity records" value={String(devices.length)} />
          </div>
        </Block>
        <Block title="Study by subject">
          <div className="space-y-3">
            {subjectStudy.map(([subject, mins]) => <div key={subject}>
              <div className="mb-1 flex justify-between gap-2 text-xs"><span className="truncate">{subject}</span><span className="num text-muted-foreground">{fmtHours(mins)}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{width:`${mins / subjectMax * 100}%`}} /></div>
            </div>)}
            {!subjectStudy.length ? <Empty text="No study sessions recorded." /> : null}
          </div>
        </Block>
        <Block title="Student distribution">
          <p className="mb-2 text-[11px] text-muted-foreground">By examination track</p>
          <div className="space-y-2">{trackCounts.map(([track,n]) => <KV key={track} label={track} value={String(n)} />)}</div>
          <p className="mb-2 mt-4 text-[11px] text-muted-foreground">Top districts</p>
          <div className="flex flex-wrap gap-1.5">{districtCounts.map(([district,n]) => <Tag key={district}>{district} · {n}</Tag>)}</div>
        </Block>
      </div>

      <Block title="Admin attention · data-driven signals">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-medium">Onboarding gap</p>
            <p className="num mt-1 text-xl">{people.length - onboarded}</p>
            <p className="text-[11px] text-muted-foreground">Registered accounts not marked onboarded.</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-medium">First-session gap</p>
            <p className="num mt-1 text-xl">{neverStudied}</p>
            <p className="text-[11px] text-muted-foreground">Students with no recorded study session.</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-medium">Registration momentum</p>
            <p className="num mt-1 text-xl">{signup7}</p>
            <p className="text-[11px] text-muted-foreground">New registrations in the last 7 days; {signupDelta >= 0 ? "+" : ""}{signupDelta} compared with the prior 7 days.</p>
          </div>
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">Activity metrics are based on recorded study sessions, not all page visits. Inactive status uses profile last_seen_at where available.</p>
      </Block>
    </div>
  );
}

function Analytics({
  people, sessions, marks, chapters,
}: {
  people: AdminProfile[];
  sessions: AdminSnapshot["sessions"];
  marks: AdminSnapshot["marks"];
  chapters: AdminSnapshot["chapters"];
}) {
  const totalMins = sessions.reduce((a,s) => a + s.minutes, 0);
  const subjectMinutes = countBy(sessions, s => s.subject);
  const maxSubject = Math.max(1, ...subjectMinutes.map(x => x[1]));
  const subjectMarks = new Map<string,{sum:number;count:number}>();
  for (const m of marks) {
    if (!m.total) continue;
    const v = subjectMarks.get(m.subject) ?? {sum:0,count:0};
    subjectMarks.set(m.subject,{sum:v.sum + (m.marks / m.total) * 100,count:v.count + 1});
  }
  const done = chapters.filter(c => c.status === "done").length;
  const inProgress = chapters.filter(c => c.status === "in_progress" || c.status === "in-progress").length;
  const uniqueStudy = new Set(sessions.map(s => s.user_id)).size;
  const sessionAvg = sessions.length ? Math.round(totalMins / sessions.length) : 0;
  const byTrack = countBy(people,p => p.track);
  const byYear = countBy(people,p => String(p.exam_year));
  const byStream = countBy(people,p => p.stream);
  const byDistrict = countBy(people,p => p.district);
  const bySubjectInterest = countBy(people.flatMap(p => (p.subjects ?? []).map(subject => ({subject}))),r => r.subject);
  const signupCohorts = new Map<string,number>();
  for (const p of people) {
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    signupCohorts.set(key,(signupCohorts.get(key) ?? 0) + 1);
  }
  const cohorts = [...signupCohorts.entries()].sort((a,b) => a[0].localeCompare(b[0])).slice(-8);
  const daily = dailyMinutes(sessions,30);
  const maxDaily = Math.max(1,...daily.map(d => d.minutes));
  const completion = chapters.length ? Math.round(done / chapters.length * 100) : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Total study hours" value={fmtHours(totalMins)} icon={Clock} />
        <Card label="Students who studied" value={String(uniqueStudy)} icon={Users} />
        <Card label="Average session length" value={fmtHours(sessionAvg)} icon={Activity} />
        <Card label="Syllabus completion" value={completion === null ? "—" : `${completion}%`} icon={LayoutGrid} />
      </div>
      <Block title="Study activity · last 30 days">
        <Bars data={daily.map(d => ({label:d.date.slice(5),value:d.minutes}))} format={fmtHours} />
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>30 days ago</span><span>Today</span></div>
      </Block>
      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Study time by subject">
          <div className="space-y-3">{subjectMinutes.slice(0,12).map(([subject,mins]) => <div key={subject}>
            <div className="mb-1 flex justify-between gap-2 text-xs"><span>{subject}</span><span className="num text-muted-foreground">{fmtHours(mins)}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{width:`${mins/maxSubject*100}%`}} /></div>
          </div>)}
          {!subjectMinutes.length ? <Empty text="No study data available." /> : null}</div>
        </Block>
        <Block title="Average marks by subject">
          <div className="space-y-2">{[...subjectMarks.entries()].sort((a,b) => b[1].sum/b[1].count - a[1].sum/a[1].count).map(([subject,v]) => <KV key={subject} label={subject} value={`${Math.round(v.sum/v.count)}% · ${v.count} records`} />)}
          {!subjectMarks.size ? <Empty text="No marks recorded yet." /> : null}</div>
        </Block>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Registration cohorts · month joined">
          <div className="space-y-2">{cohorts.map(([month,n]) => <KV key={month} label={month} value={`${n} students`} />)}
          {!cohorts.length ? <Empty text="No registration history." /> : null}</div>
          <p className="mt-2 text-[10px] text-muted-foreground">Signup cohorts show registrations only. Retention cannot be calculated reliably without historical activity events.</p>
        </Block>
        <Block title="Syllabus progress">
          <div className="space-y-2">
            <KV label="Completed" value={String(done)} />
            <KV label="In progress" value={String(inProgress)} />
            <KV label="Other / not started" value={String(Math.max(0,chapters.length-done-inProgress))} />
            <KV label="Total tracked chapters" value={String(chapters.length)} />
          </div>
        </Block>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Student profile breakdown">
          <p className="mb-2 text-[11px] text-muted-foreground">Examination track</p>
          <div className="flex flex-wrap gap-1.5">{byTrack.map(([k,n]) => <Tag key={k}>{k} · {n}</Tag>)}</div>
          <p className="mb-2 mt-4 text-[11px] text-muted-foreground">Examination year</p>
          <div className="flex flex-wrap gap-1.5">{byYear.map(([k,n]) => <Tag key={k}>{k} · {n}</Tag>)}</div>
          <p className="mb-2 mt-4 text-[11px] text-muted-foreground">Stream</p>
          <div className="flex flex-wrap gap-1.5">{byStream.map(([k,n]) => <Tag key={k}>{k} · {n}</Tag>)}</div>
        </Block>
        <Block title="Student subject interests">
          <div className="space-y-2">{bySubjectInterest.slice(0,12).map(([subject,n]) => <KV key={subject} label={subject} value={String(n)} />)}
          {!bySubjectInterest.length ? <Empty text="No subject preferences recorded." /> : null}</div>
        </Block>
      </div>
      <Block title="Top districts">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{byDistrict.slice(0,18).map(([district,n]) => <KV key={district} label={district} value={String(n)} />)}
        {!byDistrict.length ? <Empty text="No district data available." /> : null}</div>
      </Block>
      <p className="text-[10px] text-muted-foreground">All figures are calculated from currently accessible records and the active Exclude demo filter. Missing data is shown as unavailable, not estimated.</p>
    </div>
  );
}

function StudentDetail({
  profile,
  snap,
  isAdminUser,
  onBack,
  onChanged,
}: {
  profile: AdminProfile;
  snap: AdminSnapshot;
  isAdminUser: boolean;
  onBack: () => void;
  onChanged: () => void;
}) {
  const [reason, setReason] = useState(profile.suspended_reason ?? "");
  const [busy, setBusy] = useState(false);

  const sessions = snap.sessions
    .filter((s) => s.user_id === profile.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const marks = snap.marks
    .filter((m) => m.user_id === profile.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const chapters = snap.chapters.filter((c) => c.user_id === profile.id);
  const devices = snap.devices.filter((d) => d.user_id === profile.id);
  const events = snap.events.filter(
    (e) => e.user_id === profile.id || (profile.email && e.email === profile.email),
  );
  const totalMins = sessions.reduce((a, s) => a + s.minutes, 0);

  const setSuspended = async (next: boolean) => {
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        suspended: next,
        suspended_reason: next ? reason.trim() || "Violation of the Study Radar terms." : null,
        suspended_at: next ? new Date().toISOString() : null,
      } as never)
      .eq("id", profile.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success(next ? "Account suspended" : "Account restored");
      onChanged();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> All students
        </Button>
        <h2 className="font-display text-lg font-semibold">{profile.name}</h2>
        {profile.suspended ? <Tag tone="bad">suspended</Tag> : null}
        {isAdminUser ? <Tag tone="good">admin</Tag> : null}
        {profile.is_demo ? <Tag>demo</Tag> : null}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() =>
            download(
              `student-${profile.name.replace(/\s+/g, "-").toLowerCase()}.json`,
              JSON.stringify({ profile, sessions, marks, chapters, devices, events }, null, 2),
              "application/json",
            )
          }
        >
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export student
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Total study" value={fmtHours(totalMins)} icon={Clock} />
        <Card label="Sessions" value={String(sessions.length)} icon={Activity} />
        <Card label="Marks" value={String(marks.length)} icon={BarChart3} />
        <Card
          label="Syllabus done"
          value={
            chapters.length
              ? `${Math.round((chapters.filter((c) => c.status === "done").length / chapters.length) * 100)}%`
              : "—"
          }
          icon={LayoutGrid}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Profile">
          <div className="space-y-2">
            <KV label="Email" value={profile.email ?? "—"} />
            <KV label="Track" value={`${profile.track} ${profile.exam_year}`} />
            <KV label="Stream" value={profile.stream ?? "—"} />
            <KV label="Subjects" value={(profile.subjects ?? []).join(", ") || "—"} />
            <KV label="Daily target" value={`${profile.daily_target_hours} h`} />
            <KV label="School" value={profile.school ?? "—"} />
            <KV label="Class / grade" value={profile.grade ?? "—"} />
            <KV
              label="Location"
              value={[profile.city, profile.district].filter(Boolean).join(", ") || "—"}
            />
            <KV label="Mobile" value={profile.mobile ?? "—"} />
            <KV label="Guardian" value={profile.guardian_name ?? "—"} />
            <KV label="Guardian phone" value={profile.guardian_phone ?? "—"} />
            <KV label="Bio" value={profile.bio ?? "—"} />
            <KV
              label="Terms accepted"
              value={
                profile.terms_accepted_at
                  ? new Date(profile.terms_accepted_at).toLocaleString()
                  : "not recorded"
              }
            />
            <KV label="Joined" value={new Date(profile.created_at).toLocaleString()} />
            <KV
              label="Last seen"
              value={
                profile.last_seen_at ? new Date(profile.last_seen_at).toLocaleString() : "never"
              }
            />
          </div>
        </Block>

        <div className="space-y-4">
          <Block title="Moderation">
            <p className="mb-3 text-xs text-muted-foreground">
              Suspended students are signed out of the app and shown this reason when they try to
              open it.
            </p>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason shown to the student…"
              rows={3}
            />
            <div className="mt-3 flex gap-2">
              {profile.suspended ? (
                <Button size="sm" disabled={busy} onClick={() => void setSuspended(false)}>
                  Restore account
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy}
                  onClick={() => void setSuspended(true)}
                >
                  <Ban className="mr-1.5 h-3.5 w-3.5" /> Suspend account
                </Button>
              )}
            </div>
          </Block>

          <Block title={`Devices & locations (${devices.length})`}>
            <div className="max-h-56 space-y-1.5 overflow-y-auto">
              {devices.slice(0, 50).map((d) => (
                <div key={d.id} className="rounded-lg border border-border bg-background px-3 py-2 text-[11px]">
                  <div className="flex justify-between gap-2">
                    <span className="truncate">{d.ip ?? "no ip"} · {d.path ?? "—"}</span>
                    <span className="num shrink-0 text-muted-foreground">
                      {new Date(d.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="truncate text-muted-foreground">
                    {[[d.city, d.country].filter(Boolean).join(", "), d.platform, d.screen, d.timezone]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ))}
              {devices.length === 0 ? (
                <p className="text-xs text-muted-foreground">No device records.</p>
              ) : null}
            </div>
          </Block>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Block title={`Study sessions (${sessions.length})`}>
          <div className="max-h-72 space-y-1.5 overflow-y-auto">
            {sessions.slice(0, 200).map((s) => (
              <div
                key={s.id}
                className="flex justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs"
              >
                <span className="truncate">{s.subject}</span>
                <span className="num shrink-0 text-muted-foreground">
                  {s.date} · {fmtHours(s.minutes)}
                </span>
              </div>
            ))}
            {sessions.length === 0 ? <p className="text-xs text-muted-foreground">None.</p> : null}
          </div>
        </Block>
        <Block title={`Marks (${marks.length})`}>
          <div className="max-h-72 space-y-1.5 overflow-y-auto">
            {marks.map((m) => (
              <div
                key={m.id}
                className="flex justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs"
              >
                <span className="truncate">
                  {m.subject} · {m.exam_name}
                </span>
                <span className="num shrink-0 text-muted-foreground">
                  {m.marks}/{m.total}
                </span>
              </div>
            ))}
            {marks.length === 0 ? <p className="text-xs text-muted-foreground">None.</p> : null}
          </div>
        </Block>
        <Block title={`Syllabus (${chapters.length})`}>
          <div className="max-h-72 space-y-1.5 overflow-y-auto">
            {chapters.map((c) => (
              <div
                key={c.id}
                className="flex justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs"
              >
                <span className="truncate">
                  {c.subject} · {c.title}
                </span>
                <span className="shrink-0 text-muted-foreground">{c.status}</span>
              </div>
            ))}
            {chapters.length === 0 ? <p className="text-xs text-muted-foreground">None.</p> : null}
          </div>
        </Block>
      </div>
    </div>
  );
}

function SiteSettingsPanel({
  settings,
  onSaved,
}: {
  settings: ReturnType<typeof useStudyOS>["settings"];
  onSaved: () => Promise<void> | void;
}) {
  const [draft, setDraft] = useState(settings);
  const [busy, setBusy] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        maintenance_mode: draft.maintenanceMode,
        maintenance_message: draft.maintenanceMessage,
        signups_enabled: draft.signupsEnabled,
        google_login_enabled: draft.googleLoginEnabled,
        announcement: draft.announcement,
        announcement_active: draft.announcementActive,
        max_writes_per_minute: draft.maxWritesPerMinute,
      } as never)
      .eq("id", true);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Site settings saved");
      await onSaved();
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Block title="Availability">
        <Toggle
          label="Maintenance mode"
          hint="Students see a friendly notice instead of the app. Admins keep full access."
          checked={draft.maintenanceMode}
          onChange={(v) => setDraft({ ...draft, maintenanceMode: v })}
        />
        <Textarea
          className="mt-3"
          rows={2}
          value={draft.maintenanceMessage}
          onChange={(e) => setDraft({ ...draft, maintenanceMessage: e.target.value })}
        />
      </Block>

      <Block title="Sign-in">
        <Toggle
          label="Allow new signups"
          hint="Turn off to close registration temporarily."
          checked={draft.signupsEnabled}
          onChange={(v) => setDraft({ ...draft, signupsEnabled: v })}
        />
        <div className="h-3" />
        <Toggle
          label="Google sign-in"
          checked={draft.googleLoginEnabled}
          onChange={(v) => setDraft({ ...draft, googleLoginEnabled: v })}
        />
      </Block>

      <Block title="Announcement banner">
        <Toggle
          label="Show banner"
          checked={draft.announcementActive}
          onChange={(v) => setDraft({ ...draft, announcementActive: v })}
        />
        <Input
          className="mt-3"
          value={draft.announcement ?? ""}
          placeholder="e.g. New: syllabus tracker for O/L science"
          onChange={(e) => setDraft({ ...draft, announcement: e.target.value || null })}
        />
      </Block>

      <Block title="Load protection">
        <p className="mb-3 text-xs text-muted-foreground">
          When a student exceeds this many writes in a minute, saving is paused for them and they
          are asked to try again shortly. This keeps the platform responsive under heavy traffic.
        </p>
        <Input
          type="number"
          min={5}
          max={600}
          value={draft.maxWritesPerMinute}
          onChange={(e) =>
            setDraft({ ...draft, maxWritesPerMinute: Number(e.target.value) || 60 })
          }
          className="max-w-32"
        />
      </Block>

      <Button onClick={() => void save()} disabled={busy}>
        {busy ? "Saving…" : "Save settings"}
      </Button>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function DataPanel({ snap }: { snap: AdminSnapshot }) {
  const exports: { name: string; rows: Record<string, unknown>[] }[] = [
    { name: "students", rows: snap.profiles as unknown as Record<string, unknown>[] },
    { name: "sessions", rows: snap.sessions as unknown as Record<string, unknown>[] },
    { name: "marks", rows: snap.marks as unknown as Record<string, unknown>[] },
    { name: "chapters", rows: snap.chapters as unknown as Record<string, unknown>[] },
    { name: "security-events", rows: snap.events as unknown as Record<string, unknown>[] },
    { name: "device-events", rows: snap.devices as unknown as Record<string, unknown>[] },
  ];
  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-2xl space-y-4">
      <Block title="Full backup">
        <p className="mb-3 text-xs text-muted-foreground">
          A point-in-time snapshot of every table you can read. Keep it private — it contains
          student personal data.
        </p>
        <Button
          onClick={() =>
            download(
              `study-radar-backup-${stamp}.json`,
              JSON.stringify({ exportedAt: new Date().toISOString(), ...snap }, null, 2),
              "application/json",
            )
          }
        >
          <Database className="mr-1.5 h-4 w-4" /> Download JSON backup
        </Button>
      </Block>

      <Block title="Table exports (CSV / Excel-ready)">
        <div className="flex flex-wrap gap-2">
          {exports.map((x) => (
            <Button
              key={x.name}
              size="sm"
              variant="outline"
              disabled={x.rows.length === 0}
              onClick={() => download(`study-radar-${x.name}-${stamp}.csv`, toCsv(x.rows), "text/csv")}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> {x.name} ({x.rows.length})
            </Button>
          ))}
        </div>
      </Block>

      <RestoreBlock />

      <Block title="Managed backups">
        <p className="text-xs text-muted-foreground">
          The database is backed up automatically by the hosting platform on a rolling schedule.
          These downloads are your own offline copy — store them somewhere encrypted.
        </p>
      </Block>
    </div>
  );
}

function RestoreBlock() {
  const restore = useServerFn(restoreBackup);
  const [file, setFile] = useState<{ sessions?: unknown[]; wasted?: unknown[]; marks?: unknown[]; chapters?: unknown[] } | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ dryRun: boolean; reports: RestoreReport[] } | null>(null);

  const payload = (dryRun: boolean) => ({
    dryRun,
    sessions: (file?.sessions ?? []) as Record<string, unknown>[],
    wasted: (file?.wasted ?? []) as Record<string, unknown>[],
    marks: (file?.marks ?? []) as Record<string, unknown>[],
    chapters: (file?.chapters ?? []) as Record<string, unknown>[],
  });

  const run = async (dryRun: boolean) => {
    if (!file) return;
    if (!dryRun && !confirm("Restore missing rows from this backup? Existing data is never overwritten.")) return;
    setBusy(true);
    try {
      setResult(await restore({ data: payload(dryRun) }));
      toast.success(dryRun ? "Check finished — nothing was changed" : "Restore finished and verified");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Block title="Restore from backup">
      <p className="mb-3 text-xs text-muted-foreground">
        Upload a JSON backup downloaded above. Run the check first: it shows what would come back.
        Restoring only adds missing rows — nothing existing is changed, and rows for deleted
        accounts are skipped. Every restored row is read back to confirm it saved.
      </p>
      <input
        type="file"
        accept="application/json,.json"
        className="mb-3 block w-full text-xs"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          setResult(null);
          if (!f) return setFile(null);
          try {
            const parsed = JSON.parse(await f.text());
            if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.sessions)) {
              throw new Error();
            }
            setFile(parsed);
            setName(f.name);
          } catch {
            setFile(null);
            toast.error("That file isn't a Study Radar backup");
          }
        }}
      />
      {file ? (
        <p className="mb-3 text-xs text-muted-foreground">
          {name}: {(file.sessions ?? []).length} sessions, {(file.wasted ?? []).length} wasted-time,{" "}
          {(file.marks ?? []).length} marks, {(file.chapters ?? []).length} chapters
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={!file || busy} onClick={() => run(true)}>
          Check backup
        </Button>
        <Button size="sm" disabled={!file || busy || !result?.dryRun} onClick={() => run(false)}>
          {busy ? "Working…" : "Restore missing data"}
        </Button>
      </div>
      {result ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr className="text-left">
                <th className="py-1 pr-3">Data</th>
                <th className="pr-3">In file</th>
                <th className="pr-3">Already here</th>
                <th className="pr-3">Skipped</th>
                <th className="pr-3">{result.dryRun ? "Would add" : "Added"}</th>
                {!result.dryRun ? <th>Verified</th> : null}
              </tr>
            </thead>
            <tbody>
              {result.reports.map((r) => {
                const toAdd = r.valid - r.skippedUnknownUser - r.alreadyPresent;
                const ok = r.verified === r.valid - r.skippedUnknownUser;
                return (
                  <tr key={r.table} className="border-t border-border">
                    <td className="py-1 pr-3">{r.table.replace("_", " ")}</td>
                    <td className="pr-3">{r.inBackup}</td>
                    <td className="pr-3">{r.alreadyPresent}</td>
                    <td className="pr-3">{r.inBackup - r.valid + r.skippedUnknownUser}</td>
                    <td className="pr-3">{result.dryRun ? toAdd : r.inserted}</td>
                    {!result.dryRun ? (
                      <td className={ok ? "text-primary" : "text-destructive"}>
                        {ok ? "All present" : `${r.verified} found`}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </Block>
  );
}
