export type ExamTrack = "AL" | "OL";

export type StudyType = "Theory" | "Revision" | "Paper" | "Class" | "Assignment";

export const STUDY_TYPES: StudyType[] = [
  "Theory",
  "Revision",
  "Paper",
  "Class",
  "Assignment",
];

export type LessonStatus =
  | "Not Started"
  | "Learning"
  | "Revision 1"
  | "Revision 2"
  | "Mastered";

export const LESSON_STATUSES: LessonStatus[] = [
  "Not Started",
  "Learning",
  "Revision 1",
  "Revision 2",
  "Mastered",
];

export interface Profile {
  track: ExamTrack;
  examYear: number;
  examDate: string; // yyyy-MM-dd
  stream?: string | undefined;
  subjects: string[];
  dailyGoalHours: number;
  weeklyGoalHours: number;
  targetZScore?: number | undefined;
  theme: "dark" | "light";
  notifications: boolean;
}

export interface StudySession {
  id: string;
  date: string; // yyyy-MM-dd
  subject: string;
  minutes: number;
  type: StudyType;
  note?: string | undefined;
  createdAt: number;
}

export interface MarkEntry {
  id: string;
  subject: string;
  examName: string;
  date: string;
  marks: number;
  total: number;
}

export interface Lesson {
  id: string;
  subject: string;
  title: string;
  status: LessonStatus;
}

export interface StudyOSData {
  version: 1;
  profile: Profile | null;
  sessions: StudySession[];
  marks: MarkEntry[];
  lessons: Lesson[];
  unlocked: string[];
}

export const EMPTY_DATA: StudyOSData = {
  version: 1,
  profile: null,
  sessions: [],
  marks: [],
  lessons: [],
  unlocked: [],
};
