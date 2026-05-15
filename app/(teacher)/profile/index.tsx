/**
 * Teacher Profile — implements `specs/09-teacher-profile.md`.
 *
 * Prototype-faithful port of `app.html:1385–1582`. Orange-gradient hero
 * with meditation figure + lotus + 4 stat tiles, eligibility status card,
 * tappable month grid with festival quick-chips, languages/authorizations/
 * preferred-centres/recent-teaching/personal-note cards, sign-out CTA.
 *
 * Inline literal font sizes match the prototype; no FontSize tokens used.
 * Per-text fontFamily ties weights to registered Plus Jakarta Sans variants.
 */

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { LotusHero, MeditationFigure } from '@/components/ui/HeroDecorations';
import { DashedDivider } from '@/components/ui/DashedDivider';
import centersData from '@/data/centers.json';

// ─── Static maps (display copy not stored on the profile) ────────────────────

const LANGUAGE_META: Record<string, { flag: string; native?: string }> = {
  Nepali: { flag: '🇳🇵', native: 'नेपाली' },
  English: { flag: '🌐' },
  Hindi: { flag: '🇮🇳' },
  Gujarati: { flag: '🇮🇳' },
  Marathi: { flag: '🇮🇳' },
  Tamil: { flag: '🇮🇳' },
  German: { flag: '🇩🇪' },
  French: { flag: '🇫🇷' },
  Spanish: { flag: '🇪🇸' },
};

const LANGUAGE_NOTES: Record<string, string> = {
  Nepali: 'Dhamma Shringa, Nepal',
  English: 'International courses',
  Hindi: 'Terai & Madhesh',
  Gujarati: 'Secondary',
  Marathi: 'Secondary',
  Tamil: 'Secondary',
  German: 'European courses',
  French: 'European courses',
  Spanish: 'European courses',
};

const AUTH_DESCRIPTIONS: Record<string, string> = {
  '10-Day': 'Standard Vipassana — core authorization',
  '20-Day': 'Advanced — for senior teachers',
  '30-Day': 'Advanced — for senior teachers',
  'Satipatthana Sutta': 'Advanced — post 10-day retreat',
  "Children's Anapana": 'Ages 8–12 · parent consent required',
  'Teen Course': 'Ages 13–17 · supervised setting',
  Executive: 'Shortened format · corporate groups',
  '1-Day': 'One-day refresher · old students',
  '3-Day': 'Three-day refresher · old students',
};

const AUTH_EMOJI: Record<string, string> = {
  '10-Day': '🪷',
  '20-Day': '🌿',
  '30-Day': '🌳',
  'Satipatthana Sutta': '📿',
  "Children's Anapana": '👦',
  'Teen Course': '🌱',
  Executive: '💼',
  '1-Day': '☸️',
  '3-Day': '🌸',
};

const RANK_COLORS = [Colors.fo, Colors.sf, Colors.bl];
const REGION_NOTE_BY_RANK = [
  'Home region · Nepali speaker',
  'Second priority region',
  'Eastern & Southern Nepal',
];

