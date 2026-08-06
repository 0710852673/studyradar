import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { AL_STREAMS, OL_COMPULSORY, OL_OPTIONAL, defaultExamDate } from "@/lib/studyos/subjects";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — StudyOS" },
      {
        name: "description",
        content: "Adjust study goals, subjects, exam year, theme and notifications.",
      },
      { property: "og:title", content: "Settings — StudyOS" },
      {
        property: "og:description",
        content: "Tune StudyOS to the way you actually study.",
      },
    ],
  }),
  component: SettingsPage,
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-4 last:border-0">
      <p className="text-sm">{label}</p>
      {children}
    </div>
  );
}

function SettingsPage() {
  const { profile, updateProfile, reset } = useStudyOS();
  if (!profile) return null;

  const pool =
    profile.track === "AL"
      ? (AL_STREAMS[profile.stream ?? ""] ?? [])
      : OL_OPTIONAL;
  const chosenOptional = profile.subjects.filter((s) => !OL_COMPULSORY.includes(s));

  const toggleSubject = (s: string) => {
    const optional = profile.track === "AL" ? profile.subjects : chosenOptional;
    let next = optional.includes(s) ? optional.filter((x) => x !== s) : [...optional, s];
    if (next.length > 3) return toast.error("Pick exactly 3 subjects");
    next = next.slice(0, 3);
    updateProfile({
      subjects: profile.track === "AL" ? next : [...OL_COMPULSORY, ...next],
    });
  };

  return (
    <AppShell title="Settings" subtitle="Tune StudyOS to your routine">
      <div className="mx-auto max-w-2xl space-y-4">
        <Panel title="Goals">
          <Row label={`Daily goal · ${profile.dailyGoalHours}h`}>
            <Slider
              className="w-48"
              value={[profile.dailyGoalHours]}
              min={1}
              max={14}
              step={0.5}
              onValueChange={([v]) => updateProfile({ dailyGoalHours: v ?? 1 })}
            />
          </Row>
          <Row label={`Weekly goal · ${profile.weeklyGoalHours}h`}>
            <Slider
              className="w-48"
              value={[profile.weeklyGoalHours]}
              min={5}
              max={90}
              step={1}
              onValueChange={([v]) => updateProfile({ weeklyGoalHours: v ?? 5 })}
            />
          </Row>
          {profile.track === "AL" ? (
            <Row label="Target Z-Score">
              <Input
                type="number"
                step="0.01"
                className="w-28"
                value={profile.targetZScore ?? 0}
                onChange={(e) => updateProfile({ targetZScore: Number(e.target.value) })}
              />
            </Row>
          ) : null}
        </Panel>

        <Panel title="Exam">
          <Row label="Exam year">
            <Input
              type="number"
              className="w-28"
              value={profile.examYear}
              onChange={(e) => {
                const y = Number(e.target.value);
                updateProfile({ examYear: y, examDate: defaultExamDate(profile.track, y) });
              }}
            />
          </Row>
          <Row label="Exam start date">
            <Input
              type="date"
              className="w-44"
              value={profile.examDate}
              onChange={(e) => updateProfile({ examDate: e.target.value })}
            />
          </Row>
        </Panel>

        <Panel title={profile.track === "AL" ? "Subjects (3)" : "Optional subjects (3)"}>
          <div className="flex flex-wrap gap-2">
            {pool.map((s) => {
              const active = profile.subjects.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSubject(s)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-sm transition-colors",
                    active
                      ? "border-primary bg-brand-soft text-primary"
                      : "border-border bg-elevated text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {profile.track === "OL" ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Compulsory: {OL_COMPULSORY.join(", ")}
            </p>
          ) : null}
        </Panel>

        <Panel title="Preferences">
          <Row label="Dark theme">
            <Switch
              checked={profile.theme === "dark"}
              onCheckedChange={(v) => updateProfile({ theme: v ? "dark" : "light" })}
            />
          </Row>
          <Row label="In-app notifications">
            <Switch
              checked={profile.notifications}
              onCheckedChange={(v) => updateProfile({ notifications: v })}
            />
          </Row>
        </Panel>

        <Panel title="Danger zone">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Reset all data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset StudyOS?</AlertDialogTitle>
                <AlertDialogDescription>
                  This erases every session, mark and lesson on this device. It cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={reset}>Reset everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Panel>
      </div>
    </AppShell>
  );
}
