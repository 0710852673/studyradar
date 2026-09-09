import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Compass, GraduationCap, Route as RouteIcon } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel, StatCard } from "@/components/studyos/Primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pathway")({
  head: () => ({
    meta: [
      { title: "Career pathways — Study Radar" },
      {
        name: "description",
        content:
          "See where each GCE A/L stream can lead in Sri Lanka — university courses, entry points and realistic alternatives.",
      },
      { property: "og:title", content: "Career pathways — Study Radar" },
      { property: "og:description", content: "Where your stream can take you after A/L." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PathwayPage,
});

type Stream = {
  id: string;
  name: string;
  subjects: string;
  courses: { title: string; where: string; note: string }[];
  alternatives: string[];
};

const STREAMS: Stream[] = [
  {
    id: "bio",
    name: "Biological Science",
    subjects: "Biology · Chemistry · Physics",
    courses: [
      { title: "MBBS (Medicine)", where: "State universities", note: "Highest Z-score demand" },
      { title: "BDS (Dental Surgery)", where: "Peradeniya", note: "Very limited intake" },
      { title: "BVSc (Veterinary Science)", where: "Peradeniya", note: "Strong Biology needed" },
      { title: "BSc Biological Science", where: "Most state universities", note: "Broad base" },
    ],
    alternatives: ["Nursing", "Medical laboratory science", "Biomedical engineering", "Pharmacy"],
  },
  {
    id: "maths",
    name: "Physical Science",
    subjects: "Combined Maths · Physics · Chemistry",
    courses: [
      { title: "Engineering", where: "Moratuwa, Peradeniya, Ruhuna", note: "Maths-weighted" },
      { title: "Computer Science / IT", where: "Colombo, Moratuwa, UCSC", note: "Growing intake" },
      { title: "BSc Physical Science", where: "Most state universities", note: "Flexible" },
      { title: "Architecture / Quantity Surveying", where: "Moratuwa", note: "Aptitude test" },
    ],
    alternatives: ["Data analytics", "Actuarial science", "Software engineering", "Surveying"],
  },
  {
    id: "com",
    name: "Commerce",
    subjects: "Accounting · Business Studies · Economics",
    courses: [
      { title: "BBA / B.Com", where: "Colombo, Sri Jayewardenepura", note: "Popular" },
      { title: "BSc Management (Finance)", where: "Kelaniya, USJ", note: "Maths helps" },
      { title: "Business Analytics", where: "Selected universities", note: "Newer stream" },
    ],
    alternatives: ["CA Sri Lanka", "CIMA", "ACCA", "Banking and insurance careers"],
  },
  {
    id: "arts",
    name: "Arts",
    subjects: "Languages · Social sciences · Aesthetics",
    courses: [
      { title: "LLB (Law)", where: "Colombo, Peradeniya, Law College", note: "Entrance exam" },
      { title: "BA International Relations", where: "Colombo, Kelaniya", note: "Language-heavy" },
      { title: "BA Education / Teaching", where: "Most universities", note: "Stable demand" },
      { title: "Mass Communication", where: "Kelaniya, USJ", note: "Portfolio helps" },
    ],
    alternatives: ["Translation", "Public service", "Journalism", "Design and media"],
  },
];

function PathwayPage() {
  const [active, setActive] = useState(STREAMS[0]!.id);
  const stream = STREAMS.find((s) => s.id === active)!;

  return (
    <AppShell title="Career pathways" subtitle="Where your stream can take you after A/L">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Streams mapped" value={STREAMS.length} hint="Sri Lankan A/L" icon={Compass} />
        <StatCard
          label="Courses listed"
          value={STREAMS.reduce((a, s) => a + s.courses.length, 0)}
          hint="State university routes"
          icon={GraduationCap}
        />
        <StatCard
          label="Alternative routes"
          value={STREAMS.reduce((a, s) => a + s.alternatives.length, 0)}
          hint="Beyond the usual first choice"
          icon={RouteIcon}
          accent
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STREAMS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
              active === s.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel title={`${stream.name} — university routes`}>
          <p className="mb-4 text-xs text-muted-foreground">{stream.subjects}</p>
          <ul className="space-y-3">
            {stream.courses.map((c) => (
              <li
                key={c.title}
                className="flex items-start gap-3 rounded-xl border border-border bg-elevated p-3"
              >
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.where} · {c.note}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="If the first choice doesn't happen">
          <ul className="space-y-2 text-sm text-muted-foreground">
            {stream.alternatives.map((a) => (
              <li key={a} className="rounded-lg border border-border px-3 py-2 text-foreground">
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Intakes, Z-score cut-offs and entry rules change every year. Always confirm with the UGC
            handbook and your school before making a decision.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
