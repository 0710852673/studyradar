import type { StudySession } from "./types";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: (ctx: AchievementContext) => number;
}

export interface AchievementContext {
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  sessions: StudySession[];
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "h10",
    title: "First 10 Hours",
    description: "Log 10 total study hours",
    goal: 10,
    progress: (c) => c.totalHours,
  },
  {
    id: "h100",
    title: "First 100 Hours",
    description: "Log 100 total study hours",
    goal: 100,
    progress: (c) => c.totalHours,
  },
  {
    id: "h500",
    title: "500 Study Hours",
    description: "The long game pays off",
    goal: 500,
    progress: (c) => c.totalHours,
  },
  {
    id: "s7",
    title: "7 Day Streak",
    description: "Study 7 days in a row",
    goal: 7,
    progress: (c) => c.longestStreak,
  },
  {
    id: "s30",
    title: "30 Day Streak",
    description: "A full month of consistency",
    goal: 30,
    progress: (c) => c.longestStreak,
  },
  {
    id: "first",
    title: "The First Step",
    description: "Log your very first session",
    goal: 1,
    progress: (c) => c.sessions.length,
  },
];
