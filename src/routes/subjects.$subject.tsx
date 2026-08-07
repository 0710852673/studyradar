import { createFileRoute } from "@tanstack/react-router";
import { startOfWeek } from "date-fns";
import { format, parseISO } from "date-fns";
import { AppShell } from "@/components/studyos/AppShell";
import { EmptyState, Panel, StatCard } from "@/components/studyos/Primitives";
import { useStudyOS } from "@/lib/studyos/store";
import { fmtHours, sessionsBetween, totalMinutes } from "@/lib/studyos/analytics";

export const Route = createFileRoute("/subjects/$subject")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.subject} — Study Radar` },
      {
        name: "description",
        content: `Total hours, weekly effort and recent sessions for ${params.subject}.`,
      },
      { property: "og:title", content: `${params.subject} — Study Radar` },
      {
        property: "og:description",
        content: `Track your ${params.subject} study time and syllabus progress.`,
      },
    ],
  }),
  component: SubjectPage,
});

function SubjectPage() {
  const { subject } = Route.useParams();
  const { profile, data } = useStudyOS();
  if (!profile) return null;

  const all = data.sessions.filter((s) => s.subject === subject);
  const week = sessionsBetween(all, startOfWeek(new Date(), { weekStartsOn: 1 }), new Date());
  const chapters = data.chapters.filter((c) => c.subject === subject);
  const done = chapters.filter((c) => c.status === "done").length;
  const pct = chapters.length ? Math.round((done / chapters.length) * 100) : 0;
  const recent = [...all]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .slice(0, 10);

  return (
    <AppShell title={subject} subtitle="Subject overview">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total" value={fmtHours(totalMinutes(all))} accent />
        <StatCard label="This week" value={fmtHours(totalMinutes(week))} />
        <StatCard
          label="Syllabus"
          value={`${pct}%`}
          hint={`${done}/${chapters.length} chapters done`}
        />
      </div>

      <Panel title="Recent sessions" className="mt-4">
        <div className="space-y-2">
          {recent.length === 0 ? (
            <EmptyState text={`No ${subject} sessions logged yet.`} />
          ) : (
            recent.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-elevated p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {s.note ?? format(parseISO(s.date), "EEEE, d MMM")}
                  </p>
                  {s.note ? (
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(s.date), "d MMM yyyy")}
                    </p>
                  ) : null}
                </div>
                <span className="num shrink-0 text-sm text-muted-foreground">
                  {fmtHours(s.minutes)}
                </span>
              </div>
            ))
          )}
        </div>
      </Panel>
    </AppShell>
  );
}
