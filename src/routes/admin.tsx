import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Clock,
  Database,
  Download,
  ShieldAlert,
  UserPlus,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { EmptyState, Panel, StatCard } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useStudyOS } from "@/lib/studyos/store";
import { fmtHours } from "@/lib/studyos/analytics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Study Radar" },
      { name: "description", content: "Overview of students, study hours and activity." },
      { property: "og:title", content: "Admin — Study Radar" },
      { property: "og:description", content: "Student overview and platform analytics." },
    ],
  }),
  component: AdminPage,
});

type ProfileRow = {
  id: string;
  name: string;
  email: string | null;
  track: string;
  exam_year: number;
  subjects: string[] | null;
  is_demo: boolean | null;
  terms_accepted_at: string | null;
  created_at: string;
};
type SessionRow = { id: string; user_id: string; date: string; subject: string; minutes: number };
type MarkRow = {
  id: string;
  user_id: string;
  subject: string;
  exam_name: string;
  marks: number;
  total: number;
  date: string;
};
type EventRow = {
  id: string;
  kind: string;
  severity: string;
  email: string | null;
  detail: string | null;
  path: string | null;
  created_at: string;
};

const TABS = ["Overview", "Students", "Sessions", "Marks", "Security", "Backups"] as const;
type Tab = (typeof TABS)[number];

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]!);
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
}

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function AdminPage() {
  const { isAdmin, ready } = useStudyOS();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [marks, setMarks] = useState<MarkRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [tab, setTab] = useState<Tab>("Overview");
  const [q, setQ] = useState("");
  const [excludeDemo, setExcludeDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    let alive = true;
    void (async () => {
      const [p, s, m, e] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("study_sessions").select("id, user_id, date, subject, minutes"),
        supabase.from("marks").select("id, user_id, subject, exam_name, marks, total, date"),
        supabase
          .from("security_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
      ]);
      if (!alive) return;
      setProfiles((p.data ?? []) as ProfileRow[]);
      setSessions((s.data ?? []) as SessionRow[]);
      setMarks((m.data ?? []) as MarkRow[]);
      setEvents((e.data ?? []) as EventRow[]);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [isAdmin]);

  const demoIds = useMemo(
    () => new Set(profiles.filter((p) => p.is_demo).map((p) => p.id)),
    [profiles],
  );
  const keep = (uid: string) => !excludeDemo || !demoIds.has(uid);

  const people = profiles.filter((p) => keep(p.id));
  const sess = sessions.filter((s) => keep(s.user_id));
  const mks = marks.filter((m) => keep(m.user_id));

  const minutesByUser = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sess) map.set(s.user_id, (map.get(s.user_id) ?? 0) + s.minutes);
    return map;
  }, [sess]);

  const totalMins = sess.reduce((a, s) => a + s.minutes, 0);
  const activeIds = new Set(sess.map((s) => s.user_id));
  const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const weeklyActive = new Set(sess.filter((s) => s.date >= since).map((s) => s.user_id)).size;

  const subjectCount = new Map<string, number>();
  for (const p of people)
    for (const s of p.subjects ?? []) subjectCount.set(s, (subjectCount.get(s) ?? 0) + 1);
  const popular = [...subjectCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const ol = people.filter((p) => p.track === "OL").length;
  const al = people.length - ol;

  const term = q.trim().toLowerCase();
  const match = (text: string) => !term || text.toLowerCase().includes(term);
  const nameOf = (uid: string) => profiles.find((p) => p.id === uid)?.name ?? uid.slice(0, 8);

  const filteredPeople = people.filter((p) =>
    match(`${p.name} ${p.email ?? ""} ${p.track} ${p.exam_year} ${(p.subjects ?? []).join(" ")}`),
  );
  const filteredSessions = sess
    .filter((s) => match(`${nameOf(s.user_id)} ${s.subject} ${s.date}`))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 300);
  const filteredMarks = mks
    .filter((m) => match(`${nameOf(m.user_id)} ${m.subject} ${m.exam_name}`))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 300);
  const filteredEvents = events.filter((e) =>
    match(`${e.kind} ${e.severity} ${e.email ?? ""} ${e.detail ?? ""}`),
  );

  if (!ready) return null;
  if (!isAdmin)
    return (
      <AppShell title="Admin" subtitle="Restricted">
        <EmptyState text="You do not have access to this area." />
      </AppShell>
    );

  const exportStudents = () =>
    download(
      "study-radar-students.csv",
      toCsv(
        filteredPeople.map((p) => ({
          name: p.name,
          email: p.email ?? "",
          track: p.track,
          exam_year: p.exam_year,
          subjects: (p.subjects ?? []).join(" | "),
          total_minutes: minutesByUser.get(p.id) ?? 0,
          terms_accepted_at: p.terms_accepted_at ?? "",
          joined: p.created_at,
        })),
      ),
      "text/csv",
    );

  return (
    <AppShell title="Admin" subtitle="Platform overview & data management">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              tab === t
                ? "border-primary/40 bg-brand-soft text-primary"
                : "border-border bg-elevated text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={excludeDemo}
            onChange={(e) => setExcludeDemo(e.target.checked)}
            className="h-3.5 w-3.5 accent-primary"
          />
          Exclude demo accounts
        </label>
      </div>

      {tab !== "Overview" && tab !== "Backups" ? (
        <Input
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mb-4 max-w-sm"
        />
      ) : null}

      {loading ? <EmptyState text="Loading platform data…" /> : null}

      {!loading && tab === "Overview" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Students" value={people.length} icon={Users} accent />
            <StatCard label="Active (ever)" value={activeIds.size} icon={Activity} />
            <StatCard label="Active this week" value={weeklyActive} icon={UserPlus} />
            <StatCard label="Total study" value={fmtHours(totalMins)} icon={Clock} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Panel title="Track split">
              <div className="space-y-2 text-sm">
                <Row label="GCE A/L" value={`${al} students`} />
                <Row label="GCE O/L" value={`${ol} students`} />
                <Row
                  label="Avg study per student"
                  value={fmtHours(people.length ? Math.round(totalMins / people.length) : 0)}
                />
                <Row label="Sessions logged" value={String(sess.length)} />
                <Row label="Marks recorded" value={String(mks.length)} />
              </div>
            </Panel>
            <Panel title="Most popular subjects">
              <div className="flex flex-wrap gap-2">
                {popular.length === 0 ? (
                  <EmptyState text="No subject data yet." />
                ) : (
                  popular.map(([s, n]) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-elevated px-3 py-1.5 text-xs"
                    >
                      {s} · {n}
                    </span>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </>
      ) : null}

      {!loading && tab === "Students" ? (
        <Panel
          title={`Students (${filteredPeople.length})`}
          action={
            <Button size="sm" variant="outline" onClick={exportStudents}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
            </Button>
          }
        >
          <div className="space-y-2">
            {filteredPeople.length === 0 ? (
              <EmptyState text="No students match that search." />
            ) : (
              filteredPeople.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-elevated p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {r.name}
                      {r.is_demo ? (
                        <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                          demo
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.email ?? "no email"} · {r.track} · {r.exam_year} ·{" "}
                      {(r.subjects ?? []).join(", ") || "No subjects"}
                    </p>
                  </div>
                  <span className="num text-sm text-muted-foreground">
                    {fmtHours(minutesByUser.get(r.id) ?? 0)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      ) : null}

      {!loading && tab === "Sessions" ? (
        <Panel
          title={`Study sessions (${filteredSessions.length} shown)`}
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                download(
                  "study-radar-sessions.csv",
                  toCsv(
                    sess.map((s) => ({
                      student: nameOf(s.user_id),
                      date: s.date,
                      subject: s.subject,
                      minutes: s.minutes,
                    })),
                  ),
                  "text/csv",
                )
              }
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
            </Button>
          }
        >
          <div className="space-y-1.5">
            {filteredSessions.length === 0 ? (
              <EmptyState text="No sessions match that search." />
            ) : (
              filteredSessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-elevated px-3 py-2 text-xs"
                >
                  <span className="truncate">
                    {nameOf(s.user_id)} · {s.subject}
                  </span>
                  <span className="num shrink-0 text-muted-foreground">
                    {s.date} · {fmtHours(s.minutes)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      ) : null}

      {!loading && tab === "Marks" ? (
        <Panel
          title={`Marks (${filteredMarks.length} shown)`}
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                download(
                  "study-radar-marks.csv",
                  toCsv(
                    mks.map((m) => ({
                      student: nameOf(m.user_id),
                      date: m.date,
                      subject: m.subject,
                      exam: m.exam_name,
                      marks: m.marks,
                      total: m.total,
                    })),
                  ),
                  "text/csv",
                )
              }
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
            </Button>
          }
        >
          <div className="space-y-1.5">
            {filteredMarks.length === 0 ? (
              <EmptyState text="No results match that search." />
            ) : (
              filteredMarks.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-elevated px-3 py-2 text-xs"
                >
                  <span className="truncate">
                    {nameOf(m.user_id)} · {m.subject} · {m.exam_name}
                  </span>
                  <span className="num shrink-0 text-muted-foreground">
                    {m.marks}/{m.total} · {m.date}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      ) : null}

      {!loading && tab === "Security" ? (
        <Panel
          title={`Security events (${filteredEvents.length})`}
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                download("study-radar-security.csv", toCsv(events as never[]), "text/csv")
              }
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
            </Button>
          }
        >
          <div className="space-y-1.5">
            {filteredEvents.length === 0 ? (
              <EmptyState text="Nothing suspicious recorded." />
            ) : (
              filteredEvents.map((e) => (
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
              ))
            )}
          </div>
        </Panel>
      ) : null}

      {!loading && tab === "Backups" ? (
        <Panel title="Backups & exports">
          <p className="text-sm text-muted-foreground">
            Download a point-in-time snapshot of platform data. Keep exports private — they contain
            student information.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() =>
                download(
                  `study-radar-backup-${new Date().toISOString().slice(0, 10)}.json`,
                  JSON.stringify(
                    { exportedAt: new Date().toISOString(), profiles, sessions, marks, events },
                    null,
                    2,
                  ),
                  "application/json",
                )
              }
            >
              <Database className="mr-1.5 h-4 w-4" /> Full JSON backup
            </Button>
            <Button variant="outline" onClick={exportStudents}>
              <Download className="mr-1.5 h-4 w-4" /> Students CSV
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            The database itself is backed up automatically by the hosting platform; these exports
            are your own offline copy.
          </p>
        </Panel>
      ) : null}
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-elevated px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="num">{value}</span>
    </div>
  );
}
