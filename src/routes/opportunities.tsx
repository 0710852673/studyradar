import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award, CalendarClock, MapPin, Search } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel, EmptyState } from "@/components/studyos/Primitives";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — Study Radar" },
      {
        name: "description",
        content:
          "Scholarships, competitions, olympiads and workshops open to Sri Lankan O/L and A/L students.",
      },
      { property: "og:title", content: "Opportunities — Study Radar" },
      { property: "og:description", content: "Scholarships, olympiads and workshops in one list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpportunitiesPage,
});

type Kind = "Scholarship" | "Competition" | "Workshop" | "Olympiad";

type Opportunity = {
  id: string;
  title: string;
  kind: Kind;
  org: string;
  location: string;
  closes: string;
  who: string;
  detail: string;
};

const ITEMS: Opportunity[] = [
  {
    id: "o1",
    title: "Sri Lanka Mathematical Olympiad",
    kind: "Olympiad",
    org: "Sri Lanka Olympiad Mathematics Foundation",
    location: "Island-wide centres",
    closes: "Registrations open early in the year",
    who: "Grades 9–13",
    detail: "Two-round selection leading to the national team training camp.",
  },
  {
    id: "o2",
    title: "National Physics Olympiad",
    kind: "Olympiad",
    org: "Institute of Physics Sri Lanka",
    location: "Colombo and regional centres",
    closes: "School nominations",
    who: "A/L Physical & Biological Science",
    detail: "Strong preparation overlaps directly with A/L mechanics and electricity.",
  },
  {
    id: "o3",
    title: "Mahapola Higher Education Scholarship",
    kind: "Scholarship",
    org: "Mahapola Trust Fund",
    location: "State universities",
    closes: "After university admission",
    who: "Admitted undergraduates",
    detail: "Monthly allowance based on merit and need once you enter university.",
  },
  {
    id: "o4",
    title: "Inter-school Debating Championship",
    kind: "Competition",
    org: "School debating circuit",
    location: "Colombo",
    closes: "Team entries via school",
    who: "O/L and A/L students",
    detail: "Good for language marks, confidence and university interviews later.",
  },
  {
    id: "o5",
    title: "Coding for School Students",
    kind: "Workshop",
    org: "University computing societies",
    location: "Online + Moratuwa",
    closes: "Rolling intakes",
    who: "Grades 10–13",
    detail: "Weekend introduction to programming, useful for ICT and future degrees.",
  },
  {
    id: "o6",
    title: "Young Scientist Exhibition",
    kind: "Competition",
    org: "Provincial education departments",
    location: "Provincial level",
    closes: "Term two",
    who: "O/L students",
    detail: "Project-based; a strong entry can carry to the national exhibition.",
  },
];

const KINDS = ["All", "Scholarship", "Competition", "Workshop", "Olympiad"] as const;

function OpportunitiesPage() {
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");
  const [q, setQ] = useState("");

  const list = ITEMS.filter(
    (i) =>
      (kind === "All" || i.kind === kind) &&
      (q.trim() === "" ||
        `${i.title} ${i.org} ${i.who}`.toLowerCase().includes(q.trim().toLowerCase())),
  );

  return (
    <AppShell title="Opportunities" subtitle="Scholarships, olympiads, competitions and workshops">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search opportunities"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                kind === k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {list.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((i) => (
            <Panel key={i.id}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold leading-snug">{i.title}</h3>
                <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                  {i.kind}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{i.detail}</p>
              <dl className="mt-3 grid gap-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Award className="h-3.5 w-3.5" />
                  <span className="truncate">{i.org}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{i.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {i.closes} · {i.who}
                  </span>
                </div>
              </dl>
            </Panel>
          ))}
        </div>
      ) : (
        <EmptyState text="Nothing matches that search yet." />
      )}

      <p className="mt-4 text-[11px] text-muted-foreground">
        Dates and eligibility are indicative. Always confirm details with the organising body or
        your school before applying.
      </p>
    </AppShell>
  );
}
