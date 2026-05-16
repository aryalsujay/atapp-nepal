/**
 * Course detail hero: forest-green gradient with back button, type kicker,
 * centre name, city + flag, travel line, match badge + AT-needed pill.
 * Prototype-faithful port of `app.html:1071–1100`.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import { MatchBadge } from '@/components/ui/MatchPill';

interface Props {
  paddingTop: number;
  onBack: () => void;
  backLabel: string;
  type: string;
  center: string;
  city: string;
  flag?: string | null;
  travel: { distanceKm: number; travelLabel: string; altitude: number } | null;
  kmLabel: string;
  altLabel: string;
  matchScore: number;
  matchLabel: string;
  needText: string;
}

export const CourseHero: React.FC<Props> = ({
  paddingTop,
  onBack,
  backLabel,
  type,
  center,
  city,
  flag,
  travel,
  kmLabel,
  altLabel,
  matchScore,
  matchLabel,
  needText,
}) => {
  return (
    <LinearGradient
      colors={['#2A4A30', Colors.fo] as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[s.hero, { paddingTop }]}
    >
      <LotusHero color="white" opacity={0.08} size={210} right={-30} bottom={-30} />
      <MountainSilhouette color="rgba(255,255,255,0.07)" />

      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={s.heroBackRow}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 18L9 12L15 6"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={s.heroBackText}>{backLabel}</Text>
      </TouchableOpacity>

      <Text style={s.heroKicker}>{type}</Text>
      <Text style={s.heroTitle}>{center}</Text>
      <Text style={s.heroCity}>
        {city}
        {flag ? ` ${flag}` : ''}
      </Text>
      {travel ? (
        <Text style={s.heroTravel}>
          📍 {travel.distanceKm} {kmLabel} · {travel.travelLabel} · {travel.altitude} {altLabel}
        </Text>
      ) : null}

      <View style={s.heroPillRow}>
        <MatchBadge score={matchScore} label={matchLabel} />
        <View style={s.heroNeedPill}>
          <Text style={s.heroNeedText}>{needText}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const s = StyleSheet.create({
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 13,
    marginLeft: -2,
    position: 'relative',
  },
  heroBackText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontFamily: FontFamily.sansMedium,
    fontWeight: '500',
  },
  heroKicker: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.sansRegular,
    position: 'relative',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.white,
    lineHeight: 26,
    position: 'relative',
  },
  heroCity: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.78)',
    fontFamily: FontFamily.sansRegular,
    marginTop: 2,
    position: 'relative',
  },
  heroTravel: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.62)',
    fontFamily: FontFamily.sansRegular,
    marginTop: 3,
    position: 'relative',
  },
  heroPillRow: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
    marginTop: 13,
    alignItems: 'center',
    position: 'relative',
  },
  heroNeedPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  heroNeedText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
});
