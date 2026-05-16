/**
 * BriefHero — forest-green gradient hero for the Teacher Course Brief screen.
 *
 * Renders the back chevron, kicker, course title, dates, city/country, and
 * source-aware status pills (✓ Confirmed plus either 📨 Assigned by Admin
 * or ✋ You Applied). Behaviour and styling are a direct port of the
 * prototype hero block — unchanged from the original screen.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { Colors, GradientDirection } from '@/theme/colors';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import type { Course } from '@/types';

interface Props {
  course: Course;
  isAssigned: boolean;
  hasApplication: boolean;
  insetsTop: number;
  onBack: () => void;
  labels: {
    back: string;
    title: string;
    confirmed: string;
    assignedByAdmin: string;
    youApplied: string;
  };
}

export const BriefHero: React.FC<Props> = ({
  course,
  isAssigned,
  hasApplication,
  insetsTop,
  onBack,
  labels,
}) => {
  return (
    <LinearGradient
      colors={['#2A4A30', Colors.fo] as [string, string]}
      start={GradientDirection.hero.start}
      end={GradientDirection.hero.end}
      style={[styles.hero, { paddingTop: Math.max(56, insetsTop + 16) }]}
    >
      <LotusHero color="white" opacity={0.08} size={210} right={-30} bottom={-30} />
      <MountainSilhouette color="rgba(255,255,255,0.07)" />

      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.heroBackRow}
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
        <Text style={styles.heroBackText}>{labels.back}</Text>
      </TouchableOpacity>

      <Text style={styles.heroKicker}>{labels.title}</Text>
      <Text style={styles.heroTitle}>{course.center}</Text>
      <Text style={styles.heroSub}>
        {course.type} · {course.dates}
      </Text>
      {course.city ? (
        <Text style={styles.heroCity}>
          {course.city}
          {course.country === 'NP' ? ' · Nepal' : course.country ? ` · ${course.country}` : ''}
          {course.flag ? ` ${course.flag}` : ''}
        </Text>
      ) : null}

      <View style={styles.heroPillRow}>
        <View style={styles.pillConfirmed}>
          <Text style={styles.pillConfirmedText}>✓ {labels.confirmed}</Text>
        </View>
        {isAssigned ? (
          <View style={styles.pillAssigned}>
            <Text style={styles.pillAssignedText}>📨 {labels.assignedByAdmin}</Text>
          </View>
        ) : hasApplication ? (
          <View style={styles.pillApplied}>
            <Text style={styles.pillAppliedText}>✋ {labels.youApplied}</Text>
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 14,
    marginLeft: -2,
    position: 'relative',
  },
  heroBackText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
  heroKicker: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    position: 'relative',
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 25,
    marginTop: 3,
    position: 'relative',
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 2,
    position: 'relative',
  },
  heroCity: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 1,
    position: 'relative',
  },
  heroPillRow: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
    marginTop: 13,
    position: 'relative',
  },
  pillConfirmed: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillConfirmedText: {
    color: Colors.white,
    fontSize: 11.5,
    fontWeight: '700',
  },
  pillAssigned: {
    backgroundColor: 'rgba(91,111,168,0.55)',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillAssignedText: {
    color: Colors.white,
    fontSize: 11.5,
    fontWeight: '700',
  },
  pillApplied: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillAppliedText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11.5,
    fontWeight: '600',
  },
});
