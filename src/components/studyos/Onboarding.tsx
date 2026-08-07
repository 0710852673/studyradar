import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { AL_STREAMS, OL_COMPULSORY, OL_OPTIONAL, defaultExamDate } from "@/lib/studyos/subjects";
import type { ExamTrack } from "@/lib/studyos/types";

function Selectable({
  active,
  disabled,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]",
        active
          ? "border-primary bg-brand-soft"
          : "border-border bg-elevated hover:border-muted-foreground/40",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{title}</span>
        {active ? <Check className="h-4 w-4 text-primary" /> : null}
      </div>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </button>
  );
}

export function Onboarding() {
  const { profile, updateProfile } = useStudyOS();
  const thisYear = new Date().getFullYear();

  const [step, setStep] = useState(0);
  const [track, setTrack] = useState<ExamTrack | null>(null);
  const [examYear, setExamYear] = useState(thisYear + 1);
  const [stream, setStream] = useState<string>("");
  const [picked, setPicked] = useState<string[]>([]);
  const [daily, setDaily] = useState(4);
  const [saving, setSaving] = useState(false);

  const optionalPool = track === "AL" ? (AL_STREAMS[stream] ?? []) : OL_OPTIONAL;

  const toggle = (s: string) => {
    setPicked((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : prev.length >= 3 ? prev : [...prev, s],
    );
  };

  const canNext =
    step === 0
      ? !!track
      : step === 1
        ? track === "AL"
          ? !!stream && picked.length === 3
          : picked.length === 3
        : true;

  const finish = async () => {
    if (!track || saving) return;
    setSaving(true);
    const subjects = track === "AL" ? picked : [...OL_COMPULSORY, ...picked];
    await updateProfile({
      track,
      examYear,
      examDate: defaultExamDate(track, examYear),
      stream: track === "AL" ? stream : undefined,
      subjects,
      dailyGoalHours: daily,
      onboarded: true,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background px-4 py-10 sm:items-center">
      <div className="panel rise w-full max-w-2xl p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">Welcome to StudyOS</h1>
            <p className="text-sm text-muted-foreground">
              Three quick steps and your dashboard is ready.
            </p>
          </div>
        </div>

        <div className="mb-7 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        {step === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Selectable
              active={track === "AL"}
              onClick={() => {
                setTrack("AL");
                setPicked([]);
              }}
              title="GCE Advanced Level"
              sub="Pick a stream and 3 subjects"
            />
            <Selectable
              active={track === "OL"}
              onClick={() => {
                setTrack("OL");
                setPicked([]);
              }}
              title="GCE Ordinary Level"
              sub="6 compulsory + 3 optional subjects"
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Exam year
              </p>
              <div className="flex flex-wrap gap-2">
                {[thisYear, thisYear + 1, thisYear + 2].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setExamYear(y)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      examYear === y
                        ? "border-primary bg-brand-soft text-primary"
                        : "border-border bg-elevated text-muted-foreground",
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {track === "AL" ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Stream
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.keys(AL_STREAMS).map((s) => (
                    <Selectable
                      key={s}
                      active={stream === s}
                      onClick={() => {
                        setStream(s);
                        setPicked([]);
                      }}
                      title={s}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Compulsory subjects
                </p>
                <div className="flex flex-wrap gap-2">
                  {OL_COMPULSORY.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-elevated px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {optionalPool.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Choose exactly 3 {track === "OL" ? "optional " : ""}subjects · {picked.length}/3
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {optionalPool.map((s) => (
                    <Selectable
                      key={s}
                      active={picked.includes(s)}
                      disabled={!picked.includes(s) && picked.length >= 3}
                      onClick={() => toggle(s)}
                      title={s}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-7">
            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Daily study goal
                </p>
                <span className="num text-lg font-semibold">{daily}h</span>
              </div>
              <Slider
                value={[daily]}
                min={1}
                max={14}
                step={0.5}
                onValueChange={([v]) => setDaily(v ?? 1)}
              />
            </div>
            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Weekly goal
                </p>
                <span className="num text-lg font-semibold">{weekly}h</span>
              </div>
              <Slider
                value={[weekly]}
                min={5}
                max={90}
                step={1}
                onValueChange={([v]) => setWeekly(v ?? 5)}
              />
            </div>
            {track === "AL" ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Target Z-Score
                </p>
                <Input
                  type="number"
                  step="0.01"
                  value={zscore}
                  onChange={(e) => setZscore(Number(e.target.value))}
                  className="w-36"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finish}>
              Start studying <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
