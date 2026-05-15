import { resolveOpenSlots } from '@/types/course';
import type { Course } from '@/types';

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 1,
    type: '10-Day',
    center: 'Dharma Shringa',
    centerId: 'dhamma-shringa',
    city: 'Kathmandu',
    country: 'NP',
    dates: 'Jul 7–18, 2026',
    startDate: '2026-07-07',
    endDate: '2026-07-18',
    languages: ['ne', 'en'],
    needCount: 1,
    genderRequired: 'Any',
    distanceKm: 0,
    travelHrs: 0,
    students: { expected: 0, male: 0, female: 0 },
    arrivalDate: '',
    arrivalTime: '',
    coordinator: { name: '', role: '', phone: '' },
    transport: '',
    ...overrides,
  };
}

describe('resolveOpenSlots', () => {
  it('returns the explicit openSlots when present', () => {
    expect(resolveOpenSlots(makeCourse({ openSlots: ['M'] }))).toEqual(['M']);
    expect(resolveOpenSlots(makeCourse({ openSlots: ['M', 'F'] }))).toEqual(['M', 'F']);
  });

  it('falls back to needCount × genderRequired when openSlots missing', () => {
    expect(resolveOpenSlots(makeCourse({ needCount: 2, genderRequired: 'M' }))).toEqual(['M', 'M']);
    expect(resolveOpenSlots(makeCourse({ needCount: 1, genderRequired: 'Any' }))).toEqual(['Any']);
  });

  it('subtracts the confirmed coTeacher from derived slots', () => {
    const c = makeCourse({
      needCount: 2,
      genderRequired: 'F',
      coTeacher: { name: 'Maya', gender: 'M', languages: ['ne'] },
    });
    // 2 needed, 1 already confirmed → 1 still open
    expect(resolveOpenSlots(c)).toEqual(['F']);
  });

  it('returns an empty array when all slots are filled', () => {
    const c = makeCourse({
      needCount: 1,
      genderRequired: 'M',
      coTeacher: { name: 'Maya', gender: 'M', languages: ['ne'] },
    });
    expect(resolveOpenSlots(c)).toEqual([]);
  });

  it('prefers explicit openSlots even when coTeacher is set (admin override)', () => {
    const c = makeCourse({
      needCount: 2,
      genderRequired: 'M',
      coTeacher: { name: 'Maya', gender: 'M', languages: ['ne'] },
      openSlots: ['F'],
    });
    expect(resolveOpenSlots(c)).toEqual(['F']);
  });
});
