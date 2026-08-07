import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { EmptyState, Panel } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { fmtHours, minutesByDay, toKey } from "@/lib/studyos/analytics";
import { subjectColor } from "@/lib/studyos/subjects";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Study Calendar — StudyOS" },
      {
        name: "description",
        content: "Browse your study history day by day: hours, subjects, papers and notes.",
      },
      { property: "og:title", content: "Study Calendar — StudyOS" },
      {
        property: "og:description",
        content: "A month view of everything you studied, one tap per day.",
      },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { data, profile } = useStudyOS();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState(toKey(new Date()));

  if (!profile) return null;
  const byDay = minutesByDay(data.sessions);
  const goal = profile.dailyGoalHours * 60;
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const daySessions = data.sessions.filter((s) => s.date === selected);

  return (
    <AppShell title="Calendar" subtitle="Your study history, day by day">
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title={format(month, "MMMM yyyy")}
          action={
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, -1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {days.map((d) => {
              const key = toKey(d);
              const mins = byDay.get(key) ?? 0;
              const ratio = Math.min(1, mins / Math.max(goal, 30));
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-xl border text-xs transition-all duration-150 hover:scale-[1.04]",
                    selected === key ? "border-primary" : "border-transparent",
                    !isSameMonth(d, month) && "opacity-35",
                    isToday(d) && "ring-1 ring-border",
                  )}
                  style={{
                    background:
                      mins > 0
                        ? `color-mix(in oklab, var(--brand) ${18 + ratio * 62}%, var(--muted))`
                        : "var(--muted)",
                    color: ratio > 0.55 ? "var(--primary-foreground)" : undefined,
                  }}
                >
                  <span className="num font-medium">{format(d, "d")}</span>
                  {mins > 0 ? (
                    <span className="num text-[10px] opacity-80">
                      {Math.round((mins / 60) * 10) / 10}h
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title={format(new Date(`${selected}T00:00:00`), "EEEE, d MMM yyyy")}>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-elevated p-3">
              <p className="text-xs text-muted-foreground">Hours</p>
              <p className="num text-lg font-semibold">{fmtHours(byDay.get(selected) ?? 0)}</p>
            </div>
            <div className="rounded-xl bg-elevated p-3">
              <p className="text-xs text-muted-foreground">Sessions</p>
              <p className="num text-lg font-semibold">{daySessions.length}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {daySessions.length === 0 ? (
              <EmptyState text="No sessions logged on this day." />
            ) : (
              daySessions.map((s) => (
                <div key={s.id} className="rounded-xl border border-border bg-elevated p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: subjectColor(s.subject) }}
                      />
                      <span className="truncate text-sm font-medium">{s.subject}</span>
                    </span>
                    <span className="num text-xs text-muted-foreground">
                      {fmtHours(s.minutes)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.note ?? ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
