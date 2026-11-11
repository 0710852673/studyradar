export type StudyEntryInput = {
  date: string;
  subject: string;
  minutes: number;
  note?: string | undefined;
};

export type WasteEntryInput = {
  date: string;
  minutes: number;
  reason?: string | undefined;
};

export type MarkEntryInput = {
  subject: string;
  examName: string;
  date: string;
  marks: number;
  total: number;
};

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;
}

export function validateMinutes(value: number): string | null {
  if (!Number.isInteger(value) || value < 1 || value > 1440) {
    return "Minutes must be a whole number between 1 and 1,440.";
  }
  return null;
}

export function validateStudyEntry(value: StudyEntryInput): string | null {
  if (!isValidDateKey(value.date)) return "Choose a valid study date.";
  if (!value.subject.trim() || value.subject.trim().length > 80) {
    return "Choose a valid subject.";
  }
  const minutesError = validateMinutes(value.minutes);
  if (minutesError) return minutesError;
  if ((value.note?.length ?? 0) > 1000) return "Study notes must be 1,000 characters or fewer.";
  return null;
}

export function validateWasteEntry(value: WasteEntryInput): string | null {
  if (!isValidDateKey(value.date)) return "Choose a valid date.";
  const minutesError = validateMinutes(value.minutes);
  if (minutesError) return minutesError;
  if ((value.reason?.length ?? 0) > 500) return "The reason must be 500 characters or fewer.";
  return null;
}

export function validateMarkEntry(value: MarkEntryInput): string | null {
  const name = value.examName.trim();
  if (name.length < 2 || name.length > 120) return "Exam name must be between 2 and 120 characters.";
  if (!value.subject.trim() || value.subject.trim().length > 80) return "Choose a valid subject.";
  if (!isValidDateKey(value.date)) return "Choose a valid exam date.";
  if (!Number.isFinite(value.marks) || !Number.isFinite(value.total) ||
      value.marks < 0 || value.total <= 0 || value.marks > value.total) {
    return "Marks must be between 0 and the total, and the total must be greater than 0.";
  }
  return null;
}
