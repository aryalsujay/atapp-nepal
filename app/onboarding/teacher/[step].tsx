/**
 * Teacher Onboarding wizard — implements `specs/03-onboarding-teacher.md`.
 *
 * 6 steps (0-indexed) — Welcome (0) · Languages (1) · Regions (2) ·
 * Availability (3) · Personal Note (4) · Done (5).
 *
 * Font sizes are intentionally inline literals matching the prototype
 * (11–14 px body) rather than the bumped `FontSize` tokens, per the
 * spec §12 "Intentional Deltas" — this flow is meant to feel visually
 * identical to the prototype.
 *
 * Step 0 is fully implemented. Steps 1–5 are placeholders that just
 * advance/retreat through the wizard; they will be filled in
 * iteratively (one screen review per step).
 */

import React, { useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes, routeTo } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { useTeachersStore } from '@/store/teachersStore';
import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';

const TOTAL_STEPS = 6; // 0..5

export default function OnboardingStep() {
  const { step: stepStr } = useLocalSearchParams<{ step: string }>();
  const step = Math.max(0, Math.min(TOTAL_STEPS - 1, parseInt(stepStr ?? '0', 10)));
  const router = useRouter();

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      router.push(routeTo.onboardingTeacher(step + 1));
    }
  };
  const goBack = () => {
    if (step > 0) router.back();
  };

  if (step === 0) {
    return <StepWelcome onContinue={goNext} />;
  }

  return <StepPlaceholder step={step} onBack={goBack} onContinue={goNext} />;
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
            {fields.map((f, idx) => (
              <View
                key={f.labelKey}
                style={[s.adminRow, idx < fields.length - 1 && s.adminRowBorder]}
              >
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
              <Text style={s.ctaText}>{t('common.continue')}</Text>
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
  const insets = useSafeAreaInsets();
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
      <LinearGradient
        colors={['#6B3600', Colors.sf] as [string, string]}
        start={GradientDirection.hero.start}
        end={GradientDirection.hero.end}
        style={[s.stepHero, { paddingTop: Math.max(56, insets.top + 12) }]}
      >
        <LotusHero color="white" opacity={0.08} size={200} right={-30} bottom={-30} />
        <MountainSilhouette color="rgba(255,255,255,0.07)" />
        <Text style={s.stepCounter}>
          STEP {step} OF {TOTAL_STEPS - 1}
        </Text>
        <Text style={s.stepTitle}>Step {step} — coming next</Text>
        <Text style={s.stepSub}>This step will be implemented in the next iteration.</Text>
        <View style={s.progressRow}>
          {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
            <View
              key={i}
              style={[
                s.progressSeg,
                { backgroundColor: i <= step - 1 ? Colors.white : 'rgba(255,255,255,0.25)' },
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      <View style={{ flex: 1 }} />

      <View style={[s.navRow, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isLast ? handleFinish : onContinue}
          activeOpacity={0.85}
          style={s.continueBtnWrap}
        >
          <LinearGradient
            colors={Gradients.primaryCta as unknown as [string, string, ...string[]]}
            start={GradientDirection.button.start}
            end={GradientDirection.button.end}
            style={s.continueBtn}
          >
            <Text style={s.continueBtnText}>{isLast ? '✓ Enter Dhamma AT' : 'Continue →'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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

  // Welcome CTA
  ctaWrap: { paddingHorizontal: 18, paddingTop: 14 },
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

  // Placeholder StepHero (steps 1..5)
  stepHero: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  stepCounter: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    marginBottom: 14,
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

  // Placeholder NavRow
  navRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 9,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx2,
  },
  continueBtnWrap: { flex: 2, borderRadius: 12, overflow: 'hidden' },
  continueBtn: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
