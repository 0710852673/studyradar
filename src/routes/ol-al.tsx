import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck, CheckCircle2, GraduationCap, ListChecks, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/ol-al")({
  head: () => ({ meta: [
    { title: "For GCE O/L & A/L students — Study Radar" },
    { name: "description", content: "Study tracking, syllabus progress, marks and exam planning shaped for Sri Lankan GCE Ordinary Level and Advanced Level students." },
    { property: "og:title", content: "Built for GCE O/L & A/L students" },
    { property: "og:description", content: "One study workspace for Sri Lankan O/L and A/L preparation." },
  ] }),
  component: ExamsPage,
});

const PATHS = [
  {name:"GCE Ordinary Level",short:"O/L",icon:ListChecks,accent:"A broad subject mix, managed in one place.",intro:"Keep compulsory and optional subjects organised while you work through chapters and prepare for school tests.",items:["Set up your compulsory and optional subjects","Track syllabus chapters as you complete them","Record test marks as mark / total","Review time spent across your subjects"]},
  {name:"GCE Advanced Level",short:"A/L",icon:GraduationCap,accent:"A focused path across your chosen stream.",intro:"Keep your stream and subject combination visible, then follow study time and paper performance across the subjects that matter.",items:["Choose your stream and subject combination","Compare study time across your subjects","Track model-paper and term-test marks","Keep your exam countdown and preparation in view"]},
];

function ExamsPage() {
  return <div className="min-h-screen bg-background"><PublicHeader/><main>
    <PageHero eyebrow="Sri Lanka first" title="One workspace for two important exam journeys." lead="GCE O/L and A/L preparation are different. Study Radar gives each path a setup that reflects its subjects, syllabus and study routine."/>
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="grid gap-5 md:grid-cols-2">{PATHS.map((p)=><article key={p.short} className="panel relative overflow-hidden p-6 sm:p-8"><div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl"/><div className="relative flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-primary"><p.icon className="h-6 w-6"/></span><span className="num text-3xl font-semibold text-primary/70">{p.short}</span></div><h2 className="relative mt-6 font-display text-xl font-semibold">{p.name}</h2><p className="relative mt-1 text-sm font-medium">{p.accent}</p><p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">{p.intro}</p><ul className="relative mt-6 space-y-3 border-t border-border pt-5 text-sm text-muted-foreground">{p.items.map(item=><li key={item} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary"/>{item}</li>)}</ul></article>)}</div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">{[{i:Target,t:"Set your direction",d:"Choose the exam path you are following."},{i:BookOpenCheck,t:"Keep records current",d:"Update sessions, syllabus and marks."},{i:ArrowRight,t:"Decide what is next",d:"Use your progress to guide your next step."}].map(x=><div key={x.t} className="rounded-2xl border border-border bg-elevated/60 p-5"><x.i className="h-5 w-5 text-primary"/><h3 className="mt-3 text-sm font-semibold">{x.t}</h3><p className="mt-1 text-xs text-muted-foreground">{x.d}</p></div>)}</div>
    </section>
    <section className="border-t border-border px-5 py-14 text-center sm:px-8 sm:py-20"><h2 className="font-display text-2xl font-semibold sm:text-3xl">Your exam path. Your study record.</h2><p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">Choose your exam during setup and start building a clearer picture of your preparation.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild size="lg"><Link to="/auth" search={{mode:"signup"}}>Create your account</Link></Button><Button asChild size="lg" variant="secondary"><Link to="/how-it-works">See how it works</Link></Button></div></section>
  </main><SiteFooter/></div>;
}
