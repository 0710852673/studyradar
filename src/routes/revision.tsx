import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { EmptyState, Panel } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { LESSON_STATUSES, type LessonStatus } from "@/lib/studyos/types";

export const Route = createFileRoute("/revision")({
  head: () => ({
    meta: [
      { title: "Revision Tracker — StudyOS" },
      {
        name: "description",
        content: "Track every lesson from Not Started to Mastered with automatic progress bars.",
      },
      { property: "og:title", content: "Revision Tracker — StudyOS" },
      {
        property: "og:description",
        content: "Lesson-by-lesson mastery tracking for each of your subjects.",
      },
    ],
  }),
  component: RevisionPage,
});

const WEIGHT: Record<LessonStatus, number> = {
  "Not Started": 0,
  Learning: 0.3,
  "Revision 1": 0.6,
  "Revision 2": 0.8,
  Mastered: 1,
};

function RevisionPage() {
  const { data, profile, addLesson, setLessonStatus, removeLesson } = useStudyOS();
  const [subject, setSubject] = useState(profile?.subjects[0] ?? "");
  const [title, setTitle] = useState("");

  if (!profile) return null;
  const active = subject || profile.subjects[0] || "";
  const lessons = data.lessons.filter((l) => l.subject === active);
  const pct = lessons.length
    ? Math.round((lessons.reduce((a, l) => a + WEIGHT[l.status], 0) / lessons.length) * 100)
    : 0;

  return (
    <AppShell title="Revision Tracker" subtitle="From first read to mastered">
      <div className="mb-4 flex flex-wrap gap-2">
        {profile.subjects.map((s) => {
          const subs = data.lessons.filter((l) => l.subject === s);
          const p = subs.length
            ? Math.round((subs.reduce((a, l) => a + WEIGHT[l.status], 0) / subs.length) * 100)
            : 0;
          return (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm transition-colors",
                s === active
                  ? "border-primary bg-brand-soft text-primary"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {s} <span className="num opacity-70">{p}%</span>
            </button>
          );
        })}
      </div>

      <Panel title={`${active} · ${pct}% mastered`}>
        <Progress value={pct} className="h-2" />

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            addLesson(active, title.trim());
            setTitle("");
          }}
        >
          <Input
            placeholder="Add a lesson or unit…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button type="submit" size="icon" className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          {lessons.length === 0 ? (
            <EmptyState text="Add your first lesson for this subject." />
          ) : (
            lessons.map((l) => (
              <div
                key={l.id}
                className="rounded-2xl border border-border bg-elevated p-3 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{l.title}</p>
                  <button
                    onClick={() => removeLesson(l.id)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {LESSON_STATUSES.map((st) => (
                    <button
                      key={st}
                      onClick={() => setLessonStatus(l.id, st)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] transition-colors",
                        l.status === st
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
    </AppShell>
  );
}
