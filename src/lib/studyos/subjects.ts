export const AL_STREAMS: Record<string, string[]> = {
  "Physical Science": ["Combined Maths", "Physics", "Chemistry", "ICT"],
  "Biological Science": ["Biology", "Physics", "Chemistry", "Agriculture"],
  Commerce: [
    "Business Studies",
    "Accounting",
    "Economics",
    "Business Statistics",
    "ICT",
  ],
  Arts: [
    "Political Science",
    "Geography",
    "Logic",
    "Sinhala",
    "History",
    "Media Studies",
    "Economics",
    "ICT",
  ],
  Technology: [
    "Engineering Technology",
    "Bio Systems Technology",
    "Science for Technology",
    "ICT",
  ],
};

export const OL_COMPULSORY = [
  "Sinhala",
  "English",
  "Mathematics",
  "Science",
  "History",
  "Religion",
];

export const OL_OPTIONAL = [
  "ICT",
  "Commerce",
  "Business & Accounting",
  "Geography",
  "Civic Education",
  "Art",
  "Music",
  "Dancing",
  "Drama",
  "Health & Physical Education",
  "Home Economics",
  "Agriculture",
  "Design & Technology",
  "Second Language (Tamil)",
  "English Literature",
];

/** Deterministic accent hue per subject so charts stay consistent everywhere. */
export function subjectColor(subject: string): string {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = (hash * 31 + subject.charCodeAt(i)) % 360;
  }
  return `oklch(0.75 0.14 ${hash})`;
}

/**
 * Central exam-date schedule used by onboarding, profile updates and the
 * dashboard countdown. 2028 dates are provisional month markers (day 01).
 */
export function defaultExamDate(track: "AL" | "OL", year: number): string {
  if (year === 2026 && track === "OL") return "2026-12-08";
  if (year === 2027 && track === "AL") return "2027-08-03";
  if (year === 2028) return track === "AL" ? "2028-08-01" : "2028-12-01";

  // Keep the established month/day defaults for other exam years.
  return track === "AL" ? `${year}-08-03` : `${year}-12-08`;
}


/**
 * Calendar-day difference for exam dates, always using Sri Lanka's calendar.
 * Exam dates are date-only values (yyyy-MM-dd), not UTC instants.
 */
export function daysUntilExamDate(examDate: string, now: Date = new Date()): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(examDate);
  if (!match) return 0;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const target = Date.UTC(year, month - 1, day);
  const targetDate = new Date(target);
  if (
    targetDate.getUTCFullYear() !== year ||
    targetDate.getUTCMonth() !== month - 1 ||
    targetDate.getUTCDate() !== day
  ) return 0;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  const today = Date.UTC(Number(part("year")), Number(part("month")) - 1, Number(part("day")));
  return Math.round((target - today) / 86_400_000);
}
