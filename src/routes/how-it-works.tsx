import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Study Radar works — seven simple steps" },
      {
        name: "description",
        content:
          "Create your account, build your student profile, track study, get insights, learn, connect and plan your future with Study Radar.",
      },
      { property: "og:title", content: "How Study Radar works" },
      {
        property: "og:description",
        content: "From sign up to personalised study insights in seven steps.",
      },
    ],
  }),
  component: HowPage,
});

const STEPS = [
  {
    title: "Create your account",
    body: "Sign up with Google or email. It takes under a minute and costs nothing.",
  },
  {
    title: "Build your student profile",
    body: "Tell us your exam, year, subjects and daily target. This is what personalises everything else.",
  },
  {
    title: "Track your study",
    body: "Log a session in two taps, or run the built-in timer while you work.",
  },
  {
    title: "Get personalised insights",
    body: "See your streak, weekly hours, subject balance and where your marks are heading.",
  },
  {
    title: "Learn and connect",
    body: "Short guides, videos, subject communities and seniors who already sat your paper.",
  },
  {
    title: "Plan your future",
    body: "Map subjects to university and career pathways, build skills and collect them in a portfolio.",
  },
  {
    title: "Get support when needed",
    body: "Stuck on a decision or falling behind? Ask for guidance and, if needed, a real person steps in.",
  },
] as const;

function HowPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <PageHero
          eyebrow="How it works"
          title="Seven steps from signing up to knowing what to do next"
          lead="Study Radar gets more useful the more of it you use — but step one is just logging your first study session."
        />

        <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
          <ol className="relative space-y-6 border-l border-border pl-8">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="absolute -left-[41px] flex h-7 w-7 items-center justify-center rounded-full border border-border bg-elevated text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <div className="panel p-4">
                  <h2 className="text-sm font-semibold">{s.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 text-center">
            <Button asChild size="lg">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
