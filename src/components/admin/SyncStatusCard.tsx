/**
 * Read-only sync status card for the admin dashboard — spec 32 §3.1.
 *
 * Shows the last successful sync time, current course count, and a hint
 * line ("Auto-syncs every 2 hours"). While a sync is in flight, an
 * `ActivityIndicator` replaces the static emoji and the hint line flips
 * to "Syncing now…". When the most recent attempt failed and no later
 * sync has succeeded, the subtitle line shows the failure copy.
 *
 * No buttons — auto-sync only (cold start + foreground + 2h heartbeat).
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useCoursesStore } from '@/store/coursesStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { relativeTime } from '@/utils/relativeTime';

export function SyncStatusCard() {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const courses = useCoursesStore((s) => s.courses);
  const lastSyncAt = useCoursesStore((s) => s.lastSyncAt);
  const lastSyncError = useCoursesStore((s) => s.lastSyncError);
  const syncing = useCoursesStore((s) => s.syncing);

  const showError = !syncing && !!lastSyncError;

  const subtitle = lastSyncAt
    ? t('admin.sync.last_synced', {
        relative: relativeTime(lastSyncAt, language),
        count: courses.length,
      })
    : t('admin.sync.never_synced');

  return (
    <View style={s.wrap}>
      <View style={s.card}>
        <View style={s.iconBox}>
          {syncing ? (
            <ActivityIndicator size="small" color={Colors.sf} />
          ) : (
            <Text style={s.emoji}>🔄</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{t('admin.sync.title')}</Text>
          <Text style={[s.sub, showError && s.subError]} numberOfLines={2}>
            {showError ? t('admin.sync.last_failed') : subtitle}
          </Text>
          <Text style={s.hint} numberOfLines={1}>
            {syncing ? t('admin.sync.in_flight') : t('admin.sync.hint')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingTop: 11,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadows.card,
  },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  sub: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    marginTop: 2,
  },
  subError: {
    color: Colors.ur,
  },
  hint: {
    fontSize: 11,
    fontStyle: 'italic',
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 2,
  },
});
