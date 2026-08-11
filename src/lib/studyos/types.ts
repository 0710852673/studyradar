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
  /** Storage path in the private avatars bucket, or an external https URL. */
  avatarUrl?: string | undefined;
  email?: string | undefined;

  // ---- Optional detail, collected in Profile ----
  city?: string | undefined;
  district?: string | undefined;
  mobile?: string | undefined;
  school?: string | undefined;
  grade?: string | undefined;
  guardianName?: string | undefined;
  guardianPhone?: string | undefined;
  bio?: string | undefined;

  // ---- Moderation ----
  suspended?: boolean | undefined;
  suspendedReason?: string | undefined;
}

/** Platform-wide switches controlled from the admin workspace. */
export interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  signupsEnabled: boolean;
  googleLoginEnabled: boolean;
  announcement: string | null;
  announcementActive: boolean;
  maxWritesPerMinute: number;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  maintenanceMode: false,
  maintenanceMessage: "Study Radar is briefly down for maintenance. Please try again shortly.",
  signupsEnabled: true,
  googleLoginEnabled: true,
  announcement: null,
  announcementActive: false,
  maxWritesPerMinute: 60,
};

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
