import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Send feedback — Study Radar" },
      { name: "description", content: "Report a bug or suggest an idea to the Study Radar team." },
      { property: "og:title", content: "Send feedback — Study Radar" },
      { property: "og:description", content: "Report bugs and share ideas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FeedbackPage,
});

const KINDS = [
  { id: "bug", label: "Bug" },
  { id: "idea", label: "Idea" },
  { id: "praise", label: "Something I like" },
  { id: "other", label: "Other" },
] as const;

type Row = { id: string; kind: string; message: string; status: string; created_at: string };

function FeedbackPage() {
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("idea");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [mine, setMine] = useState<Row[]>([]);

  const load = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data } = await supabase
      .from("feedback")
      .select("id,kind,message,status,created_at")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setMine(data ?? []);
  };
  useEffect(() => {
    void load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (text.length < 5) return toast.error("Please write a little more.");
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = auth.user
      ? await supabase
          .from("feedback")
          .insert({ user_id: auth.user.id, kind, message: text.slice(0, 2000), page: "/feedback" })
      : { error: new Error("signed out") };
    setBusy(false);
    if (error) return toast.error("Couldn't send feedback. Please try again.");
    setMessage("");
    toast.success("Thanks — the team will read this.");
    void load();
  };

  return (
    <AppShell title="Feedback" subtitle="Tell us what to fix or build next.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="New feedback">
          <form onSubmit={submit} className="space-y-3">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Feedback type">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  role="radio"
                  aria-checked={kind === k.id}
                  onClick={() => setKind(k.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs",
                    kind === k.id
                      ? "border-primary bg-brand-soft text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <Textarea
              rows={6}
              maxLength={2000}
              aria-label="Your feedback"
              placeholder="What happened, or what would help?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit" disabled={busy} className="w-full">
              Send feedback
            </Button>
          </form>
        </Panel>
        <Panel title="Your past feedback">
          {mine.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing sent yet.</p>
          ) : (
            <ul className="space-y-3">
              {mine.map((r) => (
                <li key={r.id} className="text-sm">
                  <p className="text-xs text-muted-foreground">
                    {r.kind} · {new Date(r.created_at).toLocaleDateString()} · {r.status}
                  </p>
                  <p className="line-clamp-3">{r.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
