import { Course, CourseType, TeacherProfile } from '@/types';

// Language code → label mapping
const LANG_LABELS: Record<string, string> = {
  ne: 'Nepali',
  en: 'English',
  hi: 'Hindi',
  gu: 'Gujarati',
  de: 'German',
};

interface MatchBreakdown {
  language: number; // 0–35
  region: number; // 0–25
  availability: number; // 0–20
  authorization: number; // 0–15
  restGap: number; // 0–5
  total: number; // 0–100
}

interface MatchResult {
  score: number;
  breakdown: MatchBreakdown;
  reasons: string[];
}

/**
 * Calculates match score between a teacher and a course.
 * Total: 100 points.
 * Language: 35 | Region: 25 | Availability: 20 | Authorization: 15 | Rest: 5
 */
export function calculateMatch(profile: TeacherProfile, course: Course): MatchResult {
  const breakdown: MatchBreakdown = {
    language: 0,
    region: 0,
    availability: 0,
    authorization: 0,
    restGap: 5, // default full rest score for pilot
    total: 0,
  };
  const reasons: string[] = [];

  // --- LANGUAGE SCORE (35pts) ---
  const courseLanguages = course.languages; // ['ne', 'en']
  let langScore = 0;
  let primaryMatches = 0;
  let secondaryMatches = 0;

  for (const langCode of courseLanguages) {
    const label = LANG_LABELS[langCode] ?? langCode;
    const level = profile.languages[label] ?? profile.languages[langCode];
    if (level === 'primary') primaryMatches++;
    else if (level === 'secondary') secondaryMatches++;
  }

  if (primaryMatches >= courseLanguages.length) {
    langScore = 35;
    reasons.push('Language match');
  } else if (primaryMatches > 0) {
    langScore = 25;
    reasons.push('Partial language match');
  } else if (secondaryMatches > 0) {
    langScore = 12;
  }
  breakdown.language = langScore;

  // --- REGION SCORE (25pts) ---
  const regionMap: Record<string, string[]> = {
    'Kathmandu Valley': ['Kathmandu Valley', 'Budhanilkantha', 'Patan'],
    'Pokhara & Gandaki': ['Pokhara', 'Gandaki', 'Pokhara & Gandaki'],
    'Lumbini & Terai': ['Lumbini', 'Terai', 'Rupandehi', 'Chitwan', 'Lumbini & Terai'],
    Koshi: ['Koshi', 'Biratnagar'],
    Madhesh: ['Madhesh', 'Janakpur'],
  };

  let regionScore = 0;
  const centerCity = course.city;
  for (let i = 0; i < profile.preferredRegions.length; i++) {
    const prefRegion = profile.preferredRegions[i];
    const aliases = regionMap[prefRegion] ?? [prefRegion];
    if (aliases.some((alias) => centerCity.includes(alias) || alias.includes(prefRegion))) {
      regionScore = i === 0 ? 25 : i === 1 ? 18 : 12;
      reasons.push('Location preference');
      break;
    }
  }
  breakdown.region = regionScore;

  // --- AVAILABILITY SCORE (20pts) ---
  const startMonth = new Date(course.startDate).getMonth(); // 0-indexed
  if (profile.availableMonths.includes(startMonth)) {
    breakdown.availability = 20;
    reasons.push('Available for dates');
  } else if (profile.festivalMonths.includes(startMonth)) {
    breakdown.availability = 5; // festival / retreat period
  } else {
    breakdown.availability = 0;
  }

  // --- AUTHORIZATION SCORE (15pts) ---
  if (profile.authorizations.includes(course.type as CourseType)) {
    breakdown.authorization = 15;
    reasons.push('Course authorization');
  }

  // --- REST GAP (5pts, fixed for pilot) ---
  breakdown.restGap = 5;

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
  if (score >= 90) return 'high';
  if (score >= 70) return 'mid';
  return 'low';
}

export function enrichCoursesWithMatch(courses: Course[], profile: TeacherProfile): Course[] {
  return courses
    .map((c) => ({ ...c, match: calculateMatch(profile, c).score }))
    .sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
}
