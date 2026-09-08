import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Clock, Play } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — guides, techniques and short videos | Study Radar" },
      {
        name: "description",
        content:
          "Short, practical guides and videos on exam technique, revision method and time management for GCE O/L and A/L students.",
      },
      { property: "og:title", content: "Learn — Study Radar" },
      { property: "og:description", content: "Practical study guides made for exam students." },
    ],
  }),
  component: LearnPage,
});

const TOPICS = ["All", "Exam technique", "Revision", "Time management", "Memory", "Wellbeing"] as const;

const ITEMS = [
  {
    title: "How to actually revise a chapter (not just re-read it)",
    topic: "Revision",
    mins: 6,
    kind: "Guide",
    blurb: "Active recall in three passes: blank page, correct, then teach it aloud.",
  },
  {
    title: "Past papers: the 3-attempt method",
    topic: "Exam technique",
    mins: 8,
    kind: "Guide",
    blurb: "Timed, untimed, then marked against the scheme. Why order matters.",
  },
  {
    title: "Planning a week around school and tuition",
    topic: "Time management",
    mins: 5,
    kind: "Video",
    blurb: "Two blocks a day beats one marathon Sunday every single time.",
  },
  {
    title: "Remembering definitions you keep forgetting",
    topic: "Memory",
    mins: 4,
    kind: "Video",
    blurb: "Spaced repetition without an app — a paper box and five folders.",
  },
  {
    title: "Answering structured essay questions",
    topic: "Exam technique",
    mins: 7,
    kind: "Guide",
    blurb: "Marks come from structure. Plan for 90 seconds, write for the rest.",
  },
  {
    title: "Studying when you have no motivation",
    topic: "Wellbeing",
    mins: 5,
    kind: "Guide",
    blurb: "Start with a 10-minute block. Motivation follows action, not the reverse.",
  },
  {
    title: "Making a revision timetable that survives a bad week",
    topic: "Revision",
    mins: 6,
    kind: "Guide",
    blurb: "Leave two empty slots. Every real week breaks a perfect timetable.",
  },
  {
    title: "Sleep, screens and the night before a paper",
    topic: "Wellbeing",
    mins: 4,
    kind: "Video",
    blurb: "What to do the evening before, and what not to attempt.",
  },
] as const;

function LearnPage() {
  const [topic, setTopic] = useState<string>("All");
  const [saved, setSaved] = useState<string[]>([]);
  const list = topic === "All" ? ITEMS : ITEMS.filter((i) => i.topic === topic);

  return (
    <AppShell title="Learn" subtitle="Short, practical material for exam students">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-colors",
              topic === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((i) => (
          <div key={i.title} className="panel flex flex-col p-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {i.kind === "Video" ? (
                <Play className="h-3.5 w-3.5 text-primary" />
              ) : (
                <BookOpen className="h-3.5 w-3.5 text-primary" />
              )}
              {i.kind} · {i.topic}
            </div>
            <h2 className="mt-3 text-sm font-semibold leading-snug">{i.title}</h2>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{i.blurb}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {i.mins} min
              </span>
              <Button
                size="sm"
                variant={saved.includes(i.title) ? "secondary" : "ghost"}
                onClick={() =>
                  setSaved((s) =>
                    s.includes(i.title) ? s.filter((x) => x !== i.title) : [...s, i.title],
                  )
                }
              >
                {saved.includes(i.title) ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Panel title="Your saved collection">
          {saved.length ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {saved.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing saved yet — tap Save on anything you want to come back to.
            </p>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
