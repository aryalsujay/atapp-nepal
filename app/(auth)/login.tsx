/**
 * Login screen v2 — implements `specs/01-login.md`.
 *
 * Differences from v1 (prototype):
 *   • Accepts email OR phone OR invite code as identifier.
 *   • "Save password" toggle persists creds to `expo-secure-store`.
 *   • Tapping a role tab auto-logs the demo user for that role (demo only).
 *   • Bigger fonts (+2 baseline) for production readability.
 *   • Local Dhamma Wheel GIF via `expo-image` instead of network fetch.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

import { Routes, routeTo } from '@/routes';
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
import { logger } from '@/utils/logger';

type Role = 'teacher' | 'server' | 'admin';

const DEMO_CREDS: Record<Role, { identifier: string; password: string }> = {
  teacher: { identifier: '+977 9841234567', password: 'demo123' },
  server: { identifier: '+977 9851234567', password: 'demo123' },
  admin: { identifier: 'admin', password: 'dhamma2026' },
};

const HERO_GRADIENT: Record<Role, readonly [string, string, ...string[]]> = {
  teacher: Gradients.teacher,
  server: Gradients.server,
  admin: Gradients.admin,
};

const SECURE_KEY = 'dhamma.savedCreds.v1';

const DHAMMA_LOGO = require('../../assets/logo-dhamma.gif');

interface SavedCreds {
  role: Role;
  identifier: string;
  password: string;
}

/**
 * Classify a user-typed identifier — drives the field icon + keyboard.
 * Phone match accepts `+`, parens, dashes, spaces, and any number of digits
 * (5+ total digit chars). Anything else with a letter or `-` non-digit prefix
 * falls back to `code` so admin usernames + invite codes work.
 */
