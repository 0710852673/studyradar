import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Send, Sparkles, TrendingUp, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel, StatCard } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStudyOS } from "@/lib/studyos/store";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "Study assistant — Study Radar" },
      {
        name: "description",
        content:
          "A study assistant that reads your own logged hours, marks and syllabus progress to suggest what to work on next.",
      },
      { property: "og:title", content: "Study assistant — Study Radar" },
      { property: "og:description", content: "Guidance based on your own study record." },
    ],
  }),
  component: AiPage,
});

type Msg = { role: "you" | "radar"; text: string };

function AiPage() {
  const { profile, data } = useStudyOS();
  const subjects = profile?.subjects ?? [];

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of data?.sessions ?? []) {
      map.set(s.subject, (map.get(s.subject) ?? 0) + s.minutes);
    }
    return subjects
      .map((s) => ({ subject: s, minutes: map.get(s) ?? 0 }))
      .sort((a, b) => a.minutes - b.minutes);
  }, [data, subjects]);

  const weakest = totals[0];
  const strongest = totals[totals.length - 1];

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "radar",
      text: "Ask me anything about your preparation. I only look at what you've logged here — hours, marks and chapter status.",
    },
  ]);
  const [draft, setDraft] = useState("");

  function reply(question: string): string {
    const q = question.toLowerCase();
    if (q.includes("weak") || q.includes("focus") || q.includes("next")) {
      return weakest
        ? `Your lowest logged time is ${weakest.subject} (${Math.round(weakest.minutes / 60)}h total). Try two 45-minute blocks on it this week before touching ${strongest?.subject ?? "your strongest subject"} again.`
        : "Log a few sessions first and I'll be able to compare your subjects.";
    }
    if (q.includes("mark") || q.includes("score")) {
      const marks = data?.marks ?? [];
      if (!marks.length) return "No marks recorded yet — add a paper under Marks and I'll track the trend.";
      const avg =
        marks.reduce((a, m) => a + (m.marks / Math.max(1, m.total)) * 100, 0) / marks.length;
      return `Across ${marks.length} recorded papers your average is ${avg.toFixed(1)}%. Look at the two lowest papers first — they usually share one weak chapter.`;
    }
    if (q.includes("time") || q.includes("plan") || q.includes("schedule")) {
      return `A simple week that fits school and tuition: 5 study days, 2 blocks a day, one block per subject, rotating so your weakest subject (${weakest?.subject ?? "—"}) appears twice.`;
    }
    return "I can help with what to focus on, how your marks are trending, and how to plan your week. Try asking \"what should I focus on?\"";
  }

  function send() {
    const q = draft.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "you", text: q }, { role: "radar", text: reply(q) }]);
    setDraft("");
  }

  return (
    <AppShell title="Study assistant" subtitle="Guidance based on your own record">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Weakest by time"
          value={weakest?.subject ?? "—"}
          hint={weakest ? `${Math.round(weakest.minutes / 60)}h logged` : "No sessions yet"}
          icon={TriangleAlert}
        />
        <StatCard
          label="Most studied"
          value={strongest?.subject ?? "—"}
          hint={strongest ? `${Math.round(strongest.minutes / 60)}h logged` : "No sessions yet"}
          icon={TrendingUp}
        />
        <StatCard
          label="Papers recorded"
          value={data?.marks?.length ?? 0}
          hint="Used for trend advice"
          icon={Sparkles}
          accent
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Ask Study Radar">
          <div className="flex max-h-[26rem] flex-col gap-3 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "you"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
                    : "mr-auto max-w-[90%] rounded-2xl rounded-bl-sm border border-border bg-elevated px-3.5 py-2.5 text-sm"
                }
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="What should I focus on this week?"
            />
            <Button onClick={send} aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            This assistant gives study suggestions only. It is not a teacher, counsellor or medical
            adviser. For anything serious, talk to a real person you trust.
          </p>
        </Panel>

        <Panel title="This week's read">
          <ul className="space-y-3 text-sm text-muted-foreground">
            {totals.slice(0, 5).map((t) => (
              <li key={t.subject}>
                <div className="flex items-center justify-between text-foreground">
                  <span className="truncate">{t.subject}</span>
                  <span className="num text-xs text-muted-foreground">
                    {Math.round(t.minutes / 60)}h
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, (t.minutes / Math.max(1, strongest?.minutes ?? 1)) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
            {!totals.length ? <li>Add subjects to see a comparison.</li> : null}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
