import { calculateMatch, enrichCoursesWithMatch, getMatchTier } from '../matching';
import type { Course, TeacherProfile } from '@/types';

/**
 * Test fixtures. The profile is the "ideal Nepal teacher": all three buckets
 * of languages primary, three preferred regions, broad authorisations, a few
 * available + festival months. Tests adjust only the axes they care about.
 */
const baseProfile = (): TeacherProfile => ({
  id: 'teacher-test',
  name: 'Test Teacher',
  gender: 'M',
  email: 't@example.com',
  inviteCode: 'AT-TEST',
  passwordHash: 'x',
  region: 'Nepal',
  flag: '🇳🇵',
  authorizedSince: 2020,
  totalCourses: 5,
  centersServed: 2,
  coursesThisYear: 1,
  authorizations: ['10-Day', 'Satipatthana Sutta'],
  languages: { Nepali: 'primary', English: 'primary' },
  preferredRegions: ['Kathmandu Valley', 'Pokhara & Gandaki', 'Lumbini & Terai'],
  availableMonths: [7, 8], // Aug, Sep
  festivalMonths: [5, 9], // Jun, Oct
  personalNote: '',
  teachingHistory: [],
  isOnboarded: true,
});

const baseCourse = (partial: Partial<Course> = {}): Course => ({
  id: 1,
  type: '10-Day',
  center: 'Dharma Shringa',
  centerId: 'dhamma-shringa',
  city: 'Budhanilkantha, Kathmandu',
  country: 'NP',
  flag: '🇳🇵',
  dates: 'Aug 1–12, 2026',
  startDate: '2026-08-01',
  endDate: '2026-08-12',
  languages: ['ne', 'en'],
  needCount: 1,
  genderRequired: 'Any',
  distanceKm: 0,
  travelHrs: 0,
  altitude: 1337,
  students: { expected: 80, male: 40, female: 40 },
  arrivalDate: 'Aug 1',
  arrivalTime: '5:00 PM',
  coordinator: { name: '—', role: '—', phone: '—' },
  transport: '—',
  ...partial,
});

