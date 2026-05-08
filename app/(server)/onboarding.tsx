import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../src/theme/spacing';
import { useAuthStore } from '../../src/store/authStore';

interface Question {
  id: number;
  question: string;
  subtext: string;
  required: boolean; // true = must answer 'yes' to pass
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Have you completed at least one 10-Day Vipassana course?',
    subtext: 'Servers must have personal experience with the technique.',
    required: true,
  },
  {
    id: 2,
    question: 'Are you able to maintain Noble Silence during the course?',
    subtext: 'Servers observe Noble Silence alongside meditating students.',
    required: true,
  },
  {
    id: 3,
    question: 'Can you commit to the full duration of your selected service period?',
    subtext: 'Leaving mid-course disrupts the community and is generally not permitted.',
    required: true,
  },
  {
    id: 4,
    question: 'Do you understand that serving is done without payment or compensation?',
    subtext: 'Dhamma service (dāna) is offered freely in the spirit of Dhamma.',
    required: true,
  },
  {
    id: 5,
    question: 'Are you free from serious physical limitations that would prevent active service work?',
    subtext: 'Kitchen and compound roles require standing and light physical activity.',
    required: false, // nice-to-have, not blocking
  },
];

type Answer = 'yes' | 'no' | null;

export default function ServerOnboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { role, userId } = useAuthStore();

  const [step, setStep] = useState(0); // 0 = intro, 1–5 = questions, 6 = result
  const [answers, setAnswers] = useState<Answer[]>(Array(QUESTIONS.length).fill(null));

  const isIntro = step === 0;
  const isDone = step > QUESTIONS.length;
  const currentQ = !isIntro && !isDone ? QUESTIONS[step - 1] : null;

  const progress = isDone ? 1 : step / QUESTIONS.length;

  const hasFailure = answers.some((a, i) => QUESTIONS[i].required && a === 'no');

  const handleAnswer = (answer: Answer) => {
    const newAnswers = [...answers];
    newAnswers[step - 1] = answer;
    setAnswers(newAnswers);

    if (step < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length + 1);
    }
  };

  const handleFinish = async () => {
    if (!hasFailure) {
      await setAuth(role!, userId!, true);
      router.replace('/(server)/home');
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#5A3800', '#8B5E14', '#C8900A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Server Eligibility</Text>
        <Text style={styles.headerSub}>
          {isIntro ? '5 quick questions' : isDone ? 'All done' : `Question ${step} of ${QUESTIONS.length}`}
        </Text>

        {/* Progress bar */}
        {!isIntro && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        {isIntro && (
          <View style={styles.card}>
            <Text style={styles.lotusIcon}>🪷</Text>
            <Text style={styles.introTitle}>Welcome, Dhamma Server</Text>
            <Text style={styles.introBody}>
              Before you begin, we need to confirm your eligibility to serve at a Vipassana centre.
              {'\n\n'}
              This takes less than a minute and helps ensure a harmonious experience for everyone.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(1)}>
              <Text style={styles.primaryBtnText}>Begin Eligibility Check</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Question */}
        {currentQ && (
          <View style={styles.card}>
            <View style={styles.qNumber}>
              <Text style={styles.qNumberText}>{step}</Text>
            </View>
            <Text style={styles.qText}>{currentQ.question}</Text>
            <Text style={styles.qSub}>{currentQ.subtext}</Text>

            <View style={styles.answerRow}>
              <TouchableOpacity
                style={[styles.answerBtn, styles.answerNo]}
                onPress={() => handleAnswer('no')}
              >
                <Text style={[styles.answerBtnText, { color: Colors.ur }]}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.answerBtn, styles.answerYes]}
                onPress={() => handleAnswer('yes')}
              >
                <Text style={[styles.answerBtnText, { color: Colors.fo }]}>Yes</Text>
              </TouchableOpacity>
            </View>

            {step > 1 && (
              <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backLink}>
                <Text style={styles.backLinkText}>← Go back</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Result */}
        {isDone && (
          <View style={styles.card}>
            {hasFailure ? (
              <>
                <Text style={styles.resultIcon}>🚫</Text>
                <Text style={styles.resultTitle}>Not Yet Eligible</Text>
                <Text style={styles.resultBody}>
                  Based on your answers, you do not yet meet the requirements to serve at a Vipassana centre.
                  {'\n\n'}
                  Please sit a 10-Day course first if you haven't done so, and return when you're ready.
                  {'\n\n'}
                  Sadhu for your interest in Dhamma service. 🙏
                </Text>
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleFinish}>
                  <Text style={styles.secondaryBtnText}>Return to Login</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.resultIcon}>✅</Text>
                <Text style={styles.resultTitle}>You're Eligible!</Text>
                <Text style={styles.resultBody}>
                  You meet all requirements to serve at a Vipassana centre. You can now browse service opportunities and apply.
                  {'\n\n'}
                  May your service be a source of Dhamma. Sadhu 🙏
                </Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
                  <Text style={styles.primaryBtnText}>Continue to App</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cr },
  header: {
    paddingHorizontal: Layout.horizontalPad,
    paddingTop: Spacing.xl,
    paddingBottom: 28,
    gap: 4,
  },
  headerTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: FontWeight.medium,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  body: { flex: 1 },
  bodyContent: {
    padding: Layout.horizontalPad,
    paddingTop: Spacing.lg,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 24,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.bd,
    alignItems: 'center',
  },
  lotusIcon: { fontSize: 52 },
  introTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.extrabold,
    color: Colors.tx,
    textAlign: 'center',
  },
  introBody: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
    lineHeight: FontSize.smPlus * 1.7,
    textAlign: 'center',
  },

  qNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.svl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qNumberText: { fontSize: FontSize.md, fontWeight: FontWeight.extrabold, color: Colors.sv },
  qText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.5,
  },
  qSub: {
    fontSize: FontSize.smPlus,
    color: Colors.tx3,
    textAlign: 'center',
    lineHeight: FontSize.smPlus * 1.6,
  },
  answerRow: { flexDirection: 'row', gap: 12, width: '100%', marginTop: Spacing.sm },
  answerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  answerNo: { backgroundColor: Colors.url, borderColor: Colors.ur + '40' },
  answerYes: { backgroundColor: Colors.fol, borderColor: Colors.fo + '40' },
  answerBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.extrabold },
  backLink: { paddingVertical: 4 },
  backLinkText: { fontSize: FontSize.sm, color: Colors.tx3 },

  resultIcon: { fontSize: 56 },
  resultTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.extrabold,
    color: Colors.tx,
    textAlign: 'center',
  },
  resultBody: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
    lineHeight: FontSize.smPlus * 1.7,
    textAlign: 'center',
  },

  primaryBtn: {
    backgroundColor: Colors.sv,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  secondaryBtnText: { color: Colors.tx2, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
