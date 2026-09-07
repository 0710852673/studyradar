import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Study Radar — a student ecosystem from Sri Lanka" },
      {
        name: "description",
        content:
          "Why Study Radar exists, who builds it, and the plan: start with Sri Lankan O/L and A/L students, then grow into a wider student platform.",
      },
      { property: "og:title", content: "About Study Radar" },
      {
        property: "og:description",
        content: "Founded by Shehara Geeneth to help Sri Lankan students study with clarity.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <PageHero
          eyebrow="About us"
          title="Students deserve better than guessing"
          lead="Most students work hard without ever knowing whether their effort is landing. Study Radar exists to make that visible — and then to help with what comes next."
        />

        <section className="mx-auto max-w-3xl space-y-4 px-5 py-14 sm:px-8">
          <div className="panel p-6">
            <h2 className="font-display text-lg font-semibold">The problem</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A student can spend six hours a day at school and tuition and still have no idea
              which subject is being neglected, whether their marks are improving, or what to do
              differently next week. Advice is scattered, seniors are hard to reach, and decisions
              about university and careers get made in a rush.
            </p>
          </div>

          <div className="panel p-6">
            <h2 className="font-display text-lg font-semibold">What we're building</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              One connected place: study tracking that shows the truth, guidance that is based on
              your own history, learning material that is short and practical, communities of
              students sitting the same paper, and support when a decision is bigger than a study
              plan. Every part feeds the next.
            </p>
          </div>

          <div className="panel p-6">
            <h2 className="font-display text-lg font-semibold">Sri Lanka first</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We are starting with GCE O/L and A/L students because that is the system we know
              best. The platform is built so other curricula can be added later, but we would
              rather be genuinely useful to one group of students than vaguely useful to everyone.
            </p>
          </div>

          <div className="panel p-6">
            <h2 className="font-display text-lg font-semibold">Student-centred by default</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Basic Study Radar stays free. Your personal information is never sold. Anything we
              learn from platform-wide patterns is aggregated and anonymised. Where guidance is
              generated automatically, we say so — and we say where its limits are.
            </p>
          </div>

          <div className="panel p-6">
            <h2 className="font-display text-lg font-semibold">Founder</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Study Radar is founded and built by{" "}
              <span className="text-foreground">Shehara Geeneth</span> in Sri Lanka, working
              directly with the students who use it.
            </p>
            <a
              href="mailto:sheharageeneth@gmail.com"
              className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="h-4 w-4" /> sheharageeneth@gmail.com
            </a>
          </div>

          <div className="pt-4 text-center">
            <Button asChild size="lg">
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
