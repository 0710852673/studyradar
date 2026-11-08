import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/guidelines")({
  head: () => ({
    meta: [
      { title: "Community Guidelines — Study Radar" },
      {
        name: "description",
        content:
          "How students keep Study Radar safe, kind and useful — rules for every shared space.",
      },
      { property: "og:title", content: "Community Guidelines — Study Radar" },
      { property: "og:description", content: "Rules that keep Study Radar safe for students." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuidelinesPage,
});

const RULES = [
  ["Be kind", "No bullying, harassment, hate or mocking anyone's marks, school or background."],
  [
    "Protect your privacy",
    "Never share phone numbers, addresses, social handles, school timetables or photos of yourself or others.",
  ],
  [
    "No private meet-ups",
    "Do not arrange to meet anyone or move conversations to other apps. Report anyone who asks.",
  ],
  [
    "Honest help only",
    "Explain, don't cheat. No sharing of leaked exam papers or doing someone else's assessed work.",
  ],
  ["Keep it on topic", "No spam, advertising, paid tuition promotion or links to unknown sites."],
  [
    "Report problems",
    "If something feels wrong, report it. Admins review reports and may hide content or suspend accounts.",
  ],
] as const;

function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <PageHero
          eyebrow="Community"
          title="Community Guidelines"
          lead="Study Radar is used by school students, many under 18. These rules apply to every shared space."
        />
        <section className="mx-auto max-w-3xl space-y-3 px-5 py-14 sm:px-8">
          {RULES.map(([t, b], i) => (
            <div key={t} className="panel p-5">
              <h2 className="text-sm font-semibold">
                {i + 1}. {t}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{b}</p>
            </div>
          ))}
          <p className="pt-2 text-xs text-muted-foreground">
            Breaking these rules can lead to content removal or account suspension.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
