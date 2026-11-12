import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ClipboardList, GraduationCap, LineChart, Target, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({ meta: [
    { title: "How Study Radar works — Study Radar 1.0" },
    { name: "description", content: "See how to set up your O/L or A/L profile, record study time, track syllabus and marks, and review progress." },
    { property: "og:title", content: "How Study Radar works" },
    { property: "og:description", content: "A step-by-step guide to using Study Radar for exam preparation." },
  ] }),
  component: HowPage,
});

const STEPS = [
  { icon: ClipboardList, n:"01", title:"Create your account", body:"Register with your email or use Google sign-in when available. Your workspace is connected to your account." },
  { icon: GraduationCap, n:"02", title:"Set up your exam profile", body:"Choose GCE O/L or A/L, set your exam year and select the subjects you are studying." },
  { icon: Target, n:"03", title:"Choose a realistic goal", body:"Set a daily study target that fits around school, tuition, rest and other responsibilities. You can adjust it later." },
  { icon: Timer, n:"04", title:"Record your time", body:"Log study sessions under the right subject. Record wasted time separately so the two totals never get mixed." },
  { icon: CheckCircle2, n:"05", title:"Update syllabus and marks", body:"Mark chapters as you progress and add test or model-paper results to keep your preparation record current." },
  { icon: LineChart, n:"06", title:"Review and adjust", body:"Use your summaries, subject balance and mark history to decide what deserves attention next." },
];

function HowPage() {
  return <div className="min-h-screen bg-background"><PublicHeader/><main>
    <PageHero eyebrow="A simple workflow" title="From first log to a clearer plan." lead="Study Radar works best when you use it consistently. Start with the basics, keep your records current and use what you learn to adjust your routine."/>
    <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="grid gap-4 md:grid-cols-2">
        {STEPS.map((s,i)=><article key={s.n} className="panel relative flex gap-4 p-5 sm:p-6">
          <div className="flex shrink-0 flex-col items-center"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-primary"><s.icon className="h-5 w-5"/></span><span className="mt-2 num text-[10px] text-muted-foreground">{s.n}</span></div>
          <div><h2 className="font-display text-base font-semibold">{s.title}</h2><p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p></div>
        </article>)}
      </div>
      <div className="mt-10 rounded-2xl border border-border bg-elevated/60 p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-wider text-primary">Your ongoing routine</p><div className="mt-5 grid gap-4 sm:grid-cols-3">{[{t:"Record",d:"Log sessions and update your syllabus."},{t:"Review",d:"Check your hours, marks and subject balance."},{t:"Adjust",d:"Make a practical change for the next week."}].map((x,i)=><div key={x.t} className="flex gap-3"><span className="num text-sm text-primary">0{i+1}</span><div><p className="text-sm font-semibold">{x.t}</p><p className="mt-1 text-xs text-muted-foreground">{x.d}</p></div></div>)}</div></div>
    </section>
    <section className="border-t border-border px-5 py-14 text-center sm:px-8 sm:py-20"><h2 className="font-display text-2xl font-semibold sm:text-3xl">Keep your preparation in view.</h2><p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">Set up your exam profile and start with your next study session.</p><Button asChild size="lg" className="mt-6"><Link to="/auth" search={{mode:"signup"}}>Get started <ArrowRight className="ml-2 h-4 w-4"/></Link></Button></section>
  </main><SiteFooter/></div>;
}
