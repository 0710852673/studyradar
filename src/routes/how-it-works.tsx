import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Study Radar 1.0 works" },
      { name: "description", content: "Set up your Sri Lankan GCE O/L or A/L profile, track study and wasted time separately, manage syllabus and marks, and review progress." },
      { property: "og:title", content: "How Study Radar works" },
      { property: "og:description", content: "A practical six-step workflow for tracking exam preparation." },
    ],
  }),
  component: HowPage,
});

const STEPS = [
  { title: "Create your account", body: "Sign up with email or use Google sign-in when it is enabled." },
  { title: "Set up your exam profile", body: "Choose O/L or A/L, your exam year, subjects and stream where relevant." },
  { title: "Set a realistic target", body: "Choose a daily study goal and keep it adjustable as school and tuition change." },
  { title: "Log study and wasted time", body: "Record each separately so your study totals never get mixed with distractions." },
  { title: "Track syllabus and marks", body: "Update chapter progress and record term-test or model-paper results." },
  { title: "Review and adjust", body: "Use your progress, streaks, subject balance and exam countdown to decide what needs attention next." },
] as const;

function HowPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <PageHero eyebrow="How it works" title="Six steps to a clearer study record" lead="Start small. Study Radar becomes more useful as you log sessions and keep your subjects, syllabus and marks up to date." />
        <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
          <ol className="relative space-y-6 border-l border-border pl-8">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="absolute -left-[41px] flex h-7 w-7 items-center justify-center rounded-full border border-border bg-elevated text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
                <div className="panel p-4"><h2 className="text-sm font-semibold">{step.title}</h2><p className="mt-1 text-sm text-muted-foreground">{step.body}</p></div>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center"><Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>Get Started</Link></Button></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
