/**
 * Teacher Profile — implements `specs/09-teacher-profile.md`.
 *
 * Prototype-faithful port of `app.html:1385–1582`. Orange-gradient hero
 * with meditation figure + lotus + 4 stat tiles, eligibility status card,
 * tappable month grid with festival quick-chips, languages/authorizations/
 * preferred-centres/recent-teaching/personal-note cards, sign-out CTA.
 *
 * Phase 3 refactor: section UI lives in `src/components/teacher/profile/`.
 * This file owns derived state (availability map, eligibility window,
 * centres-by-region map) plus the mutation handlers that touch the
 * profile store, and orchestrates the scroll layout. ~270 lines instead
 * of 1176.
 */

import React, { useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Colors } from '@/theme/colors';
import centersData from '@/data/centers.json';
import {
  AvailabilityCalendar,
  CourseAuthorizationsList,
  EligibilityCard,
  LanguagesSection,
  MONTHS_EN,
  MONTHS_NE,
  PersonalNoteCard,
  PreferredCentersSection,
  ProfileHero,
  RecentTeachingSection,
  SignOutButton,
  type MonthState,
} from '@/components/teacher/profile';

interface CenterRow {
  id: string;
  name: string;
  region?: string;
}

export default function TeacherProfile() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();

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
  const persistMonths = (idx: number, state: MonthState) => {
    const newStates = [...monthStates];
    newStates[idx] = state;
    setProfile({
      ...profile,
      availableMonths: newStates.map((s, i) => (s === 'available' ? i : -1)).filter((i) => i >= 0),
      festivalMonths: newStates.map((s, i) => (s === 'festival' ? i : -1)).filter((i) => i >= 0),
    });
  };

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

  // ─── Derived: presentation slices ──────────────────────────────────────────
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
        <ProfileHero
          profile={profile}
          yearsActive={yearsActive}
          altLangLabel={altLangLabel}
          topInset={insets.top}
          onToggleLanguage={() => setLanguage(language === 'en' ? 'ne' : 'en')}
          onPressEdit={() => router.push(Routes.teacherProfileEdit)}
        />

        <EligibilityCard lastTaught={lastTaught} nextEligibleStr={nextEligibleStr} />

        <AvailabilityCalendar
          monthLabels={monthLabels}
          monthStates={monthStates}
          availableCount={availableCount}
          onCycleMonth={cycleMonth}
          onSetFestival={setMonthFestival}
          onReset={resetMonths}
        />

        <LanguagesSection activeLanguages={activeLanguages} />

        <CourseAuthorizationsList authorizations={profile.authorizations ?? []} />

        <PreferredCentersSection
          preferredRegions={profile.preferredRegions ?? []}
          centersByRegion={centersByRegion}
          flag={profile.flag}
        />

        <RecentTeachingSection
          history={profile.teachingHistory ?? []}
          totalCourses={profile.totalCourses}
          showAll={showAllHistory}
          onToggleShowAll={() => setShowAllHistory((v) => !v)}
        />

        <PersonalNoteCard note={profile.personalNote} updatedAt={profile.personalNoteUpdatedAt} />

        <SignOutButton onPress={onSignOut} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
});
