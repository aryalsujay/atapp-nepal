/**
 * Typed accessors for seed JSON data.
 *
 * Screens / stores must import from `@/data` rather than the individual JSON
 * files so the type cast happens in exactly one place. Replacing JSON with
 * SQLite (spec `00-data-layer.md`) will only change this file's internals;
 * the public surface stays the same.
 */

import adminJson from './admin.json';
import applicationsJson from './applications.json';
import centersJson from './centers.json';
import coursesJson from './courses.json';
import hallsJson from './halls.json';
import adminApplicationsJson from './adminApplications.json';
import serverApplicationsJson from './serverApplications.json';
import serverCoursesJson from './serverCourses.json';
import serverNotificationsJson from './serverNotifications.json';
import teachersJson from './teachers.json';

import type { Application, Centre, Course, Hall } from '@/types';
import type { StoredTeacher } from '@/store/teachersStore';

export interface AdminAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  centerName?: string;
  settings?: Record<string, unknown>;
}

export interface ServerCourse {
  id: number;
  center: string;
  centerId: string;
  city: string;
  type: string;
  dates: string;
  startDate: string;
  endDate: string;
  days: number;
  mServers: number;
  fServers: number;
  filled: number;
  total: number;
  areas: string[];
  arriveBy: string;
  altitude?: number;
  country: string;
  flag?: string;
}

export interface ServerApplication {
  id: number;
  courseId: number;
  center: string;
  type: string;
  dates: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawal_requested';
  areas: string[];
  partial: boolean;
  days: string | null;
  applied: string;
  coordinator: string;
  coordPhone: string;
  arriveBy: string;
  reason?: string;
}

export const admin = adminJson as AdminAccount;
export const teachers = teachersJson as unknown as StoredTeacher[];
export const centres = centersJson as Centre[];
export const halls = hallsJson as Hall[];
export const courses = coursesJson as unknown as Course[];
export const applications = applicationsJson as unknown as Application[];
export const serverCourses = serverCoursesJson as ServerCourse[];
export const serverApplications = serverApplicationsJson as unknown as ServerApplication[];

export interface ServerNotification {
  id: number;
  type: 'approval' | 'rejection' | 'reminder';
  time: string;
  read: boolean;
  center: string;
  course: string;
  subj: string;
  en: string;
  np: string;
}

export const serverNotifications = serverNotificationsJson as ServerNotification[];

export interface AdminApplication {
  id: number;
  name: string;
  gender: 'M' | 'F';
  langs: string[];
  course: string;
  applied: string;
  match: number;
  courses: number;
  note: string;
}

export const adminApplications = adminApplicationsJson as AdminApplication[];
