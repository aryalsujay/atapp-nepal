/**
 * Admin Auto-Schedule — implements `specs/25-admin-auto-schedule.md`.
 *
 * Prototype-faithful port of `app.html:2291–2427` (`AdminAuto`).
 *
 * Phase 3 refactor: data moved to `src/data/admin/scheduleDraft.json` +
 * `availableTeachers.json`. Sub-components live in
 * `src/components/admin/schedule/`. This file is now ~200 lines instead
 * of 958.
 */

import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero } from '@/components/ui/HeroDecorations';
import { DraftCard, MatchingCriteriaChips, OverrideModal } from '@/components/admin/schedule';
import { scheduleDraft, type ScheduleDraftRow } from '@/data';

export default function AdminScheduleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [finalized, setFinalized] = useState(false);
  const [overrideRow, setOverrideRow] = useState<ScheduleDraftRow | null>(null);

  const handleConfirmOverride = ({
    row,
    teacher,
  }: {
    row: ScheduleDraftRow;
    teacher: string;
    reason: string;
  }) => {
    const action = row.teacher ? 'Changed' : 'Assigned';
    Alert.alert(`${action} ${teacher} for ${row.center}`);
    setOverrideRow(null);
  };

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={Gradients.autoSchedule}
          start={GradientDirection.hero.start}
          end={GradientDirection.hero.end}
          style={[s.hero, { paddingTop: Math.max(56, insets.top + 12) }]}
        >
          <LotusHero color="white" opacity={0.08} size={210} />

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={s.backRow}
            hitSlop={8}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke="rgba(255,255,255,0.72)"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={s.backText}>Dashboard</Text>
          </TouchableOpacity>

          <Text style={s.title}>{t('admin.schedule.title')}</Text>
          <Text style={s.subline}>Q3 2026 · Jul – Sep · Apr 24</Text>

          <View style={s.statsRow}>
            <HeroStat n="5/6" label="Assigned" color={Colors.white} />
            <HeroStat n="3" label="Review" color="#FFD580" />
            <HeroStat n="1" label="Unscheduled" color="#FFB3AE" />
          </View>
        </LinearGradient>

        {/* ─── Matching criteria ──────────────────────────────── */}
        <MatchingCriteriaChips />

        {/* ─── Draft assignments ──────────────────────────────── */}
        <Text style={s.sph}>{t('admin.schedule.draft_assignments')}</Text>
        {scheduleDraft.map((r, i) => (
          <DraftCard key={`${r.center}-${i}`} row={r} onOverride={setOverrideRow} />
        ))}

        {/* ─── Footer actions ─────────────────────────────────── */}
        <View style={s.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Alert.alert(t('common.coming_soon'))}
            style={[s.footerBtn, s.footerBtnOu]}
          >
            <Text style={[s.footerBtnText, { color: Colors.tx }]}>⚡ Re-generate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFinalized(true)}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={Gradients.forestCta}
              start={GradientDirection.button.start}
              end={GradientDirection.button.end}
              style={s.footerBtn}
            >
              <Text style={[s.footerBtnText, { color: Colors.white }]}>
                {finalized ? '✅ Notified!' : '✓ Finalize & Notify'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {finalized && (
          <View style={s.finalizedBanner}>
            <Text style={s.finalizedEmoji}>✅</Text>
            <Text style={s.finalizedTitle}>Schedule Finalized!</Text>
            <Text style={s.finalizedBody}>All teachers notified. Sadhu! 🙏</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ─── Override modal ─────────────────────────────────── */}
      <OverrideModal
        row={overrideRow}
        onClose={() => setOverrideRow(null)}
        onConfirm={handleConfirmOverride}
      />
    </View>
  );
}

const HeroStat: React.FC<{ n: string; label: string; color: string }> = ({ n, label, color }) => (
  <View style={s.statChip}>
    <Text style={[s.statNumber, { color }]}>{n}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

const s = StyleSheet.create({
  flex: { flex: 1 },

  hero: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 13,
  },
  backText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: FontFamily.sansRegular,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    fontFamily: FontFamily.sansExtraBold,
  },
  subline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.sansRegular,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 13,
    paddingHorizontal: 6,
    paddingVertical: 9,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
  },
  statLabel: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },

  sph: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 9,
    fontFamily: FontFamily.sansBold,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnOu: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.bd2,
  },
  footerBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  finalizedBanner: {
    marginHorizontal: 18,
    marginTop: 10,
    backgroundColor: Colors.fol,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  finalizedEmoji: { fontSize: 24, marginBottom: 5 },
  finalizedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.fo,
    fontFamily: FontFamily.sansBold,
  },
  finalizedBody: {
    fontSize: 12.5,
    color: Colors.tx2,
    marginTop: 3,
    textAlign: 'center',
    fontFamily: FontFamily.sansRegular,
  },
});
