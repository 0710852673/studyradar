import type { MarkEntry, StudySession } from "./types";

export type AssistantContext = {
  subjects: string[];
  sessions: StudySession[];
  marks: MarkEntry[];
};

export type SubjectTotal = { subject: string; minutes: number };

/** Minutes logged per subject, lowest first. */
export function subjectTotals(ctx: AssistantContext): SubjectTotal[] {
  const map = new Map<string, number>();
  for (const s of ctx.sessions) map.set(s.subject, (map.get(s.subject) ?? 0) + s.minutes);
  return ctx.subjects
    .map((s) => ({ subject: s, minutes: map.get(s) ?? 0 }))
    .sort((a, b) => a.minutes - b.minutes);
}

/**
 * Offline study assistant. Answers only from what the student has logged —
 * hours, marks and subject balance. No external calls, so it always responds.
 */
export function assistantReply(question: string, ctx: AssistantContext): string {
  const q = question.toLowerCase();
  const totals = subjectTotals(ctx);
  const weakest = totals[0];
  const strongest = totals[totals.length - 1];

  if (q.includes("weak") || q.includes("focus") || q.includes("next") || q.includes("start")) {
    return weakest
      ? `Your lowest logged time is ${weakest.subject} (${Math.round(weakest.minutes / 60)}h total). Try two 45-minute blocks on it this week before going back to ${strongest?.subject ?? "your strongest subject"}.`
      : "Log a few sessions first and I'll be able to compare your subjects.";
  }

  if (q.includes("mark") || q.includes("score") || q.includes("paper") || q.includes("exam")) {
    if (!ctx.marks.length)
      return "No marks recorded yet — add a paper under Marks and I'll track the trend for you.";
    const avg =
      ctx.marks.reduce((a, m) => a + (m.marks / Math.max(1, m.total)) * 100, 0) / ctx.marks.length;
    return `Across ${ctx.marks.length} recorded papers your average is ${avg.toFixed(1)}%. Start with your two lowest papers — they usually share one weak chapter.`;
  }

  if (q.includes("time") || q.includes("plan") || q.includes("schedule") || q.includes("week")) {
    return `A simple week that fits school and tuition: 5 study days, 2 blocks a day, one block per subject, rotating so your weakest subject (${weakest?.subject ?? "—"}) appears twice.`;
  }

  if (q.includes("streak") || q.includes("motivat") || q.includes("tired")) {
    return "Short and regular beats long and rare. A 25-minute block still keeps your streak alive — use the Timer page and stop when it rings.";
  }

  if (q.includes("syllabus") || q.includes("chapter") || q.includes("revis")) {
    return "Mark each chapter Todo, Doing or Done under Syllabus. Revise anything that has been Done for more than two weeks — that's usually where marks quietly slip.";
  }

  return 'I can help with what to focus on, how your marks are trending, and how to plan your week. Try asking "what should I focus on?"';
}

export const ASSISTANT_SUGGESTIONS = [
  "What should I focus on?",
  "How are my marks trending?",
  "Plan my week",
] as const;

export const ASSISTANT_DISCLAIMER =
  "Study suggestions only — based on what you've logged here. For anything serious, talk to a person you trust.";
