import { createFileRoute } from "@tanstack/react-router";
import { endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { Flame, Target, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/studyos/AppShell";
import { EmptyState, Panel, StatCard } from "@/components/studyos/Primitives";
import { useStudyOS } from "@/lib/studyos/store";
import {
  dailySeries,
  fmtHours,
  minutesByDay,
  sessionsBetween,
  streaks,
  totalMinutes,
} from "@/lib/studyos/analytics";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Study Radar" },
      {
        name: "description",
        content: "Your weekly study report: hours against target, best subject and streak.",
      },
      { property: "og:title", content: "Progress — Study Radar" },
      {
        property: "og:description",
        content: "A simple weekly report of study hours, best subject and consistency.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { profile, data } = useStudyOS();
  if (!profile) return null;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const week = sessionsBetween(data.sessions, weekStart, endOfWeek(weekStart, { weekStartsOn: 1 }));
  const target = profile.weeklyGoalHours * 60;
  const studied = totalMinutes(week);
  const s = streaks(data.sessions);

  const bySubject = profile.subjects
    .map((subject) => ({
      subject,
      minutes: totalMinutes(week.filter((x) => x.subject === subject)),
    }))
    .sort((a, b) => b.minutes - a.minutes);
  const best = bySubject[0];

  const byDay = minutesByDay(week);
  let bestDay: { day: string; minutes: number } | null = null;
  for (const [key, minutes] of byDay) {
    if (!bestDay || minutes > bestDay.minutes)
      bestDay = { day: format(new Date(`${key}T00:00:00`), "EEEE"), minutes };
  }

  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = startOfWeek(subWeeks(new Date(), 7 - i), { weekStartsOn: 1 });
    const mins = totalMinutes(
      sessionsBetween(data.sessions, start, endOfWeek(start, { weekStartsOn: 1 })),
    );
    return { label: format(start, "d MMM"), hours: Math.round((mins / 60) * 10) / 10 };
  });

  const last14 = dailySeries(data.sessions, 14);
  const pct = target > 0 ? Math.min(100, Math.round((studied / target) * 100)) : 0;

  return (
    <AppShell title="Progress" subtitle="Your week at a glance">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Study time"
          value={fmtHours(studied)}
          hint={`Target ${profile.weeklyGoalHours}h`}
          icon={Target}
          accent
        />
        <StatCard label="Weekly goal" value={`${pct}%`} icon={TrendingUp} />
        <StatCard
          label="Best subject"
          value={best && best.minutes > 0 ? best.subject : "—"}
          hint={best && best.minutes > 0 ? fmtHours(best.minutes) : "Nothing logged yet"}
        />
        <StatCard
          label="Streak"
          value={`${s.current} days`}
          hint={`Longest ${s.longest}`}
          icon={Flame}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Last 8 weeks">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeks}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={28} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="hours" fill="var(--brand)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Last 14 days">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={28} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="hours" fill="var(--brand)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="This week by subject" className="mt-4">
        <div className="space-y-3">
          {studied === 0 ? (
            <EmptyState text="Nothing logged this week yet." />
          ) : (
            bySubject.map((r) => (
              <div key={r.subject}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="truncate">{r.subject}</span>
                  <span className="num text-muted-foreground">{fmtHours(r.minutes)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${best && best.minutes ? (r.minutes / best.minutes) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
          {bestDay ? (
            <p className="pt-2 text-xs text-muted-foreground">
              Most studied day: {bestDay.day} · {fmtHours(bestDay.minutes)}
            </p>
          ) : null}
        </div>
      </Panel>
    </AppShell>
  );
}
