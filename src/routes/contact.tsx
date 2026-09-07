import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHero, PublicHeader } from "@/components/studyos/PublicHeader";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Study Radar — support, feedback & partnerships" },
      {
        name: "description",
        content:
          "Send a message to the Study Radar team about support, feedback, partnerships or general questions.",
      },
      { property: "og:title", content: "Contact Study Radar" },
      {
        property: "og:description",
        content: "Support, feedback and partnership enquiries.",
      },
    ],
  }),
  component: ContactPage,
});

const TOPICS = ["General enquiry", "Support", "Feedback", "Partnership"] as const;

function ContactPage() {
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success("Thanks — your message has been noted.");
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <PageHero
          eyebrow="Contact"
          title="Tell us what you need"
          lead="Questions, bug reports, ideas or partnership enquiries — we read everything."
        />

        <section className="mx-auto grid max-w-4xl gap-4 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr]">
          <div className="panel p-6">
            {sent ? (
              <div className="py-8 text-center">
                <h2 className="font-display text-lg font-semibold">Message received</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thanks {name || "there"} — we'll reply to {email || "your email"} as soon as we
                  can. For anything urgent, email us directly.
                </p>
                <Button variant="secondary" className="mt-5" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className={
                        "rounded-full border px-3 py-1.5 text-xs transition-colors " +
                        (topic === t
                          ? "border-primary bg-brand-soft text-primary"
                          : "border-border text-muted-foreground hover:text-foreground")
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Textarea
                  rows={6}
                  placeholder="How can we help?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <Button type="submit" size="lg" className="w-full">
                  <Send className="h-4 w-4" /> Send message
                </Button>
                <p className="text-xs text-muted-foreground">
                  We only use these details to reply to you.
                </p>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <div className="panel p-5">
              <h2 className="text-sm font-semibold">Email us directly</h2>
              <a
                href="mailto:sheharageeneth@gmail.com"
                className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Mail className="h-4 w-4" /> sheharageeneth@gmail.com
              </a>
            </div>
            <div className="panel p-5 text-sm text-muted-foreground">
              <h2 className="text-sm font-semibold text-foreground">Response time</h2>
              <p className="mt-2">
                Study Radar is a small team, so replies usually take a day or two. Support requests
                from signed-in students are handled first.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
