import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help — Study Radar" },
      { name: "description", content: "Answers to common questions about logging study time, wasted time, marks and your account." },
      { property: "og:title", content: "Help — Study Radar" },
      { property: "og:description", content: "Common questions about using Study Radar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelpPage,
});

const FAQ = [
  ["How do I log study time?", "Press the + Log button, pick a subject and a duration, then save. It appears on your dashboard straight away."],
  ["What is wasted time?", "In the Log window switch to “Wasted time” to record time lost to distractions. It is optional and only you (and site admins for safety) can see it."],
  ["Is my data private?", "Your sessions, marks, wasted time and saved items are visible only to you. Optional usage analytics are off until you turn them on in Profile."],
  ["I forgot my password", "Use “Forgot password” on the sign-in page and follow the email link."],
  ["How do I delete my account or data?", "Send a request through the contact page while signed in and the team will handle it."],
  ["Something is broken", "Use the Feedback page inside the app, or the contact page if you can't sign in."],
] as const;

function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <PageHero eyebrow="Help" title="How can we help?" lead="Quick answers to the most common questions." />
        <section className="mx-auto max-w-3xl space-y-3 px-5 py-14 sm:px-8">
          {FAQ.map(([q, a]) => (
            <details key={q} className="panel p-5">
              <summary className="cursor-pointer text-sm font-semibold">{q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{a}</p>
            </details>
          ))}
          <p className="pt-4 text-sm text-muted-foreground">
            Still stuck? <Link to="/contact" className="text-primary underline">Contact us</Link> · Read the{" "}
            <Link to="/guidelines" className="text-primary underline">community guidelines</Link>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
