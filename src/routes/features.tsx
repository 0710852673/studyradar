import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, Bookmark, GraduationCap, Lock, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Study Radar 1.0" },
      { name: "description", content: "Study tracking, syllabus, marks, goals, progress, exam countdowns and a Resource Hub for Sri Lankan GCE O/L and A/L." },
      { property: "og:title", content: "Study Radar 1.0 features" },
      { property: "og:description", content: "Practical tools for tracking Sri Lankan O/L and A/L exam preparation." },
    ],
  }),
  component: FeaturesPage,
});

const GROUPS = [
  { icon: Timer, name: "Track", blurb: "Keep an honest record of how your study time is used.", items: ["Study sessions by subject", "Wasted time kept separate", "Built-in study timer", "Calendar editing and deletion"] },
  { icon: BarChart3, name: "Understand", blurb: "See your consistency and subject balance.", items: ["Daily, weekly and monthly progress", "Study and wasted-time comparisons", "Streaks and achievements", "Subject-level analysis"] },
  { icon: GraduationCap, name: "Prepare", blurb: "Set up the exam path you are actually following.", items: ["Sri Lankan GCE O/L and A/L profiles", "A/L stream and subject selection", "Daily and weekly goals", "Exam countdown in Sri Lanka time"] },
  { icon: BookOpen, name: "Syllabus and marks", blurb: "Track what you have covered and how your papers are going.", items: ["Chapter-by-chapter syllabus tracker", "Record, edit and remove marks", "Paper performance trends", "Progress by subject"] },
  { icon: Bookmark, name: "Resource Hub", blurb: "Keep useful study links organised in one place.", items: ["Browse published resources", "Save links to your private list", "Suggest resources for review", "Filter by exam and subject"] },
  { icon: Lock, name: "Account and privacy", blurb: "Your study records stay tied to your own account.", items: ["Email and optional Google sign-in", "Private student records", "Optional analytics off by default", "Feedback and contact forms"] },
] as const;

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <PageHero eyebrow="Study Radar 1.0" title="A clear workspace for exam preparation" lead="Study Radar 1.0 focuses on the essentials: track study, manage subjects and syllabus, record marks, and understand your progress." />
        <section className="mx-auto grid max-w-6xl gap-4 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.name} className="panel p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-primary"><group.icon className="h-5 w-5" /></span>
              <h2 className="mt-4 font-display text-lg font-semibold">{group.name}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{group.blurb}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {group.items.map((item) => <li key={item} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{item}</li>)}
              </ul>
            </div>
          ))}
        </section>
        <section className="border-t border-border px-5 py-14 text-center sm:px-8">
          <h2 className="font-display text-2xl font-semibold">Start with your study hours</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Log your first session, then build a clearer picture of your preparation over time.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>Get Started</Link></Button>
            <Button asChild size="lg" variant="secondary"><Link to="/how-it-works">See how it works</Link></Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
