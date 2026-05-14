import type { Course, CourseType } from '@/types';
import { LanguageLabels as LANG_LABELS, languageLabel } from '@/config/match';

// Backwards-compatible re-export so callers don't break.
export const langLabel = languageLabel;

export interface EligibilityCheck {
  key: 'authorization' | 'language' | 'availability' | 'restGap' | 'gender';
  label: string;
  sublabel?: string;
  passed: boolean;
}

interface ProfileLike {
  authorizations: string[];
  languages: Record<string, string>;
  availableMonths: number[];
  festivalMonths?: number[];
  gender?: 'M' | 'F';
}

/**
 * Single source of truth for course eligibility checks. Used by teacher
 * course-detail and admin review screens — must stay in sync.
 *
 * `labels` allows the caller to inject translated strings; falls back to English.
 */
export function buildEligibilityChecks(
  profile: ProfileLike,
  course: Pick<Course, 'type' | 'languages' | 'startDate' | 'dates' | 'genderRequired'>,
  labels?: Partial<Record<EligibilityCheck['key'], string>>,
): EligibilityCheck[] {
  const langSubs = course.languages.map(langLabel).join(', ');

  const langPass = course.languages.some((lc) => {
    const label = LANG_LABELS[lc] ?? lc;
    return profile.languages[label] === 'primary' || profile.languages[lc] === 'primary';
  });

  const monthIdx = new Date(course.startDate).getMonth();
  const availPass = profile.availableMonths.includes(monthIdx);

  const genderPass = course.genderRequired === 'Any' || course.genderRequired === profile.gender;

  return [
    {
      key: 'authorization',
      label: labels?.authorization ?? 'Authorization',
      passed: profile.authorizations.includes(course.type as CourseType),
    },
    {
      key: 'language',
      label: labels?.language ?? 'Language',
      sublabel: langSubs,
      passed: langPass,
    },
    {
      key: 'availability',
      label: labels?.availability ?? 'Availability',
      sublabel: course.dates,
      passed: availPass,
    },
    {
      key: 'restGap',
      label: labels?.restGap ?? 'Rest gap',
      passed: true,
    },
    {
      key: 'gender',
      label: labels?.gender ?? 'Gender',
      sublabel:
        course.genderRequired !== 'Any' ? `${course.genderRequired} AT required` : 'Any gender',
      passed: genderPass,
    },
  ];
}
