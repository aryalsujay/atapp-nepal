/**
 * Eligibility checklist section — section header + card with 5 pass/fail
 * rows (language, location, rest gap, authorization, availability). Exports
 * the `buildPrototypeChecks` helper that derives the row data from a course +
 * teacher profile. Prototype-faithful port of `app.html:1138–1150`.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { langLabel } from '@/utils/eligibility';
import type { Course, TeacherProfile } from '@/types';

export type Check = {
  key: 'language' | 'location' | 'restGap' | 'authorization' | 'availability';
  label: string;
  sublabel: string;
  passed: boolean;
};

interface Props {
  title: string;
  checks: Check[];
}

export const EligibilityCheck: React.FC<Props> = ({ title, checks }) => {
  return (
    <>
      <Text style={s.sphTitleStandalone}>{title}</Text>
      <View style={s.card}>
        {checks.map((c, i) => (
          <View key={c.key} style={[s.chkRow, i === checks.length - 1 && s.chkRowLast]}>
            <View style={[s.chkIc, c.passed ? s.chkIcOk : s.chkIcFail]}>
              {c.passed ? <CheckIcon /> : <XIcon />}
            </View>
            <View style={s.chkBody}>
              <Text style={s.chkLabel}>{c.label}</Text>
              {c.sublabel ? <Text style={s.chkSublabel}>{c.sublabel}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    </>
  );
};

function CheckIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12L10 17L20 7"
        stroke={Colors.fo}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function XIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6L18 18M18 6L6 18"
        stroke={Colors.ur}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function buildPrototypeChecks(
  course: Course,
  profile: TeacherProfile,
  t: (k: string, opts?: Record<string, unknown>) => string,
): Check[] {
  // Language: pass if any course language is primary for teacher
  const teacherLangs = Object.keys(profile.languages).filter(
    (l) => profile.languages[l] === 'primary' || profile.languages[l] === 'secondary',
  );
  const langPass = course.languages.some((lc) => {
    const label = langLabel(lc);
    const lvl = profile.languages[label] ?? profile.languages[lc];
    return lvl === 'primary';
  });

  // Location: pass if course city/region matches one of teacher's preferredRegions
  const cityLower = (course.city ?? '').toLowerCase();
  const locationPass = (profile.preferredRegions ?? []).some((r: string) => {
    const first = r.split(' ')[0].toLowerCase();
    return cityLower.includes(first) || r.toLowerCase().includes(cityLower);
  });

  // Rest gap: pass if last teachingHistory entry is older than 21 days
  const lastEntry = (profile.teachingHistory ?? [])[0];
  const lastTaught = lastEntry?.date ?? '';
  const restPass = (() => {
    if (!lastTaught) return true;
    const parsed = new Date(`${lastTaught} 01`).getTime();
    if (Number.isNaN(parsed)) return true;
    return Date.now() - parsed > 21 * 24 * 60 * 60 * 1000;
  })();

  // Authorization
  const authPass = (profile.authorizations ?? []).includes(course.type);

  // Availability: pass if course start month is in availableMonths or not in festivalMonths
  const startMonth = new Date(course.startDate).getMonth();
  const inAvailable = (profile.availableMonths ?? []).includes(startMonth);
  const inFestival = (profile.festivalMonths ?? []).includes(startMonth);
  const availPass = inAvailable && !inFestival;

  return [
    {
      key: 'language',
      label: t('courseDetail.check_language'),
      sublabel: t('courseDetail.check_language_sub', {
        course: course.languages.map(langLabel).join('/'),
        yours: teacherLangs.join(', '),
      }),
      passed: langPass,
    },
    {
      key: 'location',
      label: t('courseDetail.check_location'),
      sublabel: locationPass
        ? t('courseDetail.check_location_sub_pass', {
            city: `${course.city}${course.flag ? ` ${course.flag}` : ''}`,
          })
        : t('courseDetail.check_location_sub_fail', {
            city: `${course.city}${course.flag ? ` ${course.flag}` : ''}`,
          }),
      passed: locationPass,
    },
    {
      key: 'restGap',
      label: t('courseDetail.check_restGap'),
      sublabel: lastTaught
        ? t('courseDetail.check_restGap_sub', { lastTaught })
        : t('courseDetail.check_restGap_sub_none'),
      passed: restPass,
    },
    {
      key: 'authorization',
      label: t('courseDetail.check_authorization'),
      sublabel: t('courseDetail.check_authorization_sub', { type: course.type }),
      passed: authPass,
    },
    {
      key: 'availability',
      label: t('courseDetail.check_availability'),
      sublabel: t('courseDetail.check_availability_sub', { dates: course.dates }),
      passed: availPass,
    },
  ];
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    ...Shadows.card,
  },
  sphTitleStandalone: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 9,
  },
  chkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  chkRowLast: {
    borderBottomWidth: 0,
  },
  chkIc: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  chkIcOk: {
    backgroundColor: Colors.fol,
  },
  chkIcFail: {
    backgroundColor: Colors.url,
  },
  chkBody: {
    flex: 1,
  },
  chkLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  chkSublabel: {
    fontSize: 11.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
    marginTop: 2,
    lineHeight: 16,
  },
});
