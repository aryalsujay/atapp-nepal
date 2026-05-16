/**
 * Server Onboarding — implements `specs/12-server-onboarding.md`.
 *
 * Prototype-faithful port of `app.html:2973–3075`. 5-question yes/no
 * wizard with a top progress bar; on completion either routes to the
 * server dashboard (all yes) or shows the blocked path with "Review
 * answers" + "Continue anyway" CTAs (any no).
 *
 * Inline literal font sizes match the prototype; no FontSize tokens used.
 * Per-text fontFamily ties weights to registered Plus Jakarta Sans variants.
 */

import React, { useState } from 'react';
import {
  Image,
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
import { useSettingsStore } from '@/store/settingsStore';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import { DashedDivider } from '@/components/ui/DashedDivider';

type Answer = 'yes' | 'no';

const DHAMMA_WHEEL = require('../../assets/logo-dhamma.gif');

// `icon` is either an emoji string (rendered as Text) or the sentinel
// 'wheel' which renders the animated dhamma-wheel GIF instead. The recap
// row maps 'wheel' → ☸️ so a tiny static glyph stays inline with text.
const QUESTIONS = [
  { key: 'q1', icon: '🪷' },
  { key: 'q2', icon: 'wheel' },
  { key: 'q3', icon: '📅' },
  { key: 'q4', icon: '💚' },
  { key: 'q5', icon: '📜' },
] as const;
type QKey = (typeof QUESTIONS)[number]['key'];

function inlineGlyph(icon: string): string {
  return icon === 'wheel' ? '☸️' : icon;
}

const YES_FG = '#9B6B14';
const YES_BG = '#FBF0E0';
const NO_FG = '#B5523A';
const NO_BG = '#FBE8E0';

const HERO_GRAD = ['#5A3800', '#9B6B14', '#D4A050'] as [string, string, string];
const RESULT_GRAD_OK = ['#5A3800', '#9B6B14'] as [string, string];
const RESULT_GRAD_BLOCKED = ['#7A2A20', '#B85040'] as [string, string];
const BTN_GRAD = ['#9B6B14', '#6B4610'] as [string, string];

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
function digit(n: number, lang: string): string {
  if (lang !== 'ne') return String(n);
  return String(n)
    .split('')
    .map((c) => (c >= '0' && c <= '9' ? DEVANAGARI_DIGITS[Number(c)] : c))
    .join('');
}

export default function ServerOnboarding() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const language = useSettingsStore((s) => s.language);

  const [answers, setAnswers] = useState<Partial<Record<QKey, Answer>>>({});
  const [step, setStep] = useState(0);

  const allYes = QUESTIONS.every((q) => answers[q.key] === 'yes');
  const anyNo = QUESTIONS.some((q) => answers[q.key] === 'no');
  const isResult = step >= QUESTIONS.length;

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.replace(Routes.login);
    }
  };

  const onAnswer = (key: QKey, value: Answer) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const onContinue = () => {
    const cur = QUESTIONS[step];
    if (!answers[cur.key]) return;
    setStep(step + 1);
  };

  const finishOnboarding = async () => {
    await setOnboarded(true);
    router.replace(Routes.serverHome);
  };

  const reviewAnswers = () => {
    setAnswers({});
    setStep(0);
  };

  // ─── Result step ────────────────────────────────────────────────────────
  if (isResult) {
    const isBlocked = anyNo;
    return (
      <View style={[s.flex, { backgroundColor: Colors.cr }]}>
        <StatusBar barStyle="light-content" />
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 20, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={isBlocked ? RESULT_GRAD_BLOCKED : RESULT_GRAD_OK}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.resultHero, { paddingTop: Math.max(58, insets.top + 14) }]}
          >
            <LotusHero color="white" opacity={0.1} size={240} right={-50} bottom={-50} />
            <Text style={s.resultEmoji}>{isBlocked ? '⚠️' : '🙏'}</Text>
            <Text style={s.resultTitle}>
              {t(isBlocked ? 'server.onboarding.blocked' : 'server.onboarding.complete')}
            </Text>
            <Text style={s.resultSub}>
              {t(isBlocked ? 'server.onboarding.blocked_sub' : 'server.onboarding.complete_sub')}
            </Text>
          </LinearGradient>

          <View style={s.resultBody}>
            <View style={s.recapCard}>
              <Text style={s.recapTitle}>{t('server.onboarding.responses_title')}</Text>
              {QUESTIONS.map((q, i) => {
                const ans = answers[q.key];
                const isYes = ans === 'yes';
                return (
                  <React.Fragment key={q.key}>
                    <View style={s.recapRow}>
                      <Text style={s.recapQuestion} numberOfLines={3}>
                        {inlineGlyph(q.icon)} {t(`server.onboarding.${q.key}`)}
                      </Text>
                      <Text style={[s.recapStatus, { color: isYes ? Colors.fo : Colors.ur }]}>
                        {isYes
                          ? `✓ ${t('server.onboarding.yes')}`
                          : `✗ ${t('server.onboarding.no')}`}
                      </Text>
                    </View>
                    {i < QUESTIONS.length - 1 ? <DashedDivider marginVertical={0} /> : null}
                  </React.Fragment>
                );
              })}
            </View>

            {isBlocked ? (
              <>
                <TouchableOpacity onPress={reviewAnswers} activeOpacity={0.85}>
                  <LinearGradient
                    colors={BTN_GRAD}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.primaryBtn}
                  >
                    <Text style={s.primaryBtnText}>{t('server.onboarding.cta_review')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={{ height: 10 }} />
                <TouchableOpacity
                  onPress={finishOnboarding}
                  activeOpacity={0.85}
                  style={s.outlineBtn}
                >
                  <Text style={s.outlineBtnText}>{t('server.onboarding.cta_continue_anyway')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={finishOnboarding} activeOpacity={0.85}>
                <LinearGradient
                  colors={BTN_GRAD}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.primaryBtn}
                >
                  <Text style={s.primaryBtnText}>{t('server.onboarding.cta_dashboard')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Question step ──────────────────────────────────────────────────────
  const cur = QUESTIONS[step];
  const curAnswer = answers[cur.key];
  const continueEnabled = Boolean(curAnswer);
  const isLastQuestion = step === QUESTIONS.length - 1;

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={HERO_GRAD}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.hero, { paddingTop: Math.max(50, insets.top + 14) }]}
        >
          <LotusHero color="white" opacity={0.1} size={220} right={-40} bottom={-40} />
          <MountainSilhouette color="rgba(255,255,255,0.08)" />

          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={s.backRow}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={s.backText}>{t('common.back')}</Text>
          </TouchableOpacity>

          <Text style={s.kicker}>{t('server.onboarding.title')}</Text>
          <Text style={s.heroTitle}>{t('server.onboarding.sub')}</Text>

          <View style={s.progressRow}>
            {QUESTIONS.map((q, i) => (
              <View
                key={q.key}
                style={[
                  s.progressSeg,
                  {
                    backgroundColor: i <= step ? Colors.white : 'rgba(255,255,255,0.25)',
                  },
                ]}
              />
            ))}
          </View>
          <Text style={s.stepCounter}>
            {digit(step + 1, language)} / {digit(QUESTIONS.length, language)}
          </Text>
        </LinearGradient>

        {/* Question body */}
        <View style={s.qBody}>
          {cur.icon === 'wheel' ? (
            <Image source={DHAMMA_WHEEL} style={s.qWheel} resizeMode="contain" />
          ) : (
            <Text style={s.qEmoji}>{cur.icon}</Text>
          )}
          <Text style={s.qText}>{t(`server.onboarding.${cur.key}`)}</Text>

          <View style={s.optionsRow}>
            <OptionTile
              variant="yes"
              selected={curAnswer === 'yes'}
              label={t('server.onboarding.yes')}
              onPress={() => onAnswer(cur.key, 'yes')}
            />
            <OptionTile
              variant="no"
              selected={curAnswer === 'no'}
              label={t('server.onboarding.no')}
              onPress={() => onAnswer(cur.key, 'no')}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={s.footerWrap}>
          <TouchableOpacity
            onPress={onContinue}
            activeOpacity={continueEnabled ? 0.85 : 1}
            disabled={!continueEnabled}
          >
            {continueEnabled ? (
              <LinearGradient
                colors={BTN_GRAD}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.continueBtnEnabled}
              >
                <Text style={s.continueBtnEnabledText}>
                  {isLastQuestion
                    ? t('server.onboarding.see_result')
                    : `${t('server.onboarding.continue')} →`}
                </Text>
              </LinearGradient>
            ) : (
              <View style={s.continueBtnDisabled}>
                <Text style={s.continueBtnDisabledText}>
                  {isLastQuestion
                    ? t('server.onboarding.see_result')
                    : `${t('server.onboarding.continue')} →`}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function OptionTile({
  variant,
  selected,
  label,
  onPress,
}: {
  variant: 'yes' | 'no';
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  const colorFg = variant === 'yes' ? YES_FG : NO_FG;
  const colorBg = variant === 'yes' ? YES_BG : NO_BG;
  const glyph = variant === 'yes' ? '✓' : '✗';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        s.optionTile,
        {
          backgroundColor: selected ? colorFg : colorBg,
          borderColor: selected ? colorFg : 'transparent',
        },
      ]}
    >
      <Text style={[s.optionGlyph, { color: selected ? Colors.white : Colors.tx }]}>{glyph}</Text>
      <Text style={[s.optionLabel, { color: selected ? Colors.white : colorFg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },

  // Hero (question steps)
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
    position: 'relative',
  },
  backText: {
    fontSize: 13,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(255,255,255,0.85)',
  },
  kicker: {
    fontSize: 13,
    fontFamily: FontFamily.devanagari,
    color: 'rgba(255,255,255,0.85)',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.white,
    lineHeight: 26,
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 18,
    position: 'relative',
  },
  progressSeg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepCounter: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    position: 'relative',
  },

  // Question body
  qBody: {
    paddingHorizontal: 22,
    paddingTop: 28,
    flexGrow: 1,
  },
  qEmoji: {
    fontSize: 46,
    marginBottom: 14,
    textAlign: 'center',
  },
  qWheel: {
    width: 60,
    height: 60,
    marginBottom: 14,
    alignSelf: 'center',
  },
  qText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
    lineHeight: 25,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionTile: {
    flex: 1,
    paddingVertical: 22,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
  },
  optionGlyph: {
    fontSize: 26,
    marginBottom: 4,
    fontFamily: FontFamily.sansBold,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
  },

  // Footer (question steps)
  footerWrap: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
  },
  continueBtnEnabled: {
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnEnabledText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.white,
  },
  continueBtnDisabled: {
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cr3,
  },
  continueBtnDisabledText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx3,
  },

  // Result hero
  resultHero: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  resultEmoji: {
    fontSize: 50,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.white,
    lineHeight: 29,
  },
  resultSub: {
    fontSize: 14,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    lineHeight: 21,
  },

  // Result body
  resultBody: {
    paddingHorizontal: 18,
    paddingTop: 22,
    flexGrow: 1,
  },
  recapCard: {
    backgroundColor: Colors.fol,
    borderWidth: 1.5,
    borderColor: Colors.fom,
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
  },
  recapTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.fo,
    marginBottom: 9,
  },
  recapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: 10,
  },
  recapQuestion: {
    flex: 1,
    paddingRight: 10,
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    lineHeight: 17,
  },
  recapStatus: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    flexShrink: 0,
  },

  // Result CTAs
  primaryBtn: {
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.white,
  },
  outlineBtn: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.bd2,
    backgroundColor: 'transparent',
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
});
