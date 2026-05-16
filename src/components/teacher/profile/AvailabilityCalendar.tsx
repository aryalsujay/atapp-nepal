/**
 * Month-by-month availability picker.
 *
 * Owns the 12-tile grid, the legend, and the festival/reset quick-chips.
 * The parent screen computes the `monthStates` array and supplies handlers
 * for cycling a month, marking a month as festival, and clearing all
 * selections. This component is purely presentational.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { DashedDivider } from '@/components/ui/DashedDivider';

export type MonthState = 'available' | 'festival' | 'unavailable';

export const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
export const MONTHS_NE = [
  'जन',
  'फेब',
  'मार्च',
  'अप्रिल',
  'मे',
  'जुन',
  'जुलाई',
  'अग',
  'सेप',
  'अक्ट',
  'नोभ',
  'डिस',
];

interface Props {
  monthLabels: string[];
  monthStates: MonthState[];
  availableCount: number;
  onCycleMonth: (idx: number) => void;
  onSetFestival: (idx: number) => void;
  onReset: () => void;
}

export function AvailabilityCalendar({
  monthLabels,
  monthStates,
  availableCount,
  onCycleMonth,
  onSetFestival,
  onReset,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      <Text style={s.sph}>📅 {t('profile.availability', { year: new Date().getFullYear() })}</Text>
      <View style={s.card}>
        <View style={s.availTopRow}>
          <Text style={s.availCountText}>
            <Text style={s.availCountStrong}>
              {availableCount} {t('profile.months_word')}
            </Text>{' '}
            {t('profile.available_lowercase')}
          </Text>
          <View style={s.maxChip}>
            <Text style={s.maxChipText}>{t('profile.max_per_year')}</Text>
          </View>
        </View>

        {/* Month grid */}
        <View style={s.monthGrid}>
          {monthStates.map((state, i) => (
            <MonthTile
              key={i}
              label={monthLabels[i]}
              state={state}
              onPress={() => onCycleMonth(i)}
            />
          ))}
        </View>

        <Text style={s.availHint}>{t('profile.av_tap_hint')}</Text>

        {/* Legend */}
        <View style={s.legendRow}>
          <LegendItem swatchBg={Colors.fo} label={`✓ ${t('profile.legend_available')}`} />
          <LegendItem
            swatchBg={Colors.cr3}
            borderColor={Colors.bd}
            label={`✗ ${t('profile.legend_unavailable')}`}
          />
          <LegendItem swatchBg={Colors.gd} label={`🎑 ${t('profile.legend_festival')}`} />
        </View>

        {/* Festival quick-chips */}
        <DashedDivider marginVertical={11} />
        <Text style={s.quickBlockHeader}>{t('profile.quick_block')}</Text>
        <View style={s.quickChipsRow}>
          <FestivalChip label={t('profile.block_buddha')} onPress={() => onSetFestival(4)} />
          <FestivalChip label={t('profile.block_dashain')} onPress={() => onSetFestival(9)} />
          <FestivalChip label={t('profile.block_tihar')} onPress={() => onSetFestival(10)} />
          <ResetChip label={t('profile.reset_av')} onPress={onReset} />
        </View>
      </View>
    </>
  );
}

function MonthTile({
  label,
  state,
  onPress,
}: {
  label: string;
  state: MonthState;
  onPress: () => void;
}) {
  const bg = state === 'available' ? Colors.fo : state === 'festival' ? Colors.gd : Colors.cr3;
  const fg =
    state === 'available' ? Colors.white : state === 'festival' ? Colors.white : Colors.tx3;
  const glyph = state === 'available' ? '✓' : state === 'festival' ? '🎑' : '✗';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.monthTile,
        { backgroundColor: bg },
        state === 'unavailable' ? s.monthTileUnavailableBorder : null,
        pressed ? { transform: [{ scale: 0.94 }] } : null,
      ]}
    >
      <Text style={[s.monthLabel, { color: fg }]}>{label}</Text>
      <Text style={[s.monthGlyph, { color: fg }]}>{glyph}</Text>
    </Pressable>
  );
}

function LegendItem({
  swatchBg,
  borderColor,
  label,
}: {
  swatchBg: string;
  borderColor?: string;
  label: string;
}) {
  return (
    <View style={s.legendItem}>
      <View
        style={[
          s.legendSwatch,
          { backgroundColor: swatchBg },
          borderColor ? { borderWidth: 1.5, borderColor } : null,
        ]}
      />
      <Text style={s.legendLabel}>{label}</Text>
    </View>
  );
}

function FestivalChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s.festivalChip}>
      <Text style={s.festivalChipText}>🎑 {label}</Text>
    </TouchableOpacity>
  );
}

function ResetChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s.resetChip}>
      <Text style={s.resetChipText}>⟲ {label}</Text>
    </TouchableOpacity>
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
  availTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  availCountText: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
  },
  availCountStrong: {
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.fo,
  },
  maxChip: {
    backgroundColor: Colors.fol,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  maxChipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.fo,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  monthTile: {
    width: '15.5%',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  monthTileUnavailableBorder: {
    borderWidth: 1.5,
    borderColor: Colors.bd,
  },
  monthLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  monthGlyph: {
    fontSize: 9,
    fontFamily: FontFamily.sansRegular,
    marginTop: 2,
    opacity: 0.85,
  },
  availHint: {
    fontSize: 10.5,
    fontStyle: 'italic',
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    textAlign: 'center',
    marginTop: 7,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 10.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
  },
  quickBlockHeader: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx3,
    textTransform: 'uppercase',
    letterSpacing: 0.525,
    marginBottom: 7,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  festivalChip: {
    backgroundColor: Colors.gdl,
    borderWidth: 1,
    borderColor: '#F0DCA0',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 18,
  },
  festivalChipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.gd,
  },
  resetChip: {
    backgroundColor: Colors.cr2,
    borderWidth: 1,
    borderColor: Colors.bd,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 18,
  },
  resetChipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx2,
  },
});
