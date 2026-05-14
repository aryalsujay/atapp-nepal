/**
 * Teacher ↔ Course match scoring. All numeric weights, tier thresholds, and
 * the region-alias map live in `src/config/match.ts` so they can be tuned
 * (or made admin-editable) without touching the algorithm.
 */

import type { Course, CourseType, TeacherProfile } from '@/types';
import {
  AvailabilityPoints,
  LanguageLabels,
  LanguagePoints,
  MatchTiers,
  MatchWeights,
  RegionMap,
  RegionTierPoints,
} from '@/config/match';

interface MatchBreakdown {
  language: number;
  region: number;
  availability: number;
  authorization: number;
  restGap: number;
  total: number;
}

interface MatchResult {
  score: number;
  breakdown: MatchBreakdown;
  reasons: string[];
}

/**
 * Calculate the match score between a teacher's profile and a course.
 *
 * Buckets (sum = 100):
 *   - Language       (MatchWeights.language)
 *   - Region         (MatchWeights.region)
 *   - Availability   (MatchWeights.availability)
 *   - Authorization  (MatchWeights.authorization)
 *   - Rest gap       (MatchWeights.restGap) — flat for pilot
 */
export function calculateMatch(profile: TeacherProfile, course: Course): MatchResult {
  const breakdown: MatchBreakdown = {
    language: 0,
    region: 0,
    availability: 0,
    authorization: 0,
    restGap: MatchWeights.restGap,
    total: 0,
  };
  const reasons: string[] = [];

  // ── Language ─────────────────────────────────────────────────────────────
  let primaryMatches = 0;
  let secondaryMatches = 0;
  for (const langCode of course.languages) {
    const label = LanguageLabels[langCode] ?? langCode;
    const level = profile.languages[label] ?? profile.languages[langCode];
    if (level === 'primary') primaryMatches++;
    else if (level === 'secondary') secondaryMatches++;
  }
  if (primaryMatches >= course.languages.length) {
    breakdown.language = LanguagePoints.allPrimary;
    reasons.push('Language match');
  } else if (primaryMatches > 0) {
    breakdown.language = LanguagePoints.partialPrimary;
    reasons.push('Partial language match');
  } else if (secondaryMatches > 0) {
    breakdown.language = LanguagePoints.secondaryOnly;
  }

  // ── Region ───────────────────────────────────────────────────────────────
  // Match if any alias of a preferred region appears in the course's city
  // string. Earlier versions also checked `alias.includes(prefRegion)` which
  // was always true (the alias list contains the region name itself), causing
  // every course to false-match the first preference — fixed 2026-05-14.
  const centerCity = course.city ?? '';
  for (let i = 0; i < profile.preferredRegions.length; i++) {
    const prefRegion = profile.preferredRegions[i];
    const aliases = RegionMap[prefRegion] ?? [prefRegion];
    if (aliases.some((alias) => centerCity.includes(alias))) {
      breakdown.region = RegionTierPoints[i] ?? RegionTierPoints[RegionTierPoints.length - 1];
      reasons.push('Location preference');
      break;
    }
  }

  // ── Availability ─────────────────────────────────────────────────────────
  const startMonth = new Date(course.startDate).getMonth();
  if (profile.availableMonths.includes(startMonth)) {
    breakdown.availability = AvailabilityPoints.available;
    reasons.push('Available for dates');
  } else if (profile.festivalMonths.includes(startMonth)) {
    breakdown.availability = AvailabilityPoints.festival;
  } else {
    breakdown.availability = AvailabilityPoints.unavailable;
  }

  // ── Authorization ────────────────────────────────────────────────────────
  if (profile.authorizations.includes(course.type as CourseType)) {
    breakdown.authorization = MatchWeights.authorization;
    reasons.push('Course authorization');
  }

  breakdown.total = Math.min(
    100,
    breakdown.language +
      breakdown.region +
      breakdown.availability +
      breakdown.authorization +
      breakdown.restGap,
  );

  return { score: breakdown.total, breakdown, reasons };
}

export function getMatchTier(score: number): 'high' | 'mid' | 'low' {
  if (score >= MatchTiers.high) return 'high';
  if (score >= MatchTiers.mid) return 'mid';
  return 'low';
}

export function enrichCoursesWithMatch(courses: Course[], profile: TeacherProfile): Course[] {
  return courses
    .map((c) => ({ ...c, match: calculateMatch(profile, c).score }))
    .sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
}