function classifyIdentifier(value: string): 'email' | 'phone' | 'code' | 'empty' {
  const trimmed = value.trim();
  if (!trimmed) return 'empty';
  if (trimmed.includes('@')) return 'email';
  // Phone: at least 5 digits total, only `+ ( ) - space` as separators.
  const digitsOnly = trimmed.replace(/[+\s\-()]/g, '');
  if (digitsOnly.length >= 5 && /^\d+$/.test(digitsOnly) && /^[+(\d]/.test(trimmed)) {
    return 'phone';
  }
  return 'code';
}

function normalizePhone(value: string): string {
  return value.replace(/[\s\-()]/g, '');
}

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const setAuth = useAuthStore((s) => s.setAuth);
  const findTeacher = useTeachersStore((s) => s.findTeacher);

  const [mode, setMode] = useState<Role>('teacher');
  const [identifier, setIdentifier] = useState(DEMO_CREDS.teacher.identifier);
  const [password, setPassword] = useState(DEMO_CREDS.teacher.password);
  const [savePassword, setSavePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  // Restore saved creds on mount (if user previously checked "Save password").
  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(SECURE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as SavedCreds;
        setMode(saved.role);
        setIdentifier(saved.identifier);
        setPassword(saved.password);
        setSavePassword(true);
      } catch (err) {
        logger.warn('[login] failed to restore saved creds', err);
      }
    })();
  }, []);

  // Tab tap behaves like the prototype: switch mode + populate demo defaults
  // for that role. No auto-login — the user clicks the CTA to sign in.
  const handleSelectMode = (next: Role) => {
    setMode(next);
    setIdentifier(DEMO_CREDS[next].identifier);
    setPassword(DEMO_CREDS[next].password);
  };

  const ctaLabel = useMemo(() => {
    if (loading) return t('login.cta_loading');
    if (mode === 'teacher') return t('login.cta_teacher');
    if (mode === 'server') return t('login.cta_server');
    return t('login.cta_admin');
  }, [mode, loading, t]);

  const idKind = classifyIdentifier(identifier);
  const idLabel = useMemo(() => {
    if (mode === 'admin') return t('login.email_label'); // admin uses username
    return t('login.identifier_label');
  }, [mode, t]);
  const idPlaceholder = useMemo(() => {
    if (mode === 'admin') return 'admin';
    return t('login.identifier_placeholder');
  }, [mode, t]);

  const handleForgot = () => {
    toast.info(t('login.forgot_alert_body'), t('login.forgot_alert_title'));
  };

  const persistCreds = async () => {
    try {
      if (savePassword) {
        const payload: SavedCreds = { role: mode, identifier, password };
        await SecureStore.setItemAsync(SECURE_KEY, JSON.stringify(payload));
      } else {
        await SecureStore.deleteItemAsync(SECURE_KEY);
      }
    } catch (err) {
      logger.warn('[login] failed to persist creds', err);
    }
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
          await persistCreds();
          router.replace(Routes.adminDashboard);
        } else {
          toast.error(t('login.error_invalid_admin'), t('login.error_invalid_title'));
        }
        return;
      }

      // For teacher + server, accept email, phone, or invite code.
      const lookupId = idKind === 'phone' ? normalizePhone(identifier) : identifier.trim();
      const found = findTeacher(lookupId);

      if (mode === 'server') {
        const serverUser =
          found?.passwordHash === password && found.role === 'server' ? found : null;
        if (!serverUser) {
          toast.error(t('login.error_invalid_server'), t('login.error_invalid_title'));
          return;
        }
        // Demo mode: always route through onboarding so the flow is visible.
        await setAuth('server', serverUser.id, false);
        await persistCreds();
        router.replace(Routes.serverOnboarding);
        return;
      }

      const teacher = found?.passwordHash === password ? found : null;
      if (!teacher) {
        toast.error(t('login.error_invalid_teacher'), t('login.error_invalid_title'));
        return;
      }
      // Demo mode: always route through onboarding so the flow is visible.
      await setAuth('teacher', teacher.id, false);
      await persistCreds();
      router.replace(routeTo.onboardingTeacher(0));
    } finally {
      setLoading(false);
    }
  };

  const heroPadTop = Math.max(58, insets.top + 11);
  const showInviteNotice = mode === 'teacher';

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
            <Image source={DHAMMA_LOGO} style={styles.logo} contentFit="contain" />
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

          {/* Identifier field — email OR phone OR username (for admin) */}
          <View style={styles.fieldGroupEmail}>
            <Text style={styles.fieldLabel}>{idLabel}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={identifier}
                onChangeText={setIdentifier}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder={idPlaceholder}
                placeholderTextColor={Colors.tx3}
                style={[styles.input, emailFocused && styles.inputFocused]}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={idKind === 'phone' ? 'phone-pad' : 'email-address'}
              />
            </View>
          </View>

          {/* Password field */}
          <View style={styles.fieldGroupPassword}>
            <Text style={styles.fieldLabel}>{t('login.password_label')}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                placeholder="••••••••"
                placeholderTextColor={Colors.tx3}
                style={[styles.input, styles.inputWithEye, pwFocused && styles.inputFocused]}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Save password + Forgot password row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              onPress={() => setSavePassword((v) => !v)}
              style={styles.saveToggle}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <View style={[styles.checkbox, savePassword && styles.checkboxOn]}>
                {savePassword && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.saveLabel}>{t('login.save_password')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleForgot}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.6}
            >
              <Text style={styles.forgotText}>{t('login.forgot')}</Text>
            </TouchableOpacity>
          </View>

          {/* Primary CTA */}
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
          {showInviteNotice && (
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

          <View style={{ height: 24 }} />
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Crossfades two gradients on mode change to match the prototype's
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
 * Plain line-art eye glyph used in the password reveal toggle.
 * `open=true` renders the eye; `open=false` adds a diagonal strike-through.
 * Stroke color tracks the surrounding text style so it reads as part of the
 * form, not as an emoji.
 */
function EyeIcon({
  open,
  size = 22,
  color = Colors.tx2,
}: {
  open: boolean;
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.5 12C4.5 7.5 8 5 12 5C16 5 19.5 7.5 21.5 12C19.5 16.5 16 19 12 19C8 19 4.5 16.5 2.5 12Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.7} />
      {!open && (
        <Line
          x1={4.5}
          y1={4.5}
          x2={19.5}
          y2={19.5}
          stroke={color}
          strokeWidth={1.7}
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}

/** Spring-scale press feedback for primary CTAs (prototype `.btn:active{scale .96}`). */
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

  // Hero
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  logoWrap: { marginBottom: 12 },
  logo: { width: 64, height: 64 },
  title: {
    fontSize: 32, // was 30
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 36,
  },
  subtitleNe: {
    fontSize: 16, // was 14
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontFamily: FontFamily.devanagari,
  },
  subtitleEn: {
    fontSize: 14, // was 12
    color: 'rgba(255,255,255,0.65)',
    marginTop: 3,
  },

  // Form area
  formArea: {
    paddingHorizontal: 18,
    paddingTop: 22,
    flex: 1,
  },

  // Role pill
  rolePill: {
    backgroundColor: Colors.cr2,
    borderRadius: 14,
    padding: 4,
    flexDirection: 'row',
    marginBottom: 22,
  },
  roleTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11, // was 9
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: Colors.white,
    ...Shadows.card,
  },
  roleTabLabel: {
    fontSize: 14.5, // was 12.5
    fontWeight: '700',
    color: Colors.tx2,
  },
  roleTabLabelActive: {
    color: Colors.sfd,
  },

  // Fields
  fieldGroupEmail: { marginBottom: 16 },
  fieldGroupPassword: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 13, // was 11
    fontWeight: '700',
    color: Colors.tx2,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.52,
  },
  inputWrap: { position: 'relative' },
  input: {
    width: '100%',
    backgroundColor: Colors.cr,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 12,
    paddingVertical: 15, // was 13
    paddingHorizontal: Layout.inputPadH,
    fontSize: 16, // was 14
    color: Colors.tx,
  },
  inputFocused: {
    borderColor: Colors.sf,
    backgroundColor: Colors.white,
  },
  inputWithEye: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  // Options row (save + forgot)
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  saveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: Colors.sf,
    borderColor: Colors.sf,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 14,
  },
  saveLabel: {
    fontSize: 14, // was 13
    color: Colors.tx2,
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 15, // was 13
    fontWeight: '600',
    color: Colors.sf,
  },

  // Primary CTA
  ctaBtn: {
    width: '100%',
    paddingVertical: 17, // was 15
    paddingHorizontal: Layout.buttonPadH,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.primaryCta,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: {
    color: Colors.white,
    fontSize: 17, // was 15
    fontWeight: '700',
  },

  // Invite-only notice
  inviteNotice: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.bll,
    borderWidth: 1,
    borderColor: Colors.bld,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  inviteIcon: {
    fontSize: 16, // was 14
    marginTop: 1,
  },
  inviteText: {
    fontSize: 13, // was 11
    color: Colors.tx2,
    lineHeight: 20,
    flex: 1,
  },

  // Footer
  footer: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 14, // was 12
    color: Colors.tx3,
  },
  footerBrand: {
    color: Colors.sf,
    fontWeight: '700',
  },
});
