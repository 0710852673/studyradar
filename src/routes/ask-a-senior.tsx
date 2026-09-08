import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, GraduationCap, MessageCircleQuestion } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel, StatCard } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/ask-a-senior")({
  head: () => ({
    meta: [
      { title: "Ask a Senior — Study Radar" },
      {
        name: "description",
        content:
          "Ask students who already sat your paper. Verified seniors answer questions about subjects, streams and exam technique.",
      },
      { property: "og:title", content: "Ask a Senior — Study Radar" },
      { property: "og:description", content: "Answers from students who sat the same exam." },
    ],
  }),
  component: SeniorPage,
});

const SENIORS = [
  { name: "Kavindu P.", took: "A/L Physical Science 2024", answers: 128, tag: "Combined Maths" },
  { name: "Hasini R.", took: "A/L Bio Science 2023", answers: 96, tag: "Chemistry" },
  { name: "Dinuka S.", took: "A/L Commerce 2024", answers: 74, tag: "Accounting" },
  { name: "Thisari W.", took: "O/L 2024", answers: 61, tag: "O/L Science" },
] as const;

const ANSWERED = [
  {
    q: "Is it worth doing 2015-2018 papers or only recent ones?",
    a: "Do the last five years properly first. Older papers are useful for structural questions but the style has shifted.",
    by: "Kavindu P.",
  },
  {
    q: "How many hours a day did you actually study in the final term?",
    a: "Around five on school days, seven on Sundays — but honestly the consistency mattered more than the total.",
    by: "Hasini R.",
  },
  {
    q: "Should I drop a tuition class to get more self-study time?",
    a: "If you can't revise what the class covers within the same week, the class isn't helping. That was my test.",
    by: "Dinuka S.",
  },
] as const;

function SeniorPage() {
  const [q, setQ] = useState("");
  const [sent, setSent] = useState<string[]>([]);

  return (
    <AppShell title="Ask a Senior" subtitle="Answers from students who already sat your paper">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Verified seniors" value={SENIORS.length} hint="Identity checked by us" icon={GraduationCap} />
        <StatCard
          label="Questions answered"
          value={SENIORS.reduce((a, s) => a + s.answers, 0)}
          hint="All time"
          icon={CheckCircle2}
          accent
        />
        <StatCard label="Typical reply" value="< 24h" hint="Most questions" icon={MessageCircleQuestion} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          <Panel title="Ask your question">
            <Textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              rows={4}
              placeholder="e.g. How did you balance Combined Maths and Physics in the last three months?"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground">
                Questions are public and anonymous. Never include your phone number or address.
              </p>
              <Button
                onClick={() => {
                  const t = q.trim();
                  if (!t) return;
                  setSent((s) => [t, ...s]);
                  setQ("");
                  toast.success("Question posted — a senior will pick it up");
                }}
              >
                Post
              </Button>
            </div>
          </Panel>

          {sent.length ? (
            <Panel title="Your questions">
              <ul className="space-y-3 text-sm">
                {sent.map((s, i) => (
                  <li key={i} className="rounded-xl border border-border bg-elevated p-3.5">
                    <p>{s}</p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">Waiting for a senior</p>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          <Panel title="Recently answered">
            <ul className="space-y-4">
              {ANSWERED.map((a) => (
                <li key={a.q} className="rounded-xl border border-border bg-elevated p-4">
                  <p className="text-sm font-medium">{a.q}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{a.a}</p>
                  <p className="mt-2 text-[11px] text-primary">— {a.by}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Seniors online">
          <ul className="space-y-3">
            {SENIORS.map((s) => (
              <li key={s.name} className="rounded-xl border border-border p-3.5">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-[11px] text-muted-foreground">{s.took}</p>
                <p className="mt-1.5 text-[11px] text-primary">
                  {s.tag} · {s.answers} answers
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
