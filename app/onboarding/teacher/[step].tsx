import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/authStore';
import { useProfileStore } from '../../../src/store/profileStore';
import { Colors, Gradients } from '../../../src/theme/colors';
import { FontSize, FontWeight } from '../../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../../src/theme/spacing';
import { AvailabilityCalendar } from '../../../src/components/ui/AvailabilityCalendar';
import { LotusHero, MountainSilhouette } from '../../../src/components/ui/HeroDecorations';
import { AvailabilityState, LanguageLevel } from '../../../src/types';

const TOTAL_STEPS = 7;

const ALL_LANGUAGES = ['Nepali', 'English', 'Hindi', 'Gujarati', 'German', 'French', 'Spanish', 'Bengali', 'Tibetan', 'Newari', 'Maithili'];
const ALL_REGIONS = [
  { key: 'Kathmandu Valley', emoji: '🏙️', desc: 'Dhamma Shringa, Dhamma Adhara' },
  { key: 'Pokhara & Gandaki', emoji: '⛰️', desc: 'Dhamma Pokhara' },
  { key: 'Lumbini & Terai', emoji: '🌾', desc: 'Dhamma Janani' },
  { key: 'Koshi', emoji: '🌊', desc: 'Eastern region' },
  { key: 'Madhesh', emoji: '🌿', desc: 'Madhesh province' },
  { key: 'International', emoji: '🌏', desc: 'Outside Nepal' },
];
const ALL_COURSE_TYPES = [
  { key: '10-Day', emoji: '🪷', desc: 'Standard 10-day course' },
  { key: '20-Day', emoji: '🌿', desc: 'Intermediate course' },
  { key: '30-Day', emoji: '🌳', desc: 'Long course' },
  { key: 'Satipatthana Sutta', emoji: '📿', desc: 'Satipatthana Sutta course' },
  { key: "Children's Anapana", emoji: '👦', desc: "Children's meditation course" },
  { key: 'Teen Course', emoji: '🧒', desc: 'Teen course (13–19 yrs)' },
  { key: 'Executive', emoji: '💼', desc: 'Corporate / executive course' },
  { key: '45-Day', emoji: '🌲', desc: '45-day long course' },
  { key: '60-Day', emoji: '🏔️', desc: '60-day long course' },
];

const LEVEL_CYCLE: Record<LanguageLevel, LanguageLevel> = {
  off: 'primary',
  primary: 'secondary',
  secondary: 'off',
};

