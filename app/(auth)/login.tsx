import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/store/authStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useTeachersStore } from '../../src/store/teachersStore';
import { Colors, Gradients } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../src/theme/spacing';
import { Shadows } from '../../src/theme/shadows';
import { LotusHero, MountainSilhouette } from '../../src/components/ui/HeroDecorations';
import { FadeInView } from '../../src/components/ui/FadeInView';
import adminData from '../../src/data/admin.json';

type Role = 'teacher' | 'admin' | 'server';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { language, setLanguage } = useSettingsStore();
  const findTeacher = useTeachersStore((s) => s.findTeacher);

  const [role, setRole] = useState<Role>('teacher');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your credentials.');
      return;
    }

    setLoading(true);

    try {
      if (role === 'admin') {
        if (identifier === adminData.username && password === adminData.password) {
          await setAuth('admin', adminData.id, true);
          router.replace('/(admin)/dashboard');
        } else {
          Alert.alert('Invalid Credentials', 'Incorrect username or password.');
        }
        return;
      }

      // Server login
      if (role === 'server') {
        const found = findTeacher(identifier.trim());
        const serverUser = found?.passwordHash === password && (found as any).role === 'server' ? found : null;
        if (!serverUser) {
          Alert.alert('Invalid Credentials', 'Email or password is incorrect.');
          return;
        }
        await setAuth('server', serverUser.id, serverUser.isOnboarded ?? false);
        if (!serverUser.isOnboarded) {
          router.replace('/(server)/onboarding');
        } else {
          router.replace('/(server)/home');
        }
        return;
      }

      // Teacher login: search across seed + admin-created teachers
      const found = findTeacher(identifier.trim());
      const teacher = found?.passwordHash === password ? found : null;

      if (!teacher) {
        Alert.alert('Invalid Credentials', 'Email/code or password is incorrect.');
        return;
      }

      await setAuth('teacher', teacher.id, teacher.isOnboarded ?? false);

      if (!teacher.isOnboarded) {
        router.replace('/onboarding/teacher/1');
      } else {
        router.replace('/(teacher)/home');
      }
    } finally {
      setLoading(false);
    }
  };

  const gradientColors =
    role === 'teacher' ? Gradients.teacher :
    role === 'admin' ? Gradients.admin :
    (['#5A3800', '#8B5E14', '#C8900A'] as const);
  const accentColor =
    role === 'teacher' ? Colors.sf :
    role === 'admin' ? Colors.bl :
    Colors.sv;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero gradient */}
        <LinearGradient
          colors={gradientColors as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 40 }]}
        >
          {/* Decorations */}
          <LotusHero color="white" opacity={0.1} size={260} />
          <MountainSilhouette color="rgba(255,255,255,0.07)" />

          {/* Language switch — top right */}
          <TouchableOpacity
            onPress={() => setLanguage(language === 'en' ? 'ne' : 'en')}
            style={styles.langSwitch}
          >
            <Text style={styles.langSwitchText}>
              {language === 'en' ? '🌐 नेपाली' : '🌐 English'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.appIcon}>🪷</Text>
          <Text style={styles.appName}>{t('login.title')}</Text>
          <Text style={styles.appSubtitle}>{t('login.subtitle')}</Text>
          <Text style={styles.appSubtitleNe}>विपस्सना शिक्षक/सेवक अनुसूचक</Text>
        </LinearGradient>

        {/* Form card — overlaps hero with rounded top */}
        <FadeInView delay={80} style={styles.formCard}>
          {/* Role tabs */}
          <Text style={styles.selectLabel}>{t('login.selectRole')}</Text>
          <View style={styles.roleTabs}>
            <RoleTab
              label={t('login.roleTeacher')}
              emoji="🧘"
              active={role === 'teacher'}
              onPress={() => setRole('teacher')}
              activeColor={Colors.sf}
            />
            <RoleTab
              label={t('login.roleAdmin')}
              emoji="📋"
              active={role === 'admin'}
              onPress={() => setRole('admin')}
              activeColor={Colors.bl}
            />
            <RoleTab
              label="Server"
              emoji="🍳"
              active={role === 'server'}
              onPress={() => setRole('server')}
              activeColor={Colors.sv}
            />
          </View>

          {/* Inputs */}
          <View style={styles.fields}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('login.email')}</Text>
              <TextInput
                value={identifier}
                onChangeText={setIdentifier}
                placeholder={role === 'teacher' ? 'your@email.com' : role === 'admin' ? 'admin' : 'priya@dhamma.np'}
                placeholderTextColor={Colors.tx3}
                style={[styles.input, identifier ? { borderColor: accentColor } : {}]}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('login.password')}</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={Colors.tx3}
                  style={[styles.input, styles.inputWithEye, password ? { borderColor: accentColor } : {}]}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Demo hint */}
          <View style={[styles.hintBox, {
            backgroundColor: role === 'teacher' ? Colors.sfl : role === 'admin' ? Colors.bll : Colors.svl,
          }]}>
            <Text style={[styles.hintText, { color: accentColor }]}>
              {role === 'teacher'
                ? '💡 Demo: ananda@dhamma.np · demo123'
                : role === 'admin'
                ? '💡 Demo: admin · dhamma2026'
                : '💡 Demo: priya@dhamma.np · demo123'}
            </Text>
          </View>

          {/* Sign in button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
            style={[
              styles.signInBtn,
              { backgroundColor: accentColor },
              loading && styles.disabledBtn,
            ]}
          >
            <Text style={styles.signInText}>
              {loading ? 'Signing in...' : t('login.signIn')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.sadhu}>{t('login.sadhu')}</Text>
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface RoleTabProps {
  label: string;
  emoji: string;
  active: boolean;
  onPress: () => void;
  activeColor: string;
}

const RoleTab: React.FC<RoleTabProps> = ({ label, emoji, active, onPress, activeColor }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[
      styles.roleTab,
      active
        ? { backgroundColor: activeColor, borderColor: activeColor }
        : { backgroundColor: Colors.white, borderColor: Colors.bd2 },
    ]}
  >
    <Text style={styles.roleEmoji}>{emoji}</Text>
    <Text style={[styles.roleLabel, { color: active ? Colors.white : Colors.tx2 }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, backgroundColor: Colors.cr },

  hero: {
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: 50,
    alignItems: 'center',
    overflow: 'hidden',
  },
  langSwitch: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: Radius.full,
  },
  langSwitchText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  appIcon: {
    fontSize: 52,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: FontSize.smPlus,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FontWeight.medium,
    marginTop: 4,
  },
  appSubtitleNe: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    marginBottom: Spacing.sm,
  },

  formCard: {
    backgroundColor: Colors.cr,
    marginTop: -22,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Layout.horizontalPad,
    paddingTop: 28,
    flex: 1,
    gap: Spacing.lg,
  },
  selectLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.tx3,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  roleTabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.cr2,
    borderRadius: Radius.lg,
    padding: 4,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 0,
  },
  roleEmoji: { fontSize: 16 },
  roleLabel: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
  },

  fields: { gap: Spacing.md },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.tx2,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: Radius.md,
    paddingHorizontal: Layout.inputPadH,
    paddingVertical: Layout.inputPadV,
    fontSize: FontSize.md,
    color: Colors.tx,
  },
  inputWrap: {
    position: 'relative',
  },
  inputWithEye: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },

  hintBox: {
    borderRadius: Radius.sm,
    padding: 11,
  },
  hintText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    fontWeight: FontWeight.medium,
  },

  signInBtn: {
    paddingVertical: 15,
    borderRadius: Radius.lg,
    alignItems: 'center',
    ...Shadows.elevated,
  },
  disabledBtn: { opacity: 0.6 },
  signInText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },

  sadhu: {
    textAlign: 'center',
    fontSize: FontSize.smPlus,
    color: Colors.tx3,
    marginTop: Spacing.sm,
  },
});
