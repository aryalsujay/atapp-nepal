/**
 * Server Profile — implements `specs/19-server-profile.md`.
 *
 * Prototype-faithful port of `app.html:2864–2970` (`ServerProfile`).
 */

import React from 'react';
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

import { Routes } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero, MeditationFigure } from '@/components/ui/HeroDecorations';
import { SERVICE_AREAS, type ServiceAreaId } from '@/data/serviceAreas';

const HERO_GRAD: [string, string] = ['#5A3800', '#9B6B14'];
const SV_ACCENT = '#9B6B14';
const SIGNOUT_TEXT = '#B85040';
const SIGNOUT_BORDER = '#E8B0A0';

const EXPERTISE: readonly ServiceAreaId[] = ['kitchen', 'dhamma', 'compound', 'residence'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type AvState = 0 | 1 | 'f';
const AV: AvState[] = [0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0];

const PREFERRED_CENTERS = [
  { rank: 1, name: 'Dhamma Shringa', city: 'Budhanilkantha, Kathmandu', color: Colors.fo },
  { rank: 2, name: 'Dhamma Pokhara', city: 'Pokhara', color: '#9B6B14' },
  { rank: 3, name: 'Dhamma Adhara', city: 'Swayambhu, Kathmandu', color: Colors.bl },
] as const;

const SERVICE_HISTORY = [
  { date: 'Mar 2026', center: 'Dhamma Shringa', area: 'Kitchen', days: 'Full (11 days)' },
  { date: 'Nov 2025', center: 'Dhamma Pokhara', area: 'Dhamma Hall', days: 'Partial (7 days)' },
  { date: 'Jun 2025', center: 'Dhamma Adhara', area: 'Compound', days: 'Full (11 days)' },
] as const;

function historyIcon(area: string): string {
  if (area === 'Kitchen') return '🍳';
  if (area === 'Dhamma Hall') return '🔔';
  return '🌿';
}

export default function ServerProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lang = i18n.language;
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const signOut = useAuthStore((s) => s.signOut);

  const langToggleText =
    lang === 'ne' ? t('server.home.lang_toggle_ne') : t('server.home.lang_toggle_en');

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero ─────────────────────────────────────────────────── */}
        <LinearGradient
          colors={HERO_GRAD}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.671, y: 0.97 }}
          style={[s.hero, { paddingTop: Math.max(56, insets.top + 12) }]}
        >
          <MeditationFigure size={130} color="rgba(255,255,255,0.1)" />
          <LotusHero color="white" opacity={0.07} size={180} />

          <View style={s.identityRow}>
            <View style={s.avatar}>
              <Text style={s.avatarGlyph}>🌿</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>Priya Thapa</Text>
              <Text style={s.sub1}>{t('server.home.dhamma_server')} · Nepal 🇳🇵</Text>
              <Text style={s.sub2}>
                {t('server.home.old_student')} · 2015 · 12 {t('server.profile.courses_lbl')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setLanguage(lang === 'ne' ? 'en' : 'ne')}
              activeOpacity={0.8}
              style={s.langPill}
              hitSlop={8}
            >
              <Text style={s.langPillText}>🌐 {langToggleText}</Text>
            </TouchableOpacity>
          </View>

          <View style={s.statsRow}>
            {[
              { ic: '🍳', n: '12', l: t('server.home.stat_served') },
              { ic: '🏛', n: '8', l: t('server.home.stat_centers') },
              { ic: '✅', n: '', l: t('server.profile.stat_eligible') },
            ].map((stat) => (
              <View key={stat.l} style={s.statChip}>
                <Text style={s.statIcon}>{stat.ic}</Text>
                {stat.n ? <Text style={s.statNumber}>{stat.n}</Text> : null}
                <Text style={[s.statLabel, { marginTop: stat.n ? 3 : 5 }]}>{stat.l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ─── Eligibility banner ───────────────────────────────────── */}
        <View style={s.banner}>
          <View style={s.bannerIcon}>
            <Text style={s.bannerIconGlyph}>✅</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.bannerTitle}>{t('server.home.eligible')}</Text>
            <Text style={s.bannerSub}>{t('server.home.eligible_sub')}</Text>
            <Text style={s.bannerLastServed}>{t('server.profile.last_served')}: Mar 2026 ✓</Text>
          </View>
        </View>

        {/* ─── Areas of Expertise ──────────────────────────────────── */}
        <Text style={s.sph}>🌟 {t('server.profile.areas_expertise')}</Text>
        <View style={s.sectionCard}>
          <Text style={s.prefAreasLabel}>{t('server.profile.pref_areas')}</Text>
          {SERVICE_AREAS.map((a) => {
            const on = EXPERTISE.includes(a.id as ServiceAreaId);
            const tileBg = on ? `${a.color}22` : Colors.cr2;
            return (
              <View key={a.id} style={s.expertiseRow}>
                <View style={[s.expertiseTile, { backgroundColor: tileBg }]}>
                  <Text style={s.expertiseEmoji}>{a.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.expertiseLabel}>{a.label}</Text>
                  <Text style={s.expertiseDesc}>{a.desc}</Text>
                </View>
                {on && (
                  <View style={[s.starBadge, { backgroundColor: a.color }]}>
                    <Text style={s.starBadgeText}>★</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ─── Availability 2026 ───────────────────────────────────── */}
        <Text style={s.sph}>📅 {t('server.profile.avail_2026')}</Text>
        <View style={s.sectionCard}>
          {[0, 6].map((rowStart) => (
            <View key={rowStart} style={[s.monthRow, rowStart === 6 && { marginTop: 5 }]}>
              {MONTHS.slice(rowStart, rowStart + 6).map((m, idx) => {
                const i = rowStart + idx;
                const state = AV[i];
                const bg = state === 1 ? Colors.fo : state === 'f' ? Colors.gd : Colors.cr3;
                const textColor =
                  state === 1 ? Colors.white : state === 'f' ? Colors.gd : Colors.tx3;
                const mark = state === 1 ? '✓' : state === 'f' ? '🎑' : '✗';
                return (
                  <View
                    key={m}
                    style={[
                      s.monthCell,
                      { backgroundColor: bg },
                      state === 0 && {
                        borderWidth: 1.5,
                        borderColor: Colors.bd,
                      },
                    ]}
                  >
                    <Text style={[s.monthLabel, { color: textColor }]}>{m}</Text>
                    <Text style={[s.monthMark, { color: textColor }]}>{mark}</Text>
                  </View>
                );
              })}
            </View>
          ))}
          <Text style={[s.festivalFooter, { marginTop: 8 }]}>
            {t('server.profile.festival_blocks')}
          </Text>
        </View>

        {/* ─── Preferred Centers ───────────────────────────────────── */}
        <Text style={s.sph}>📍 {t('server.profile.pref_centers')}</Text>
        <View style={s.sectionCard}>
          {PREFERRED_CENTERS.map((c) => (
            <View key={c.rank} style={s.centerRow}>
              <View style={[s.rankTile, { backgroundColor: c.color }]}>
                <Text style={s.rankText}>{c.rank}</Text>
              </View>
              <View>
                <Text style={s.centerName}>{c.name}</Text>
                <Text style={s.centerCity}>{c.city} 🇳🇵</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ─── Service History ─────────────────────────────────────── */}
        <Text style={s.sph}>📖 {t('server.profile.service_history')}</Text>
        <View style={s.sectionCard}>
          {SERVICE_HISTORY.map((h, i) => (
            <View
              key={i}
              style={[
                s.historyRow,
                i < 2 && {
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.bd,
                },
              ]}
            >
              <View style={s.historyIconTile}>
                <Text style={s.historyEmoji}>{historyIcon(h.area)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.historyCenter}>{h.center}</Text>
                <Text style={s.historyMeta}>
                  {h.area} · {h.days}
                </Text>
              </View>
              <Text style={s.historyDate}>{h.date}</Text>
            </View>
          ))}
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={8}
            style={s.viewAllWrap}
            // TODO: route to per-server full service history once that screen
            // is built and the history is sourced from the SQLite layer.
            onPress={() =>
              Alert.alert(t('server.profile.view_all_courses'), t('common.coming_soon'))
            }
          >
            <Text style={s.viewAllText}>{t('server.profile.view_all_courses')}</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Edit Profile button ─────────────────────────────────── */}
        <View style={s.editWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.replace(Routes.login)}
            style={s.outlineBtn}
          >
            <Text style={s.outlineBtnText}>{t('server.profile.edit_avail')}</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Sign Out button ─────────────────────────────────────── */}
        <View style={s.signOutWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={async () => {
              await signOut();
              router.replace(Routes.login);
            }}
            style={[s.outlineBtn, { borderColor: SIGNOUT_BORDER }]}
          >
            <Text style={[s.outlineBtnText, { color: SIGNOUT_TEXT }]}>{t('common.signOut')}</Text>
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
    paddingBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    position: 'relative',
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarGlyph: { fontSize: 30 },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    fontFamily: FontFamily.sansExtraBold,
  },
  sub1: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: FontFamily.sansRegular,
  },
  sub2: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: FontFamily.sansRegular,
  },
  langPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    flexShrink: 0,
  },
  langPillText: {
    color: Colors.white,
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Stats row (compact vs dashboard)
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
    position: 'relative',
  },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statIcon: { fontSize: 15, marginBottom: 1, lineHeight: 15 },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 17,
    fontFamily: FontFamily.sansExtraBold,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontFamily: FontFamily.sansRegular,
  },

  // Eligibility banner
  banner: {
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: Colors.fol,
    borderWidth: 1.5,
    borderColor: Colors.fom,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  bannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.fo,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bannerIconGlyph: { fontSize: 20 },
  bannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.fo,
    fontFamily: FontFamily.sansExtraBold,
  },
  bannerSub: {
    fontSize: 11.5,
    color: Colors.tx2,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },
  bannerLastServed: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.fo,
    marginTop: 2,
    fontFamily: FontFamily.sansBold,
  },

  // Section header
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

  // Section card (no marginBottom)
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

  // Expertise
  prefAreasLabel: {
    fontSize: 11,
    color: Colors.tx3,
    marginBottom: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.55,
    fontFamily: FontFamily.sansSemiBold,
  },
  expertiseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  expertiseTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  expertiseEmoji: { fontSize: 18 },
  expertiseLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  expertiseDesc: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  starBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  starBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },

  // Availability
  monthRow: {
    flexDirection: 'row',
    gap: 5,
  },
  monthCell: {
    flex: 1,
    borderRadius: 9,
    paddingHorizontal: 3,
    paddingVertical: 7,
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  monthMark: {
    fontSize: 7.5,
    opacity: 0.8,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  festivalFooter: {
    fontSize: 10,
    color: Colors.gd,
    fontFamily: FontFamily.sansRegular,
  },

  // Preferred Centers
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  rankTile: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
    fontFamily: FontFamily.sansExtraBold,
  },
  centerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  centerCity: {
    fontSize: 11.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },

  // Service history
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
  },
  historyIconTile: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: Colors.svl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  historyEmoji: { fontSize: 16 },
  historyCenter: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  historyMeta: {
    fontSize: 11,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  historyDate: {
    fontSize: 11,
    color: Colors.tx3,
    fontFamily: FontFamily.sansRegular,
  },
  viewAllWrap: {
    marginTop: 10,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    color: SV_ACCENT,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Action buttons
  editWrap: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 6,
  },
  signOutWrap: {
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  outlineBtn: {
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.bd2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
});
