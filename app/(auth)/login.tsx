/**
 * Login screen — implements `specs/01-login.md`.
 *
 * Prototype reference: `VipassanaTeacherApp/app.html` lines 891–937.
 * Any visible change must update the spec first.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Routes, routeTo } from '@/routes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useTeachersStore } from '@/store/teachersStore';
import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { Shadows } from '@/theme/shadows';
import { Layout } from '@/theme/spacing';
import { FontFamily } from '@/theme/typography';
import { LotusHero, MountainSilhouette } from '@/components/ui/HeroDecorations';
import { FadeInView } from '@/components/ui/FadeInView';
import { useToast } from '@/components/ui/Toast';
import adminData from '@/data/admin.json';

type Role = 'teacher' | 'server' | 'admin';

const DEMO_EMAIL: Record<Role, string> = {
  teacher: 'ananda@dhamma.org.np',
  server: 'priya@dhamma.org.np',
  admin: 'admin@dhamma.org.np',
};

const HERO_GRADIENT: Record<Role, readonly [string, string, ...string[]]> = {
  teacher: Gradients.teacher,
  server: Gradients.server,
  admin: Gradients.admin,
};

// Bundled Dhamma Wheel logo (PNG converted from the original GIF at
// dhamma.org/np). Local asset avoids network flash on cold start.
const DHAMMA_LOGO = require('../../assets/logo-dhamma.png');

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const setAuth = useAuthStore((s) => s.setAuth);
  const findTeacher = useTeachersStore((s) => s.findTeacher);

  const [mode, setMode] = useState<Role>('teacher');
  const [identifier, setIdentifier] = useState(DEMO_EMAIL.teacher);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  // Swap pre-filled demo email when role changes — matches prototype `defaultEmail`.
  const handleSelectMode = (next: Role) => {
    setMode(next);
    setIdentifier(DEMO_EMAIL[next]);
  };

  const ctaLabel = useMemo(() => {
    if (loading) return t('login.cta_loading');
    if (mode === 'teacher') return t('login.cta_teacher');
    if (mode === 'server') return t('login.cta_server');
    return t('login.cta_admin');
  }, [mode, loading, t]);

  const handleForgot = () => {
    toast.info(t('login.forgot_alert_body'), t('login.forgot_alert_title'));
  };

  const handleSignIn = async () => {
    if (!identifier.trim() || !password.trim()) {
      toast.error(t('login.error_missing_body'), t('login.error_missing_title'));
      return;
    }
    setLoading(true);
    try {
      if (mode === 'admin') {
        if (identifier === adminData.username && password === adminData.password) {
          await setAuth('admin', adminData.id, true);
          router.replace(Routes.adminDashboard);
        } else {
          toast.error(t('login.error_invalid_admin'), t('login.error_invalid_title'));
        }
        return;
      }

      if (mode === 'server') {
        const found = findTeacher(identifier.trim());
        const serverUser =
          found?.passwordHash === password && found.role === 'server' ? found : null;
        if (!serverUser) {
          toast.error(t('login.error_invalid_server'), t('login.error_invalid_title'));
          return;
        }
        await setAuth('server', serverUser.id, serverUser.isOnboarded ?? false);
        router.replace(serverUser.isOnboarded ? Routes.serverHome : Routes.serverOnboarding);
        return;
      }

      // teacher
      const found = findTeacher(identifier.trim());
      const teacher = found?.passwordHash === password ? found : null;
      if (!teacher) {
        toast.error(t('login.error_invalid_teacher'), t('login.error_invalid_title'));
        return;
      }
      await setAuth('teacher', teacher.id, teacher.isOnboarded ?? false);
      router.replace(teacher.isOnboarded ? Routes.teacherHome : routeTo.onboardingTeacher(1));
    } finally {
      setLoading(false);
    }
  };

  const heroPadTop = Math.max(58, insets.top + 11);

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
        {/* Hero — gradient changes per mode with crossfade */}
        <HeroGradient mode={mode} paddingTop={heroPadTop}>
          <LotusHero color="white" opacity={0.1} size={260} right={-50} bottom={-50} />
          <MountainSilhouette color="rgba(255,255,255,0.07)" />

          <View style={styles.logoWrap}>
            <Image source={DHAMMA_LOGO} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitleNe}>{t('login.subtitle_ne')}</Text>
          <Text style={styles.subtitleEn}>{t('login.subtitle_en')}</Text>
        </HeroGradient>

        {/* Form */}
        <FadeInView delay={60} style={styles.formArea}>
          {/* Role pill */}
          <View style={styles.rolePill}>
            <RoleTab
              label={t('login.tab_teacher')}
              active={mode === 'teacher'}
              onPress={() => handleSelectMode('teacher')}
            />
            <RoleTab
              label={t('login.tab_server')}
              active={mode === 'server'}
              onPress={() => handleSelectMode('server')}
            />
            <RoleTab
              label={t('login.tab_admin')}
              active={mode === 'admin'}
              onPress={() => handleSelectMode('admin')}
            />
          </View>

          {/* Email field */}
          <View style={styles.fieldGroupEmail}>
            <Text style={styles.fieldLabel}>{t('login.email_label')}</Text>
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder={t('login.email_placeholder')}
              placeholderTextColor={Colors.tx3}
              style={[styles.input, emailFocused && styles.inputFocused]}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          {/* Password field */}
          <View style={styles.fieldGroupPassword}>
            <Text style={styles.fieldLabel}>{t('login.password_label')}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              placeholder="••••••••"
              placeholderTextColor={Colors.tx3}
              style={[styles.input, pwFocused && styles.inputFocused]}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Forgot password */}
          <TouchableOpacity
            onPress={handleForgot}
            style={styles.forgotWrap}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.forgotText}>{t('login.forgot')}</Text>
          </TouchableOpacity>

          {/* Primary CTA — gradient, label per mode */}
          <PressScale onPress={handleSignIn} disabled={loading}>
            <LinearGradient
              colors={Gradients.primaryCta as unknown as [string, string, ...string[]]}
              start={GradientDirection.button.start}
              end={GradientDirection.button.end}
              style={[styles.ctaBtn, loading && styles.ctaDisabled]}
            >
              <Text style={styles.ctaText}>{ctaLabel}</Text>
            </LinearGradient>
          </PressScale>

          {/* Invite-only notice — teacher mode only */}
          {mode === 'teacher' && (
            <View style={styles.inviteNotice}>
              <Text style={styles.inviteIcon}>🔒</Text>
              <Text style={styles.inviteText}>{t('login.invite_only')}</Text>
            </View>
          )}

          {/* Footer disclaimer */}
          <Text style={styles.footer}>
            {t('login.footer_prefix')}
            <Text style={styles.footerBrand}>{t('login.footer_brand')}</Text>
          </Text>

          <View style={{ height: 20 }} />
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Crossfades two `LinearGradient`s on mode change to match the prototype's
 * `transition: background .3s` on the hero block (`app.html:904`).
 */
