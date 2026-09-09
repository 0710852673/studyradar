import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Circle, Sparkles, Target } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel, StatCard } from "@/components/studyos/Primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/skill-lab")({
  head: () => ({
    meta: [
      { title: "Skill lab — Study Radar" },
      {
        name: "description",
        content:
          "Practical skills beside the syllabus — study technique, writing, presenting and basic digital skills, in short steps.",
      },
      { property: "og:title", content: "Skill lab — Study Radar" },
      { property: "og:description", content: "Short skill tracks you can finish between papers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SkillLabPage,
});

type Track = { id: string; name: string; blurb: string; steps: string[] };

const TRACKS: Track[] = [
  {
    id: "t1",
    name: "Study technique",
    blurb: "Learn how to revise so the same hours produce better marks.",
    steps: [
      "Try one 25-minute focused block with the phone in another room",
      "Write five recall questions from today's lesson",
      "Re-answer yesterday's questions without notes",
      "Space one subject over three short sessions instead of one long one",
      "Review your weekly hours in Progress and adjust one subject",
    ],
  },
  {
    id: "t2",
    name: "Answer writing",
    blurb: "Structure essay and structured-question answers the way markers expect.",
    steps: [
      "Underline the command word in five past questions",
      "Write one answer as point, explanation, example",
      "Time yourself on a full structured question",
      "Compare your answer to the marking scheme line by line",
    ],
  },
  {
    id: "t3",
    name: "Presenting and speaking",
    blurb: "Useful for interviews, group work and university selection later.",
    steps: [
      "Explain one topic out loud for two minutes",
      "Record it once and listen back",
      "Teach the same topic to a friend or sibling",
      "Present to a small group without reading",
    ],
  },
  {
    id: "t4",
    name: "Digital basics",
    blurb: "Tools that save time now and matter after school.",
    steps: [
      "Organise your notes into one folder structure",
      "Make a simple spreadsheet of your marks",
      "Learn ten keyboard shortcuts you actually use",
      "Write a clean, formal email",
    ],
  },
];

function SkillLabPage() {
  const [done, setDone] = useState<string[]>([]);
  const total = TRACKS.reduce((a, t) => a + t.steps.length, 0);
  const pct = Math.round((done.length / total) * 100);

  function toggle(key: string) {
    setDone((d) => (d.includes(key) ? d.filter((x) => x !== key) : [...d, key]));
  }

  return (
    <AppShell title="Skill lab" subtitle="Practical skills beside the syllabus">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tracks" value={TRACKS.length} hint="Short and finishable" icon={Sparkles} />
        <StatCard label="Steps completed" value={`${done.length}/${total}`} hint="This device" icon={Target} />
        <StatCard label="Progress" value={`${pct}%`} hint="Across all tracks" accent />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {TRACKS.map((t) => {
          const trackDone = t.steps.filter((_, i) => done.includes(`${t.id}-${i}`)).length;
          return (
            <Panel key={t.id} title={t.name}>
              <p className="-mt-2 mb-3 text-xs text-muted-foreground">{t.blurb}</p>
              <ul className="space-y-1.5">
                {t.steps.map((s, i) => {
                  const key = `${t.id}-${i}`;
                  const isDone = done.includes(key);
                  return (
                    <li key={key}>
                      <button
                        onClick={() => toggle(key)}
                        className={cn(
                          "flex w-full items-start gap-2.5 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors",
                          isDone
                            ? "bg-elevated text-muted-foreground line-through"
                            : "hover:bg-elevated",
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span>{s}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[11px] text-muted-foreground">
                {trackDone} of {t.steps.length} done
              </p>
            </Panel>
          );
        })}
      </div>
    </AppShell>
  );
}
