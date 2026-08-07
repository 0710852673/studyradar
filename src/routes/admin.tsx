import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Clock, UserPlus, Users } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { EmptyState, Panel, StatCard } from "@/components/studyos/Primitives";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useStudyOS } from "@/lib/studyos/store";
import { fmtHours } from "@/lib/studyos/analytics";

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

type Student = {
  id: string;
  name: string;
  track: string;
  exam_year: number;
  subjects: string[] | null;
  minutes: number;
};

function AdminPage() {
  const { isAdmin, ready } = useStudyOS();
  const [rows, setRows] = useState<Student[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    let alive = true;
    void (async () => {
      const [profiles, sessions] = await Promise.all([
        supabase.from("profiles").select("id, name, track, exam_year, subjects"),
        supabase.from("study_sessions").select("user_id, minutes"),
      ]);
      if (!alive) return;
      const mins = new Map<string, number>();
      for (const s of (sessions.data ?? []) as { user_id: string; minutes: number }[])
        mins.set(s.user_id, (mins.get(s.user_id) ?? 0) + s.minutes);
      setRows(
        ((profiles.data ?? []) as Omit<Student, "minutes">[]).map((p) => ({
          ...p,
          minutes: mins.get(p.id) ?? 0,
        })),
      );
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [isAdmin]);

  if (!ready) return null;
  if (!isAdmin)
    return (
      <AppShell title="Admin" subtitle="Restricted">
        <EmptyState text="You do not have access to this area." />
      </AppShell>
    );

  const totalMins = rows.reduce((a, r) => a + r.minutes, 0);
  const active = rows.filter((r) => r.minutes > 0).length;
  const subjectCount = new Map<string, number>();
  for (const r of rows)
    for (const s of r.subjects ?? []) subjectCount.set(s, (subjectCount.get(s) ?? 0) + 1);
  const popular = [...subjectCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  const filtered = rows.filter((r) =>
    `${r.name} ${r.track} ${r.exam_year} ${(r.subjects ?? []).join(" ")}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <AppShell title="Admin" subtitle="Platform overview">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total students" value={rows.length} icon={Users} accent />
        <StatCard label="Active users" value={active} icon={Activity} />
        <StatCard label="Total study" value={fmtHours(totalMins)} icon={Clock} />
        <StatCard
          label="Avg per student"
          value={fmtHours(rows.length ? Math.round(totalMins / rows.length) : 0)}
          icon={UserPlus}
        />
      </div>

      <Panel title="Most popular subjects" className="mt-4">
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

      <Panel
        title="Students"
        className="mt-4"
        action={
          <Input
            placeholder="Search name, exam, subject"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-56"
          />
        }
      >
        <div className="space-y-2">
          {loading ? (
            <EmptyState text="Loading students…" />
          ) : filtered.length === 0 ? (
            <EmptyState text="No students match that search." />
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-elevated p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.track} · {r.exam_year} · {(r.subjects ?? []).join(", ") || "No subjects"}
                  </p>
                </div>
                <span className="num text-sm text-muted-foreground">{fmtHours(r.minutes)}</span>
              </div>
            ))
          )}
        </div>
      </Panel>
    </AppShell>
  );
}
