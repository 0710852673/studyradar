import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import type { MarkEntry, Profile, StudySession } from "./types";

export const toKey = (d: Date) => format(d, "yyyy-MM-dd");
export const hrs = (minutes: number) => minutes / 60;

export function fmtHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function minutesByDay(sessions: StudySession[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of sessions) map.set(s.date, (map.get(s.date) ?? 0) + s.minutes);
  return map;
}

export function totalMinutes(sessions: StudySession[]): number {
  return sessions.reduce((a, s) => a + s.minutes, 0);
}

export function sessionsBetween(
  sessions: StudySession[],
  from: Date,
  to: Date,
): StudySession[] {
  const a = toKey(from);
  const b = toKey(to);
  return sessions.filter((s) => s.date >= a && s.date <= b);
}

export function streaks(sessions: StudySession[]) {
  const days = [...new Set(sessions.map((s) => s.date))].sort();
  if (days.length === 0) return { current: 0, longest: 0, missed: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = differenceInCalendarDays(parseISO(days[i]!), parseISO(days[i - 1]!));
    run = gap === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = new Date();
  let current = 0;
  let cursor = today;
  const set = new Set(days);
  if (!set.has(toKey(today))) cursor = subDays(today, 1);
  while (set.has(toKey(cursor))) {
    current++;
    cursor = subDays(cursor, 1);
  }

  const span = differenceInCalendarDays(today, parseISO(days[0]!)) + 1;
  return { current, longest, missed: Math.max(0, span - days.length) };
}

/** 0-100 composite of goal completion, consistency and recency. */
export function studyScore(sessions: StudySession[], profile: Profile): number {
  const last30 = sessionsBetween(sessions, subDays(new Date(), 29), new Date());
  const byDay = minutesByDay(last30);
  const goalMin = profile.dailyGoalHours * 60;
  let goalDays = 0;
  for (const v of byDay.values()) if (v >= goalMin) goalDays++;
  const consistency = byDay.size / 30;
  const goalRate = goalDays / 30;
  const volume = Math.min(1, totalMinutes(last30) / (goalMin * 30 || 1));
  return Math.min(100, Math.round(consistency * 40 + goalRate * 35 + volume * 25));
}

export function consistencyPct(sessions: StudySession[], days = 30): number {
  const recent = sessionsBetween(sessions, subDays(new Date(), days - 1), new Date());
  return Math.round((minutesByDay(recent).size / days) * 100);
}

export function dailySeries(sessions: StudySession[], days: number) {
  const map = minutesByDay(sessions);
  return eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() }).map(
    (d) => ({
      key: toKey(d),
      label: format(d, days > 40 ? "d MMM" : "EEE"),
      hours: Math.round(hrs(map.get(toKey(d)) ?? 0) * 10) / 10,
    }),
  );
}

export function monthlySeries(sessions: StudySession[], months = 12) {
  const out: { label: string; hours: number }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i, 1));
    const end = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i + 1, 1));
    const mins = sessions
      .filter((s) => s.date >= toKey(start) && s.date < toKey(end))
      .reduce((a, s) => a + s.minutes, 0);
    out.push({ label: format(start, "MMM"), hours: Math.round(hrs(mins) * 10) / 10 });
  }
  return out;
}

export function bySubject(sessions: StudySession[], subjects: string[]) {
  return subjects.map((subject) => {
    const all = sessions.filter((s) => s.subject === subject);
    const week = sessionsBetween(all, startOfWeek(new Date(), { weekStartsOn: 1 }), new Date());
    const days = minutesByDay(all).size || 1;
    return {
      subject,
      total: totalMinutes(all),
      week: totalMinutes(week),
      avg: Math.round(totalMinutes(all) / days),
      sessions: all.length,
    };
  });
}

export function forecast(sessions: StudySession[], profile: Profile) {
  const last30 = sessionsBetween(sessions, subDays(new Date(), 29), new Date());
  const avgPerDay = hrs(totalMinutes(last30)) / 30;
  const daysLeft = Math.max(0, differenceInCalendarDays(parseISO(profile.examDate), new Date()));
  const done = hrs(totalMinutes(sessions));
  const projected = done + avgPerDay * daysLeft;
  const target = profile.dailyGoalHours * daysLeft + done;
  return {
    avgPerDay: Math.round(avgPerDay * 10) / 10,
    daysLeft,
    done: Math.round(done),
    projected: Math.round(projected),
    target: Math.round(target),
    onTrack: avgPerDay >= profile.dailyGoalHours * 0.9,
    requiredPerDay:
      daysLeft > 0 ? Math.round(((target - done) / daysLeft) * 10) / 10 : 0,
  };
}

export function markStats(marks: MarkEntry[]) {
  if (marks.length === 0) return null;
  const pcts = marks.map((m) => (m.marks / m.total) * 100);
  const sorted = [...marks].sort((a, b) => a.date.localeCompare(b.date));
  const firstEntry = sorted[0]!;
  const lastEntry = sorted[sorted.length - 1]!;
  const first = (firstEntry.marks / firstEntry.total) * 100;
  const last = (lastEntry.marks / lastEntry.total) * 100;
  return {
    average: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
    highest: Math.round(Math.max(...pcts)),
    lowest: Math.round(Math.min(...pcts)),
    trend: Math.round(last - first),
    series: sorted.map((m) => ({
      label: m.examName,
      date: format(parseISO(m.date), "d MMM"),
      pct: Math.round((m.marks / m.total) * 100),
    })),
  };
}

export function insights(sessions: StudySession[], profile: Profile): string[] {
  const out: string[] = [];
  const today = sessionsBetween(sessions, new Date(), new Date());
  const goalMin = profile.dailyGoalHours * 60;
  if (totalMinutes(today) >= goalMin && goalMin > 0)
    out.push("You completed your daily goal today. Nice work.");

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const week = hrs(totalMinutes(sessionsBetween(sessions, weekStart, new Date())));
  const elapsed = differenceInCalendarDays(new Date(), weekStart) + 1;
  const expected = (profile.weeklyGoalHours / 7) * elapsed;
  if (week < expected * 0.8)
    out.push(
      `You are behind your weekly target — ${Math.round(week)}h of ${profile.weeklyGoalHours}h.`,
    );

  for (const subject of profile.subjects) {
    const last = sessions
      .filter((s) => s.subject === subject)
      .map((s) => s.date)
      .sort()
      .pop();
    const gap = last ? differenceInCalendarDays(new Date(), parseISO(last)) : null;
    if (gap === null) out.push(`You haven't logged any ${subject} yet.`);
    else if (gap >= 3) out.push(`You haven't studied ${subject} in ${gap} days.`);
  }

  const s = streaks(sessions);
  if (s.current >= 3) out.push(`${s.current} day streak — keep it alive.`);
  return out.slice(0, 5);
}

export function heatmapDays(sessions: StudySession[], weeks = 53) {
  const map = minutesByDay(sessions);
  const end = new Date();
  const start = startOfWeek(subDays(end, weeks * 7 - 1), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end: addDays(start, weeks * 7 - 1) });
  return days.map((d) => ({ date: d, key: toKey(d), minutes: map.get(toKey(d)) ?? 0 }));
}
