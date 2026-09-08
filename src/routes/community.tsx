import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessagesSquare, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel, StatCard } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Subject communities — Study Radar" },
      {
        name: "description",
        content:
          "Moderated subject rooms where Sri Lankan O/L and A/L students ask questions and share what worked.",
      },
      { property: "og:title", content: "Subject communities — Study Radar" },
      { property: "og:description", content: "Ask, answer and revise together — safely moderated." },
    ],
  }),
  component: CommunityPage,
});

const ROOMS = [
  { name: "Combined Maths", members: 1284, online: 63 },
  { name: "Physics", members: 1102, online: 48 },
  { name: "Chemistry", members: 966, online: 41 },
  { name: "Biology", members: 1421, online: 77 },
  { name: "Business Studies", members: 704, online: 22 },
  { name: "O/L Science", members: 1890, online: 96 },
] as const;

const SEED: Record<string, { who: string; text: string; ago: string }[]> = {
  "Combined Maths": [
    { who: "Nimesha", text: "Anyone got a clean method for 2019 paper II q6? Stuck on the integration.", ago: "12m" },
    { who: "Ravindu", text: "Split it by parts twice, the second term cancels. I'll post my working.", ago: "9m" },
    { who: "Senior · Kavindu", text: "Careful with limits after substitution — that's where most people lose marks.", ago: "4m" },
  ],
  Physics: [
    { who: "Ishara", text: "How much of unit 7 usually comes in paper I?", ago: "26m" },
    { who: "Senior · Dilanka", text: "Two to three MCQs most years. Don't skip it, but don't over-revise it either.", ago: "20m" },
  ],
};

function CommunityPage() {
  const [room, setRoom] = useState<string>("Combined Maths");
  const [msgs, setMsgs] = useState(SEED);
  const [draft, setDraft] = useState("");

  const list = msgs[room] ?? [];

  function send() {
    const t = draft.trim();
    if (!t) return;
    setMsgs((m) => ({ ...m, [room]: [...(m[room] ?? []), { who: "You", text: t, ago: "now" }] }));
    setDraft("");
  }

  return (
    <AppShell title="Community" subtitle="Subject rooms, moderated and student-run">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Rooms" value={ROOMS.length} hint="One per subject" icon={MessagesSquare} />
        <StatCard
          label="Students online"
          value={ROOMS.reduce((a, r) => a + r.online, 0)}
          hint="Across all rooms"
          icon={Users}
          accent
        />
        <StatCard label="Moderation" value="On" hint="Reported messages reviewed by a human" icon={ShieldCheck} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[18rem_1fr]">
        <Panel title="Rooms">
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {ROOMS.map((r) => (
              <button
                key={r.name}
                onClick={() => setRoom(r.name)}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-2.5 text-left text-sm transition-colors lg:w-full",
                  room === r.name
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <div className="font-medium">{r.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {r.members.toLocaleString()} members · {r.online} online
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title={room}>
          <div className="flex max-h-[24rem] flex-col gap-3 overflow-y-auto pr-1">
            {list.map((m, i) => (
              <div key={i} className="rounded-2xl border border-border bg-elevated px-3.5 py-2.5">
                <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">{m.who}</span>
                  <span>{m.ago}</span>
                </div>
                <p className="mt-1 text-sm">{m.text}</p>
              </div>
            ))}
            {!list.length ? (
              <p className="text-sm text-muted-foreground">No messages here yet — start it off.</p>
            ) : null}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={`Message ${room}`}
            />
            <Button onClick={send}>Send</Button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Be kind, keep it about studying, and never share personal contact details. Anything
            unsafe is reviewed by a moderator.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
