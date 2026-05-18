/**
 * Teacher Onboarding wizard — implements `specs/03-onboarding-teacher.md`.
 *
 * 6 steps (0-indexed):
 *   0 Welcome           — admin-locked profile + intro
 *   1 Languages         — Primary / Secondary / Don't teach cycle
 *   2 Regions           — multi-select chips, ordered selection list
 *   3 Availability      — 12-month grid, 3-state cycle
 *   4 Personal Note     — optional free-text textarea
 *   5 All set           — summary card + "Enter Dhamma AT" persist
 *
 * State lives in `useOnboardingDraftStore` (Zustand) so it survives the
 * per-step route remounts. Persisted to `profileStore` only on step 5.
 *
 * Font sizes are intentional inline literals matching the prototype
 * (11–14 px body) rather than the bumped `FontSize` tokens — see spec
 * §12 "Intentional Deltas".
 */

import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes, routeTo } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTeachersStore } from '@/store/teachersStore';
import { useOnboardingDraftStore, type LangLevel } from '@/store/onboardingDraftStore';
import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import { fromAvailabilityArray } from '@/utils/availability';
import { logger } from '@/utils/logger';
import type { LanguageLevel, AvailabilityState } from '@/types';

const TOTAL_STEPS = 6; // 0..5

export default function OnboardingStep() {
  const { step: stepStr } = useLocalSearchParams<{ step: string }>();
  const step = Math.max(0, Math.min(TOTAL_STEPS - 1, parseInt(stepStr ?? '0', 10)));
  const router = useRouter();

  // Use explicit pushes (rather than router.back) so the navigation works
  // identically on web — where the browser history may not contain prior
  // step URLs if login routed in with `replace`.
  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      router.push(routeTo.onboardingTeacher(step + 1));
    }
  };
  const goBack = () => {
    if (step > 0) {
      router.push(routeTo.onboardingTeacher(step - 1));
    }
  };

  if (step === 0) {
    return <StepWelcome onContinue={goNext} />;
  }
  if (step === 1) {
    return <StepLanguages onBack={goBack} onContinue={goNext} />;
  }
  if (step === 2) {
    return <StepRegions onBack={goBack} onContinue={goNext} />;
  }
  if (step === 3) {
    return <StepAvailability onBack={goBack} onContinue={goNext} />;
  }
  if (step === 4) {
    return <StepNote onBack={goBack} onContinue={goNext} />;
  }
  if (step === 5) {
    return <StepDone />;
  }

  return <StepPlaceholder step={step} onBack={goBack} onContinue={goNext} />;
}

// ─── Shared: StepHero + NavRow ───────────────────────────────────────────────