const MONTHS_EN = [
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
const MONTHS_NE = [
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

type MonthState = 'available' | 'festival' | 'unavailable';

interface CenterRow {
  id: string;
  name: string;
  region?: string;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function TeacherProfile() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();

  const userId = useAuthStore((s) => s.userId) ?? '';
  const signOut = useAuthStore((s) => s.signOut);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const altLangLabel = language === 'en' ? 'नेपाली' : 'English';

  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);

  const [showAllHistory, setShowAllHistory] = useState(false);

  // ─── Derived: availability state ────────────────────────────────────────────
  const monthStates = useMemo<MonthState[]>(() => {
    const avail = new Set(profile?.availableMonths ?? []);
    const fest = new Set(profile?.festivalMonths ?? []);
    return MONTHS_EN.map((_, i) => {
      if (fest.has(i)) return 'festival';
      if (avail.has(i)) return 'available';
      return 'unavailable';
    });
  }, [profile]);

  const availableCount = monthStates.filter((s) => s === 'available').length;

  // ─── Derived: eligibility ──────────────────────────────────────────────────
  const lastTaught = profile?.teachingHistory?.[0]?.date ?? '';
  const lastTaughtMs = lastTaught ? Date.parse(`${lastTaught} 01`) : NaN;
  const nextEligibleMs = Number.isNaN(lastTaughtMs)
    ? null
    : lastTaughtMs + 21 * 24 * 60 * 60 * 1000;
  const nextEligibleStr = nextEligibleMs
    ? new Date(nextEligibleMs).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  // ─── Derived: centres per preferred region ─────────────────────────────────
  const centersByRegion = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const c of centersData as CenterRow[]) {
      if (!c.region) continue;
      if (!m.has(c.region)) m.set(c.region, []);
      m.get(c.region)!.push(c.name);
    }
    return m;
  }, []);

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.cr }}>
        <StatusBar barStyle="light-content" />
      </View>
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const cycleMonth = (idx: number) => {
    const next: MonthState =
      monthStates[idx] === 'available'
        ? 'festival'
        : monthStates[idx] === 'festival'
          ? 'unavailable'
          : 'available';
    persistMonths(idx, next);
  };

  const setMonthFestival = (idx: number) => persistMonths(idx, 'festival');

  const resetMonths = () => {
    setProfile({
      ...profile,
      availableMonths: [],
      festivalMonths: [],
    });
  };

  const persistMonths = (idx: number, state: MonthState) => {
    const newStates = [...monthStates];
    newStates[idx] = state;
    setProfile({
      ...profile,
      availableMonths: newStates.map((s, i) => (s === 'available' ? i : -1)).filter((i) => i >= 0),
      festivalMonths: newStates.map((s, i) => (s === 'festival' ? i : -1)).filter((i) => i >= 0),
    });
  };

  const onSignOut = () => {
    confirm({
      title: t('profile.signout_confirm_title'),
      message: t('profile.signout_confirm_message'),
      confirmText: t('common.signOut'),
      destructive: true,
      onConfirm: async () => {
        await signOut();
        router.replace(Routes.login);
      },
    });
  };

  // ─── Render helpers ────────────────────────────────────────────────────────
  const activeLanguages = Object.entries(profile.languages).filter(
    ([, level]) => level === 'primary' || level === 'secondary',
  );

  const yearsActive =
    profile.authorizedSince && profile.authorizedSince > 0
      ? new Date().getFullYear() - profile.authorizedSince
      : 0;

  const monthLabels = language === 'ne' ? MONTHS_NE : MONTHS_EN;

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#6B3600', Colors.sf] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.hero, { paddingTop: Math.max(56, insets.top + 14) }]}
        >
          <MeditationFigure size={130} color="rgba(255,255,255,0.1)" />
          <LotusHero color="white" opacity={0.07} size={180} right={-20} bottom={-20} />

          {/* Lang + Edit pills */}
          <View style={s.heroPillRow}>
            <TouchableOpacity
              onPress={() => setLanguage(language === 'en' ? 'ne' : 'en')}
              activeOpacity={0.85}
              style={s.heroPill}
            >
              <Text style={s.heroPillText}>🌐 {altLangLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(Routes.teacherProfileEdit)}
              activeOpacity={0.85}
              style={s.heroPill}
            >
              <Text style={s.heroPillText}>✏️ {t('profile.edit')}</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar + name */}
          <View style={s.heroIdentityRow}>
            <View style={s.heroAvatar}>
              <Text style={s.heroAvatarEmoji}>🧘</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.heroName}>{profile.name}</Text>
              <Text style={s.heroSub}>
                {t('profile.role_at')} · {profile.region || 'Nepal'} {profile.flag ?? '🇳🇵'}
              </Text>
              <Text style={s.heroMeta}>
                🔒 {t('profile.authorized_since', { year: profile.authorizedSince })} ·{' '}
                {profile.gender === 'F' ? t('profile.female_at') : t('profile.male_at')}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={s.heroStatsRow}>
            <StatTile value={profile.totalCourses} label={t('profile.stat_total')} />
            <StatTile value={profile.centersServed} label={t('profile.stat_centers')} />
            <StatTile value={yearsActive} label={t('profile.stat_years')} />
            <StatTile value={profile.coursesThisYear} label={t('profile.stat_this_year')} />
          </View>
        </LinearGradient>

        {/* ── Eligibility card ──────────────────────────────────────────── */}
        <View style={s.eligWrap}>
          <View style={s.eligCard}>
            <View style={s.eligIconTile}>
              <Text style={s.eligIconEmoji}>✅</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.eligTitle}>{t('profile.eligible_title')}</Text>
              <Text style={s.eligSub}>
                {lastTaught
                  ? t('profile.eligible_sub', { lastTaught })
                  : t('profile.eligible_sub_none')}
              </Text>
              {nextEligibleStr ? (
                <Text style={s.eligNext}>
                  {t('profile.eligible_next', { date: nextEligibleStr })}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── Availability ──────────────────────────────────────────────── */}
        <Text style={s.sph}>
          📅 {t('profile.availability', { year: new Date().getFullYear() })}
        </Text>
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
            {MONTHS_EN.map((_, i) => {
              const state = monthStates[i];
              return (
                <MonthTile
                  key={i}
                  label={monthLabels[i]}
                  state={state}
                  onPress={() => cycleMonth(i)}
                />
              );
            })}
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
            <FestivalChip label={t('profile.block_buddha')} onPress={() => setMonthFestival(4)} />
            <FestivalChip label={t('profile.block_dashain')} onPress={() => setMonthFestival(9)} />
            <FestivalChip label={t('profile.block_tihar')} onPress={() => setMonthFestival(10)} />
            <ResetChip label={t('profile.reset_av')} onPress={resetMonths} />
          </View>
        </View>

        {/* ── Languages ─────────────────────────────────────────────────── */}
        <Text style={s.sph}>🗣 {t('profile.languages')}</Text>
        <View style={s.card}>
          <Text style={s.cardLabel}>{t('profile.can_conduct')}</Text>
          {activeLanguages.map(([lang, level]) => {
            const meta = LANGUAGE_META[lang] ?? { flag: '🌐' };
            const note = LANGUAGE_NOTES[lang] ?? '';
            const isPrimary = level === 'primary';
            const display = meta.native ? `${lang} (${meta.native})` : lang;
            return (
              <View key={lang} style={s.langRow}>
                <View
                  style={[s.langTile, { backgroundColor: isPrimary ? Colors.fol : Colors.cr2 }]}
                >
                  <Text style={s.langTileText}>{meta.flag}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.langName}>{display}</Text>
                  <Text style={s.langNote}>{note}</Text>
                </View>
                <View
                  style={[
                    s.levelChip,
                    isPrimary ? { backgroundColor: Colors.fol } : { backgroundColor: Colors.cr2 },
                  ]}
                >
                  <Text style={[s.levelChipText, { color: isPrimary ? Colors.fo : Colors.tx2 }]}>
                    {isPrimary ? `★ ${t('profile.primary')}` : t('profile.secondary')}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Authorizations ────────────────────────────────────────────── */}
        <View style={s.sphRow}>
          <Text style={s.sphText}>🎓 {t('profile.authorizations')}</Text>
          <Text style={s.sphSubtle}>· 🔒 {t('profile.locked_short')}</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardLabel}>{t('profile.authorized_to_teach')}</Text>
          {(profile.authorizations ?? []).map((courseType) => (
            <View key={courseType} style={s.authRow}>
              <View style={s.authTile}>
                <Text style={s.authTileEmoji}>{AUTH_EMOJI[courseType] ?? '🪷'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.authLabel}>{courseType}</Text>
                <Text style={s.authDesc}>{AUTH_DESCRIPTIONS[courseType] ?? ''}</Text>
              </View>
              <View style={s.authCheckCircle}>
                <CheckIcon />
              </View>
            </View>
          ))}
        </View>

        {/* ── Preferred Centers ─────────────────────────────────────────── */}
        <Text style={s.sph}>📍 {t('profile.preferred_centers')}</Text>
        <View style={s.card}>
          <Text style={s.cardLabel}>{t('profile.will_travel_to')}</Text>
          {(profile.preferredRegions ?? []).slice(0, 3).map((region, i) => {
            const centers = centersByRegion.get(region) ?? [];
            return (
              <View key={region} style={s.prefRow}>
                <View style={[s.prefRankTile, { backgroundColor: RANK_COLORS[i] ?? Colors.fo }]}>
                  <Text style={s.prefRankText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.prefRegion}>
                    {region} {profile.flag ?? '🇳🇵'}
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

        {/* ── Recent Teaching ───────────────────────────────────────────── */}
        <Text style={s.sph}>📖 {t('profile.recent_teaching')}</Text>
        <View style={s.card}>
          {(showAllHistory
            ? (profile.teachingHistory ?? [])
            : (profile.teachingHistory ?? []).slice(0, 3)
          ).map((h, i, arr) => (
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
          {(profile.teachingHistory ?? []).length > 3 ? (
            <TouchableOpacity
              onPress={() => setShowAllHistory((v) => !v)}
              activeOpacity={0.6}
              style={s.historyFooterWrap}
            >
              <Text style={s.historyFooterLink}>
                {showAllHistory
                  ? t('profile.show_less_courses')
                  : t('profile.view_all_courses', { count: profile.totalCourses })}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ── Personal Note ─────────────────────────────────────────────── */}
        <Text style={s.sph}>💬 {t('profile.personal_note')}</Text>
        <View style={[s.card, s.noteCard]}>
          <Text style={s.noteBody}>&ldquo;{profile.personalNote}&rdquo;</Text>
          <Text style={s.noteUpdated}>{t('profile.last_updated', { date: 'Apr 2026' })}</Text>
        </View>

        {/* ── Sign Out ──────────────────────────────────────────────────── */}
        <View style={s.signOutWrap}>
          <TouchableOpacity onPress={onSignOut} activeOpacity={0.85} style={s.signOutBtn}>
            <Text style={s.signOutText}>{t('common.signOut')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <View style={s.statTile}>
      <Text style={s.statNumber}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
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

function CheckIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12L10 17L20 7"
        stroke={Colors.white}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },

  // ── Hero ──
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  heroPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroPillText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  heroIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    position: 'relative',
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroAvatarEmoji: {
    fontSize: 50,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.white,
    lineHeight: 24,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
  },
  heroMeta: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    position: 'relative',
  },
  statTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 9,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.white,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
    lineHeight: 11,
    textAlign: 'center',
  },

  // ── Eligibility ──
  eligWrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  eligCard: {
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
  eligIconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.fo,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  eligIconEmoji: { fontSize: 22 },
  eligTitle: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.fo,
  },
  eligSub: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    marginTop: 2,
  },
  eligNext: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.fo,
    marginTop: 2,
  },

  // ── Section header (.sph) ──
  // Section header typography — used inline inside a flex row (sphRow)
  // so margins are owned by the parent, not the text.
  sphText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
  },
  // Standalone section header (text + its own margins). Used when the
  // header has no right-aligned subtitle.
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
  sphRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    marginBottom: 9,
    paddingHorizontal: 18,
  },
  sphSubtle: {
    fontSize: 9.5,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
    color: Colors.tx3,
  },

  // ── Card base ──
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

  // ── Availability ──
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

  // ── Languages ──
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  langTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  langTileText: { fontSize: 18 },
  langName: {
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  langNote: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 1,
  },
  levelChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  levelChipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // ── Authorizations ──
  authRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  authTile: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: Colors.fol,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  authTileEmoji: { fontSize: 17 },
  authLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  authDesc: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 1,
  },
  authCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.fo,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // ── Preferred Centers ──
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

  // ── Recent Teaching ──
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

  // ── Personal Note ──
  noteCard: {
    backgroundColor: Colors.sfl,
    borderWidth: 1,
    borderColor: Colors.sfm,
  },
  noteBody: {
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx,
    lineHeight: 21,
  },
  noteUpdated: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 8,
  },

  // ── Sign Out ──
  signOutWrap: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 6,
  },
  signOutBtn: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#F5C0BB',
    borderRadius: 13,
    paddingHorizontal: 22,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.ur,
  },
});
