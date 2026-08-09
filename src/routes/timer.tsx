import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel } from "@/components/studyos/Primitives";
import { LogForm } from "@/components/studyos/QuickLog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";

export const Route = createFileRoute("/timer")({
  head: () => ({
    meta: [
      { title: "Study Timer — Study Radar" },
      {
        name: "description",
        content: "Stopwatch, Pomodoro and countdown timers that log your study automatically.",
      },
      { property: "og:title", content: "Study Timer — Study Radar" },
      {
        property: "og:description",
        content: "Focus with Pomodoro or a stopwatch and auto-log every finished session.",
      },
    ],
  }),
  component: TimerPage,
});

type Mode = "Stopwatch" | "Pomodoro" | "Countdown";

const clock = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return [h > 0 ? String(h).padStart(2, "0") : null, String(m).padStart(2, "0"), String(r).padStart(2, "0")]
    .filter(Boolean)
    .join(":");
};

function TimerPage() {
  const { profile } = useStudyOS();
  const [mode, setMode] = useState<Mode>("Stopwatch");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [target, setTarget] = useState(25 * 60);
  const [logOpen, setLogOpen] = useState(false);
  const [logMinutes, setLogMinutes] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [running]);

  const limit = mode === "Stopwatch" ? null : target;
  const remaining = limit === null ? elapsed : Math.max(0, limit - elapsed);

  useEffect(() => {
    if (limit !== null && elapsed >= limit && running) {
      setRunning(false);
      finish(limit / 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, limit, running]);

  const finish = (minutes: number) => {
    const m = Math.round(minutes);
    if (m < 1) {
      reset();
      return;
    }
    setLogMinutes(m);
    setLogOpen(true);
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
  };

  const progress = useMemo(
    () => (limit === null ? (elapsed % 3600) / 3600 : Math.min(1, elapsed / limit)),
    [elapsed, limit],
  );

  if (!profile) return null;

  return (
    <AppShell title="Study Timer" subtitle="Focus now, it logs itself">
      <div className="mx-auto max-w-xl space-y-4">
        <Panel>
          <div className="mb-6 flex gap-2">
            {(["Stopwatch", "Pomodoro", "Countdown"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  reset();
                  setTarget(m === "Pomodoro" ? 25 * 60 : 45 * 60);
                }}
                className={cn(
                  "flex-1 rounded-xl px-3 py-2 text-sm transition-colors",
                  mode === m
                    ? "bg-brand-soft font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="relative mx-auto flex h-60 w-60 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--muted)" strokeWidth="4" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={283}
                strokeDashoffset={283 - progress * 283}
                style={{ transition: "stroke-dashoffset 0.9s linear" }}
              />
            </svg>
            <div className="text-center">
              <div className="num text-5xl font-semibold">{clock(remaining)}</div>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {mode}
              </p>
            </div>
          </div>

          {mode !== "Stopwatch" ? (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[15, 25, 45, 60, 90].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setTarget(m * 60);
                    reset();
                  }}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                    target === m * 60
                      ? "border-primary bg-brand-soft text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {m}m
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-7 flex items-center justify-center gap-3">
            <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full p-0"
              onClick={() => setRunning((r) => !r)}
            >
              {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => finish(elapsed / 60)}
              disabled={elapsed < 60}
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Stop the timer to log the session — the duration is filled in for you.
          </p>
        </Panel>
      </div>

      <Dialog
        open={logOpen}
        onOpenChange={(o) => {
          setLogOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Session complete — {logMinutes} min</DialogTitle>
          </DialogHeader>
          <LogForm
            initialMinutes={logMinutes}
            onDone={() => {
              setLogOpen(false);
              reset();
            }}
          />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
