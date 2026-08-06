import { createFileRoute } from "@tanstack/react-router";
import { Flame, Lock, Trophy } from "lucide-react";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel, StatCard } from "@/components/studyos/Primitives";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { ACHIEVEMENTS } from "@/lib/studyos/achievements";
import { streaks, totalMinutes } from "@/lib/studyos/analytics";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements & Streaks — StudyOS" },
      {
        name: "description",
        content: "Unlock study milestones, keep your streak alive and stay motivated.",
      },
      { property: "og:title", content: "Achievements & Streaks — StudyOS" },
      {
        property: "og:description",
        content: "Milestones for hours studied, streaks kept and papers completed.",
      },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { data, profile } = useStudyOS();
  if (!profile) return null;

  const s = streaks(data.sessions);
  const ctx = {
    totalHours: totalMinutes(data.sessions) / 60,
    currentStreak: s.current,
    longestStreak: s.longest,
    papers: data.sessions.filter((x) => x.type === "Paper").length,
    sessions: data.sessions,
  };

  const milestone =
    s.current >= 30
      ? "Legendary consistency — 30+ days straight."
      : s.current >= 7
        ? "One full week of momentum. Don't break it."
        : s.current >= 3
          ? "Three days in. The habit is forming."
          : "Study today to start a new streak.";

  return (
    <AppShell title="Achievements" subtitle="Proof that the hours added up">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Current streak" value={`${s.current} days`} icon={Flame} accent />
        <StatCard label="Longest streak" value={`${s.longest} days`} icon={Trophy} />
        <StatCard label="Missed days" value={s.missed} hint="Since your first session" />
      </div>

      <Panel className="mt-4">
        <p className="text-sm text-primary">{milestone}</p>
      </Panel>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const progress = Math.min(a.goal, a.progress(ctx));
          const done = progress >= a.goal;
          return (
            <div
              key={a.id}
              className={cn(
                "panel p-4 transition-transform duration-200 hover:-translate-y-0.5",
                done && "glow",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
                </div>
                {done ? (
                  <Trophy className="h-5 w-5 text-primary" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <Progress value={(progress / a.goal) * 100} className="mt-4 h-1.5" />
              <p className="num mt-2 text-xs text-muted-foreground">
                {Math.round(progress)} / {a.goal}
              </p>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
