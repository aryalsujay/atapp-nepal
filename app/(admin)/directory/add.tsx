/**
 * Admin — Add Teacher (spec 33).
 *
 * Two-phase modal screen: identity form → success card with credentials.
 * Identity-only — authorisations, languages, availability are filled by
 * the teacher during onboarding on first login.
 *
 * Credentials are shown ONCE on the success screen and shared via the
 * native share sheet (WhatsApp / Signal / Mail / SMS). After Done, the
 * temp password is unrecoverable from the UI — admin can re-create the
 * teacher (delete + add) if they lose it.
 */

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes } from '@/routes';
import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { useTeachersStore } from '@/store/teachersStore';
import type { StoredTeacher } from '@/store/teachersStore';
import { useToast } from '@/components/ui/Toast';
import { getDb } from '@/db';
import { teachersRepo } from '@/db/repositories';
import { generateTempPassword, hashPassword, normalizePhone } from '@/utils/credentials';

type Gender = 'M' | 'F';
type Phase = 'form' | 'done';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AUTH_TYPES = [
  '10-Day',
  'Satipatthana Sutta',
  '20-Day',
  '30-Day',
  '45-Day',
  '60-Day',
  'Teen Course',
  "Children's Anapana",
  'Executive',
  '1-Day',
  '3-Day',
];

const NEPAL_REGIONS = [
  'Kathmandu Valley',
  'Pokhara & Gandaki',
  'Lumbini & Terai',
  'Koshi & East Nepal',
  'Madhesh',
  'Karnali & Far-West',
];

const DEFAULT_LANGS = ['Nepali', 'English', 'Hindi'];

