import { CourseType, Gender, LanguageLevel } from './common';

export interface HistoryEntry {
  date: string;
  center: string;
  country: string;
  type: CourseType;
  students: number;
}

export interface TeacherProfile {
  id: string;
  name: string;
  gender: Gender;
  email: string;
  phone?: string;
  region: string;
  flag?: string;
  authorizedSince: number;
  totalCourses: number;
  centersServed: number;
  coursesThisYear: number;
  authorizations: CourseType[];
  languages: Record<string, LanguageLevel>;
  preferredRegions: string[];
  /** Months 0-11 the teacher is generally available. */
  availableMonths: number[];
  /** Months 0-11 the teacher has festival / personal retreat blocks. */
  festivalMonths: number[];
  personalNote: string;
  /** Epoch ms of the last `personalNote` edit. Null until first edit. */
  personalNoteUpdatedAt: number | null;
  teachingHistory: HistoryEntry[];
  inviteCode?: string;
  isOnboarded: boolean;
  /** Specific home address — preferred over `preferredRegions[0]` for distance/travel. */
  homeCity?: string | null;
  homeLat?: number | null;
  homeLng?: number | null;
}
