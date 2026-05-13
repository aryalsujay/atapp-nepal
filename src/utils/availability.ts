/**
 * Availability helpers — convert between the stored / typed shape
 * (`availableMonths[]` + `festivalMonths[]`) and the 12-slot array shape used
 * by the calendar UI component.
 *
 * Storage shape (canonical, what we save in DB / JSON):
 *   { availableMonths: [2, 3, 6, 7], festivalMonths: [4, 9, 10] }
 *
 * UI shape (what `<AvailabilityCalendar>` accepts):
 *   [0, 0, 1, 1, 'f', 0, 1, 1, 0, 'f', 'f', 0]  // length 12, indexed by month 0-11
 */

import type { AvailabilityState } from '@/types/common';

export interface AvailabilityProfile {
  availableMonths: number[];
  festivalMonths: number[];
}

/** Convert storage shape → 12-slot array for the calendar UI. */
export function toAvailabilityArray(profile: AvailabilityProfile): AvailabilityState[] {
  const arr: AvailabilityState[] = Array(12).fill(0) as AvailabilityState[];
  for (const m of profile.availableMonths) {
    if (m >= 0 && m < 12) arr[m] = 1;
  }
  for (const m of profile.festivalMonths) {
    if (m >= 0 && m < 12) arr[m] = 'f';
  }
  return arr;
}

/** Convert 12-slot UI array → storage shape (for saving). */
export function fromAvailabilityArray(arr: AvailabilityState[]): AvailabilityProfile {
  const availableMonths: number[] = [];
  const festivalMonths: number[] = [];
  arr.forEach((v, i) => {
    if (v === 1) availableMonths.push(i);
    else if (v === 'f') festivalMonths.push(i);
  });
  return { availableMonths, festivalMonths };
}

/** Returns true if the teacher is available in the given month (0-11). */
export function isAvailableInMonth(profile: AvailabilityProfile, monthIdx: number): boolean {
  return profile.availableMonths.includes(monthIdx);
}

/** Returns true if the teacher has a festival/retreat block in the given month. */
export function isFestivalInMonth(profile: AvailabilityProfile, monthIdx: number): boolean {
  return profile.festivalMonths.includes(monthIdx);
}

/** Total count of available months. */
export function availableMonthsCount(profile: AvailabilityProfile): number {
  return profile.availableMonths.length;
}
