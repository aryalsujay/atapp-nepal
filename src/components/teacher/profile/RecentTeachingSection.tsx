/**
 * Recent teaching history with collapsible "view all" footer.
 *
 * Shows the three most recent rows by default; tapping the footer link
 * expands to the full history. Parent controls the expansion state so it
 * can persist across re-renders triggered by profile mutations.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import type { HistoryEntry } from '@/types/profile';

interface Props {
  history: HistoryEntry[];
  totalCourses: number;
  showAll: boolean;
  onToggleShowAll: () => void;
}

export function RecentTeachingSection({ history, totalCourses, showAll, onToggleShowAll }: Props) {
  const { t } = useTranslation();
  const rows = showAll ? history : history.slice(0, 3);
  return (
    <>
      <Text style={s.sph}>📖 {t('profile.recent_teaching')}</Text>
      <View style={s.card}>
        {rows.map((h, i, arr) => (
          <View
            key={`${h.date}-${i}`}
            style={[s.historyRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0 }]}
          >
            <View style={s.historyTile}>
              <Text style={s.historyTileText}>{h.country}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.historyCenter}>{h.center}</Text>
              <Text style={s.historyMeta}>
                {h.type} · {h.students} {t('profile.students_label')}
              </Text>
            </View>
            <Text style={s.historyDate}>{h.date}</Text>
          </View>
        ))}
        {history.length > 3 ? (
          <TouchableOpacity
            onPress={onToggleShowAll}
            activeOpacity={0.6}
            style={s.historyFooterWrap}
          >
            <Text style={s.historyFooterLink}>
              {showAll
                ? t('profile.show_less_courses')
                : t('profile.view_all_courses', { count: totalCourses })}
            </Text>
          </TouchableOpacity>
        ) : null}
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
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 9,
    borderBottomColor: Colors.bd,
  },
  historyTile: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: Colors.sfl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  historyTileText: { fontSize: 16 },
  historyCenter: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  historyMeta: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    marginTop: 1,
  },
  historyDate: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    textAlign: 'right',
    flexShrink: 0,
  },
  historyFooterWrap: {
    marginTop: 10,
    alignItems: 'center',
  },
  historyFooterLink: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.sf,
  },
});
