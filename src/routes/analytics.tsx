import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/studyos/AppShell";
import { EmptyState, Panel, StatCard } from "@/components/studyos/Primitives";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import {
  bySubject,
  consistencyPct,
  dailySeries,
  fmtHours,
  minutesByDay,
  monthlySeries,
  totalMinutes,
} from "@/lib/studyos/analytics";
import { subjectColor } from "@/lib/studyos/subjects";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Study Analytics — Study Radar" },
      {
        name: "description",
        content: "Weekly, monthly and yearly study analytics with subject breakdowns.",
      },
      { property: "og:title", content: "Study Analytics — Study Radar" },
      {
        property: "og:description",
        content: "See your best study day, consistency and subject-wise hours at a glance.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const axis = { stroke: "var(--muted-foreground)", fontSize: 11 };

function AnalyticsPage() {
  const { data, profile } = useStudyOS();
  const [range, setRange] = useState<"Weekly" | "Monthly" | "Yearly">("Weekly");
  if (!profile) return null;

  const sessions = data.sessions;
  const days = range === "Weekly" ? 7 : range === "Monthly" ? 30 : 365;
  const series = range === "Yearly" ? monthlySeries(sessions, 12) : dailySeries(sessions, days);
  const byDay = minutesByDay(sessions);
  const best = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];
  const stats = bySubject(sessions, profile.subjects).sort((a, b) => b.total - a.total);
  const most = stats[0];
  const least = stats[stats.length - 1];
  const avgDay = byDay.size ? totalMinutes(sessions) / byDay.size : 0;
  const goalDays = [...byDay.values()].filter((v) => v >= profile.dailyGoalHours * 60).length;

  return (
    <AppShell title="Analytics" subtitle="Where your hours actually go">
      <div className="mb-4 inline-flex rounded-xl border border-border bg-surface p-1">
        {(["Weekly", "Monthly", "Yearly"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm transition-colors",
              range === r ? "bg-brand-soft font-medium text-primary" : "text-muted-foreground",
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Avg hours / day" value={fmtHours(avgDay)} hint="On days you studied" />
        <StatCard label="Consistency" value={`${consistencyPct(sessions)}%`} hint="Last 30 days" />
        <StatCard
          label="Best study day"
          value={best ? fmtHours(best[1]) : "—"}
          hint={best ? format(parseISO(best[0]), "d MMM yyyy") : "No data yet"}
        />
        <StatCard
          label="Daily goal hit"
          value={`${goalDays} days`}
          hint={`Goal ${profile.dailyGoalHours}h/day`}
        />
      </div>

      <Panel title={`${range} study hours`} className="mt-4">
        {totalMinutes(sessions) === 0 ? (
          <EmptyState text="Nothing logged yet." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} {...axis} />
              <YAxis tickLine={false} axisLine={false} width={28} {...axis} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="var(--brand)"
                strokeWidth={2.5}
                fill="url(#ga)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Subject-wise hours" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={Math.max(180, stats.length * 38)}>
            <BarChart data={stats} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="subject"
                width={130}
                tickLine={false}
                axisLine={false}
                {...axis}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                formatter={(v: number) => fmtHours(v)}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                {stats.map((x) => (
                  <Cell key={x.subject} fill={subjectColor(x.subject)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Highlights">
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-elevated p-3">
              <p className="text-xs text-muted-foreground">Most studied</p>
              <p className="font-medium">{most ? `${most.subject} · ${fmtHours(most.total)}` : "—"}</p>
            </div>
            <div className="rounded-xl bg-elevated p-3">
              <p className="text-xs text-muted-foreground">Least studied</p>
              <p className="font-medium">
                {least ? `${least.subject} · ${fmtHours(least.total)}` : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-elevated p-3">
              <p className="text-xs text-muted-foreground">Total sessions</p>
              <p className="num font-medium">{sessions.length}</p>
            </div>
            <div className="rounded-xl bg-elevated p-3">
              <p className="text-xs text-muted-foreground">Lifetime hours</p>
              <p className="num font-medium">{fmtHours(totalMinutes(sessions))}</p>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
