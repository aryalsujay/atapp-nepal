/**
 * Course types the teacher is authorized to conduct.
 *
 * Authorizations are locked (read-only) on the profile screen — managed by
 * Pariyatti centrally — so this card is presentation-only with a small "🔒"
 * subtitle next to the section header. Static per-course descriptions and
 * emojis live here so the screen file stays free of display copy.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

const AUTH_DESCRIPTIONS: Record<string, string> = {
  '10-Day': 'Standard Vipassana — core authorization',
  '20-Day': 'Advanced — for senior teachers',
  '30-Day': 'Advanced — for senior teachers',
  'Satipatthana Sutta': 'Advanced — post 10-day retreat',
  "Children's Anapana": 'Ages 8–12 · parent consent required',
  'Teen Course': 'Ages 13–17 · supervised setting',
  Executive: 'Shortened format · corporate groups',
  '1-Day': 'One-day refresher · old students',
  '3-Day': 'Three-day refresher · old students',
};

const AUTH_EMOJI: Record<string, string> = {
  '10-Day': '🪷',
  '20-Day': '🌿',
  '30-Day': '🌳',
  'Satipatthana Sutta': '📿',
  "Children's Anapana": '👦',
  'Teen Course': '🌱',
  Executive: '💼',
  '1-Day': '☸️',
  '3-Day': '🌸',
};

interface Props {
  authorizations: string[];
}

export function CourseAuthorizationsList({ authorizations }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <View style={s.sphRow}>
        <Text style={s.sphText}>🎓 {t('profile.authorizations')}</Text>
        <Text style={s.sphSubtle}>· 🔒 {t('profile.locked_short')}</Text>
      </View>
      <View style={s.card}>
        <Text style={s.cardLabel}>{t('profile.authorized_to_teach')}</Text>
        {authorizations.map((courseType) => (
          <View key={courseType} style={s.authRow}>
            <View style={s.authTile}>
              <Text style={s.authTileEmoji}>{AUTH_EMOJI[courseType] ?? '🪷'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.authLabel}>{courseType}</Text>
              <Text style={s.authDesc}>{AUTH_DESCRIPTIONS[courseType] ?? ''}</Text>
            </View>
            <View style={s.authCheckCircle}>
              <CheckIcon />
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function CheckIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12L10 17L20 7"
        stroke={Colors.white}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const s = StyleSheet.create({
  sphRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    marginBottom: 9,
    paddingHorizontal: 18,
  },
  sphText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
  },
  sphSubtle: {
    fontSize: 9.5,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
    color: Colors.tx3,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    ...Shadows.card,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx3,
    textTransform: 'uppercase',
    letterSpacing: 0.55,
    marginBottom: 8,
  },
  authRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  authTile: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: Colors.fol,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  authTileEmoji: { fontSize: 17 },
  authLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  authDesc: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 1,
  },
  authCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.fo,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
