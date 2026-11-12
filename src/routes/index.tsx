import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Flame,
  GraduationCap,
  ListChecks,
  Lock,
  Radar,
  Sparkles,
  Target,
  Timer,
  Trophy,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/studyos/Footer";
import { PublicHeader } from "@/components/studyos/PublicHeader";
import { useStudyOS } from "@/lib/studyos/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Study Radar — GCE O/L & A/L Study Tracker for Sri Lanka" },
      {
        name: "description",
        content:
          "A study tracker for Sri Lankan GCE O/L and A/L students. Track study and wasted time separately, manage subjects and syllabus, record marks and understand your progress.",
      },
      { property: "og:title", content: "Study Radar — Track study. Understand your progress." },
      {
        property: "og:description",
        content:
          "One place for study sessions, wasted time, subjects, syllabus, marks, planning and progress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

/* ---------- motion helpers ---------- */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Fades + lifts children into view once, respecting reduced-motion. */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out",
        shown
          ? "opacity-100 motion-safe:translate-y-0"
          : "opacity-100 motion-safe:translate-y-4 motion-safe:opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Counts up to `to` when scrolled into view. */
function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setV(to);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1200;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        setV(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, reduced]);

  return (
    <span ref={ref} className="num">
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ---------- content ---------- */

const FEATURES = [
  {
    icon: Flame,
    title: "Track study time",
    text: "Log each session by subject and see your daily, weekly and monthly study patterns.",
  },
  {
    icon: Timer,
    title: "Track wasted time separately",
    text: "Record time lost for a clearer picture. Study time and wasted time stay independent.",
  },
  {
    icon: BookOpenCheck,
    title: "Subjects & syllabus",
    text: "Keep subject hours and syllabus chapters together, so you can see what is covered and what remains.",
  },
  {
    icon: GraduationCap,
    title: "Marks & exam progress",
    text: "Record term-test and model-paper marks, then follow your performance over time.",
  },
  {
    icon: CalendarDays,
    title: "Plan your study",
    text: "Use your calendar and study timer to organise sessions and keep your routine visible.",
  },
  {
    icon: Trophy,
    title: "Streaks & achievements",
    text: "See your consistency grow and recognise meaningful study milestones.",
  },
  {
    icon: Target,
    title: "Resources & saved items",
    text: "Explore the Resource Hub and keep useful links saved for when you need them.",
  },
  {
    icon: Lock,
    title: "Your own private workspace",
    text: "Your study records belong to your account, with privacy controls and a place to send feedback.",
  },
];

const STEPS = [
  { n: "01", t: "Create your account", d: "Sign up with Google or email, then complete your student profile." },
  { n: "02", t: "Choose your exam path", d: "Set up your O/L subjects or A/L stream and subjects." },
  { n: "03", t: "Track your preparation", d: "Log study and wasted time separately, then follow your progress." },
];

const SUBJECT_PREVIEW = [
  { s: "Combined Maths", h: "42h", pct: 78 },
  { s: "Physics", h: "31h", pct: 61 },
  { s: "Chemistry", h: "24h", pct: 47 },
];

/* ---------- mock dashboard ---------- */

function DashboardPreview() {
  const bars = [45, 70, 38, 88, 62, 96, 74];
  return (
    <div className="panel relative overflow-hidden rounded-[1.75rem] p-4 shadow-2xl shadow-primary/10 sm:p-6 lg:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Radar className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Your study overview</span>
        </div>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] text-primary">
          LIVE PREVIEW
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { k: "Today", v: <Counter to={3.3} decimals={1} suffix="h" />, s: "of 5h target" },
          { k: "This week", v: <Counter to={21} suffix="h" />, s: "of 35h" },
          { k: "Streak", v: <Counter to={12} suffix="d" />, s: "personal best" },
        ].map((c) => (
          <div key={c.k} className="rounded-xl border border-border/80 bg-elevated p-2.5 sm:p-3.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.k}</p>
            <p className="mt-1.5 text-lg font-semibold">{c.v}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{c.s}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-4 rounded-2xl border border-border/80 bg-elevated p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Example weekly activity</p>
          <p className="text-xs text-primary">Study trend</p>
        </div>
        <div className="mt-3 flex h-24 items-end gap-2">
          {bars.map((b, i) => (
            <div key={i} className="flex-1">
              <div
                className="w-full rounded-t-md bg-primary/80 motion-safe:animate-[grow_0.9s_cubic-bezier(0.22,1,0.36,1)_both]"
                style={{ height: `${b}%`, animationDelay: `${i * 70}ms` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-3 grid gap-2 sm:grid-cols-3">
        {SUBJECT_PREVIEW.map((s, i) => (
          <div key={s.s} className="rounded-xl border border-border/80 bg-elevated p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{s.s}</span>
              <span className="num text-muted-foreground">{s.h}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary motion-safe:animate-[stretch_1.1s_cubic-bezier(0.22,1,0.36,1)_both]"
                style={{ width: `${s.pct}%`, animationDelay: `${200 + i * 120}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

function Landing() {
  const { session } = useStudyOS();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main>
        {/* HERO */}
        <section className="relative isolate overflow-hidden px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-24">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-6rem] h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[130px] motion-safe:animate-[drift_14s_ease-in-out_infinite]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_5%,transparent)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]"
          />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.92fr] lg:gap-14">
            <div className="text-center lg:text-left">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated/70 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Built for GCE O/L &amp; A/L students in Sri Lanka
                </span>
              </Reveal>

              <Reveal delay={90}>
                <h1 className="mt-6 font-display text-[2.65rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.35rem]">
                  See where your study time goes.
                  <span className="block bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                    Make every hour count.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={170}>
                <p className="mx-auto mt-6 max-w-xl text-[0.95rem] leading-7 text-muted-foreground sm:text-lg sm:leading-8 lg:mx-0">
                  Study Radar brings your study sessions, wasted time, subjects, syllabus, marks and
                  progress into one clear workspace, built around Sri Lankan GCE O/L and A/L
                  preparation.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                  <Button
                    asChild
                    size="lg"
                    className="group w-full shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20 sm:w-auto"
                  >
                    <Link to={session ? "/dashboard" : "/auth"} search={session ? {} : { mode: "signup" }}>
                      <span>{session ? "Open your dashboard" : "Get Started"}</span><ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                    <a href="#how">See How It Works</a>
                  </Button>
                </div>
              </Reveal>

              <Reveal delay={310}>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
                  {["Free to use", "Google sign-in", "Mobile first", "Your data stays private"].map(
                    (x) => (
                      <span key={x} className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        {x}
                      </span>
                    ),
                  )}
                </div>
              </Reveal>
            </div>

            <Reveal delay={200} className="relative motion-safe:animate-[float_7s_ease-in-out_infinite]">
              <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[2.5rem] bg-primary/[0.08] blur-2xl" />
              <DashboardPreview />
            </Reveal>
          </div>
        </section>

        <section className="relative z-10 px-5 pb-14 sm:px-8 sm:pb-20">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:grid-cols-4 sm:p-5">
            {[
              { icon: Timer, title: "Study + break tracking", detail: "Kept separate" },
              { icon: GraduationCap, title: "O/L and A/L", detail: "Built for both paths" },
              { icon: TrendingUp, title: "Progress insights", detail: "See your patterns" },
              { icon: ShieldCheck, title: "Private by design", detail: "Your account, your data" },
            ].map((item) => (
              <div key={item.title} className="flex min-w-0 items-center gap-3 px-1 py-2 sm:px-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-primary"><item.icon className="h-4 w-4" /></span>
                <span className="min-w-0"><span className="block text-xs font-semibold sm:text-sm">{item.title}</span><span className="mt-0.5 block text-[10px] text-muted-foreground sm:text-xs">{item.detail}</span></span>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="border-t border-border px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-4xl">
                Everything you need. Nothing you don&apos;t.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                Designed to be opened between lessons — quick, calm and honest about your progress.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 70}>
                  <div className="panel group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-primary transition-transform duration-300 group-hover:scale-110">
                      <f.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-base font-medium">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* O/L vs A/L */}
        <section id="exams" className="border-t border-border px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-4xl">
                One app, two very different exams.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                Study Radar adapts its onboarding, subjects and dashboard to the exam you are
                actually sitting.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                {
                  tag: "GCE O/L",
                  icon: ListChecks,
                  title: "Six compulsory, three optional",
                  points: [
                    "Compulsory subjects preselected for you",
                    "Optional buckets chosen during onboarding",
                    "Balance warnings when a subject falls behind",
                    "Syllabus tracker per subject",
                  ],
                },
                {
                  tag: "GCE A/L",
                  icon: GraduationCap,
                  title: "Stream and three subjects",
                  points: [
                    "Stream-aware subject sets",
                    "Deeper per-subject hour analysis",
                    "Model paper and term test mark trends",
                    "Exam countdown and readiness view",
                  ],
                },
              ].map((c, i) => (
                <Reveal key={c.tag} delay={i * 100}>
                  <div className="panel h-full p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8">
                    <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs text-primary">
                      <c.icon className="h-3.5 w-3.5" />
                      {c.tag}
                    </span>
                    <h3 className="mt-4 font-display text-xl font-semibold">{c.title}</h3>
                    <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                      {c.points.map((p) => (
                        <li key={p} className="flex gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="border-t border-border px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-4xl">
                Up and running in a minute
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-3 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 90}>
                  <div className="panel h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                    <span className="num text-sm text-primary">{s.n}</span>
                    <h3 className="mt-3 text-base font-medium">{s.t}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <div className="panel mt-8 grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
                {[
                  { l: "Study & wasted time", v: "Separate" },
                  { l: "Exam pathways", v: "O/L + A/L" },
                  { l: "Your preparation", v: "One view" },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <p className="font-display text-3xl font-semibold text-primary">{s.v}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.l}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ABOUT US */}
        <section id="about" className="border-t border-border px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  About us
                </span>
                <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight sm:text-4xl">
                  Built by students, for students sitting the same exams.
                </h2>
                <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                  Study Radar started with a simple frustration: hours of work with nothing to show
                  for it but a vague feeling of being behind. Notebooks, timetables and phone timers
                  all told part of the story — never the whole one.
                </p>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  So this became one place where every hour, mark, chapter and streak lives
                  together. No noise, no adverts, no paywall. Just an honest picture of your
                  preparation, updated the moment you log a session.
                </p>

                <div className="panel mt-7 p-5">
                  <p className="text-sm font-semibold">A small independent team in Sri Lanka</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    We build alongside the students who use Study Radar — tell us what to fix next
                    on the contact page.
                  </p>
                </div>
              </Reveal>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    i: Target,
                    t: "Our mission",
                    d: "Give every Sri Lankan O/L and A/L student a clear, honest view of their own preparation.",
                  },
                  {
                    i: Flame,
                    t: "What we believe",
                    d: "Consistency beats cramming. Small daily wins, tracked, become results.",
                  },
                  {
                    i: Lock,
                    t: "How we treat you",
                    d: "Your records are private to your account. No selling data, ever.",
                  },
                  {
                    i: Trophy,
                    t: "Where we're going",
                    d: "Smarter insights, better reports — shaped by what students actually ask for.",
                  },
                ].map((c, i) => (
                  <Reveal key={c.t} delay={i * 80}>
                    <div className="panel h-full p-5 transition-transform duration-300 hover:-translate-y-1">
                      <c.i className="h-4.5 w-4.5 text-primary" />
                      <h3 className="mt-3 text-sm font-medium">{c.t}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.d}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY */}

        <section className="border-t border-border px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  Security &amp; privacy
                </span>
                <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight sm:text-4xl">
                  Your study data is yours.
                </h2>
                <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
                  Accounts use Google&apos;s verified sign-in. Access rules are enforced in the
                  database itself, so no student can read another student&apos;s records — even by
                  tampering with requests. Read the{" "}
                  <Link to="/privacy" className="text-primary underline-offset-4 hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link to="/terms" className="text-primary underline-offset-4 hover:underline">
                    Terms
                  </Link>
                  .
                </p>
              </Reveal>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { i: Lock, t: "Row-level access", d: "Enforced in the database, not the UI." },
                  { i: CheckCircle2, t: "Verified sign-in", d: "Minimal Google permissions only." },
                  { i: CalendarDays, t: "Delete anytime", d: "Remove your account from Settings." },
                  { i: Timer, t: "No hidden tracking", d: "No contacts, mail, or location." },
                ].map((c, i) => (
                  <Reveal key={c.t} delay={i * 80}>
                    <div className="panel h-full p-5">
                      <c.i className="h-4.5 w-4.5 text-primary" />
                      <h3 className="mt-3 text-sm font-medium">{c.t}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{c.d}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="border-t border-border px-5 py-16 sm:px-8 sm:py-24">
          <Reveal className="mx-auto max-w-4xl">
            <div className="panel relative flex flex-col items-center gap-4 overflow-hidden p-8 text-center sm:p-14">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-primary/10 blur-3xl"
              />
              <h2 className="relative font-display text-2xl font-semibold sm:text-4xl">
                Start Your Study Radar
              </h2>
              <p className="relative max-w-md text-sm text-muted-foreground sm:text-base">
                Your next exam starts today. Log your first session in under a minute.
              </p>
              <Button asChild size="lg" className="relative transition-transform hover:scale-[1.03]">
                <Link to={session ? "/dashboard" : "/auth"} search={session ? {} : { mode: "signup" }}>
                  {session ? "Open dashboard" : "Get Started"}
                </Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
