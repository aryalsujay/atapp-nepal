/**
 * Eligibility status banner shown directly under the hero.
 *
 * Displays the "ready to teach" confirmation, the date the teacher last
 * conducted a course, and (if known) the next eligible date — derived in
 * the parent screen from the teaching history.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';

interface Props {
  lastTaught: string;
  nextEligibleStr: string | null;
}

export function EligibilityCard({ lastTaught, nextEligibleStr }: Props) {
  const { t } = useTranslation();
  return (
    <View style={s.wrap}>
      <View style={s.card}>
        <View style={s.iconTile}>
          <Text style={s.iconEmoji}>✅</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{t('profile.eligible_title')}</Text>
          <Text style={s.sub}>
            {lastTaught
              ? t('profile.eligible_sub', { lastTaught })
              : t('profile.eligible_sub_none')}
          </Text>
          {nextEligibleStr ? (
            <Text style={s.next}>{t('profile.eligible_next', { date: nextEligibleStr })}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  card: {
    backgroundColor: Colors.fol,
    borderWidth: 1.5,
    borderColor: Colors.fom,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.fo,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 22 },
  title: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.fo,
  },
  sub: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    marginTop: 2,
  },
  next: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.fo,
    marginTop: 2,
  },
});
