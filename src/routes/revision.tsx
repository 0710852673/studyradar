import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { EmptyState, Panel } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { CHAPTER_LABEL, CHAPTER_STATUSES, type ChapterStatus } from "@/lib/studyos/types";

export const Route = createFileRoute("/revision")({
  head: () => ({
    meta: [
      { title: "Syllabus Tracker — Study Radar" },
      {
        name: "description",
        content: "Track every chapter of your GCE syllabus: not started, in progress or done.",
      },
      { property: "og:title", content: "Syllabus Tracker — Study Radar" },
      {
        property: "og:description",
        content: "See exactly how much of each subject you have covered.",
      },
    ],
  }),
  component: SyllabusPage,
});

const DOT: Record<ChapterStatus, string> = {
  todo: "bg-muted",
  doing: "bg-amber-400",
  done: "bg-emerald-400",
};

const NEXT: Record<ChapterStatus, ChapterStatus> = {
  todo: "doing",
  doing: "done",
  done: "todo",
};

function SyllabusPage() {
  const { profile, data, addChapter, setChapterStatus, removeChapter } = useStudyOS();
  const [subject, setSubject] = useState<string>("");
  const [title, setTitle] = useState("");

  if (!profile) return null;
  const active = subject || profile.subjects[0] || "";
  const chapters = data.chapters.filter((c) => c.subject === active);
  const done = chapters.filter((c) => c.status === "done").length;
  const pct = chapters.length ? Math.round((done / chapters.length) * 100) : 0;

  const add = async () => {
    const t = title.trim();
    if (!t || !active) return;
    setTitle("");
    await addChapter(active, t);
  };

  return (
    <AppShell title="Syllabus" subtitle="Chapter by chapter, subject by subject">
      <div className="mb-4 flex flex-wrap gap-2">
        {profile.subjects.map((s) => (
          <button
            key={s}
            onClick={() => setSubject(s)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              s === active
                ? "border-primary bg-brand-soft text-primary"
                : "border-border bg-elevated text-muted-foreground hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <Panel
        title={`${active} · ${done}/${chapters.length} chapters`}
        action={<span className="num text-sm font-semibold text-primary">{pct}%</span>}
      >
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Add a chapter (e.g. Mechanics)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void add();
            }}
          />
          <Button onClick={add} disabled={!title.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {chapters.length === 0 ? (
            <EmptyState text="No chapters yet. Add the first one above." />
          ) : (
            chapters.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-elevated p-3"
              >
                <button
                  onClick={() => setChapterStatus(c.id, NEXT[c.status])}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", DOT[c.status])} />
                  <span
                    className={cn(
                      "truncate text-sm",
                      c.status === "done" && "text-muted-foreground line-through",
                    )}
                  >
                    {c.title}
                  </span>
                </button>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {CHAPTER_LABEL[c.status]}
                </span>
                <button
                  onClick={() => removeChapter(c.id)}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  aria-label={`Delete ${c.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Tap a chapter to cycle it:{" "}
          {CHAPTER_STATUSES.map((s) => CHAPTER_LABEL[s]).join(" → ")}.
        </p>
      </Panel>
    </AppShell>
  );
}
