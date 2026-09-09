import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, Clock, Heart, PlayCircle } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/reels")({
  head: () => ({
    meta: [
      { title: "Study reels — Study Radar" },
      {
        name: "description",
        content:
          "Short, focused explainers for GCE O/L and A/L topics — one concept per clip, saved to your own list.",
      },
      { property: "og:title", content: "Study reels — Study Radar" },
      { property: "og:description", content: "One concept per clip, built for revision breaks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReelsPage,
});

type Reel = {
  id: string;
  title: string;
  subject: string;
  level: "O/L" | "A/L";
  seconds: number;
  by: string;
  takeaway: string;
};

const REELS: Reel[] = [
  {
    id: "r1",
    title: "Why moles make stoichiometry easy",
    subject: "Chemistry",
    level: "A/L",
    seconds: 75,
    by: "Nimna P.",
    takeaway: "Convert everything to moles first, then use the equation ratio. Nothing else.",
  },
  {
    id: "r2",
    title: "Projectile motion in one diagram",
    subject: "Physics",
    level: "A/L",
    seconds: 60,
    by: "Tharindu S.",
    takeaway: "Split into horizontal (constant v) and vertical (constant a). Time is shared.",
  },
  {
    id: "r3",
    title: "Quadratics: the 3 forms you actually need",
    subject: "Mathematics",
    level: "O/L",
    seconds: 90,
    by: "Hasini W.",
    takeaway: "Standard for solving, factored for roots, vertex for graphs.",
  },
  {
    id: "r4",
    title: "Osmosis vs diffusion, in 40 seconds",
    subject: "Biology",
    level: "A/L",
    seconds: 45,
    by: "Sanduni R.",
    takeaway: "Osmosis is water only, across a membrane, down a water-potential gradient.",
  },
  {
    id: "r5",
    title: "Essay structure that scores in Sinhala paper II",
    subject: "Sinhala",
    level: "O/L",
    seconds: 110,
    by: "Kavindu J.",
    takeaway: "One idea per paragraph, evidence in the middle, tie back to the question.",
  },
  {
    id: "r6",
    title: "Demand curve shifts vs movements",
    subject: "Economics",
    level: "A/L",
    seconds: 80,
    by: "Ishara D.",
    takeaway: "Price changes move along the curve. Everything else shifts it.",
  },
];

const LEVELS = ["All", "O/L", "A/L"] as const;

function ReelsPage() {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");
  const [saved, setSaved] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);

  const list = REELS.filter((r) => level === "All" || r.level === level);

  function toggleSave(r: Reel) {
    setSaved((s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id]));
    if (!saved.includes(r.id)) toast.success(`Saved "${r.title}"`);
  }

  return (
    <AppShell title="Study reels" subtitle="Short explainers, one concept at a time">
      <div className="mb-4 flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
              level === l
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {l}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-muted-foreground">
          {saved.length} saved
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => (
          <Panel key={r.id} className="flex flex-col">
            <div className="flex aspect-video items-center justify-center rounded-xl border border-border bg-elevated">
              <PlayCircle className="h-10 w-10 text-primary" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="rounded-full border border-border px-2 py-0.5">{r.level}</span>
              <span className="truncate">{r.subject}</span>
              <span className="ml-auto flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {r.seconds}s
              </span>
            </div>
            <h3 className="mt-2 text-sm font-semibold leading-snug">{r.title}</h3>
            <p className="mt-1.5 flex-1 text-xs text-muted-foreground">{r.takeaway}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="truncate text-[11px] text-muted-foreground">by {r.by}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Like"
                  onClick={() =>
                    setLiked((s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id]))
                  }
                >
                  <Heart
                    className={cn("h-4 w-4", liked.includes(r.id) && "fill-primary text-primary")}
                  />
                </Button>
                <Button variant="ghost" size="sm" aria-label="Save" onClick={() => toggleSave(r)}>
                  <Bookmark
                    className={cn("h-4 w-4", saved.includes(r.id) && "fill-primary text-primary")}
                  />
                </Button>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Reels are short revision aids, not a replacement for your teacher or the syllabus. Clips
        shown here are sample content while the library is being built.
      </p>
    </AppShell>
  );
}
