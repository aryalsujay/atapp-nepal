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
  teachingHistory: HistoryEntry[];
  inviteCode?: string;
  isOnboarded: boolean;
}
