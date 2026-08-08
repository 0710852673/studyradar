import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Flame,
  GraduationCap,
  ListChecks,
  Radar,
  Timer,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/studyos/Footer";
import { useStudyOS } from "@/lib/studyos/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Study Radar — GCE O/L & A/L Study Tracker for Sri Lanka" },
      {
        name: "description",
        content:
          "Track study hours, streaks, marks and syllabus progress for GCE O/L and A/L. Free, fast and built for Sri Lankan students.",
      },
      { property: "og:title", content: "Study Radar — Know exactly where you stand" },
      {
        property: "og:description",
        content:
          "Log study in seconds, watch your streak grow and see your exam readiness in one dashboard.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Flame,
    title: "Fast study logging",
    text: "Pick a subject, tap +30m, done. Logging a session takes under five seconds.",
  },
  {
    icon: BarChart3,
    title: "Real progress, not guesses",
    text: "Daily, weekly and monthly trends with subject comparison and honest insights.",
  },
  {
    icon: GraduationCap,
    title: "Marks tracker",
    text: "Add every term test and model paper, then watch your improvement curve.",
  },
  {
    icon: ListChecks,
    title: "Syllabus tracker",
    text: "Chapter by chapter: not started, in progress, done. Nothing more complicated.",
  },
  {
    icon: CalendarDays,
    title: "GitHub-style heatmap",
    text: "One glance shows your consistency across the whole year.",
  },
  {
    icon: Trophy,
    title: "Streaks & achievements",
    text: "100 study hours. 30 day streak. Small wins that keep you going.",
  },
];

const STEPS = [
  { n: "01", t: "Create your account", d: "Email or Google — takes ten seconds." },
  { n: "02", t: "Pick exam & subjects", d: "A/L stream subjects or O/L compulsory + optional." },
  { n: "03", t: "Log study daily", d: "Your dashboard, streak and forecast update instantly." },
];

function Landing() {
  const { session } = useStudyOS();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Radar className="h-4 w-4" />
            </span>
            <span className="font-display text-base font-semibold tracking-tight sm:text-lg">
              Study Radar
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#contact" className="transition-colors hover:text-foreground">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {session ? (
              <Button asChild size="sm">
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[110px]"
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated px-3.5 py-1.5 text-xs text-muted-foreground">
              <Timer className="h-3.5 w-3.5 text-primary" />
              Built for GCE O/L &amp; A/L students in Sri Lanka
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Know exactly where you stand
              <span className="block text-primary">before the exam does.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Study Radar turns your daily study into hours, streaks, marks and a clear readiness
              score — so you stop guessing and start improving.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to={session ? "/dashboard" : "/auth"}>
                  {session ? "Open your dashboard" : "Start tracking — free"}
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <a href="#features">See what's inside</a>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {["No cost", "Google sign-in", "Works on mobile", "Your data is private"].map((x) => (
                <span key={x} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {x}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto mt-14 grid max-w-4xl gap-3 sm:grid-cols-3">
            {[
              { k: "Today", v: "3h 20m", s: "of your 5h target" },
              { k: "Streak", v: "12 days", s: "keep it alive" },
              { k: "Exam in", v: "245 days", s: "A/L 2027" },
            ].map((c) => (
              <div key={c.k} className="panel p-5 text-left">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.k}</p>
                <p className="num mt-2 text-2xl font-semibold">{c.v}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.s}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="border-t border-border px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you need. Nothing you don't.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Designed to be opened between lessons — quick, calm and honest about your progress.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="panel p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-primary">
                    <f.icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="mt-4 text-sm font-medium">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="border-t border-border px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Up and running in a minute
            </h2>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="panel p-6">
                  <span className="num text-sm text-primary">{s.n}</span>
                  <h3 className="mt-3 text-base font-medium">{s.t}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>

            <div className="panel mt-10 flex flex-col items-center gap-4 p-8 text-center sm:p-12">
              <h3 className="font-display text-xl font-semibold sm:text-2xl">
                Your next exam starts today.
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Join Study Radar and log your first session in under a minute.
              </p>
              <Button asChild size="lg">
                <Link to={session ? "/dashboard" : "/auth"}>
                  {session ? "Open dashboard" : "Create your free account"}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
