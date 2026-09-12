import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import {
  ASSISTANT_DISCLAIMER,
  ASSISTANT_SUGGESTIONS,
  assistantReply,
} from "@/lib/studyos/assistant";

type Msg = { role: "you" | "radar"; text: string };

/** Floating study assistant, available on every signed-in page. */
export function AssistantWidget() {
  const { profile, data } = useStudyOS();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "radar",
      text: "Hi! Ask me what to study next, how your marks are going, or how to plan your week.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);

  if (!profile) return null;

  function ask(text: string) {
    const q = text.trim();
    if (!q) return;
    const answer = assistantReply(q, {
      subjects: profile?.subjects ?? [],
      sessions: data?.sessions ?? [],
      marks: data?.marks ?? [],
    });
    setMessages((m) => [...m, { role: "you", text: q }, { role: "radar", text: answer }]);
    setDraft("");
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close study assistant" : "Open study assistant"}
        className={cn(
          "fixed bottom-20 right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-200 hover:scale-105 lg:bottom-6 lg:right-6",
          "h-12 w-12",
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="fixed inset-x-3 bottom-36 z-40 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[22rem] lg:bottom-24">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Study assistant</p>
              <p className="text-[11px] text-muted-foreground">Based on your own record</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "you"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[90%] rounded-2xl rounded-bl-sm border border-border bg-elevated px-3 py-2 text-sm"
                }
              >
                {m.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
            {ASSISTANT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask(draft)}
              placeholder="Ask anything about your studies"
              className="h-9"
            />
            <Button size="icon" className="h-9 w-9" onClick={() => ask(draft)} aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="px-4 pb-3 text-[10px] text-muted-foreground">{ASSISTANT_DISCLAIMER}</p>
        </div>
      ) : null}
    </>
  );
}
