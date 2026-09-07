import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/ol-al")({
  head: () => ({
    meta: [
      { title: "For GCE O/L & A/L students — Study Radar" },
      {
        name: "description",
        content:
          "Built around the way Sri Lankan students actually study: O/L core and optional subjects, A/L streams, term tests, papers and revision.",
      },
      { property: "og:title", content: "Built for GCE O/L & A/L students" },
      {
        property: "og:description",
        content: "Subject tracking, revision, marks and exam planning for Sri Lankan students.",
      },
    ],
  }),
  component: ExamsPage,
});

const OL = [
  "Core subjects plus your optional picks — or type in any subject you take",
  "Chapter-by-chapter syllabus tracking with three simple states",
  "Term test marks stored as mark / total so percentages are honest",
  "Daily targets that fit around school and tuition",
];

const AL = [
  "Any stream — Maths, Bio, Commerce, Arts, Tech — or a custom subject list",
  "Time balance across your three subjects so nothing quietly slips",
  "Paper and model-paper marks tracked over time",
  "Countdown to your exam date with weekly reality checks",
];

function ExamsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <PageHero
          eyebrow="Sri Lanka first"
          title="Built around the way Sri Lankan students actually study"
          lead="School, tuition, papers, term tests and revision — Study Radar is shaped for GCE O/L and A/L, not adapted from something foreign."
        />

        <section className="mx-auto grid max-w-5xl gap-4 px-5 py-14 sm:px-8 md:grid-cols-2">
          {[
            { name: "GCE Ordinary Level", items: OL },
            { name: "GCE Advanced Level", items: AL },
          ].map((block) => (
            <div key={block.name} className="panel p-6">
              <h2 className="font-display text-xl font-semibold">{block.name}</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {block.items.map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-14 sm:px-8">
          <div className="panel p-6">
            <h2 className="font-display text-lg font-semibold">More than tracking</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Subject communities, seniors who already sat the same paper, short guides on exam
              technique, and pathway planning for what comes after results. Study Radar is not
              affiliated with any examinations authority — it is a student-built tool.
            </p>
            <div className="mt-5">
              <Button asChild>
                <Link to="/auth">Create your free account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
