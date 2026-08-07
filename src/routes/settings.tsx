import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { AL_STREAMS, OL_COMPULSORY, OL_OPTIONAL, defaultExamDate } from "@/lib/studyos/subjects";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Profile — Study Radar" },
      {
        name: "description",
        content: "Update your name, exam year, subjects and daily study target.",
      },
      { property: "og:title", content: "Profile — Study Radar" },
      {
        property: "og:description",
        content: "Your account, subjects and study target in one place.",
      },
    ],
  }),
  component: ProfilePage,
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-4 last:border-0">
      <p className="text-sm">{label}</p>
      {children}
    </div>
  );
}

function ProfilePage() {
  const { profile, user, updateProfile, signOut } = useStudyOS();
  if (!profile) return null;

  const thisYear = new Date().getFullYear();
  const optionalPool =
    profile.track === "AL" ? (AL_STREAMS[profile.stream ?? ""] ?? []) : OL_OPTIONAL;
  const chosenOptional = profile.subjects.filter((s) => !OL_COMPULSORY.includes(s));

  const toggleSubject = (s: string) => {
    const has = chosenOptional.includes(s);
    if (!has && chosenOptional.length >= 3) return;
    const next = has ? chosenOptional.filter((x) => x !== s) : [...chosenOptional, s];
    const subjects = profile.track === "AL" ? next : [...OL_COMPULSORY, ...next];
    void updateProfile({ subjects });
  };

  return (
    <AppShell title="Profile" subtitle={user?.email ?? "Your account"}>
      <div className="mx-auto max-w-2xl space-y-4">
        <Panel title="Account">
          <Row label="Name">
            <Input
              defaultValue={profile.name}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== profile.name) {
                  void updateProfile({ name: v });
                  toast.success("Name updated");
                }
              }}
              className="w-48"
            />
          </Row>
          <Row label="Exam">
            <span className="text-sm text-muted-foreground">
              GCE {profile.track === "AL" ? "Advanced" : "Ordinary"} Level
              {profile.stream ? ` · ${profile.stream}` : ""}
            </span>
          </Row>
          <Row label="Exam year">
            <div className="flex gap-2">
              {[thisYear, thisYear + 1, thisYear + 2].map((y) => (
                <button
                  key={y}
                  onClick={() =>
                    void updateProfile({
                      examYear: y,
                      examDate: defaultExamDate(profile.track, y),
                    })
                  }
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    profile.examYear === y
                      ? "border-primary bg-brand-soft text-primary"
                      : "border-border bg-elevated text-muted-foreground",
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </Row>
        </Panel>

        <Panel title="Daily target">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Hours per day</p>
            <span className="num text-lg font-semibold">{profile.dailyGoalHours}h</span>
          </div>
          <Slider
            value={[profile.dailyGoalHours]}
            min={1}
            max={14}
            step={0.5}
            onValueChange={([v]) => void updateProfile({ dailyGoalHours: v ?? 1 })}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Weekly target: {profile.dailyGoalHours * 7}h
          </p>
        </Panel>

        <Panel title={profile.track === "AL" ? "Subjects" : "Optional subjects"}>
          {profile.track === "OL" ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {OL_COMPULSORY.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border bg-elevated px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-3">
            {optionalPool.map((s) => {
              const active = chosenOptional.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSubject(s)}
                  disabled={!active && chosenOptional.length >= 3}
                  className={cn(
                    "rounded-xl border p-3 text-left text-sm transition-colors",
                    active
                      ? "border-primary bg-brand-soft text-primary"
                      : "border-border bg-elevated text-muted-foreground disabled:opacity-40",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <Button variant="secondary" className="w-full" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </Panel>
      </div>
    </AppShell>
  );
}
