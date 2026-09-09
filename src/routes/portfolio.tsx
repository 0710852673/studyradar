import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Award, BookOpen, Clock, GraduationCap } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel, StatCard, EmptyState } from "@/components/studyos/Primitives";
import { useStudyOS } from "@/lib/studyos/store";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Student portfolio — Study Radar" },
      {
        name: "description",
        content:
          "A clean summary of your study record — hours, subjects, marks and syllabus progress in one page.",
      },
      { property: "og:title", content: "Student portfolio — Study Radar" },
      { property: "og:description", content: "Your study record, summarised in one page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { profile, data } = useStudyOS();
  const sessions = data?.sessions ?? [];
  const marks = data?.marks ?? [];
  const chapters = data?.chapters ?? [];

  const stats = useMemo(() => {
    const minutes = sessions.reduce((a, s) => a + s.minutes, 0);
    const bySubject = new Map<string, number>();
    for (const s of sessions) bySubject.set(s.subject, (bySubject.get(s.subject) ?? 0) + s.minutes);
    const best = [...bySubject.entries()].sort((a, b) => b[1] - a[1])[0];
    const avg = marks.length
      ? marks.reduce((a, m) => a + (m.marks / Math.max(1, m.total)) * 100, 0) / marks.length
      : null;
    const doneChapters = chapters.filter((c) => c.status === "done").length;
    return { minutes, best, avg, doneChapters, bySubject };
  }, [sessions, marks, chapters]);

  return (
    <AppShell title="Portfolio" subtitle="Your study record, summarised">
      <Panel className="mb-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-semibold">{profile?.name ?? "Student"}</h2>
          <p className="text-sm text-muted-foreground">
            GCE {profile?.track ?? "—"} · Exam {profile?.examYear ?? "—"}
            {profile?.school ? ` · ${profile.school}` : ""}
          </p>
          {profile?.bio ? <p className="mt-2 text-sm">{profile.bio}</p> : null}
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total study time"
          value={`${Math.round(stats.minutes / 60)}h`}
          hint={`${sessions.length} sessions logged`}
          icon={Clock}
        />
        <StatCard
          label="Strongest by time"
          value={stats.best?.[0] ?? "—"}
          hint={stats.best ? `${Math.round(stats.best[1] / 60)}h` : "No sessions yet"}
          icon={BookOpen}
        />
        <StatCard
          label="Average paper"
          value={stats.avg !== null ? `${stats.avg.toFixed(1)}%` : "—"}
          hint={`${marks.length} papers recorded`}
          icon={GraduationCap}
        />
        <StatCard
          label="Chapters finished"
          value={`${stats.doneChapters}/${chapters.length}`}
          hint="Across all subjects"
          icon={Award}
          accent
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Subjects">
          {profile?.subjects?.length ? (
            <ul className="space-y-2 text-sm">
              {profile.subjects.map((s) => (
                <li
                  key={s}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <span className="truncate">{s}</span>
                  <span className="num text-xs text-muted-foreground">
                    {Math.round((stats.bySubject.get(s) ?? 0) / 60)}h
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState text="Add your subjects in Profile to see them here." />
          )}
        </Panel>

        <Panel title="Recent papers">
          {marks.length ? (
            <ul className="space-y-2 text-sm">
              {[...marks]
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .slice(0, 6)
                .map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{m.examName}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {m.subject} · {m.date}
                      </span>
                    </span>
                    <span className="num shrink-0 text-sm">
                      {Math.round((m.marks / Math.max(1, m.total)) * 100)}%
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <EmptyState text="Record a paper under Marks and it will appear here." />
          )}
        </Panel>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        This page is built only from what you logged. Nothing here is shared with anyone unless you
        choose to show it.
      </p>
    </AppShell>
  );
}
