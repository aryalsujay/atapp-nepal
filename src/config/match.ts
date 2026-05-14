/**
 * Match algorithm configuration — the single source of truth for the
 * teacher↔course scoring formula.
 *
 * Anything in this file should ultimately be admin-tunable (write a row to
 * `settings` table, read it into a Zustand store). For now the values live as
 * constants so we keep one place to change them.
 *
 * **Why move this out of `matching.ts`:**
 *   1. Tests can override values without monkey-patching the algorithm.
 *   2. When admin UI lands, only this file's constants become store reads.
 *   3. The region alias map is derived from `NEPAL_CENTERS` so adding a new
 *      centre to the scraper config automatically updates matching — no need
 *      to maintain two parallel lists.
 */

import { NEPAL_CENTERS, type CenterMeta } from '@/utils/scraper';

/**
 * Maximum points each axis can contribute to the total score (0–100).
 *
 * Sum should equal 100. If a future admin change re-balances this, update all
 * five values so the total still caps at 100.
 */
export const MatchWeights = {
  language: 35,
  region: 25,
  availability: 20,
  authorization: 15,
  restGap: 5,
} as const;

/** Region preference points by ordinal — 1st pick > 2nd > 3rd-and-beyond. */
export const RegionTierPoints = [25, 18, 12] as const;

/** Language sub-tiers within the `language` bucket. */
export const LanguagePoints = {
  /** Every course language is `primary` in the teacher's profile. */
  allPrimary: MatchWeights.language, // 35
  /** At least one course language is `primary`, not all. */
  partialPrimary: 25,
  /** No primaries, but at least one is `secondary`. */
  secondaryOnly: 12,
  /** No language match. */
  none: 0,
} as const;

/** Availability sub-tiers within the `availability` bucket. */
export const AvailabilityPoints = {
  /** Course start-month is in `profile.availableMonths`. */
  available: MatchWeights.availability, // 20
  /** Course start-month is in `profile.festivalMonths` (open to it). */
  festival: 5,
  /** Not available that month. */
  unavailable: 0,
} as const;

/** Match-score tier boundaries (used for badge color + match-meter color). */
export const MatchTiers = {
  /** ≥ this → "high" (green). */
  high: 90,
  /** ≥ this → "mid" (blue). */
  mid: 70,
} as const;

/**
 * Region alias map — derived from `NEPAL_CENTERS[*].region`. The matcher uses
 * this to check whether a course's city belongs to one of the teacher's
 * preferred regions.
 *
 * Single source of truth: the city → region mapping lives in
 * `src/utils/scraper.ts` where each centre is keyed to its region. Cities are
 * stored as substrings (the city field on a course is e.g.
 * "Budhanilkantha, Kathmandu" — we want "Budhanilkantha" or "Kathmandu" to
 * resolve to "Kathmandu Valley").
 *
 * If a region needs extra aliases that aren't a centre's city (e.g. a region
 * name itself like "Lumbini & Terai" appearing in user-entered text),
 * `REGION_EXTRA_ALIASES` is the place to add them.
 */
const REGION_EXTRA_ALIASES: Record<string, string[]> = {
  // Lumbini & Terai is a multi-word region — the centres in it have city
  // names like "Lumbini" and "Chitwan" already captured. Add fallback aliases
  // for direct region-name matches.
  'Lumbini & Terai': ['Lumbini', 'Terai', 'Rupandehi', 'Chitwan'],
  'Pokhara & Gandaki': ['Pokhara', 'Gandaki'],
  Koshi: ['Biratnagar', 'Itahari'],
  'Kathmandu Valley': ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Patan'],
};

function buildRegionMap(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const meta of Object.values(NEPAL_CENTERS) as CenterMeta[]) {
    const region = meta.region;
    if (!map[region]) map[region] = [];
    // First token of city — strips the ", Kathmandu" suffix etc.
    const cityHead = meta.city.split(',')[0]?.trim();
    if (cityHead && !map[region].includes(cityHead)) map[region].push(cityHead);
  }
  // Layer the extra aliases on top.
  for (const [region, aliases] of Object.entries(REGION_EXTRA_ALIASES)) {
    if (!map[region]) map[region] = [];
    for (const a of aliases) if (!map[region].includes(a)) map[region].push(a);
  }
  return map;
}

export const RegionMap: Record<string, string[]> = buildRegionMap();

/** Language code → display label. Reused across matching + UI. */
export const LanguageLabels: Record<string, string> = {
  ne: 'Nepali',
  en: 'English',
  hi: 'Hindi',
  gu: 'Gujarati',
  de: 'German',
};

export function languageLabel(code: string): string {
  return LanguageLabels[code] ?? code;
}
