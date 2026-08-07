import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { startOfWeek } from "date-fns";
import { AppShell } from "@/components/studyos/AppShell";
import { EmptyState, Panel } from "@/components/studyos/Primitives";
import { useStudyOS } from "@/lib/studyos/store";
import { subjectColor } from "@/lib/studyos/subjects";
import { fmtHours, sessionsBetween, totalMinutes } from "@/lib/studyos/analytics";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — Study Radar" },
      {
        name: "description",
        content: "Hours, weekly effort and syllabus progress for every subject you study.",
      },
      { property: "og:title", content: "Subjects — Study Radar" },
      {
        property: "og:description",
        content: "See which subjects get your hours and which ones are falling behind.",
      },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const { profile, data } = useStudyOS();
  if (!profile) return null;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const rows = profile.subjects.map((subject) => {
    const all = data.sessions.filter((s) => s.subject === subject);
    const chapters = data.chapters.filter((c) => c.subject === subject);
    const done = chapters.filter((c) => c.status === "done").length;
    return {
      subject,
      total: totalMinutes(all),
      week: totalMinutes(sessionsBetween(all, weekStart, new Date())),
      pct: chapters.length ? Math.round((done / chapters.length) * 100) : 0,
      chapters: chapters.length,
    };
  });

  return (
    <AppShell title="Subjects" subtitle="Where your hours are going">
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.length === 0 ? (
          <EmptyState text="No subjects yet." />
        ) : (
          rows.map((r) => (
            <Link key={r.subject} to="/subjects/$subject" params={{ subject: r.subject }}>
              <Panel className="transition-transform duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: subjectColor(r.subject) }}
                    />
                    <span className="truncate font-medium">{r.subject}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="num text-2xl font-semibold">{fmtHours(r.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmtHours(r.week)} this week
                    </p>
                  </div>
                  <span className="num text-sm font-semibold text-primary">{r.pct}%</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </Panel>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  );
}