function StepHero({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const language = useSettingsStore((st) => st.language);
  const setLanguage = useSettingsStore((st) => st.setLanguage);
  const toggleLang = () => setLanguage(language === 'en' ? 'ne' : 'en');
  // Pill always shows the *alternative* language so the action is obvious.
  const altLangLabel = language === 'en' ? 'नेपाली' : 'English';

  return (
    <LinearGradient
      colors={['#6B3600', Colors.sf] as [string, string]}
      start={GradientDirection.hero.start}
      end={GradientDirection.hero.end}
      style={[s.stepHero, { paddingTop: Math.max(56, insets.top + 12) }]}
    >
      <LotusHero color="white" opacity={0.08} size={200} right={-30} bottom={-30} />
      <MountainSilhouette color="rgba(255,255,255,0.07)" />
      <View style={s.heroTopRow}>
        <Text style={s.stepCounter}>
          {t('onboarding.teacher.step_counter', { step, total: TOTAL_STEPS - 2 })}
        </Text>
        <TouchableOpacity
          onPress={toggleLang}
          activeOpacity={0.7}
          style={s.langTogglePill}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Toggle language"
        >
          <Text style={s.langToggleText}>🌐 {altLangLabel}</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.stepTitle}>{title}</Text>
      <Text style={s.stepSub}>{subtitle}</Text>
      <View style={s.progressRow}>
        {Array.from({ length: TOTAL_STEPS - 2 }).map((_, i) => (
          <View
            key={i}
            style={[
              s.progressSeg,
              {
                backgroundColor: i <= step - 1 ? Colors.white : 'rgba(255,255,255,0.25)',
              },
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

function NavRow({
  onBack,
  onContinue,
  continueDisabled,
  continueLabel,
}: {
  onBack: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View style={[s.navRow, { paddingBottom: insets.bottom + 24 }]}>
      <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
        <Text style={s.backBtnText}>← {t('common.back')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.85}
        disabled={continueDisabled}
        style={[s.continueBtnWrap, continueDisabled && s.continueDisabled]}
      >
        <LinearGradient
          colors={Gradients.primaryCta as unknown as [string, string, ...string[]]}
          start={GradientDirection.button.start}
          end={GradientDirection.button.end}
          style={s.continueBtn}
        >
          <Text style={s.continueBtnText}>{continueLabel ?? `${t('common.continue')} →`}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 1: Languages ───────────────────────────────────────────────────────

const LANG_KEYS = ['Nepali', 'English', 'Hindi', 'Gujarati', 'German'];

function StepLanguages({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const { t } = useTranslation();
  const langs = useOnboardingDraftStore((d) => d.langs);
  const cycleLang = useOnboardingDraftStore((d) => d.cycleLang);

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={s.flex}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <StepHero
          step={1}
          title={t('onboarding.teacher.step1.title')}
          subtitle={t('onboarding.teacher.step1.subtitle')}
        />
        <View style={s.langCard}>
          {LANG_KEYS.map((key, idx) => {
            const level: LangLevel = langs[key] ?? 'off';
            const tone =
              level === 'primary'
                ? {
                    bg: Colors.fol,
                    color: Colors.fo,
                    icon: '★',
                    chipBg: Colors.fol,
                    chipColor: Colors.fo,
                  }
                : level === 'secondary'
                  ? {
                      bg: Colors.gdl,
                      color: Colors.gd,
                      icon: '·',
                      chipBg: Colors.gdl,
                      chipColor: Colors.gd,
                    }
                  : {
                      bg: Colors.cr2,
                      color: Colors.tx3,
                      icon: '✗',
                      chipBg: Colors.cr2,
                      chipColor: Colors.tx3,
                    };
            const labelKey = `onboarding.teacher.step1.${level}`;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => cycleLang(key)}
                activeOpacity={0.7}
                style={[s.langRow, idx < LANG_KEYS.length - 1 && s.langRowBorder]}
              >
                <View style={[s.langBadge, { backgroundColor: tone.bg }]}>
                  <Text style={[s.langBadgeIcon, { color: tone.color }]}>{tone.icon}</Text>
                </View>
                <Text style={[s.langName, { color: level === 'off' ? Colors.tx3 : Colors.tx }]}>
                  {key}
                </Text>
                <View style={[s.langChip, { backgroundColor: tone.chipBg }]}>
                  <Text style={[s.langChipText, { color: tone.chipColor }]}>{t(labelKey)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <NavRow onBack={onBack} onContinue={onContinue} />
      </ScrollView>
    </View>
  );
}

// ─── Step 2: Regions ─────────────────────────────────────────────────────────

const REGION_KEYS = [
  'kathmandu_valley',
  'pokhara',
  'lumbini_terai',
  'koshi',
  'gandaki',
  'madhesh',
  'international',
];

function StepRegions({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const { t } = useTranslation();
  const regions = useOnboardingDraftStore((d) => d.regions);
  const toggleRegion = useOnboardingDraftStore((d) => d.toggleRegion);
  const canContinue = regions.length > 0;

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={s.flex}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <StepHero
          step={2}
          title={t('onboarding.teacher.step2.title')}
          subtitle={t('onboarding.teacher.step2.subtitle')}
        />

        {/* Chip row */}
        <View style={s.regionChipRow}>
          {REGION_KEYS.map((key) => {
            const label = t(`onboarding.teacher.step2.regions.${key}`);
            const on = regions.includes(key);
            return (
              <TouchableOpacity
                key={key}
                onPress={() => toggleRegion(key)}
                activeOpacity={0.7}
                style={[s.regionChip, on && s.regionChipOn]}
              >
                <Text style={[s.regionChipText, on && s.regionChipTextOn]}>
                  {on ? '✓ ' : '+ '}
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected card */}
        {regions.length > 0 ? (
          <View style={s.selectedCard}>
            <Text style={s.selectedLabel}>{t('onboarding.teacher.step2.selected_label')}</Text>
            {regions.map((r, i) => (
              <View key={r} style={[s.selectedRow, i < regions.length - 1 && s.selectedRowBorder]}>
                <View style={s.selectedBadge}>
                  <Text style={s.selectedBadgeText}>{i + 1}</Text>
                </View>
                <Text style={s.selectedRowText}>{t(`onboarding.teacher.step2.regions.${r}`)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={s.regionEmptyHint}>{t('onboarding.teacher.step2.empty_hint')}</Text>
        )}

        <NavRow onBack={onBack} onContinue={onContinue} continueDisabled={!canContinue} />
      </ScrollView>
    </View>
  );
}

// ─── Step 3: Availability ────────────────────────────────────────────────────

function StepAvailability({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const { t, i18n: i18nInst } = useTranslation();
  const av = useOnboardingDraftStore((d) => d.av);
  const cycleMonth = useOnboardingDraftStore((d) => d.cycleMonth);

  const months = (i18nInst.t('onboarding.teacher.step3.months_short', { returnObjects: true }) ??
    []) as string[];
  const availableCount = av.filter((v) => v === 1).length;
  const festivalCount = av.filter((v) => v === 'f').length;

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={s.flex}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <StepHero
          step={3}
          title={t('onboarding.teacher.step3.title')}
          subtitle={t('onboarding.teacher.step3.subtitle')}
        />

        <View style={s.avCard}>
          <View style={s.avSummary}>
            <Text style={[s.avSummaryStrong, { color: Colors.fo }]}>
              {t('onboarding.teacher.step3.summary_available', { count: availableCount })}
            </Text>
            {festivalCount > 0 && (
              <Text style={[s.avSummarySoft]}>
                {' · '}
                <Text style={{ color: Colors.gd, fontWeight: '700' }}>
                  {t('onboarding.teacher.step3.summary_festival', { count: festivalCount })}
                </Text>
              </Text>
            )}
          </View>

          {[0, 6].map((rowStart) => (
            <View key={rowStart} style={s.avGridRow}>
              {Array.from({ length: 6 }).map((_, j) => {
                const i = rowStart + j;
                const state = av[i];
                const tone =
                  state === 1
                    ? { bg: Colors.fo, fg: Colors.white, glyph: '✓' }
                    : state === 'f'
                      ? { bg: Colors.gd, fg: Colors.white, glyph: '🎑' }
                      : { bg: Colors.cr3, fg: Colors.tx3, glyph: '✗' };
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => cycleMonth(i)}
                    activeOpacity={0.75}
                    style={[s.avCell, { backgroundColor: tone.bg }, state === 0 && s.avCellEmpty]}
                  >
                    <Text style={[s.avCellMonth, { color: tone.fg }]}>{months[i] ?? ''}</Text>
                    <Text style={[s.avCellGlyph, { color: tone.fg }]}>{tone.glyph}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <Text style={s.avHint}>{t('onboarding.teacher.step3.tap_hint')}</Text>
        </View>

        <NavRow onBack={onBack} onContinue={onContinue} />
      </ScrollView>
    </View>
  );
}

// ─── Step 4: Personal Note ───────────────────────────────────────────────────

function StepNote({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const { t } = useTranslation();
  const note = useOnboardingDraftStore((d) => d.note);
  const setNote = useOnboardingDraftStore((d) => d.setNote);

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.flex, { backgroundColor: Colors.cr }]}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepHero
            step={4}
            title={t('onboarding.teacher.step4.title')}
            subtitle={t('onboarding.teacher.step4.subtitle')}
          />

          <View style={s.noteCard}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={t('onboarding.teacher.step4.placeholder')}
              placeholderTextColor={Colors.tx3}
              style={s.noteInput}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoCapitalize="sentences"
            />
          </View>

          <NavRow onBack={onBack} onContinue={onContinue} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Step 0: Welcome ─────────────────────────────────────────────────────────

function StepWelcome({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.userId);
  const findTeacher = useTeachersStore((s) => s.findTeacher);
  const teacher = useMemo(() => (userId ? findTeacher(userId) : undefined), [userId, findTeacher]);

  const nameGenderValue = teacher
    ? `${teacher.name} · ${teacher.gender === 'M' ? 'Male AT' : 'Female AT'}`
    : '—';
  const authorizationsValue = teacher?.authorizations?.length
    ? teacher.authorizations.join(', ')
    : '—';
  const sinceValue = teacher?.authorizedSince ? String(teacher.authorizedSince) : '—';
  const homeRegionValue = teacher
    ? `${teacher.preferredRegions?.[0] ?? 'Nepal'} · ${teacher.region ?? 'Nepal'} ${teacher.flag ?? '🇳🇵'}`
    : '—';

  const fields: { icon: string; labelKey: string; value: string }[] = [
    { icon: '👤', labelKey: 'onboarding.teacher.step0.field_name_gender', value: nameGenderValue },
    {
      icon: '🎓',
      labelKey: 'onboarding.teacher.step0.field_authorizations',
      value: authorizationsValue,
    },
    { icon: '📅', labelKey: 'onboarding.teacher.step0.field_since', value: sinceValue },
    {
      icon: '🏠',
      labelKey: 'onboarding.teacher.step0.field_home_region',
      value: homeRegionValue,
    },
  ];

  return (
    <View style={s.flex}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={s.flex}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={Gradients.teacher as unknown as [string, string, ...string[]]}
          start={GradientDirection.hero.start}
          end={GradientDirection.hero.end}
          style={[s.welcomeHero, { paddingTop: Math.max(70, insets.top + 22) }]}
        >
          <LotusHero color="white" opacity={0.12} size={300} right={-60} bottom={-60} />
          <MountainSilhouette color="rgba(255,255,255,0.08)" />
          <Text style={s.welcomeNamaste}>🙏</Text>
          <Text style={s.welcomeTitleEn}>{t('onboarding.teacher.step0.title_en')}</Text>
          <Text style={s.welcomeTitleNe}>{t('onboarding.teacher.step0.title_ne')}</Text>
          <Text style={s.welcomeSub}>{t('onboarding.teacher.step0.subtitle')}</Text>
        </LinearGradient>

        {/* Admin-locked card */}
        <View style={s.cardWrap}>
          <View style={s.adminCard}>
            <Text style={s.adminSectionLabel}>{t('onboarding.teacher.step0.admin_section')}</Text>
            {fields.map((f) => (
              <View key={f.labelKey} style={[s.adminRow, s.adminRowBorder]}>
                <Text style={s.adminIcon}>{f.icon}</Text>
                <View style={s.adminTextWrap}>
                  <Text style={s.adminFieldLabel}>{t(f.labelKey)}</Text>
                  <Text style={s.adminFieldValue}>{f.value}</Text>
                </View>
              </View>
            ))}
            <Text style={s.adminTail}>{t('onboarding.teacher.step0.card_tail')}</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={s.ctaWrap}>
          <TouchableOpacity onPress={onContinue} activeOpacity={0.85} style={s.ctaTouchable}>
            <LinearGradient
              colors={Gradients.primaryCta as unknown as [string, string, ...string[]]}
              start={GradientDirection.button.start}
              end={GradientDirection.button.end}
              style={s.ctaBtn}
            >
              <Text style={s.ctaText}>{t('common.continue')} →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 + insets.bottom }} />
      </ScrollView>
    </View>
  );
}

// ─── Step 5: Done / All set ──────────────────────────────────────────────────

const REGION_LABELS: Record<string, string> = {
  kathmandu_valley: 'Kathmandu Valley',
  pokhara: 'Pokhara',
  lumbini_terai: 'Lumbini & Terai',
  koshi: 'Koshi',
  gandaki: 'Gandaki',
  madhesh: 'Madhesh',
  international: 'International',
};

function StepDone() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userId = useAuthStore((st) => st.userId);
  const setOnboarded = useAuthStore((st) => st.setOnboarded);
  const { loadProfile, updateProfile } = useProfileStore();
  const draft = useOnboardingDraftStore();
  const resetDraft = useOnboardingDraftStore((d) => d.reset);

  const activeLangs = Object.entries(draft.langs).filter(([, lvl]) => lvl !== 'off');
  const langsSummary = activeLangs.map(([k, lvl]) => (lvl === 'primary' ? `${k} ★` : k)).join(', ');

  const regionsSummary = draft.regions.map((k) => REGION_LABELS[k] ?? k).join(' › ');

  const monthsCount = draft.av.filter((v) => v === 1).length;
  const festivalCount = draft.av.filter((v) => v === 'f').length;
  const availSummary =
    festivalCount > 0
      ? t('onboarding.teacher.step5.summary_avail_template', {
          months: monthsCount,
          festivals: festivalCount,
        })
      : t('onboarding.teacher.step5.summary_avail_no_festival', { months: monthsCount });

  const noteSummary = draft.note.trim()
    ? draft.note.length > 50
      ? draft.note.slice(0, 50) + '…'
      : draft.note
    : t('onboarding.teacher.step5.summary_note_empty');

  const handleEnter = async () => {
    try {
      if (userId) await loadProfile(userId);
      const { availableMonths, festivalMonths } = fromAvailabilityArray(
        draft.av as unknown as AvailabilityState[],
      );
      await updateProfile({
        languages: draft.langs as Record<string, LanguageLevel>,
        preferredRegions: draft.regions.map((k) => REGION_LABELS[k] ?? k),
        availableMonths,
        festivalMonths,
        personalNote: draft.note,
        isOnboarded: true,
      });
      await setOnboarded(true);
      resetDraft();
      router.replace(Routes.teacherHome);
    } catch (err) {
      logger.warn('[onboarding] failed to persist profile', err);
    }
  };

  const rows: { icon: string; labelKey: string; value: string }[] = [
    {
      icon: '🗣',
      labelKey: 'onboarding.teacher.step5.summary_langs_label',
      value: langsSummary || '—',
    },
    {
      icon: '📍',
      labelKey: 'onboarding.teacher.step5.summary_regions_label',
      value: regionsSummary || '—',
    },
    { icon: '📅', labelKey: 'onboarding.teacher.step5.summary_avail_label', value: availSummary },
    { icon: '💬', labelKey: 'onboarding.teacher.step5.summary_note_label', value: noteSummary },
  ];

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={s.flex}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Forest hero — distinct from the saffron StepHero */}
        <LinearGradient
          colors={['#1C4228', Colors.fo] as [string, string]}
          start={GradientDirection.hero.start}
          end={GradientDirection.hero.end}
          style={[s.doneHero, { paddingTop: Math.max(80, insets.top + 36) }]}
        >
          <LotusHero color="white" opacity={0.12} size={320} right={-70} bottom={-70} />
          <MountainSilhouette color="rgba(255,255,255,0.09)" />
          <Text style={s.doneNamaste}>🙏</Text>
          <Text style={s.doneTitle}>{t('onboarding.teacher.step5.title')}</Text>
          <Text style={s.doneSub}>{t('onboarding.teacher.step5.subtitle')}</Text>
        </LinearGradient>

        {/* Summary card */}
        <View style={s.cardWrap}>
          <View style={s.adminCard}>
            {rows.map((r) => (
              <View key={r.labelKey} style={[s.adminRow, s.adminRowBorder]}>
                <Text style={s.adminIcon}>{r.icon}</Text>
                <View style={s.adminTextWrap}>
                  <Text style={s.adminFieldLabel}>{t(r.labelKey)}</Text>
                  <Text style={s.adminFieldValue}>{r.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Single CTA — full-width, saffron gradient like the prototype `.btn.pr` */}
        <View style={s.doneCtaWrap}>
          <TouchableOpacity onPress={handleEnter} activeOpacity={0.85}>
            <LinearGradient
              colors={Gradients.primaryCta as unknown as [string, string, ...string[]]}
              start={GradientDirection.button.start}
              end={GradientDirection.button.end}
              style={s.doneCtaBtn}
            >
              <Text style={s.doneCtaText}>{t('onboarding.teacher.step5.enter_app')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 + insets.bottom }} />
      </ScrollView>
    </View>
  );
}

// ─── Step 1..5: placeholder (to be filled in step-by-step) ───────────────────

function StepPlaceholder({
  step,
  onBack,
  onContinue,
}: {
  step: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  const router = useRouter();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const isLast = step === TOTAL_STEPS - 1;

  const handleFinish = async () => {
    await setOnboarded(true);
    router.replace(Routes.teacherHome);
  };

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={s.flex}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <StepHero
          step={step}
          title={`Step ${step} — coming next`}
          subtitle="This step will be implemented in the next iteration."
        />
        <View style={{ flex: 1, minHeight: 120 }} />
        <NavRow
          onBack={onBack}
          onContinue={isLast ? handleFinish : onContinue}
          continueLabel={isLast ? '✓ Enter Dhamma Nepal' : undefined}
        />
      </ScrollView>
    </View>
  );
}

// ─── Styles — inline literal sizes match prototype (spec §12) ────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, backgroundColor: Colors.cr },

  // Welcome hero (step 0)
  welcomeHero: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
  },
  welcomeNamaste: {
    fontSize: 54,
    marginBottom: 14,
  },
  welcomeTitleEn: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 30,
    textAlign: 'center',
  },
  welcomeTitleNe: {
    fontSize: 21,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    fontFamily: FontFamily.devanagariBold,
    marginTop: 6,
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 14,
    lineHeight: 21,
    maxWidth: 300,
    textAlign: 'center',
  },

  // Admin-locked card
  cardWrap: { paddingHorizontal: 18, paddingTop: 22 },
  adminCard: {
    backgroundColor: Colors.fol,
    borderWidth: 1,
    borderColor: Colors.fom,
    borderRadius: 14,
    padding: 14,
  },
  adminSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.fo,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  adminRow: {
    flexDirection: 'row',
    gap: 11,
    paddingVertical: 7,
    alignItems: 'flex-start',
  },
  adminRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.fom,
    borderStyle: 'dashed',
  },
  adminIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  adminTextWrap: { flex: 1 },
  adminFieldLabel: {
    fontSize: 11,
    color: Colors.tx3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  adminFieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.tx,
    marginTop: 1,
  },
  adminTail: {
    fontSize: 11,
    color: Colors.tx3,
    fontStyle: 'italic',
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 10,
  },

  // Welcome CTA — generous gap below the card
  ctaWrap: { paddingHorizontal: 18, paddingTop: 32 },
  ctaTouchable: { borderRadius: 14, overflow: 'hidden' },
  ctaBtn: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // Step 5: Done CTA — prototype .btn.pr style (full width, 15 px padding, 15 px font, radius 13)
  doneCtaWrap: {
    paddingHorizontal: 18,
    paddingTop: 32,
  },
  doneCtaBtn: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCtaText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // Step 5: Done
  doneHero: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
  },
  doneNamaste: {
    fontSize: 64,
    marginBottom: 14,
  },
  doneTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 30,
    textAlign: 'center',
  },
  doneSub: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 14,
    lineHeight: 21,
    maxWidth: 300,
    textAlign: 'center',
  },

  // Step 4: Personal Note
  noteCard: {
    margin: 18,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
  },
  noteInput: {
    fontSize: 14,
    color: Colors.tx,
    lineHeight: 21,
    minHeight: 140,
    textAlignVertical: 'top',
    fontFamily: FontFamily.sans,
  },

  // Step 3: Availability
  avCard: {
    margin: 18,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
  },
  avSummary: {
    fontSize: 12,
    color: Colors.tx2,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  avSummaryStrong: {
    fontSize: 12,
    fontWeight: '700',
  },
  avSummarySoft: {
    fontSize: 12,
    color: Colors.tx2,
  },
  avGridRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 5,
  },
  avCell: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  avCellEmpty: {
    borderWidth: 1.5,
    borderColor: Colors.bd,
  },
  avCellMonth: {
    fontSize: 10,
    fontWeight: '700',
  },
  avCellGlyph: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.9,
  },
  avHint: {
    fontSize: 10.5,
    color: Colors.tx3,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },

  // Step 2: Regions
  regionChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 8,
  },
  regionChip: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  regionChipOn: {
    backgroundColor: Colors.sf,
    borderColor: Colors.sf,
  },
  regionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.tx2,
  },
  regionChipTextOn: {
    color: Colors.white,
  },
  selectedCard: {
    margin: 18,
    marginTop: 14,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
  },
  selectedLabel: {
    fontSize: 11,
    color: Colors.tx3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 7,
  },
  selectedRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: Colors.sf,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  selectedRowText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.tx,
    flex: 1,
  },
  regionEmptyHint: {
    fontSize: 12,
    color: Colors.tx3,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 14,
    marginHorizontal: 18,
  },

  // Step 1: Languages card
  langCard: {
    margin: 18,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
  },
  langRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  langBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBadgeIcon: {
    fontSize: 16,
    fontWeight: '800',
  },
  langName: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
  },
  langChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  langChipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // StepHero (steps 1..5)
  stepHero: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepCounter: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.66,
  },
  langTogglePill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 4,
    paddingHorizontal: 11,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  langToggleText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.white,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 26,
  },
  stepSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 6,
    lineHeight: 20,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 18,
  },
  progressSeg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },

  // NavRow — matches prototype `.btn.sm` (padding 7 15, font 12.5, radius 10)
  // wrapper padding 18 18 6 per app.html:1749
  navRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 9,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 15,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.bd2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.tx,
  },
  continueBtnWrap: { flex: 2 },
  continueDisabled: { opacity: 0.45 },
  continueBtn: {
    paddingVertical: 11,
    paddingHorizontal: 15,
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
});
