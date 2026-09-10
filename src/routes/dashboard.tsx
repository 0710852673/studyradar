import { differenceInCalendarDays, parseISO, startOfMonth, startOfWeek } from "date-fns";
import {
  Briefcase,
  CalendarClock,
  Clock,
  Compass,
  FileText,
  Flame,
  Gauge,
  MessagesSquare,
  PlayCircle,
  Sparkles,
  TrendingUp,
  UserRoundCheck,
  Wrench,
} from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import { Heatmap } from "@/components/studyos/Heatmap";
import { Progress } from "@/components/ui/progress";
import { useStudyOS } from "@/lib/studyos/store";
import {
  bySubject,
  dailySeries,
  fmtHours,
  forecast,
  insights,
  monthlySeries,
  sessionsBetween,
  streaks,
  studyScore,
  totalMinutes,
} from "@/lib/studyos/analytics";
import { subjectColor } from "@/lib/studyos/subjects";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Study Radar" },
      {
        name: "description",
        content:
          "Track study hours, streaks, marks and exam readiness for Sri Lankan GCE O/L and A/L students.",
      },
      { property: "og:title", content: "Dashboard — Study Radar" },
      {
        property: "og:description",
        content: "A fitness tracker, but for studying. Hours, streaks, marks and forecasts.",
      },
    ],
  }),
  component: Dashboard,
});

const chartAxis = { stroke: "var(--muted-foreground)", fontSize: 11 };

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">{payload[0].value}h</p>
    </div>
  );
}

function Dashboard() {
  const { data, profile } = useStudyOS();
  if (!profile) return null;
  const sessions = data.sessions;

  const today = totalMinutes(sessionsBetween(sessions, new Date(), new Date()));
  const week = totalMinutes(
    sessionsBetween(sessions, startOfWeek(new Date(), { weekStartsOn: 1 }), new Date()),
  );
  const month = totalMinutes(sessionsBetween(sessions, startOfMonth(new Date()), new Date()));
  const s = streaks(sessions);
  const score = studyScore(sessions, profile);
  const daysLeft = Math.max(
    0,
    differenceInCalendarDays(parseISO(profile.examDate), new Date()),
  );
  const goalPct = Math.min(100, Math.round((today / (profile.dailyGoalHours * 60)) * 100));
  const weekSeries = dailySeries(sessions, 7);
  const monthSeries = monthlySeries(sessions, 6);
  const subjectStats = bySubject(sessions, profile.subjects);
  const maxSubject = Math.max(1, ...subjectStats.map((x) => x.total));
  const f = forecast(sessions, profile);
  const notes = insights(sessions, profile);

  return (
    <AppShell
      title={`${profile.track === "AL" ? "A/L" : "O/L"} ${profile.examYear}`}
      subtitle={profile.stream ? `${profile.stream} stream` : "Your study dashboard"}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Today"
          value={fmtHours(today)}
          icon={Clock}
          accent
          hint={`${goalPct}% of your ${profile.dailyGoalHours}h goal`}
        >
          <Progress value={goalPct} className="mt-3 h-1.5" />
        </StatCard>
        <StatCard
          label="This week"
          value={fmtHours(week)}
          icon={TrendingUp}
          hint={`Goal ${profile.weeklyGoalHours}h`}
        >
          <Progress
            value={Math.min(100, (week / 60 / profile.weeklyGoalHours) * 100)}
            className="mt-3 h-1.5"
          />
        </StatCard>
        <StatCard label="This month" value={fmtHours(month)} icon={Gauge} hint="Total logged" />
        <StatCard
          label="Streak"
          value={`${s.current} days`}
          icon={Flame}
          hint={`Longest ${s.longest} days`}
        />
        <StatCard
          label="Study score"
          value={score}
          icon={Sparkles}
          hint="Consistency + goals + volume"
        />
        <StatCard
          label="Exam countdown"
          value={`${daysLeft} days`}
          icon={CalendarClock}
          hint={profile.examDate}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Weekly study trend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weekSeries}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} {...chartAxis} />
              <YAxis tickLine={false} axisLine={false} width={28} {...chartAxis} />
              <Tooltip content={<ChartTip />} />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="var(--brand)"
                strokeWidth={2.5}
                fill="url(#g1)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Monthly trend">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} {...chartAxis} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="hours" fill="var(--brand)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Subject comparison" className="lg:col-span-2">
          {totalMinutes(sessions) === 0 ? (
            <EmptyState text="Log your first session to see subject comparison." />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, subjectStats.length * 38)}>
              <BarChart data={subjectStats} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="subject"
                  width={130}
                  tickLine={false}
                  axisLine={false}
                  {...chartAxis}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={({ active, payload }: any) =>
                    active && payload?.length ? (
                      <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs">
                        {fmtHours(payload[0].value)}
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {subjectStats.map((x) => (
                    <Cell key={x.subject} fill={subjectColor(x.subject)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Insights">
          {notes.length === 0 ? (
            <EmptyState text="No alerts. You're on top of things." />
          ) : (
            <ul className="space-y-2.5">
              {notes.map((n, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border bg-elevated px-3 py-2.5 text-sm text-muted-foreground"
                >
                  {n}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Subjects" className="mt-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {subjectStats.map((x) => (
            <div key={x.subject} className="rounded-2xl border border-border bg-elevated p-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: subjectColor(x.subject) }}
                />
                <span className="truncate text-sm font-medium">{x.subject}</span>
              </div>
              <div className="num mt-3 text-xl font-semibold">{fmtHours(x.total)}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {fmtHours(x.week)} this week · avg {fmtHours(x.avg)}/day
              </div>
              <Progress value={(x.total / maxSubject) * 100} className="mt-3 h-1.5" />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Explore Study Radar" className="mt-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ECOSYSTEM.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              className="flex items-start gap-3 rounded-2xl border border-border bg-elevated p-4 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
                <i.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{i.label}</span>
                <span className="block text-xs text-muted-foreground">{i.desc}</span>
              </span>
            </Link>
          ))}
        </div>
        <Link
          to="/explore"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary"
        >
          See everything <Compass className="h-3.5 w-3.5" />
        </Link>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Study heatmap" className="lg:col-span-2">
          <Heatmap sessions={sessions} goalMinutes={profile.dailyGoalHours * 60} />
        </Panel>
        <Panel title="Forecast">
          <p className="text-sm text-muted-foreground">
            At your current pace of <span className="text-foreground">{f.avgPerDay}h/day</span>,
            you will complete approximately{" "}
            <span className="text-foreground">{f.projected} study hours</span> before your exam.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-elevated p-3">
              <p className="text-xs text-muted-foreground">Hours done</p>
              <p className="num text-lg font-semibold">{f.done}h</p>
            </div>
            <div className="rounded-xl bg-elevated p-3">
              <p className="text-xs text-muted-foreground">Days left</p>
              <p className="num text-lg font-semibold">{f.daysLeft}</p>
            </div>
          </div>
          <p
            className={`mt-4 rounded-xl px-3 py-2.5 text-sm ${f.onTrack ? "bg-brand-soft text-primary" : "bg-muted text-muted-foreground"}`}
          >
            {f.onTrack
              ? "You are on track for your target."
              : `Behind target — aim for ${f.requiredPerDay}h/day to catch up.`}
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
