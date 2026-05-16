/**
 * Server Dashboard — implements `specs/13-server-dashboard.md`.
 *
 * Prototype-faithful port of `app.html:2529–2616` (`ServerDash`). Inline
 * literal font sizes match the prototype CSS; no FontSize tokens used.
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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes, routeTo } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useTeachersStore } from '@/store/teachersStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import { serverApplications, serverCourses } from '@/data';

const HERO_GRADIENT: [string, string, string] = ['#5A3800', '#9B6B14', '#C8900A'];
const SV_ACCENT = '#9B6B14';

export default function ServerHomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lang = i18n.language;
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const userId = useAuthStore((s) => s.userId) ?? '';
  const findTeacher = useTeachersStore((s) => s.findTeacher);
  const user = findTeacher(userId);
  const displayName = user?.name ?? 'Priya Thapa';

  const openSlots = serverCourses.reduce((sum, c) => sum + (c.total - c.filled), 0);
  const totalCourses = serverCourses.length;
  const unread = 0;

  const upcomingApp =
    serverApplications.find((a) => a.status === 'approved') ?? serverApplications[0];
  const upcomingCourse = upcomingApp
    ? serverCourses.find((c) => c.id === upcomingApp.courseId)
    : undefined;
  const upcomingArea = SERVICE_AREAS.find((a) => a.id === upcomingApp?.areas[0]);
  const upcomingAreaIcon = upcomingArea?.emoji ?? '🍳';
  // Prototype always uses the English label here, even in NE mode.
  const upcomingAreaLabelText = upcomingArea?.label ?? 'Kitchen';
  const upcomingDuration = upcomingApp?.partial
    ? `${t('server.home.partial_lbl')}: ${upcomingApp.days ?? ''}`
    : t('server.home.full_course_lbl');
  const upcomingCity = upcomingCourse
    ? `${upcomingCourse.city}${upcomingCourse.flag ? ' ' + upcomingCourse.flag : ' 🇳🇵'}`
    : 'Budhanilkantha, Kathmandu 🇳🇵';

  const langToggleText =
    lang === 'ne' ? t('server.home.lang_toggle_ne') : t('server.home.lang_toggle_en');

  const top3 = serverCourses.slice(0, 3);

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero ─────────────────────────────────────────────────── */}
        <LinearGradient
          colors={HERO_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.671, y: 0.97 }}
          style={[s.hero, { paddingTop: Math.max(56, insets.top + 12) }]}
        >
          <LotusHero color="white" opacity={0.08} size={210} right={-30} bottom={-30} />
          <MountainSilhouette />

          <View style={s.heroRow}>
            <View style={{ flexShrink: 1 }}>
              <Text style={[s.kicker, lang === 'ne' && { fontFamily: FontFamily.devanagari }]}>
                {t('server.home.dhamma_server')}
              </Text>
              <Text style={s.name}>{displayName} 🙏</Text>
              <Text style={s.subline}>{t('server.home.old_student')} · Serving since 2018</Text>
            </View>

            <View style={s.heroRight}>
              <View style={s.badge}>
                <Text style={s.badgeGlyph}>🌿</Text>
                {unread > 0 && (
                  <View style={s.badgeDot}>
                    <Text style={s.badgeDotText}>{unread}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setLanguage(lang === 'ne' ? 'en' : 'ne')}
                activeOpacity={0.8}
                style={s.langPill}
                hitSlop={8}
              >
                <Text
                  style={[s.langPillText, lang === 'en' && { fontFamily: FontFamily.devanagari }]}
                >
                  🌐 {langToggleText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.statsRow}>
            {[
              { ic: '🍳', n: 12, l: t('server.home.stat_served') },
              { ic: '🏛', n: 8, l: t('server.home.stat_centers') },
              { ic: '📅', n: 1, l: t('server.home.stat_upcoming') },
            ].map((stat) => (
              <View key={stat.l} style={s.statChip}>
                <Text style={s.statIcon}>{stat.ic}</Text>
                <Text style={s.statNumber}>{stat.n}</Text>
                <Text style={s.statLabel}>{stat.l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ─── My Upcoming Service ──────────────────────────────────── */}
        <Text style={s.sph}>🙏 {t('server.home.upcoming_service')}</Text>
        {upcomingApp ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(routeTo.serverApplicationDetail(upcomingApp.id))}
            style={[s.card, { borderLeftWidth: 4, borderLeftColor: SV_ACCENT }]}
          >
            <View style={s.cardRow}>
              <View style={s.iconTile}>
                <Text style={s.iconTileGlyph}>{upcomingAreaIcon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.upcomingTitle}>{upcomingApp.center}</Text>
                <Text style={s.upcomingSub}>
                  {upcomingAreaLabelText} · {upcomingDuration} ({upcomingApp.dates})
                </Text>
                <Text style={s.upcomingMeta}>{upcomingCity}</Text>
              </View>
              <View style={s.confirmedPill}>
                <Text style={s.confirmedPillText}>{t('server.home.confirmed')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* ─── Open Opportunities ───────────────────────────────────── */}
        <View style={s.opphHeaderRow}>
          <Text style={[s.sph, { margin: 0 }]}>🌟 {t('server.home.open_opps')}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push(Routes.serverOpportunities)}
            hitSlop={8}
          >
            <Text style={s.seeAll}>{t('home.see_all')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.opphSub}>
          {openSlots} {t('server.home.open_slots')} {totalCourses} {t('server.home.courses')}
        </Text>

        {top3.map((c) => {
          const open = c.total - c.filled;
          const pct = c.total > 0 ? Math.round((c.filled / c.total) * 100) : 0;
          const fillColor = pct > 80 ? Colors.ur : pct > 50 ? SV_ACCENT : Colors.fo;
          const slotsLeftColor = open <= 3 ? Colors.ur : SV_ACCENT;
          const visibleAreas = c.areas.slice(0, 4);
          const overflow = c.areas.length - visibleAreas.length;

          return (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.85}
              onPress={() => router.push(routeTo.serverOpportunityDetail(c.id))}
              style={[s.card, { borderLeftWidth: 4, borderLeftColor: SV_ACCENT }]}
            >
              <View style={s.oppTopRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={s.oppTitle}>{c.center}</Text>
                  <Text style={s.oppCity}>{c.city}</Text>
                  <Text style={s.oppMeta}>
                    📅 {c.dates} · {c.type}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.slotsLeft, { color: slotsLeftColor }]}>{open} slots left</Text>
                  <Text style={s.slotsBreakdown}>
                    {c.mServers}M + {c.fServers}F
                  </Text>
                </View>
              </View>

              <View style={s.progressRow}>
                <View style={s.progressTrack}>
                  <View
                    style={[
                      s.progressFill,
                      {
                        width: `${pct}%` as DimensionValue,
                        backgroundColor: fillColor,
                      },
                    ]}
                  />
                </View>
                <Text style={s.progressLabel}>
                  {c.filled}/{c.total} filled
                </Text>
              </View>

              <View style={s.chipsRow}>
                {visibleAreas.map((aid) => {
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
                {overflow > 0 && <Text style={s.areaOverflow}>+{overflow} more</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* ─── Eligible to Serve ────────────────────────────────────── */}
        <View
          style={[s.card, { backgroundColor: Colors.fol, borderWidth: 1, borderColor: Colors.fom }]}
        >
          <Text style={s.eligibleTitle}>✅ {t('server.home.eligible')}</Text>
          <Text style={s.eligibleSub}>{t('server.home.eligible_sub')} · Last served: Mar 2026</Text>
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
    paddingBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  kicker: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: FontFamily.sansRegular,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    fontFamily: FontFamily.sansExtraBold,
  },
  subline: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.sansRegular,
  },
  heroRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  badge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeGlyph: { fontSize: 26 },
  badgeDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Colors.ur,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#9B6B14',
  },
  badgeDotText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    fontFamily: FontFamily.sansExtraBold,
  },
  langPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  langPillText: {
    color: Colors.white,
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    position: 'relative',
  },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 13,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statIcon: { fontSize: 16, marginBottom: 2, lineHeight: 16 },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 18,
    fontFamily: FontFamily.sansExtraBold,
  },
  statLabel: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 3,
    fontFamily: FontFamily.sansRegular,
    textAlign: 'center',
  },

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

  // Card (.card)
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

  // Upcoming service card
  cardRow: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
  },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: Colors.svl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconTileGlyph: { fontSize: 22 },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  upcomingSub: {
    fontSize: 12,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  upcomingMeta: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  confirmedPill: {
    backgroundColor: Colors.fol,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    flexShrink: 0,
  },
  confirmedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.fo,
    fontFamily: FontFamily.sansBold,
  },

  // Open Opportunities header
  opphHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 7,
  },
  seeAll: {
    fontSize: 13,
    color: SV_ACCENT,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  opphSub: {
    fontSize: 12,
    color: Colors.tx3,
    paddingHorizontal: 18,
    paddingBottom: 9,
    fontStyle: 'italic',
    fontFamily: FontFamily.sansRegular,
  },

  // Opportunity card
  oppTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 7,
  },
  oppTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  oppCity: {
    fontSize: 12,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  oppMeta: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  slotsLeft: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
  },
  slotsBreakdown: {
    fontSize: 10,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 7,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: Colors.cr3,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.tx3,
    flexShrink: 0,
    fontFamily: FontFamily.sansRegular,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  areaChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: Colors.svl,
  },
  areaChipText: {
    fontSize: 10,
    color: SV_ACCENT,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  areaOverflow: {
    fontSize: 10,
    color: Colors.tx3,
    fontFamily: FontFamily.sansRegular,
  },

  // Eligible card overrides handled inline
  eligibleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.fo,
    marginBottom: 4,
    fontFamily: FontFamily.sansBold,
  },
  eligibleSub: {
    fontSize: 12,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
});
