/**
 * Admin Dashboard — implements `specs/21-admin-dashboard.md`.
 *
 * Prototype-faithful port of `app.html:1935–2010` (`AdminDash`).
 */

import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes, routeTo } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import { adminApplications } from '@/data';

const URGENT = [
  {
    name: '10-Day',
    center: 'Dhamma Pokhara, Pokhara 🇳🇵',
    dates: 'Jul 15–26, 2026',
    days: 11,
    need: 'Nepali-speaking AT',
  },
  {
    name: '10-Day',
    center: 'Dhamma Janani, Lumbini 🇳🇵',
    dates: 'Aug 20–31, 2026',
    days: 18,
    need: 'Female AT (Nepali/Hindi)',
  },
  {
    name: '20-Day',
    center: 'Dhamma Shringa, Kathmandu 🇳🇵',
    dates: 'Nov 1–21, 2026',
    days: 34,
    need: 'Senior Male AT',
  },
];

function matchBadgeStyle(score: number) {
  if (score >= 90) return { bg: Colors.fol, color: Colors.fo };
  if (score >= 70) return { bg: Colors.bll, color: Colors.bl };
  return { bg: Colors.cr2, color: Colors.tx3 };
}

export default function AdminDashboardScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lang = i18n.language;
  const signOut = useAuthStore((s) => s.signOut);
  const [showCoTeacher, setShowCoTeacher] = useState(true);

  const recent = adminApplications.slice(0, 2);

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero ─────────────────────────────────────────────────── */}
        <LinearGradient
          colors={Gradients.admin}
          start={GradientDirection.hero.start}
          end={GradientDirection.hero.end}
          style={[s.hero, { paddingTop: Math.max(56, insets.top + 12) }]}
        >
          <LotusHero color="white" opacity={0.07} size={220} />
          <MountainSilhouette color="rgba(255,255,255,0.06)" />

          <Text style={[s.kicker, lang === 'ne' && { fontFamily: FontFamily.devanagari }]}>
            {t('admin.dashboard.kicker')}
          </Text>
          <Text style={s.title}>Dashboard</Text>
          <Text style={s.subline}>Dhamma Shringa · Kathmandu Valley 🇳🇵</Text>

          <View style={s.statsRow}>
            <StatChip n="4" label={t('admin.dashboard.applications')} color={Colors.gd} />
            <StatChip n="6" label="Unscheduled" color="#FFB3AE" />
            <StatChip n="138" label="Active ATs" color={Colors.white} />
          </View>
        </LinearGradient>

        {/* ─── Quick actions ──────────────────────────────────────── */}
        <View style={s.quickRow}>
          <QuickButton
            label={`📨 ${t('admin.dashboard.applications')}`}
            variant="forest"
            onPress={() => router.push(Routes.adminInbox)}
          />
          <QuickButton
            label={`👥 ${t('admin.dashboard.teachers')}`}
            variant="saffron"
            onPress={() => router.push(Routes.adminDirectory)}
          />
          <QuickButton
            label={`⚡ ${t('admin.dashboard.schedule')}`}
            variant="outline"
            onPress={() => router.push(Routes.adminSchedule)}
          />
        </View>

        {/* ─── Urgent ─────────────────────────────────────────────── */}
        <Text style={s.sph}>🔴 {t('admin.dashboard.urgent')}</Text>
        {URGENT.map((c) => (
          <View key={c.center} style={[s.card, { borderLeftWidth: 4, borderLeftColor: Colors.ur }]}>
            <View style={s.urgentTopRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={s.urgentName}>{c.name}</Text>
                <Text style={s.urgentCenter}>{c.center}</Text>
                <Text style={s.urgentDates}>📅 {c.dates}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                <Text style={s.urgentDaysLeft}>{c.days}d left</Text>
              </View>
            </View>
            <View style={s.urgentBottomRow}>
              <View style={s.chipUr}>
                <Text style={s.chipUrText}>Needs: {c.need}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(Routes.adminDirectory)}
              >
                <LinearGradient
                  colors={Gradients.primaryCta}
                  start={GradientDirection.button.start}
                  end={GradientDirection.button.end}
                  style={s.assignBtn}
                >
                  <Text style={s.assignBtnText}>Assign AT</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ─── Recent Applications ────────────────────────────────── */}
        <View style={s.recentHeaderRow}>
          <Text style={[s.sph, { margin: 0 }]}>📨 {t('admin.dashboard.recent_apps')}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => router.push(Routes.adminInbox)}
          >
            <Text style={s.seeAll}>{t('home.see_all')}</Text>
          </TouchableOpacity>
        </View>
        {recent.map((a) => {
          const badge = matchBadgeStyle(a.match);
          return (
            <TouchableOpacity
              key={a.id}
              activeOpacity={0.85}
              onPress={() => router.push(routeTo.adminApplicationReview(a.id))}
              style={[s.card, s.recentCardRow]}
            >
              <View style={s.avatar}>
                <Text style={s.avatarText}>{a.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.recentName}>{a.name}</Text>
                <Text style={s.recentCourse}>{a.course}</Text>
              </View>
              <View style={[s.mbadge, { backgroundColor: badge.bg }]}>
                <Text style={[s.mbadgeText, { color: badge.color }]}>{a.match}% match</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* ─── Notification Center card ───────────────────────────── */}
        <View style={s.notifWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(Routes.adminNotifications)}
            style={s.notifCard}
          >
            <Text style={{ fontSize: 22 }}>📧</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.notifTitle}>{t('admin.dashboard.notif_center')}</Text>
              <Text style={s.notifSub}>{t('admin.dashboard.notif_center_sub')}</Text>
            </View>
            <Text style={s.notifChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Feature Visibility ─────────────────────────────────── */}
        <Text style={s.sph}>⚙️ {t('admin.dashboard.feature_visibility')}</Text>
        <View style={s.sectionCard}>
          <View style={s.toggleRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={s.toggleTitle}>{t('admin.dashboard.coteacher_title')}</Text>
              <Text style={s.toggleSub}>{t('admin.dashboard.coteacher_sub')}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowCoTeacher((v) => !v)}
              style={[s.toggleTrack, { backgroundColor: showCoTeacher ? Colors.fo : Colors.bd2 }]}
            >
              <View style={[s.toggleThumb, { marginLeft: showCoTeacher ? 18 : 0 }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Sign Out ───────────────────────────────────────────── */}
        <View style={s.signOutWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={async () => {
              await signOut();
              router.replace(Routes.login);
            }}
            style={s.signOutBtn}
          >
            <Text style={s.signOutText}>{t('common.signOut')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function StatChip({ n, label, color }: { n: string; label: string; color: string }) {
  return (
    <View style={s.statChip}>
      <Text style={[s.statNumber, { color }]}>{n}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function QuickButton({
  label,
  variant,
  onPress,
}: {
  label: string;
  variant: 'forest' | 'saffron' | 'outline';
  onPress: () => void;
}) {
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[
          s.quickBtn,
          { borderWidth: 2, borderColor: Colors.bd2, backgroundColor: 'transparent' },
        ]}
      >
        <Text style={[s.quickBtnText, { color: Colors.tx }]}>{label}</Text>
      </TouchableOpacity>
    );
  }
  const colors = variant === 'forest' ? Gradients.forestCta : Gradients.primaryCta;
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ flex: 1 }}>
      <LinearGradient
        colors={colors}
        start={GradientDirection.button.start}
        end={GradientDirection.button.end}
        style={s.quickBtn}
      >
        <Text style={[s.quickBtnText, { color: Colors.white }]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },

  // Hero
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  kicker: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.65)',
    position: 'relative',
    fontFamily: FontFamily.sansRegular,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    position: 'relative',
    fontFamily: FontFamily.sansExtraBold,
  },
  subline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.68)',
    position: 'relative',
    fontFamily: FontFamily.sansRegular,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    position: 'relative',
  },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 13,
    paddingHorizontal: 7,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
  },
  statLabel: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },

  // Quick actions
  quickRow: {
    flexDirection: 'row',
    gap: 9,
    paddingTop: 13,
    paddingHorizontal: 18,
  },
  quickBtn: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 11,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '700',
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

  // Urgent
  urgentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 7,
  },
  urgentName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  urgentCenter: {
    fontSize: 12.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  urgentDates: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  urgentDaysLeft: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.ur,
    fontFamily: FontFamily.sansExtraBold,
  },
  urgentBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipUr: {
    backgroundColor: Colors.url,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 1,
  },
  chipUrText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.ur,
    fontFamily: FontFamily.sansSemiBold,
  },
  assignBtn: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },

  // Recent applications
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 7,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.sf,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  recentCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sfm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.sfd,
    fontFamily: FontFamily.sansBold,
  },
  recentName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  recentCourse: {
    fontSize: 11.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  mbadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  mbadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Notification Center
  notifWrap: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 10,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bll,
    borderWidth: 1,
    borderColor: Colors.bld,
    borderRadius: 16,
    padding: 15,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.bl,
    fontFamily: FontFamily.sansBold,
  },
  notifSub: {
    fontSize: 11,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  notifChevron: {
    fontSize: 18,
    color: Colors.bl,
  },

  // Feature visibility toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  toggleSub: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 3,
    flexShrink: 0,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },

  // Sign out
  signOutWrap: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
  },
  signOutBtn: {
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.urd,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ur,
    fontFamily: FontFamily.sansBold,
  },
});