function HeroGradient({
  mode,
  paddingTop,
  children,
}: {
  mode: Role;
  paddingTop: number;
  children: React.ReactNode;
}) {
  const prevMode = useRef<Role>(mode);
  const fade = useRef(new Animated.Value(0)).current;
  const [pending, setPending] = useState<Role | null>(null);

  useEffect(() => {
    if (prevMode.current === mode) return;
    setPending(prevMode.current);
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      prevMode.current = mode;
      setPending(null);
    });
  }, [mode, fade]);

  return (
    <View style={[styles.hero, { paddingTop }]} pointerEvents="box-none">
      {pending && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: fade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
          ]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={HERO_GRADIENT[pending] as unknown as [string, string, ...string[]]}
            start={GradientDirection.hero.start}
            end={GradientDirection.hero.end}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
      <LinearGradient
        colors={HERO_GRADIENT[mode] as unknown as [string, string, ...string[]]}
        start={GradientDirection.hero.start}
        end={GradientDirection.hero.end}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

/** Role-tab segmented control button — matches prototype tab style. */
function RoleTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.roleTab, active && styles.roleTabActive]}
    >
      <Text style={[styles.roleTabLabel, active && styles.roleTabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

/**
 * Press-scale wrapper — matches prototype `.btn:active{transform:scale(.96)}`.
 * Used here for the primary CTA. Extract to `src/components/ui/` when a second
 * screen needs it.
 */
function PressScale({
  onPress,
  disabled,
  children,
}: {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => !disabled && press(0.96)}
        onPressOut={() => press(1)}
        disabled={disabled}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, backgroundColor: Colors.cr },

  // Hero — padding: 58px top (overridden per insets), 24px horizontal, 36px bottom
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  logoWrap: { marginBottom: 10 },
  logo: { width: 56, height: 56 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 33, // 30 × 1.1
    letterSpacing: 0,
  },
  subtitleNe: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    fontFamily: FontFamily.devanagari,
  },
  subtitleEn: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  // Form area — padding: 20px top, 18px horizontal, 0 bottom
  formArea: {
    paddingHorizontal: 18,
    paddingTop: 20,
    flex: 1,
  },

  // Role pill container
  rolePill: {
    backgroundColor: Colors.cr2,
    borderRadius: 13,
    padding: 4,
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: Colors.white,
    ...Shadows.card,
  },
  roleTabLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.tx2,
  },
  roleTabLabelActive: {
    color: Colors.sfd,
  },

  // Email + password field groups
  fieldGroupEmail: { marginBottom: 14 },
  fieldGroupPassword: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.tx2,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.44, // 0.04em at 11px
  },
  input: {
    width: '100%',
    backgroundColor: Colors.cr,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 12,
    paddingVertical: Layout.inputPadV, // 13
    paddingHorizontal: Layout.inputPadH, // 15
    fontSize: 14,
    color: Colors.tx,
  },
  inputFocused: {
    borderColor: Colors.sf,
    backgroundColor: Colors.white,
  },

  // Forgot password
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.sf,
  },

  // Primary CTA
  ctaBtn: {
    width: '100%',
    paddingVertical: Layout.buttonPadV, // 15
    paddingHorizontal: Layout.buttonPadH, // 22
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.primaryCta,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // Invite-only notice — teacher only
  inviteNotice: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.bll,
    borderWidth: 1,
    borderColor: Colors.bld,
    borderRadius: 11,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
  },
  inviteIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  inviteText: {
    fontSize: 11,
    color: Colors.tx2,
    lineHeight: 16.5, // 11 × 1.5
    flex: 1,
  },

  // Footer disclaimer
  footer: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.tx3,
  },
  footerBrand: {
    color: Colors.sf,
  },
});
