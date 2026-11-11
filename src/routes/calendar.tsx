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
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { EmptyState, Panel } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { fmtHours, minutesByDay, toKey } from "@/lib/studyos/analytics";
import { subjectColor } from "@/lib/studyos/subjects";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Study Calendar — Study Radar" },
      {
        name: "description",
        content: "Browse your study history day by day: hours, subjects, papers and notes.",
      },
      { property: "og:title", content: "Study Calendar — Study Radar" },
      {
        property: "og:description",
        content: "A month view of everything you studied, one tap per day.",
      },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { data, profile, updateSession, removeSession, updateWaste, removeWaste } = useStudyOS();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState(toKey(new Date()));
  const [editing, setEditing] = useState<
    | { kind: "study"; id: string; date: string; subject: string; minutes: string; note: string }
    | { kind: "waste"; id: string; date: string; minutes: string; reason: string }
    | null
  >(null);
  const [savingEdit, setSavingEdit] = useState(false);

  if (!profile) return null;
  const byDay = minutesByDay(data.sessions);
  const goal = profile.dailyGoalHours * 60;
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const daySessions = data.sessions.filter((s) => s.date === selected);
  const dayWaste = data.wasted.filter((entry) => entry.date === selected);

  const saveEdit = async () => {
    if (!editing || savingEdit) return;
    setSavingEdit(true);
    try {
      const saved = editing.kind === "study"
        ? await updateSession(editing.id, {
            date: editing.date,
            subject: editing.subject,
            minutes: Number(editing.minutes),
            note: editing.note.trim() || undefined,
          })
        : await updateWaste(editing.id, {
            date: editing.date,
            minutes: Number(editing.minutes),
            reason: editing.reason.trim() || undefined,
          });
      if (saved) {
        setSelected(editing.date);
        setEditing(null);
      }
    } finally {
      setSavingEdit(false);
    }
  };

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
                  {s.note ? <p className="mt-1 text-xs text-muted-foreground">{s.note}</p> : null}
                  <div className="mt-2 flex justify-end gap-2"><button type="button" aria-label="Edit this study entry" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setEditing({ kind: "study", id: s.id, date: s.date, subject: s.subject, minutes: String(s.minutes), note: s.note ?? "" })}><Pencil className="h-3.5 w-3.5" />Edit</button><button type="button" aria-label="Delete this study entry" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => { if (window.confirm("Delete this study entry? This cannot be undone.")) void removeSession(s.id); }}><Trash2 className="h-3.5 w-3.5" />Delete entry</button></div>
                </div>
              ))
            )}
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Wasted-time entries · {dayWaste.length}</h3>
            {dayWaste.length ? <div className="space-y-2">{dayWaste.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-elevated p-3"><div className="min-w-0"><p className="text-sm">{entry.reason || "No reason recorded"}</p><p className="num text-xs text-muted-foreground">{fmtHours(entry.minutes)}</p></div><div className="flex items-center gap-1"><button type="button" aria-label="Edit this wasted-time entry" className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setEditing({ kind: "waste", id: entry.id, date: entry.date, minutes: String(entry.minutes), reason: entry.reason ?? "" })}><Pencil className="h-4 w-4" /></button><button type="button" aria-label="Delete this wasted-time entry" className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => { if (window.confirm("Delete this wasted-time entry? This cannot be undone.")) void removeWaste(entry.id); }}><Trash2 className="h-4 w-4" /></button></div></div>)}</div> : <p className="text-xs text-muted-foreground">No wasted-time entries on this day.</p>}
          </div>
        </Panel>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(next) => { if (!next) setEditing(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.kind === "study" ? "Edit study entry" : "Edit wasted-time entry"}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="space-y-3">
              <Input type="date" value={editing.date} onChange={(event) => setEditing({ ...editing, date: event.target.value })} />
              <Input type="number" min={1} max={1440} step={1} value={editing.minutes} onChange={(event) => setEditing({ ...editing, minutes: event.target.value })} placeholder="Minutes" />
              {editing.kind === "study" ? (
                <>
                  <select
                    value={editing.subject}
                    onChange={(event) => setEditing({ ...editing, subject: event.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {profile.subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                  </select>
                  <Textarea maxLength={1000} value={editing.note} onChange={(event) => setEditing({ ...editing, note: event.target.value })} placeholder="Optional note" />
                </>
              ) : (
                <Input maxLength={500} value={editing.reason} onChange={(event) => setEditing({ ...editing, reason: event.target.value })} placeholder="Optional reason" />
              )}
              <Button className="w-full" onClick={() => void saveEdit()} disabled={savingEdit}>
                {savingEdit ? "Saving…" : "Save changes"}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