export default function AdminAddTeacher() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const addTeacher = useTeachersStore((s) => s.addTeacher);

  const [phase, setPhase] = useState<Phase>('form');

  // Identity
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [region, setRegion] = useState('');

  // Optional extended fields — admin may pre-fill at create time, OR
  // leave blank and edit later from the teacher detail screen.
  const [inviteCode, setInviteCode] = useState('');
  const [authorizations, setAuthorizations] = useState<string[]>([]);
  const [languages, setLanguages] = useState<Record<string, 'primary' | 'secondary'>>({});
  const [preferredRegions, setPreferredRegions] = useState<string[]>([]);
  const [yearAuthorized, setYearAuthorized] = useState('');
  const [showExtras, setShowExtras] = useState(false);

  // Credentials — only temp password. The AT invite code is captured in
  // the optional `inviteCode` field above when admin already has one.
  const [autoPwd, setAutoPwd] = useState(true);
  const [pwd, setPwd] = useState(() => generateTempPassword());

  // Created teacher payload (for the success screen)
  const [created, setCreated] = useState<null | {
    name: string;
    email: string;
    phone: string;
    password: string;
  }>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onCreate = async () => {
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !gender) {
      setError(t('admin.add_teacher.err_required'));
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError(t('admin.add_teacher.err_email_invalid'));
      return;
    }
    const phoneDigits = normalizePhone(trimmedPhone);
    if (phoneDigits.length < 7 || !/^\d+$/.test(phoneDigits)) {
      setError(t('admin.add_teacher.err_phone_invalid'));
      return;
    }

    setSubmitting(true);
    try {
      const db = getDb();
      const existsByEmail = teachersRepo.findByIdentifier(db, trimmedEmail);
      if (existsByEmail) {
        setError(t('admin.add_teacher.err_email_taken'));
        return;
      }
      const existsByPhone = teachersRepo.findByIdentifier(db, trimmedPhone);
      if (existsByPhone) {
        setError(t('admin.add_teacher.err_phone_taken'));
        return;
      }

      const id = `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const yearN = parseInt(yearAuthorized.replace(/\D/g, ''), 10);
      await addTeacher({
        id,
        role: 'teacher',
        name: trimmedName,
        gender,
        email: trimmedEmail,
        phone: trimmedPhone,
        inviteCode: inviteCode.trim(),
        passwordHash: hashPassword(pwd),
        region: region.trim() || '',
        flag: '🇳🇵',
        authorizedSince: Number.isFinite(yearN) ? yearN : new Date().getFullYear(),
        totalCourses: 0,
        centersServed: 0,
        coursesThisYear: 0,
        authorizations: authorizations as StoredTeacher['authorizations'],
        languages,
        preferredRegions,
        availableMonths: [],
        festivalMonths: [],
        personalNote: '',
        teachingHistory: [],
        isOnboarded: false,
      });

      setCreated({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        password: pwd,
      });
      setPhase('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.sf} />

      <LinearGradient
        colors={Gradients.admin as unknown as [string, string, ...string[]]}
        start={GradientDirection.hero.start}
        end={GradientDirection.hero.end}
        style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}
      >
        <View style={s.headerRow}>
          <TouchableOpacity
            onPress={() => router.replace(Routes.adminDirectory)}
            hitSlop={10}
            style={s.closeBtn}
          >
            <Text style={s.closeIcon}>×</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>
            {phase === 'done' ? t('admin.add_teacher.success_title') : t('admin.add_teacher.title')}
          </Text>
          <View style={{ width: 30 }} />
        </View>
      </LinearGradient>

      {phase === 'form' ? (
        <FormView
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          gender={gender}
          setGender={setGender}
          region={region}
          setRegion={setRegion}
          autoPwd={autoPwd}
          setAutoPwd={(v) => {
            setAutoPwd(v);
            if (v) setPwd(generateTempPassword());
          }}
          pwd={pwd}
          setPwd={setPwd}
          inviteCode={inviteCode}
          setInviteCode={setInviteCode}
          authorizations={authorizations}
          setAuthorizations={setAuthorizations}
          languages={languages}
          setLanguages={setLanguages}
          preferredRegions={preferredRegions}
          setPreferredRegions={setPreferredRegions}
          yearAuthorized={yearAuthorized}
          setYearAuthorized={setYearAuthorized}
          showExtras={showExtras}
          setShowExtras={setShowExtras}
          error={error}
          submitting={submitting}
          onSubmit={onCreate}
          insetsBottom={insets.bottom}
          tFn={t}
        />
      ) : (
        <SuccessView
          info={created!}
          onDone={() => router.replace(Routes.adminDirectory)}
          toast={toast}
          insetsBottom={insets.bottom}
          tFn={t}
        />
      )}
    </View>
  );
}

// ─── Form ────────────────────────────────────────────────────────────────────

function FormView(props: {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  gender: Gender | null;
  setGender: (v: Gender) => void;
  region: string;
  setRegion: (v: string) => void;
  autoPwd: boolean;
  setAutoPwd: (v: boolean) => void;
  pwd: string;
  setPwd: (v: string) => void;
  inviteCode: string;
  setInviteCode: (v: string) => void;
  authorizations: string[];
  setAuthorizations: (v: string[]) => void;
  languages: Record<string, 'primary' | 'secondary'>;
  setLanguages: (v: Record<string, 'primary' | 'secondary'>) => void;
  preferredRegions: string[];
  setPreferredRegions: (v: string[]) => void;
  yearAuthorized: string;
  setYearAuthorized: (v: string) => void;
  showExtras: boolean;
  setShowExtras: (v: boolean) => void;
  error: string | null;
  submitting: boolean;
  onSubmit: () => void;
  insetsBottom: number;
  tFn: (k: string, opts?: Record<string, unknown>) => string;
}) {
  const t = props.tFn;
  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={{ padding: 18, paddingBottom: props.insetsBottom + 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <Field label={t('admin.add_teacher.field_name')} required>
        <TextInput
          value={props.name}
          onChangeText={props.setName}
          style={s.input}
          placeholder="Bhikkhu Ananda"
          placeholderTextColor={Colors.tx3}
          autoCapitalize="words"
        />
      </Field>

      <Field label={t('admin.add_teacher.field_email')} required>
        <TextInput
          value={props.email}
          onChangeText={props.setEmail}
          style={s.input}
          placeholder="ananda@dhamma.org"
          placeholderTextColor={Colors.tx3}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
      </Field>

      <Field label={t('admin.add_teacher.field_phone')} required>
        <TextInput
          value={props.phone}
          onChangeText={props.setPhone}
          style={s.input}
          placeholder="+977 9812345678"
          placeholderTextColor={Colors.tx3}
          keyboardType="phone-pad"
          autoCorrect={false}
        />
      </Field>

      <Field label={t('admin.add_teacher.field_gender')} required>
        <View style={s.radioRow}>
          <Radio
            on={props.gender === 'M'}
            label={t('admin.add_teacher.gender_m')}
            onPress={() => props.setGender('M')}
          />
          <Radio
            on={props.gender === 'F'}
            label={t('admin.add_teacher.gender_f')}
            onPress={() => props.setGender('F')}
          />
        </View>
      </Field>

      <Field label={t('admin.add_teacher.field_region')}>
        <TextInput
          value={props.region}
          onChangeText={props.setRegion}
          style={s.input}
          placeholder="Kathmandu Valley"
          placeholderTextColor={Colors.tx3}
        />
      </Field>

      <Text style={s.sectionHeader}>{t('admin.add_teacher.creds_header')}</Text>

      <ToggleRow
        label={t('admin.add_teacher.auto_pwd')}
        value={props.autoPwd}
        onChange={props.setAutoPwd}
      />
      {!props.autoPwd && (
        <TextInput value={props.pwd} onChangeText={props.setPwd} style={s.input} />
      )}

      {/* Optional extras — collapsed by default */}
      <TouchableOpacity
        onPress={() => props.setShowExtras(!props.showExtras)}
        activeOpacity={0.7}
        style={s.extrasHeaderBtn}
      >
        <Text style={s.extrasHeader}>
          {props.showExtras ? '▼' : '▶'} {t('admin.add_teacher.extras_header')}
        </Text>
      </TouchableOpacity>
      {props.showExtras && (
        <View style={{ gap: 12, marginTop: 6 }}>
          <Field label={t('admin.teacher_detail.section_at_code')}>
            <TextInput
              value={props.inviteCode}
              onChangeText={props.setInviteCode}
              style={s.input}
              placeholder={t('admin.teacher_detail.at_code_placeholder')}
              placeholderTextColor={Colors.tx3}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </Field>

          <Field label={t('admin.teacher_detail.section_authorizations')}>
            <View style={s.chipGrid}>
              {AUTH_TYPES.map((type) => {
                const on = props.authorizations.includes(type);
                return (
                  <Pressable
                    key={type}
                    onPress={() =>
                      props.setAuthorizations(
                        on
                          ? props.authorizations.filter((x) => x !== type)
                          : [...props.authorizations, type],
                      )
                    }
                    style={[s.optChip, on && s.optChipOn]}
                  >
                    <Text style={[s.optChipText, on && s.optChipTextOn]}>{type}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label={t('admin.teacher_detail.section_languages')}>
            <View style={{ gap: 7 }}>
              {DEFAULT_LANGS.map((lang) => {
                const level = props.languages[lang];
                const next: 'primary' | 'secondary' | undefined =
                  level === undefined ? 'secondary' : level === 'secondary' ? 'primary' : undefined;
                const label =
                  level === 'primary'
                    ? t('admin.teacher_detail.lang_primary')
                    : level === 'secondary'
                      ? t('admin.teacher_detail.lang_secondary')
                      : t('admin.teacher_detail.lang_off');
                return (
                  <Pressable
                    key={lang}
                    onPress={() => {
                      const langs = { ...props.languages };
                      if (next === undefined) delete langs[lang];
                      else langs[lang] = next;
                      props.setLanguages(langs);
                    }}
                    style={s.langPillRow}
                  >
                    <Text style={s.langPillName}>{lang}</Text>
                    <Text style={s.langPillLevel}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label={t('admin.teacher_detail.section_regions')}>
            <View style={s.chipGrid}>
              {NEPAL_REGIONS.map((r) => {
                const on = props.preferredRegions.includes(r);
                return (
                  <Pressable
                    key={r}
                    onPress={() =>
                      props.setPreferredRegions(
                        on
                          ? props.preferredRegions.filter((x) => x !== r)
                          : [...props.preferredRegions, r],
                      )
                    }
                    style={[s.optChip, on && s.optChipOn]}
                  >
                    <Text style={[s.optChipText, on && s.optChipTextOn]}>{r}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label={t('admin.teacher_detail.section_year')}>
            <TextInput
              value={props.yearAuthorized}
              onChangeText={props.setYearAuthorized}
              style={s.input}
              placeholder={t('admin.teacher_detail.year_placeholder')}
              placeholderTextColor={Colors.tx3}
              keyboardType="number-pad"
              maxLength={4}
            />
          </Field>
        </View>
      )}

      {props.error && (
        <View style={s.errorBanner}>
          <Text style={s.errorText}>{props.error}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={props.onSubmit}
        activeOpacity={0.85}
        disabled={props.submitting}
        style={{ marginTop: 20 }}
      >
        <LinearGradient
          colors={Gradients.primaryCta as unknown as [string, string, ...string[]]}
          start={GradientDirection.button.start}
          end={GradientDirection.button.end}
          style={[s.primaryBtn, props.submitting && { opacity: 0.6 }]}
        >
          <Text style={s.primaryBtnText}>{t('admin.add_teacher.create_btn')}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Success ─────────────────────────────────────────────────────────────────

function SuccessView({
  info,
  onDone,
  toast,
  insetsBottom,
  tFn,
}: {
  info: { name: string; email: string; phone: string; password: string };
  onDone: () => void;
  toast: ReturnType<typeof useToast>;
  insetsBottom: number;
  tFn: (k: string, opts?: Record<string, unknown>) => string;
}) {
  const t = tFn;

  const shareText = useMemo(
    () =>
      `${t('admin.add_teacher.share_subject')}\n` +
      `${t('admin.add_teacher.field_phone')}: ${info.phone}\n` +
      `${t('admin.add_teacher.field_email')}: ${info.email}\n` +
      `${t('admin.add_teacher.temp_password')}: ${info.password}\n\n` +
      `${t('admin.add_teacher.login_hint')}`,
    [info, t],
  );

  const copy = async (value: string) => {
    await Clipboard.setStringAsync(value);
    toast.success(t('admin.add_teacher.toast_copied'));
  };

  const share = async () => {
    try {
      // Sharing.shareAsync requires a file URI on iOS, so we write the
      // text to a tiny temp file and share that. Most apps (WhatsApp,
      // Mail, Messages) read the file's textual content directly.
      const uri = `${FileSystem.documentDirectory}credentials.txt`;
      await FileSystem.writeAsStringAsync(uri, shareText);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'text/plain',
          dialogTitle: t('admin.add_teacher.share_subject'),
          UTI: 'public.plain-text',
        });
      } else {
        await Clipboard.setStringAsync(shareText);
        toast.success(t('admin.add_teacher.toast_copied'));
      }
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={{ padding: 18, paddingBottom: insetsBottom + 32 }}
    >
      <View style={s.successHeader}>
        <Text style={s.successName}>{info.name}</Text>
        <Text style={s.successContact}>{info.phone}</Text>
        <Text style={s.successContact}>{info.email}</Text>
      </View>

      <Text style={s.shareIntro}>{t('admin.add_teacher.share_intro')}</Text>

      <CredentialCard
        label={t('admin.add_teacher.temp_password')}
        value={info.password}
        onCopy={() => copy(info.password)}
      />

      <View style={s.actionRow}>
        <TouchableOpacity onPress={() => copy(shareText)} style={s.outlineBtn} activeOpacity={0.85}>
          <Text style={s.outlineBtnText}>📋 {t('admin.add_teacher.copy_both')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={share} activeOpacity={0.85} style={{ flex: 1 }}>
          <LinearGradient
            colors={Gradients.primaryCta as unknown as [string, string, ...string[]]}
            start={GradientDirection.button.start}
            end={GradientDirection.button.end}
            style={s.primaryBtn}
          >
            <Text style={s.primaryBtnText}>📤 {t('admin.add_teacher.share')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={s.firstLoginHint}>{t('admin.add_teacher.first_login_hint')}</Text>

      <TouchableOpacity onPress={onDone} activeOpacity={0.85} style={{ marginTop: 18 }}>
        <View style={s.doneBtn}>
          <Text style={s.doneBtnText}>{t('admin.add_teacher.done')}</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>
        {label}
        {required ? ' *' : ''}
      </Text>
      {children}
    </View>
  );
}

function Radio({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.radio, on && s.radioOn]}>
      <View style={[s.radioDot, on && s.radioDotOn]} />
      <Text style={[s.radioLabel, on && s.radioLabelOn]}>{label}</Text>
    </Pressable>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={s.toggleRow}>
      <Text style={s.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

function CredentialCard({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <View style={s.credCard}>
      <View style={{ flex: 1 }}>
        <Text style={s.credLabel}>{label}</Text>
        <Text style={s.credValue} selectable>
          {value}
        </Text>
      </View>
      <TouchableOpacity onPress={onCopy} hitSlop={10} style={s.copyBtn} activeOpacity={0.7}>
        <Text style={s.copyIcon}>📋</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },

  header: {
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 26,
    color: Colors.white,
    fontWeight: '600',
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },

  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx,
  },

  radioRow: {
    flexDirection: 'row',
    gap: 10,
  },
  radio: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    backgroundColor: Colors.white,
    gap: 8,
  },
  radioOn: {
    borderColor: Colors.sf,
    backgroundColor: Colors.sfl,
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
  },
  radioDotOn: {
    borderColor: Colors.sf,
    backgroundColor: Colors.sf,
  },
  radioLabel: {
    fontSize: 13,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
    color: Colors.tx2,
  },
  radioLabelOn: {
    color: Colors.sfd,
  },

  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 22,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 13,
    color: Colors.tx,
    fontFamily: FontFamily.sansRegular,
    flex: 1,
  },
  disabledToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    opacity: 0.6,
  },
  disabledToggleLabel: {
    fontSize: 13,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
    flex: 1,
  },
  disabledHint: {
    fontSize: 11,
    color: Colors.tx3,
    fontStyle: 'italic',
    marginBottom: 8,
  },

  extrasHeaderBtn: {
    paddingVertical: 12,
    marginTop: 8,
  },
  extrasHeader: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.sfd,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  optChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
  },
  optChipOn: {
    backgroundColor: Colors.sf,
    borderColor: Colors.sf,
  },
  optChipText: {
    fontSize: 12,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
    color: Colors.tx2,
  },
  optChipTextOn: {
    color: Colors.white,
  },
  langPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: Colors.cr,
    borderWidth: 1,
    borderColor: Colors.bd,
  },
  langPillName: {
    fontSize: 13,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
    color: Colors.tx,
  },
  langPillLevel: {
    fontSize: 11.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
  },

  errorBanner: {
    backgroundColor: Colors.url,
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  errorText: {
    fontSize: 12.5,
    color: Colors.ur,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
  },

  primaryBtn: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  outlineBtn: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    color: Colors.tx2,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  doneBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cr2,
  },
  doneBtnText: {
    color: Colors.tx2,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Success view
  successHeader: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    ...Shadows.card,
  },
  successName: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.tx,
  },
  successContact: {
    fontSize: 12.5,
    color: Colors.tx2,
    marginTop: 3,
    fontFamily: FontFamily.sansRegular,
  },
  shareIntro: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    marginBottom: 10,
  },
  credCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  credLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.tx3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  credValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
    letterSpacing: 0.6,
  },
  copyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  copyIcon: {
    fontSize: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
  },
  firstLoginHint: {
    fontSize: 12,
    color: Colors.tx3,
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
});