describe('calculateMatch', () => {
  it('returns 100 for a perfectly aligned profile + course', () => {
    const { score, breakdown } = calculateMatch(baseProfile(), baseCourse());
    expect(score).toBe(100);
    expect(breakdown).toEqual({
      language: 35,
      region: 25,
      availability: 20,
      authorization: 15,
      restGap: 5,
      total: 100,
    });
  });

  // ── REGRESSION: the region-alias bug ─────────────────────────────────────
  // Earlier `alias.includes(prefRegion)` was always true for the 1st region
  // because the alias list contained the region name itself, so EVERY course
  // matched preferredRegions[0]. This test pins the fix in place.
  describe('region bug regression', () => {
    it('does not credit a Pokhara course against a 1st-pref of Kathmandu Valley', () => {
      const profile = baseProfile();
      profile.preferredRegions = ['Kathmandu Valley']; // single preference
      const pokharaCourse = baseCourse({
        center: 'Dhamma Pokhara',
        city: 'Pokhara',
      });
      const { breakdown } = calculateMatch(profile, pokharaCourse);
      // Pokhara is not in `Kathmandu Valley` aliases — region score must be 0.
      expect(breakdown.region).toBe(0);
    });

    it('credits Pokhara at tier 2 (18) when it is the 2nd preference', () => {
      const profile = baseProfile();
      // Kathmandu Valley first, then Pokhara & Gandaki — Pokhara course should
      // score 18, not 25.
      const pokharaCourse = baseCourse({
        center: 'Dhamma Pokhara',
        city: 'Pokhara',
      });
      const { breakdown } = calculateMatch(profile, pokharaCourse);
      expect(breakdown.region).toBe(18);
    });

    it('credits a 3rd-tier region at 12', () => {
      const profile = baseProfile();
      const lumbiniCourse = baseCourse({
        center: 'Dhamma Janani',
        city: 'Chitwan',
      });
      const { breakdown } = calculateMatch(profile, lumbiniCourse);
      expect(breakdown.region).toBe(12);
    });
  });

  // ── Language ─────────────────────────────────────────────────────────────
  describe('language scoring', () => {
    it('awards full 35 when every course language is primary', () => {
      const profile = baseProfile();
      profile.languages = { Nepali: 'primary', English: 'primary' };
      const { breakdown } = calculateMatch(profile, baseCourse());
      expect(breakdown.language).toBe(35);
    });

    it('awards 25 for partial primary match', () => {
      const profile = baseProfile();
      profile.languages = { Nepali: 'primary' };
      const { breakdown } = calculateMatch(profile, baseCourse());
      expect(breakdown.language).toBe(25);
    });

    it('awards 12 for secondary-only matches', () => {
      const profile = baseProfile();
      profile.languages = { Nepali: 'secondary', English: 'secondary' };
      const { breakdown } = calculateMatch(profile, baseCourse());
      expect(breakdown.language).toBe(12);
    });

    it('awards 0 for no language overlap', () => {
      const profile = baseProfile();
      profile.languages = { German: 'primary' };
      const { breakdown } = calculateMatch(profile, baseCourse());
      expect(breakdown.language).toBe(0);
    });
  });

  // ── Availability ─────────────────────────────────────────────────────────
  describe('availability scoring', () => {
    it('awards 20 when start month is in availableMonths', () => {
      const profile = baseProfile();
      const course = baseCourse({ startDate: '2026-08-01' }); // Aug → month 7
      profile.availableMonths = [7];
      const { breakdown } = calculateMatch(profile, course);
      expect(breakdown.availability).toBe(20);
    });

    it('awards 5 when start month is a festival', () => {
      const profile = baseProfile();
      const course = baseCourse({ startDate: '2026-10-01' }); // month 9
      profile.availableMonths = [];
      profile.festivalMonths = [9];
      const { breakdown } = calculateMatch(profile, course);
      expect(breakdown.availability).toBe(5);
    });

    it('awards 0 when unavailable', () => {
      const profile = baseProfile();
      profile.availableMonths = [];
      profile.festivalMonths = [];
      const { breakdown } = calculateMatch(profile, baseCourse());
      expect(breakdown.availability).toBe(0);
    });
  });

  // ── Authorization ────────────────────────────────────────────────────────
  it('drops 15 auth points when course type is not authorised', () => {
    const profile = baseProfile();
    profile.authorizations = ['10-Day'];
    const teenCourse = baseCourse({ type: 'Teen Course' });
    const { breakdown } = calculateMatch(profile, teenCourse);
    expect(breakdown.authorization).toBe(0);
  });

  // ── Total cap ───────────────────────────────────────────────────────────
  it('caps total at 100', () => {
    const { score } = calculateMatch(baseProfile(), baseCourse());
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('getMatchTier', () => {
  it('returns "high" at the 90 boundary', () => {
    expect(getMatchTier(90)).toBe('high');
    expect(getMatchTier(95)).toBe('high');
    expect(getMatchTier(100)).toBe('high');
  });

  it('returns "mid" between 70 and 89', () => {
    expect(getMatchTier(70)).toBe('mid');
    expect(getMatchTier(83)).toBe('mid');
    expect(getMatchTier(89)).toBe('mid');
  });

  it('returns "low" below 70', () => {
    expect(getMatchTier(0)).toBe('low');
    expect(getMatchTier(50)).toBe('low');
    expect(getMatchTier(69)).toBe('low');
  });
});

describe('enrichCoursesWithMatch', () => {
  it('sorts by score descending', () => {
    const profile = baseProfile();
    profile.preferredRegions = ['Kathmandu Valley']; // single preference
    const courses: Course[] = [
      baseCourse({ id: 1, center: 'Dhamma Pokhara', city: 'Pokhara' }),
      baseCourse({ id: 2, center: 'Dharma Shringa', city: 'Budhanilkantha, Kathmandu' }),
    ];
    const enriched = enrichCoursesWithMatch(courses, profile);
    expect(enriched[0].id).toBe(2); // Kathmandu (region match) first
    expect(enriched[0].match).toBeGreaterThan(enriched[1].match ?? 0);
  });
});
