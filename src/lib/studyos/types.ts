export type ExamTrack = "AL" | "OL";

/** Syllabus chapter state — deliberately only three. */
export type ChapterStatus = "todo" | "doing" | "done";

export const CHAPTER_STATUSES: ChapterStatus[] = ["todo", "doing", "done"];

export const CHAPTER_LABEL: Record<ChapterStatus, string> = {
  todo: "Not started",
  doing: "In progress",
  done: "Done",
};

export interface Profile {
  id: string;
  name: string;
  track: ExamTrack;
  examYear: number;
  examDate: string; // yyyy-MM-dd
  stream?: string | undefined;
  subjects: string[];
  dailyGoalHours: number;
  /** Derived: daily target x 7, used by weekly report. */
  weeklyGoalHours: number;
  onboarded: boolean;
}

export interface StudySession {
  id: string;
  date: string; // yyyy-MM-dd
  subject: string;
  minutes: number;
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

export interface Chapter {
  id: string;
  subject: string;
  title: string;
  status: ChapterStatus;
}

export interface StudyOSData {
  sessions: StudySession[];
  marks: MarkEntry[];
  chapters: Chapter[];
}

export const EMPTY_DATA: StudyOSData = { sessions: [], marks: [], chapters: [] };
