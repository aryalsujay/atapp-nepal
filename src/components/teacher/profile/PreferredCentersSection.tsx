/**
 * Ranked list of preferred regions where the teacher will travel.
 *
 * Reads from the centres seed (passed in pre-grouped by region) and renders
 * up to three ranked rows. Rank colour and per-rank note copy are local to
 * this component since neither belongs on the profile model.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

const RANK_COLORS = [Colors.fo, Colors.sf, Colors.bl];
const REGION_NOTE_BY_RANK = [
  'Home region · Nepali speaker',
  'Second priority region',
  'Eastern & Southern Nepal',
];

interface Props {
  preferredRegions: string[];
  centersByRegion: Map<string, string[]>;
  flag?: string;
}

export function PreferredCentersSection({ preferredRegions, centersByRegion, flag }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <Text style={s.sph}>📍 {t('profile.preferred_centers')}</Text>
      <View style={s.card}>
        <Text style={s.cardLabel}>{t('profile.will_travel_to')}</Text>
        {preferredRegions.slice(0, 3).map((region, i) => {
          const centers = centersByRegion.get(region) ?? [];
          return (
            <View key={region} style={s.prefRow}>
              <View style={[s.prefRankTile, { backgroundColor: RANK_COLORS[i] ?? Colors.fo }]}>
                <Text style={s.prefRankText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.prefRegion}>
                  {region} {flag ?? '🇳🇵'}
                </Text>
                {centers.length > 0 ? (
                  <Text style={s.prefCenters}>{centers.join(' · ')}</Text>
                ) : null}
                <Text style={s.prefNote}>{REGION_NOTE_BY_RANK[i] ?? ''}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  sph: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
    marginTop: 18,
    marginHorizontal: 18,
    marginBottom: 9,
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
  prefRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  prefRankTile: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  prefRankText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.white,
  },
  prefRegion: {
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  prefCenters: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    marginTop: 1,
  },
  prefNote: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 2,
    fontStyle: 'italic',
  },
});
