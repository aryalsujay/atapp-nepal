import { CourseType, Gender } from './common';

export interface CoTeacher {
  name: string;
  gender: Gender;
  languages: string[];
  phone?: string;
}

export interface Coordinator {
  name: string;
  role: string;
  phone: string;
}

export type SlotGender = Gender | 'Any';

export interface Course {
  id: number;
  type: CourseType;
  center: string;
  centerId: string;
  city: string;
  country: string;
  flag?: string;
  dates: string;
  startDate: string;
  endDate: string;
  languages: string[];
  needCount: number;
  /**
   * Legacy single-slot gender requirement. Retained for backward compat;
   * new code should prefer `openSlots`, which describes each open slot
   * separately. When both are present `openSlots` wins.
   */
  genderRequired: SlotGender;
  /**
   * Per-slot gender requirement for each open AT slot. Length should equal
   * `needCount` minus the number of confirmed ATs (e.g., `coTeacher`).
   * E.g., `['M']` = one open slot for a Male AT.
   * E.g., `['M', 'F']` = two open slots, one Male and one Female.
   * `null/undefined` means "derive from `genderRequired` + `needCount`".
   */
  openSlots?: SlotGender[];
  coTeacher?: CoTeacher;
  distanceKm: number;
  travelHrs: number;
  altitude?: number;
  students: { expected: number; male: number; female: number };
  arrivalDate: string;
  arrivalTime: string;
  coordinator: Coordinator;
  transport: string;
  status?: string;
  notes?: string;
  match?: number;
}

/**
 * Resolve the list of open slots for a course. Prefers the explicit
 * `openSlots` array; falls back to deriving from `needCount` minus
 * confirmed ATs, all using `genderRequired`.
 */
export function resolveOpenSlots(course: Course): SlotGender[] {
  if (course.openSlots && course.openSlots.length > 0) return course.openSlots;
  const filled = course.coTeacher ? 1 : 0;
  const open = Math.max(0, course.needCount - filled);
  return Array.from({ length: open }, () => course.genderRequired);
}