export default function OnboardingStep() {
  const { step: stepStr } = useLocalSearchParams<{ step: string }>();
  const step = parseInt(stepStr ?? '1', 10);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.userId)!;
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const signOut = useAuthStore((s) => s.signOut);
  const { loadProfile, updateProfile } = useProfileStore();

  const [languages, setLanguages] = useState<Record<string, LanguageLevel>>({
    Nepali: 'primary',
    English: 'secondary',
  });
  const [regions, setRegions] = useState<string[]>(['Kathmandu Valley']);
  const [authorizations, setAuthorizations] = useState<string[]>(['10-Day']);
  const [availability, setAvailability] = useState<AvailabilityState[]>(
    Array(12).fill(0) as AvailabilityState[]
  );
  const [note, setNote] = useState('');

  const goNext = async () => {
    if (step < TOTAL_STEPS) {
      router.push(`/onboarding/teacher/${step + 1}`);
    } else {
      await loadProfile(userId);
      await updateProfile({
        languages: languages as Record<string, LanguageLevel>,
        preferredRegions: regions,
        authorizations,
        monthlyAvailability: availability,
        personalNote: note,
        isOnboarded: true,
      });
      await setOnboarded(true);
      router.replace('/(teacher)/home');
    }
  };

  const goBack = () => {
    if (step > 1) router.back();
  };

  const toggleLanguage = (lang: string) => {
    const current = (languages[lang] ?? 'off') as LanguageLevel;
    setLanguages((prev) => ({ ...prev, [lang]: LEVEL_CYCLE[current] }));
  };

  const toggleRegion = (region: string) => {
    setRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const toggleAuth = (type: string) => {
    setAuthorizations((prev) =>
      prev.includes(type) ? prev.filter((a) => a !== type) : [...prev, type]
    );
  };

  const toggleAvailability = (idx: number) => {
    setAvailability((prev) => {
      const next = [...prev];
      const cur = next[idx];
      next[idx] = cur === 0 ? 1 : cur === 1 ? 'f' : 0;
      return next as AvailabilityState[];
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepWelcome />;
      case 2:
        return <StepLanguages languages={languages} onToggle={toggleLanguage} />;
      case 3:
        return <StepRegions regions={regions} onToggle={toggleRegion} />;
      case 4:
        return <StepAuthorizations authorizations={authorizations} onToggle={toggleAuth} />;
      case 5:
        return <StepAvailability availability={availability} onToggle={toggleAvailability} />;
      case 6:
        return <StepNote note={note} onChangeNote={setNote} />;
      case 7:
        return (
          <StepSummary
            languages={languages}
            regions={regions}
            authorizations={authorizations}
            availability={availability}
            note={note}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = step === TOTAL_STEPS;
  const stepColor = isLastStep ? Colors.fo : Colors.sf;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      {/* Progress bar */}
      <View style={[styles.progressWrap, { paddingTop: insets.top + 8 }]}>
        <View style={styles.progressDots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx + 1 === step && styles.dotActive,
                idx + 1 < step && styles.dotDone,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepCount}>{step} / {TOTAL_STEPS}</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      {/* Nav buttons */}
      <View style={[styles.navRow, { paddingBottom: insets.bottom + 16 }]}>
        {step > 1 ? (
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={async () => { await signOut(); router.replace('/(auth)/login'); }}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={goNext}
          activeOpacity={0.85}
          style={[styles.continueBtn, { backgroundColor: stepColor }]}
        >
          <Text style={styles.continueBtnText}>
            {isLastStep ? '✓ Enter Dhamma AT' : 'Continue →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Step Components ─────────────────────────────────────────────────────────

const StepWelcome = () => (
  <View style={stepStyles.container}>
    <LinearGradient
      colors={Gradients.teacher as unknown as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={stepStyles.welcomeHero}
    >
      <LotusHero color="white" opacity={0.12} size={200} />
      <MountainSilhouette />
      <Text style={stepStyles.welcomeEmoji}>🪷</Text>
      <Text style={stepStyles.welcomeHeroTitle}>Dhamma AT</Text>
    </LinearGradient>
    <Text style={stepStyles.stepTitle}>Welcome, Teacher</Text>
    <Text style={stepStyles.stepSubtitle}>
      Let's set up your profile so we can match you with the right courses.
      This takes about 2 minutes and you can update it anytime.
    </Text>
    <View style={stepStyles.infoRow}>
      <InfoBadge emoji="🌐" label="Languages" />
      <InfoBadge emoji="📍" label="Regions" />
      <InfoBadge emoji="📋" label="Authorizations" />
      <InfoBadge emoji="📅" label="Availability" />
    </View>
  </View>
);

const InfoBadge = ({ emoji, label }: { emoji: string; label: string }) => (
  <View style={stepStyles.infoBadge}>
    <Text style={{ fontSize: 20 }}>{emoji}</Text>
    <Text style={stepStyles.infoBadgeLabel}>{label}</Text>
  </View>
);

const StepLanguages = ({
  languages,
  onToggle,
}: {
  languages: Record<string, LanguageLevel>;
  onToggle: (lang: string) => void;
}) => (
  <View style={stepStyles.container}>
    <Text style={stepStyles.stepTitle}>Teaching Languages</Text>
    <Text style={stepStyles.stepSubtitle}>
      Which languages can you teach in? Tap once for Primary, twice for Secondary, three times to remove.
    </Text>
    <View style={stepStyles.legendRow}>
      <View style={[stepStyles.legendDot, { backgroundColor: Colors.sf }]} />
      <Text style={stepStyles.legendText}>Primary</Text>
      <View style={[stepStyles.legendDot, { backgroundColor: Colors.tx2 }]} />
      <Text style={stepStyles.legendText}>Secondary</Text>
    </View>
    <View style={stepStyles.langGrid}>
      {ALL_LANGUAGES.map((lang) => {
        const level = (languages[lang] ?? 'off') as LanguageLevel;
        const bg = level === 'primary' ? Colors.sf : level === 'secondary' ? Colors.tx2 : Colors.white;
        const textColor = level !== 'off' ? Colors.white : Colors.tx3;
        const border = level === 'off' ? Colors.bd : bg;
        return (
          <TouchableOpacity
            key={lang}
            onPress={() => onToggle(lang)}
            activeOpacity={0.75}
            style={[stepStyles.langChip, { backgroundColor: bg, borderColor: border }]}
          >
            <Text style={[stepStyles.langChipText, { color: textColor }]}>
              {lang}{level === 'primary' ? ' ★' : level === 'secondary' ? ' ☆' : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const StepRegions = ({
  regions,
  onToggle,
}: {
  regions: string[];
  onToggle: (r: string) => void;
}) => (
  <View style={stepStyles.container}>
    <Text style={stepStyles.stepTitle}>Where will you travel?</Text>
    <Text style={stepStyles.stepSubtitle}>
      Select all regions you're willing to serve in. Order reflects your preference.
    </Text>
    <View style={stepStyles.regionList}>
      {ALL_REGIONS.map(({ key, emoji, desc }) => {
        const selected = regions.includes(key);
        const rank = regions.indexOf(key) + 1;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onToggle(key)}
            activeOpacity={0.8}
            style={[
              stepStyles.regionRow,
              selected && { backgroundColor: Colors.sfl, borderColor: Colors.sfm },
            ]}
          >
            <Text style={{ fontSize: 22, width: 32 }}>{emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[stepStyles.regionText, selected && { color: Colors.sf, fontWeight: FontWeight.bold }]}>
                {key}
              </Text>
              <Text style={stepStyles.regionDesc}>{desc}</Text>
            </View>
            {selected && (
              <View style={stepStyles.regionBadge}>
                <Text style={stepStyles.regionBadgeText}>#{rank}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const StepAuthorizations = ({
  authorizations,
  onToggle,
}: {
  authorizations: string[];
  onToggle: (type: string) => void;
}) => (
  <View style={stepStyles.container}>
    <Text style={stepStyles.stepTitle}>Course Authorizations</Text>
    <Text style={stepStyles.stepSubtitle}>
      Which course types are you authorized to teach? Select all that apply.
    </Text>
    <View style={stepStyles.authGrid}>
      {ALL_COURSE_TYPES.map(({ key, emoji, desc }) => {
        const selected = authorizations.includes(key);
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onToggle(key)}
            activeOpacity={0.8}
            style={[
              stepStyles.authCard,
              selected && { backgroundColor: Colors.sfl, borderColor: Colors.sf },
            ]}
          >
            <Text style={stepStyles.authEmoji}>{emoji}</Text>
            <Text style={[stepStyles.authLabel, selected && { color: Colors.sf, fontWeight: FontWeight.bold }]}>
              {key}
            </Text>
            <Text style={stepStyles.authDesc}>{desc}</Text>
            {selected && (
              <View style={stepStyles.authCheck}>
                <Text style={{ color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold }}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const StepAvailability = ({
  availability,
  onToggle,
}: {
  availability: AvailabilityState[];
  onToggle: (idx: number) => void;
}) => (
  <View style={stepStyles.container}>
    <Text style={stepStyles.stepTitle}>Available Months — 2026</Text>
    <Text style={stepStyles.stepSubtitle}>
      Mark which months you can serve. Tap once for Available, twice for Festival (limited), three times to clear.
    </Text>
    <View style={stepStyles.legendRow}>
      <View style={[stepStyles.legendDot, { backgroundColor: Colors.fo }]} />
      <Text style={stepStyles.legendText}>Available</Text>
      <View style={[stepStyles.legendDot, { backgroundColor: Colors.gd }]} />
      <Text style={stepStyles.legendText}>Festival</Text>
      <View style={[stepStyles.legendDot, { backgroundColor: Colors.cr3 }]} />
      <Text style={stepStyles.legendText}>Unavailable</Text>
    </View>
    <AvailabilityCalendar availability={availability} editable onToggle={onToggle} />
  </View>
);

const StepNote = ({
  note,
  onChangeNote,
}: {
  note: string;
  onChangeNote: (v: string) => void;
}) => (
  <View style={stepStyles.container}>
    <Text style={stepStyles.stepTitle}>Anything we should know?</Text>
    <Text style={stepStyles.stepSubtitle}>
      Share any personal requirements, health considerations, or preferences that will help the admin schedule you appropriately.
    </Text>
    <TextInput
      value={note}
      onChangeText={onChangeNote}
      style={stepStyles.textarea}
      placeholder="e.g. I need a vegetarian diet option. I cannot climb stairs. I'm available only if my co-teacher is confirmed first..."
      placeholderTextColor={Colors.tx3}
      multiline
      numberOfLines={6}
      textAlignVertical="top"
    />
    <Text style={stepStyles.hint}>Optional — you can add or update this from your profile anytime.</Text>
  </View>
);

const StepSummary = ({
  languages,
  regions,
  authorizations,
  availability,
  note,
}: {
  languages: Record<string, LanguageLevel>;
  regions: string[];
  authorizations: string[];
  availability: AvailabilityState[];
  note: string;
}) => {
  const activeLangs = Object.entries(languages).filter(([, v]) => v !== 'off');
  const availMonths = availability.filter((a) => a === 1).length;

  return (
    <View style={stepStyles.container}>
      <LinearGradient
        colors={Gradients.approved as unknown as [string, string, ...string[]]}
        style={stepStyles.summaryHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <LotusHero color="white" opacity={0.12} size={180} />
        <MountainSilhouette />
        <Text style={{ fontSize: 52 }}>✓</Text>
        <Text style={stepStyles.summaryHeroTitle}>All Set!</Text>
        <Text style={stepStyles.summaryHeroSub}>Your profile is ready</Text>
      </LinearGradient>

      <View style={stepStyles.summaryCard}>
        <SummaryRow
          emoji="🌐"
          label="Languages"
          value={`${activeLangs.length} selected`}
          detail={activeLangs.map(([l]) => l).join(', ')}
        />
        <SummaryRow
          emoji="📍"
          label="Regions"
          value={`${regions.length} preferred`}
          detail={regions.join(', ')}
        />
        <SummaryRow
          emoji="📋"
          label="Authorizations"
          value={`${authorizations.length} course types`}
          detail={authorizations.join(', ')}
        />
        <SummaryRow
          emoji="📅"
          label="Availability"
          value={`${availMonths} months`}
        />
        <SummaryRow
          emoji="📝"
          label="Personal Note"
          value={note ? 'Added ✓' : 'Not added'}
          last
        />
      </View>
    </View>
  );
};

const SummaryRow = ({
  emoji,
  label,
  value,
  detail,
  last,
}: {
  emoji: string;
  label: string;
  value: string;
  detail?: string;
  last?: boolean;
}) => (
  <View style={[stepStyles.summaryRow, last && { borderBottomWidth: 0 }]}>
    <Text style={{ fontSize: 18, width: 28 }}>{emoji}</Text>
    <View style={{ flex: 1 }}>
      <Text style={stepStyles.summaryLabel}>{label}</Text>
      {detail ? <Text style={stepStyles.summaryDetail} numberOfLines={1}>{detail}</Text> : null}
    </View>
    <Text style={stepStyles.summaryValue}>{value}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const stepStyles = StyleSheet.create({
  container: { gap: Spacing.lg, paddingBottom: 20 },

  welcomeHero: {
    height: 180,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 4,
  },
  welcomeEmoji: { fontSize: 52 },
  welcomeHeroTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  infoBadge: {
    flex: 1,
    minWidth: 70,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.bd,
  },
  infoBadgeLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.tx3,
    textAlign: 'center',
  },

  stepTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.extrabold,
    color: Colors.tx,
    lineHeight: FontSize.h2 * 1.2,
  },
  stepSubtitle: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
    lineHeight: FontSize.smPlus * 1.55,
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    fontStyle: 'italic',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    marginRight: 8,
  },

  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  langChipText: { fontSize: FontSize.smPlus, fontWeight: FontWeight.semibold },

  regionList: { gap: 8 },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
  },
  regionText: { fontSize: FontSize.smPlus, color: Colors.tx2, fontWeight: FontWeight.medium },
  regionDesc: { fontSize: FontSize.xs, color: Colors.tx3, marginTop: 2 },
  regionBadge: {
    backgroundColor: Colors.sfm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  regionBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.sf },

  authGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  authCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    gap: 4,
    position: 'relative',
  },
  authEmoji: { fontSize: 24 },
  authLabel: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.tx,
  },
  authDesc: { fontSize: FontSize.xs, color: Colors.tx3, lineHeight: 15 },
  authCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.sf,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textarea: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: Radius.md,
    padding: 14,
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    minHeight: 140,
  },

  summaryHero: {
    height: 180,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 4,
  },
  summaryHeroTitle: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
  },
  summaryHeroSub: {
    fontSize: FontSize.smPlus,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FontWeight.medium,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    gap: 10,
  },
  summaryLabel: {
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    fontWeight: FontWeight.semibold,
  },
  summaryDetail: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
    marginTop: 2,
  },
  summaryValue: {
    fontSize: FontSize.sm,
    color: Colors.fo,
    fontWeight: FontWeight.bold,
  },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    backgroundColor: Colors.white,
  },
  progressDots: { flexDirection: 'row', gap: 5 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.cr3,
  },
  dotActive: { backgroundColor: Colors.sf, width: 18, borderRadius: 3.5 },
  dotDone: { backgroundColor: Colors.fo },
  stepCount: { fontSize: FontSize.sm, color: Colors.tx3, fontWeight: FontWeight.semibold },
  content: { padding: Layout.horizontalPad, paddingTop: Spacing.xl },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.horizontalPad,
    paddingTop: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.bd,
    gap: Spacing.md,
  },
  backBtn: { paddingVertical: 12, paddingHorizontal: 4 },
  backBtnText: { fontSize: FontSize.smPlus, color: Colors.tx2, fontWeight: FontWeight.semibold },
  backBtnPlaceholder: { width: 80 },
  continueBtn: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
