import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, Bookmark, CalendarDays, CheckCircle2, GraduationCap, Lock, Target, Timer, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/features")({
  head: () => ({ meta: [
    { title: "Features — Study Radar 1.0" },
    { name: "description", content: "Explore study tracking, syllabus management, marks, goals, progress insights and resources for Sri Lankan GCE O/L and A/L students." },
    { property: "og:title", content: "Study Radar 1.0 features" },
    { property: "og:description", content: "A practical workspace for Sri Lankan O/L and A/L exam preparation." },
  ] }),
  component: FeaturesPage,
});

const GROUPS = [
  { icon: Timer, name: "Track your time", tag: "01 · RECORD", blurb: "Build an accurate picture of how your day is being used.", items: ["Log study sessions by subject", "Record wasted time separately", "Use the built-in study timer", "Edit or remove incorrect logs"] },
  { icon: BarChart3, name: "Understand progress", tag: "02 · REVIEW", blurb: "Turn your records into patterns you can actually use.", items: ["Daily, weekly and monthly summaries", "Compare study and wasted time", "Review streaks and achievements", "Spot subject-level imbalances"] },
  { icon: GraduationCap, name: "Prepare for your exam", tag: "03 · PLAN", blurb: "Set up a workspace that matches your exam path.", items: ["Sri Lankan GCE O/L and A/L profiles", "A/L stream and subject selection", "Daily and weekly study goals", "Exam countdowns"] },
  { icon: BookOpen, name: "Manage syllabus and marks", tag: "04 · IMPROVE", blurb: "Keep learning progress and paper performance together.", items: ["Chapter-by-chapter syllabus tracking", "Record and manage marks", "Follow paper performance over time", "Review progress by subject"] },
  { icon: Bookmark, name: "Keep resources close", tag: "05 · ORGANISE", blurb: "Spend less time searching for useful material.", items: ["Browse published resources", "Save useful links", "Suggest resources for review", "Filter by exam and subject"] },
  { icon: Lock, name: "Manage your workspace", tag: "06 · CONTROL", blurb: "Keep your account and personal study records organised.", items: ["Email and optional Google sign-in", "Personal study records", "Privacy and account controls", "Feedback and contact options"] },
];

function FeaturesPage() {
  return <div className="min-h-screen bg-background">
    <PublicHeader />
    <main>
      <PageHero eyebrow="Explore Study Radar" title="Everything has a place. Every hour has a record." lead="A practical set of tools for planning, tracking and understanding your GCE O/L or A/L preparation — without scattering everything across different apps." />
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {[{i:Timer,t:"Track",d:"Record what you do."},{i:TrendingUp,t:"Understand",d:"See what is changing."},{i:Target,t:"Adjust",d:"Choose your next step."}].map(x=><div key={x.t} className="panel flex items-center gap-3 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-primary"><x.i className="h-5 w-5"/></span><div><p className="text-sm font-semibold">{x.t}</p><p className="text-xs text-muted-foreground">{x.d}</p></div></div>)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((g,index)=><article key={g.name} className="panel group flex h-full flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 sm:p-6">
            <div className="flex items-center justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-primary"><g.icon className="h-5 w-5"/></span><span className="num text-[10px] tracking-wider text-muted-foreground">{g.tag}</span></div>
            <h2 className="mt-5 font-display text-lg font-semibold">{g.name}</h2><p className="mt-1.5 min-h-10 text-sm text-muted-foreground">{g.blurb}</p>
            <ul className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm text-muted-foreground">{g.items.map(item=><li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary"/>{item}</li>)}</ul>
          </article>)}
        </div>
      </section>
      <section className="border-t border-border px-5 py-14 sm:px-8 sm:py-20"><div className="panel mx-auto flex max-w-5xl flex-col items-center gap-4 p-7 text-center sm:p-10"><Trophy className="h-8 w-8 text-primary"/><h2 className="font-display text-2xl font-semibold sm:text-3xl">Start with one honest study log.</h2><p className="max-w-xl text-sm text-muted-foreground">You do not need a perfect routine on day one. Start recording, review your patterns and adjust as you go.</p><div className="flex flex-wrap justify-center gap-3"><Button asChild size="lg"><Link to="/auth" search={{mode:"signup"}}>Create your account</Link></Button><Button asChild size="lg" variant="secondary"><Link to="/how-it-works">How it works</Link></Button></div></div></section>
    </main><SiteFooter/></div>;
}
