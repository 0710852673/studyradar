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
