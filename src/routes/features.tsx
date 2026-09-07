import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Compass,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Study Radar student ecosystem" },
      {
        name: "description",
        content:
          "Study tracking, AI insights, learning content, community, pathways and student support — everything Study Radar gives Sri Lankan O/L and A/L students.",
      },
      { property: "og:title", content: "Features — Study Radar" },
      {
        property: "og:description",
        content: "Study, AI, learn, connect, grow and support — one student ecosystem.",
      },
    ],
  }),
  component: FeaturesPage,
});

const GROUPS = [
  {
    icon: BarChart3,
    name: "Study",
    blurb: "The core of Study Radar — your hours, subjects and results in one place.",
    items: ["Dashboard", "Study tracking", "Progress & goals", "Marks and performance"],
  },
  {
    icon: Sparkles,
    name: "AI",
    blurb: "Guidance that reads your own study history instead of giving generic advice.",
    items: ["AI assistant", "Weekly analysis", "Focus recommendations", "Explained insights"],
  },
  {
    icon: BookOpen,
    name: "Learn",
    blurb: "Short, practical material made for exam students, not textbook dumps.",
    items: ["Guides & articles", "Short videos", "Study techniques", "Saved collections"],
  },
  {
    icon: MessagesSquare,
    name: "Connect",
    blurb: "Talk to students who are sitting the same paper as you.",
    items: ["Subject communities", "Chat rooms", "Ask a Senior", "Question & answer"],
  },
  {
    icon: Compass,
    name: "Grow",
    blurb: "Look past the exam — where your subjects can actually take you.",
    items: ["Pathway planner", "Skill Lab", "Portfolio", "Opportunities"],
  },
  {
    icon: Briefcase,
    name: "Support",
    blurb: "When study advice isn't enough, a real person can step in.",
    items: ["Consulting centre", "Mentors & volunteers", "Escalation to humans", "Safe referral"],
  },
] as const;

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <PageHero
          eyebrow="Everything in one ecosystem"
          title="Six parts of Study Radar, working together"
          lead="Each area feeds the next. What you track shapes what you're shown, who you can ask and what you plan next."
        />

        <section className="mx-auto grid max-w-6xl gap-4 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
          {GROUPS.map((g) => (
            <div key={g.name} className="panel p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-primary">
                <g.icon className="h-5 w-5" />
              </span>
              <h2 className="font-display mt-4 text-lg font-semibold">{g.name}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{g.blurb}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {g.items.map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="border-t border-border px-5 py-14 text-center sm:px-8">
          <h2 className="font-display text-2xl font-semibold">Start with your study hours</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Everything else in Study Radar becomes more useful once the platform can see how you
            actually study.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
