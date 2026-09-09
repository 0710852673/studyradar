import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  Compass,
  FileText,
  MessagesSquare,
  PlayCircle,
  Sparkles,
  UserRoundCheck,
  Wrench,
} from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Study Radar" },
      {
        name: "description",
        content:
          "Everything beyond your dashboard: study assistant, guides, community, reels, seniors, pathways, opportunities, skills and portfolio.",
      },
      { property: "og:title", content: "Explore — Study Radar" },
      { property: "og:description", content: "The whole Study Radar ecosystem in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

const GROUPS = [
  {
    title: "Learn",
    items: [
      { to: "/ai", label: "Study assistant", icon: Sparkles, desc: "Advice from your own record" },
      { to: "/learn", label: "Guides & videos", icon: FileText, desc: "Topic-by-topic library" },
      { to: "/reels", label: "Study reels", icon: PlayCircle, desc: "One concept per clip" },
      { to: "/skill-lab", label: "Skill lab", icon: Wrench, desc: "Skills beside the syllabus" },
    ],
  },
  {
    title: "People",
    items: [
      { to: "/community", label: "Community", icon: MessagesSquare, desc: "Subject rooms" },
      {
        to: "/ask-a-senior",
        label: "Ask a senior",
        icon: UserRoundCheck,
        desc: "Students who sat the paper",
      },
    ],
  },
  {
    title: "Future",
    items: [
      { to: "/pathway", label: "Career pathways", icon: Compass, desc: "Where your stream leads" },
      {
        to: "/opportunities",
        label: "Opportunities",
        icon: Briefcase,
        desc: "Scholarships & olympiads",
      },
      { to: "/portfolio", label: "Portfolio", icon: FileText, desc: "Your record, summarised" },
    ],
  },
] as const;

function ExplorePage() {
  return (
    <AppShell title="Explore" subtitle="Everything beyond your dashboard">
      <div className="space-y-6">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {g.title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {g.items.map((i) => (
                <Link
                  key={i.to}
                  to={i.to}
                  className="panel rise flex items-start gap-3 p-4 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-elevated text-primary">
                    <i.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{i.label}</span>
                    <span className="block text-xs text-muted-foreground">{i.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
