/**
 * Server Course Detail — implements `specs/15-server-course-detail.md`.
 *
 * Prototype-faithful port of `app.html:3082–3170` (`ServerCourseDetail`).
 */

import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type DimensionValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { routeTo } from '@/routes';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import { DashedDivider } from '@/components/ui/DashedDivider';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import { serverCourses } from '@/data';

const HERO_GRAD: [string, string] = ['#5A3800', '#9B6B14'];
const APPLY_GRAD: [string, string] = ['#9B6B14', '#6B4610'];
const SV_ACCENT = '#9B6B14';

const SCHEDULE: { hour: string; key: string }[] = [
  { hour: '4:00 AM', key: 'row_0' },
  { hour: '4:30 AM', key: 'row_1' },
  { hour: '6:30 AM', key: 'row_2' },
  { hour: '11:00 AM', key: 'row_3' },
  { hour: '5:00 PM', key: 'row_4' },
  { hour: '7:00 PM', key: 'row_5' },
  { hour: '9:30 PM', key: 'row_6' },
];

const EXPECT_KEYS = ['expect_dorm', 'expect_food', 'expect_rules'] as const;

export default function ServerCourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const numericId = Number(id);
  const c = serverCourses.find((x) => x.id === numericId) ?? serverCourses[0];
  const open = c.total - c.filled;
  const pct = c.total > 0 ? Math.round((c.filled / c.total) * 100) : 0;
  const fillColor = pct > 80 ? Colors.ur : pct > 50 ? SV_ACCENT : Colors.fo;

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero ──────────────────────────────────────────────────── */}
        <LinearGradient
          colors={HERO_GRAD}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.671, y: 0.97 }}
          style={[s.hero, { paddingTop: Math.max(56, insets.top + 12) }]}
        >
          <LotusHero color="white" opacity={0.08} size={180} />
          <MountainSilhouette />

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={s.backRow}
            hitSlop={8}
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
            <Text style={s.backText}>{t('common.back')}</Text>
          </TouchableOpacity>

          <Text style={s.kicker}>
            {c.type} · {c.days} {t('server.detail.days_suffix')}
          </Text>
          <Text style={s.title}>{c.center}</Text>
          <Text style={s.city}>{c.city}</Text>

          <View style={s.pillRow}>
            <View style={s.pill}>
              <Text style={s.pillText}>📅 {c.dates}</Text>
            </View>
            <View style={s.pill}>
              <Text style={s.pillText}>
                {open} {t('server.detail.open_short')}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ─── Server intake card ───────────────────────────────────── */}
        <View style={[s.card, { marginTop: 14 }]}>
          <View style={s.intakeTopRow}>
            <Text style={s.intakeLabel}>{t('server.detail.intake')}</Text>
            <Text style={s.intakeMeta}>
              {c.filled}/{c.total} · {c.mServers}M + {c.fServers}F
            </Text>
          </View>
          <View style={s.intakeTrack}>
            <View
              style={[
                s.intakeFill,
                {
                  width: `${pct}%` as DimensionValue,
                  backgroundColor: fillColor,
                },
              ]}
            />
          </View>
        </View>

        {/* ─── About ─────────────────────────────────────────────────── */}
        <Text style={s.sph}>📖 {t('server.detail.about')}</Text>
        <View style={s.sectionCard}>
          <Text style={s.aboutBody}>
            {t('server.detail.about_body', { days: c.days, center: c.center })}
          </Text>
        </View>

        {/* ─── Daily schedule ────────────────────────────────────────── */}
        <Text style={s.sph}>⏰ {t('server.detail.daily_schedule')}</Text>
        <View style={s.sectionCard}>
          {SCHEDULE.map((row) => (
            <React.Fragment key={row.hour}>
              <View style={s.schedRow}>
                <Text style={s.schedHour}>{row.hour}</Text>
                <Text style={s.schedActivity}>{t(`server.detail.schedule.${row.key}`)}</Text>
              </View>
              <DashedDivider marginVertical={0} />
            </React.Fragment>
          ))}
        </View>

        {/* ─── Service areas open ────────────────────────────────────── */}
        <Text style={s.sph}>🌟 {t('server.detail.areas_open')}</Text>
        <View style={s.areasRow}>
          {c.areas.map((aid) => {
            const sa = SERVICE_AREAS.find((x) => x.id === aid);
            if (!sa) return null;
            return (
              <View key={aid} style={s.areaChip}>
                <Text style={s.areaChipText}>
                  {sa.emoji} {sa.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ─── What to expect ────────────────────────────────────────── */}
        <Text style={s.sph}>💡 {t('server.detail.what_expect')}</Text>
        <View style={s.sectionCard}>
          {EXPECT_KEYS.map((k) => (
            <View key={k} style={s.bulletRow}>
              <Text style={s.bulletDot}>•</Text>
              <Text style={s.bulletText}>{t(`server.detail.${k}`)}</Text>
            </View>
          ))}
        </View>

        {/* ─── Apply CTA ─────────────────────────────────────────────── */}
        <View style={s.ctaWrap}>
          <TouchableOpacity
            onPress={() => router.push(routeTo.serverApply(c.id))}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={APPLY_GRAD}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.ctaBtn}
            >
              <Text style={s.ctaText}>{t('server.opportunities.apply_serve')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },

  // Hero
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
    marginBottom: 12,
  },
  backText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: FontFamily.sansRegular,
  },
  kicker: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.sansRegular,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 2,
    fontFamily: FontFamily.sansExtraBold,
  },
  city: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    fontFamily: FontFamily.sansRegular,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Card (.card base)
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    shadowColor: Colors.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 0,
    shadowColor: Colors.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
  },

  // Intake card internals
  intakeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  intakeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  intakeMeta: {
    fontSize: 11,
    color: Colors.tx3,
    fontFamily: FontFamily.sansRegular,
  },
  intakeTrack: {
    height: 7,
    backgroundColor: Colors.cr3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  intakeFill: { height: '100%' },

  // Section header (.sph)
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

  // About body
  aboutBody: {
    fontSize: 13,
    color: Colors.tx2,
    lineHeight: 20.15,
    fontFamily: FontFamily.sansRegular,
  },

  // Schedule
  schedRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 7,
  },
  schedHour: {
    fontSize: 12,
    fontWeight: '700',
    color: SV_ACCENT,
    width: 72,
    flexShrink: 0,
    fontFamily: FontFamily.sansBold,
  },
  schedActivity: {
    fontSize: 12,
    color: Colors.tx2,
    flex: 1,
    fontFamily: FontFamily.sansRegular,
  },

  // Service areas chips (bigger than card chips)
  areasRow: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  areaChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.svl,
  },
  areaChipText: {
    fontSize: 11,
    color: SV_ACCENT,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // What-to-expect bullets
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 7,
  },
  bulletDot: {
    fontSize: 14,
    color: SV_ACCENT,
    fontFamily: FontFamily.sansBold,
  },
  bulletText: {
    fontSize: 12.5,
    color: Colors.tx2,
    lineHeight: 18.1,
    flex: 1,
    fontFamily: FontFamily.sansRegular,
  },

  // CTA
  ctaWrap: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
  },
  ctaBtn: {
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },
});
