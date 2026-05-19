/**
 * Typed route constants.
 *
 * All Expo Router navigation should go through this file. Direct string
 * literals like `router.push('/(teacher)/courses')` are an anti-pattern —
 * a typo gets you a silent broken navigation.
 *
 * Usage:
 *   import { Routes, routeTo } from '@/routes';
 *   router.push(Routes.teacherHome);
 *   router.push(routeTo.teacherCourseDetail('abc-123'));
 */

export const Routes = {
  // Auth
  login: '/(auth)/login',

  // Index router
  root: '/',

  // Teacher
  teacherHome: '/(teacher)/home',
  teacherCourses: '/(teacher)/courses',
  teacherApplications: '/(teacher)/applications',
  teacherNotifications: '/(teacher)/notifications',
  teacherProfile: '/(teacher)/profile',
  teacherProfileEdit: '/(teacher)/profile/edit',

  // Server
  serverHome: '/(server)/home',
  serverOpportunities: '/(server)/opportunities',
  serverApplications: '/(server)/applications',
  serverNotifications: '/(server)/notifications',
  serverProfile: '/(server)/profile',
  serverOnboarding: '/(server)/onboarding',

  // Admin
  adminDashboard: '/(admin)/dashboard',
  adminInbox: '/(admin)/inbox',
  adminDirectory: '/(admin)/directory',
  adminSchedule: '/(admin)/schedule',
  adminCalendar: '/(admin)/calendar',
  adminNotifications: '/(admin)/notifications',
  adminCentres: '/(admin)/centres',
  adminServerInbox: '/(admin)/server/inbox',
  adminServerBoard: '/(admin)/server/board',
  adminDirectoryAdd: '/(admin)/directory/add',
  adminTranslations: '/(admin)/translations',
  adminTranslationsImport: '/(admin)/translations/import',
  adminTranslationsReview: '/(admin)/translations/review',
} as const;

export type RouteKey = keyof typeof Routes;
export type RoutePath = (typeof Routes)[RouteKey];

/**
 * Parameterized route builders.
 * Use these for any route that takes a dynamic segment.
 */
export const routeTo = {
  // Teacher
  adminTeacherDetail: (id: string) => `/(admin)/directory/${id}` as const,
  teacherCourseDetail: (id: string | number) => `/(teacher)/courses/${id}` as const,
  teacherApplicationBrief: (id: string | number) => `/(teacher)/applications/brief/${id}` as const,

  // Server
  serverOpportunityDetail: (id: string | number) => `/(server)/opportunities/${id}` as const,
  serverApplicationDetail: (id: string | number) => `/(server)/applications/${id}` as const,
  serverApply: (id: string | number) => `/(server)/apply/${id}` as const,

  // Admin
  adminApplicationReview: (id: string | number) => `/(admin)/inbox/${id}` as const,
  adminCentreDetail: (id: string | number) => `/(admin)/centres/${id}` as const,

  // Onboarding (teacher) — step number 1..N
  onboardingTeacher: (step: number) => `/onboarding/teacher/${step}` as const,
};
