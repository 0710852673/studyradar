import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, GraduationCap, HeartHandshake, Lightbulb, ShieldCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About Study Radar — built for Sri Lankan students" },
    { name: "description", content: "Learn why Study Radar exists, what it aims to solve for GCE O/L and A/L students, and how the platform is evolving." },
    { property: "og:title", content: "About Study Radar" },
    { property: "og:description", content: "The purpose and direction behind Study Radar." },
  ] }),
  component: AboutPage,
});

const PRINCIPLES = [
  {i:Target,t:"Clarity over guesswork",d:"Students should be able to see their own study patterns, subject balance and progress instead of relying only on memory."},
  {i:GraduationCap,t:"Designed for the local exam journey",d:"O/L and A/L preparation has its own subjects, streams, school routines and paper formats. The experience should reflect that context."},
  {i:ShieldCheck,t:"Respect for student data",d:"Personal study records should remain personal. Privacy and account controls are part of the product, not an afterthought."},
  {i:HeartHandshake,t:"Built around useful feedback",d:"The platform should improve based on real student needs, clear problem reports and practical suggestions."},
];

function AboutPage() {
  return <div className="min-h-screen bg-background"><PublicHeader/><main>
    <PageHero eyebrow="Why Study Radar exists" title="Make your effort easier to understand." lead="Study Radar is a study-planning and progress-tracking workspace focused on Sri Lankan GCE O/L and A/L students. It brings everyday preparation records into one place."/>
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="panel relative overflow-hidden p-6 sm:p-8"><div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl"/><Compass className="relative h-8 w-8 text-primary"/><h2 className="relative mt-5 font-display text-2xl font-semibold">The problem we want to solve</h2><p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">Study records often end up scattered across notebooks, spreadsheets, timers and paper results. That makes it harder to notice which subjects are being neglected, whether study habits are changing, or what to focus on next.</p><p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">Study Radar brings study time, separate wasted-time records, subjects, syllabus progress and marks into one workspace so students can make more informed decisions about their preparation.</p></div>
        <div className="grid gap-3 sm:grid-cols-2">{PRINCIPLES.map((p)=><article key={p.t} className="panel p-5 sm:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-primary"><p.i className="h-5 w-5"/></span><h3 className="mt-4 text-sm font-semibold">{p.t}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.d}</p></article>)}</div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-border p-6"><Lightbulb className="h-5 w-5 text-primary"/><h2 className="mt-3 font-display text-lg font-semibold">What comes first</h2><p className="mt-2 text-sm text-muted-foreground">The foundation is a reliable study record: sessions, subject tracking, syllabus, marks and progress summaries. These essentials need to work clearly before the platform grows further.</p></div><div className="rounded-2xl border border-border p-6"><GraduationCap className="h-5 w-5 text-primary"/><h2 className="mt-3 font-display text-lg font-semibold">Where it can grow</h2><p className="mt-2 text-sm text-muted-foreground">The longer-term direction is a broader student ecosystem with learning resources, peer support, guidance and opportunities. New features should solve real problems, not just add more buttons.</p></div></div>
    </section>
    <section className="border-t border-border px-5 py-14 text-center sm:px-8 sm:py-20"><h2 className="font-display text-2xl font-semibold sm:text-3xl">Help shape what gets better next.</h2><p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">Questions, feedback and clear bug reports help identify what students need most.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild><Link to="/contact">Send feedback <ArrowRight className="ml-2 h-4 w-4"/></Link></Button><Button asChild variant="secondary"><Link to="/features">Explore features</Link></Button></div></section>
  </main><SiteFooter/></div>;
}
