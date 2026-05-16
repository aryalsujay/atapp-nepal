/**
 * Saffron-gradient hero for the Teacher Profile screen.
 *
 * Renders meditation figure + lotus backdrop, language/edit pill row,
 * avatar + name/role/meta column, and the four stat tiles. Pure UI —
 * receives derived values via props; mutations (signOut, language toggle,
 * edit nav) are passed in as callbacks.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero, MeditationFigure } from '@/components/ui/HeroDecorations';
import type { TeacherProfile } from '@/types';

interface Props {
  profile: TeacherProfile;
  yearsActive: number;
  altLangLabel: string;
  topInset: number;
  onToggleLanguage: () => void;
  onPressEdit: () => void;
}

export function ProfileHero({
  profile,
  yearsActive,
  altLangLabel,
  topInset,
  onToggleLanguage,
  onPressEdit,
}: Props) {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={['#6B3600', Colors.sf] as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[s.hero, { paddingTop: Math.max(56, topInset + 14) }]}
    >
      <MeditationFigure size={130} color="rgba(255,255,255,0.1)" />
      <LotusHero color="white" opacity={0.07} size={180} right={-20} bottom={-20} />

      {/* Lang + Edit pills */}
      <View style={s.heroPillRow}>
        <TouchableOpacity onPress={onToggleLanguage} activeOpacity={0.85} style={s.heroPill}>
          <Text style={s.heroPillText}>🌐 {altLangLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressEdit} activeOpacity={0.85} style={s.heroPill}>
          <Text style={s.heroPillText}>✏️ {t('profile.edit')}</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar + name */}
      <View style={s.heroIdentityRow}>
        <View style={s.heroAvatar}>
          <Text style={s.heroAvatarEmoji}>🧘</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.heroName}>{profile.name}</Text>
          <Text style={s.heroSub}>
            {t('profile.role_at')} · {profile.region || 'Nepal'} {profile.flag ?? '🇳🇵'}
          </Text>
          <Text style={s.heroMeta}>
            🔒 {t('profile.authorized_since', { year: profile.authorizedSince })} ·{' '}
            {profile.gender === 'F' ? t('profile.female_at') : t('profile.male_at')}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={s.heroStatsRow}>
        <StatTile value={profile.totalCourses} label={t('profile.stat_total')} />
        <StatTile value={profile.centersServed} label={t('profile.stat_centers')} />
        <StatTile value={yearsActive} label={t('profile.stat_years')} />
        <StatTile value={profile.coursesThisYear} label={t('profile.stat_this_year')} />
      </View>
    </LinearGradient>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <View style={s.statTile}>
      <Text style={s.statNumber}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  heroPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroPillText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  heroIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    position: 'relative',
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroAvatarEmoji: {
    fontSize: 50,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.white,
    lineHeight: 24,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
  },
  heroMeta: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    position: 'relative',
  },
  statTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 9,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.white,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
    lineHeight: 11,
    textAlign: 'center',
  },
});
