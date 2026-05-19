/**
 * Admin — Teacher detail / edit screen.
 *
 * One screen, always editable. Reads the live row from `teachersStore`,
 * holds a local form copy, and writes back via `addTeacher` (which
 * upserts). The Save button is only enabled when something has changed.
 *
 * Sections:
 *  1. Identity   — name / email / phone / gender / region
 *  2. AT code    — single line, free-text; admin assigns externally
 *  3. Authorizations — multi-select chip list of CourseType values
 *  4. Languages  — per-language level picker (off / secondary / primary)
 *  5. Regions    — multi-select chip list of canonical Nepal regions
 *  6. Year       — numeric input
 *
 * Delete button at the bottom — uses the global Confirm dialog.
 */

import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes } from '@/routes';
import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { useTeachersStore } from '@/store/teachersStore';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { generateTempPassword, hashPassword } from '@/utils/credentials';
import type { StoredTeacher } from '@/store/teachersStore';
import type { CourseType, LanguageLevel } from '@/types/common';

const AUTH_TYPES: CourseType[] = [
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

export default function AdminTeacherDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const confirm = useConfirm();
  const params = useLocalSearchParams<{ id: string }>();
  const teacherId = String(params.id ?? '');

  const teacher = useTeachersStore((s) => s.allTeachers.find((x) => x.id === teacherId));
  const addTeacher = useTeachersStore((s) => s.addTeacher);
  const deleteTeacher = useTeachersStore((s) => s.deleteTeacher);

  const [form, setForm] = useState<StoredTeacher | null>(teacher ?? null);
  const [newLang, setNewLang] = useState('');
  const [saving, setSaving] = useState(false);
  const [newPwd, setNewPwd] = useState<string | null>(null);

  // Sync local form when the store row changes (rare — e.g. after another
  // tab edits the same teacher).
  React.useEffect(() => {
    if (teacher && (!form || form.id !== teacher.id)) {
      setForm(teacher);
    }
  }, [teacher, form]);

  const dirty = useMemo(
    () => !!form && !!teacher && JSON.stringify(form) !== JSON.stringify(teacher),
    [form, teacher],
  );

  if (!form || !teacher) {
    return (
      <View style={[s.flex, { backgroundColor: Colors.cr }]}>
        <Header
          insets={insets}
          title={t('admin.teacher_detail.title')}
          onClose={() => router.replace(Routes.adminDirectory)}
        />
        <View style={s.notFoundCard}>
          <Text style={s.notFoundText}>{t('admin.teacher_detail.not_found')}</Text>
        </View>
      </View>
    );
  }

  const onSave = async () => {
    setSaving(true);
    try {
      await addTeacher(form);
      toast.success(t('admin.teacher_detail.saved_toast'));
    } finally {
      setSaving(false);
    }
  };

  const onResetPassword = () => {
    confirm({
      title: t('admin.teacher_detail.reset_pwd_confirm_title'),
      message: t('admin.teacher_detail.reset_pwd_confirm_body'),
      confirmText: t('admin.teacher_detail.reset_pwd_confirm_yes'),
      cancelText: t('admin.teacher_detail.delete_confirm_no'),
      onConfirm: async () => {
        const pwd = generateTempPassword();
        // Persist via the upsert path; the local form copy is updated too
        // so the (already-rendered) Save button stays in sync with what's
        // on disk.
        const updated: StoredTeacher = { ...form, passwordHash: hashPassword(pwd) };
        await addTeacher(updated);
        setForm(updated);
        setNewPwd(pwd);
      },
    });
  };

  const onDelete = () => {
    confirm({
      title: t('admin.teacher_detail.delete_confirm_title'),
      message: t('admin.teacher_detail.delete_confirm_body'),
      confirmText: t('admin.teacher_detail.delete_confirm_yes'),
      cancelText: t('admin.teacher_detail.delete_confirm_no'),
      destructive: true,
      onConfirm: async () => {
        await deleteTeacher(teacher.id);
        toast.success(t('admin.teacher_detail.deleted_toast'));
        router.replace(Routes.adminDirectory);
      },
    });
  };

  const toggleAuthorization = (type: CourseType) => {
    const current = form.authorizations ?? [];
    setForm({
      ...form,
      authorizations: current.includes(type)
        ? current.filter((x) => x !== type)
        : [...current, type],
    });
  };

  const toggleRegion = (r: string) => {
    const current = form.preferredRegions ?? [];
    setForm({
      ...form,
      preferredRegions: current.includes(r) ? current.filter((x) => x !== r) : [...current, r],
    });
  };

  const cycleLang = (lang: string) => {
    const cur = (form.languages?.[lang] ?? 'off') as LanguageLevel;
    const next: LanguageLevel =
      cur === 'off' ? 'secondary' : cur === 'secondary' ? 'primary' : 'off';
    const langs = { ...(form.languages ?? {}) };
    if (next === 'off') delete langs[lang];
    else langs[lang] = next;
    setForm({ ...form, languages: langs });
  };

  const addLang = () => {
    const trimmed = newLang.trim();
    if (!trimmed) return;
    setForm({ ...form, languages: { ...(form.languages ?? {}), [trimmed]: 'secondary' } });
    setNewLang('');
  };

  const knownLangs = new Set([...DEFAULT_LANGS, ...Object.keys(form.languages ?? {})]);

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bl} />
      <Header
        insets={insets}
        title={form.name || t('admin.teacher_detail.title')}
        onClose={() => router.replace(Routes.adminDirectory)}
      />

      <ScrollView
        style={s.flex}
        contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status badge */}
        {!form.isOnboarded && (
          <View style={s.statusBanner}>
            <Text style={s.statusBannerText}>⏳ {t('admin.teacher_detail.not_onboarded')}</Text>
          </View>
        )}

        {/* Identity */}
        <Section title={t('admin.teacher_detail.section_identity')}>
          <Labeled label={t('admin.add_teacher.field_name')}>
            <TextInput
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              style={s.input}
              autoCapitalize="words"
            />
          </Labeled>
          <Labeled label={t('admin.add_teacher.field_email')}>
            <TextInput
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
              style={s.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Labeled>
          <Labeled label={t('admin.add_teacher.field_phone')}>
            <TextInput
              value={form.phone ?? ''}
              onChangeText={(v) => setForm({ ...form, phone: v })}
              style={s.input}
              keyboardType="phone-pad"
            />
          </Labeled>
          <Labeled label={t('admin.add_teacher.field_gender')}>
            <View style={s.radioRow}>
              {(['M', 'F'] as const).map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setForm({ ...form, gender: g })}
                  style={[s.radio, form.gender === g && s.radioOn]}
                >
                  <Text style={[s.radioLabel, form.gender === g && s.radioLabelOn]}>
                    {g === 'M' ? t('admin.add_teacher.gender_m') : t('admin.add_teacher.gender_f')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Labeled>
          <Labeled label={t('admin.add_teacher.field_region')}>
            <TextInput
              value={form.region}
              onChangeText={(v) => setForm({ ...form, region: v })}
              style={s.input}
              placeholder="Kathmandu Valley"
              placeholderTextColor={Colors.tx3}
            />
          </Labeled>
        </Section>

        {/* AT invite code */}
        <Section title={t('admin.teacher_detail.section_at_code')}>
          <TextInput
            value={form.inviteCode}
            onChangeText={(v) => setForm({ ...form, inviteCode: v })}
            style={s.input}
            placeholder={t('admin.teacher_detail.at_code_placeholder')}
            placeholderTextColor={Colors.tx3}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <Text style={s.hint}>{t('admin.teacher_detail.at_code_hint')}</Text>
        </Section>

        {/* Authorizations */}
        <Section title={t('admin.teacher_detail.section_authorizations')}>
          <ChipGrid>
            {AUTH_TYPES.map((type) => {
              const on = (form.authorizations ?? []).includes(type);
              return (
                <Chip key={type} on={on} label={type} onPress={() => toggleAuthorization(type)} />
              );
            })}
          </ChipGrid>
        </Section>

        {/* Languages */}
        <Section title={t('admin.teacher_detail.section_languages')}>
          <View style={{ gap: 9 }}>
            {Array.from(knownLangs).map((lang) => {
              const level = (form.languages?.[lang] ?? 'off') as LanguageLevel;
              const labelKey =
                level === 'primary'
                  ? 'admin.teacher_detail.lang_primary'
                  : level === 'secondary'
                    ? 'admin.teacher_detail.lang_secondary'
                    : 'admin.teacher_detail.lang_off';
              const tone =
                level === 'primary'
                  ? { bg: Colors.fol, fg: Colors.fo }
                  : level === 'secondary'
                    ? { bg: Colors.bll, fg: Colors.bl }
                    : { bg: Colors.cr2, fg: Colors.tx3 };
              return (
                <TouchableOpacity
                  key={lang}
                  onPress={() => cycleLang(lang)}
                  activeOpacity={0.7}
                  style={s.langRow}
                >
                  <Text style={s.langName}>{lang}</Text>
                  <View style={[s.langPill, { backgroundColor: tone.bg }]}>
                    <Text style={[s.langPillText, { color: tone.fg }]}>{t(labelKey)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={s.langAddRow}>
            <TextInput
              value={newLang}
              onChangeText={setNewLang}
              placeholder={t('admin.teacher_detail.lang_add_placeholder')}
              placeholderTextColor={Colors.tx3}
              style={[s.input, { flex: 1 }]}
              autoCapitalize="words"
            />
            <TouchableOpacity onPress={addLang} activeOpacity={0.85} style={s.langAddBtn}>
              <Text style={s.langAddBtnText}>{t('admin.teacher_detail.lang_add_btn')}</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Preferred regions */}
        <Section title={t('admin.teacher_detail.section_regions')}>
          <ChipGrid>
            {NEPAL_REGIONS.map((r) => {
              const on = (form.preferredRegions ?? []).includes(r);
              return <Chip key={r} on={on} label={r} onPress={() => toggleRegion(r)} />;
            })}
          </ChipGrid>
        </Section>

        {/* Year authorized */}
        <Section title={t('admin.teacher_detail.section_year')}>
          <TextInput
            value={form.authorizedSince ? String(form.authorizedSince) : ''}
            onChangeText={(v) => {
              const n = parseInt(v.replace(/\D/g, ''), 10);
              setForm({ ...form, authorizedSince: Number.isFinite(n) ? n : 0 });
            }}
            style={s.input}
            placeholder={t('admin.teacher_detail.year_placeholder')}
            placeholderTextColor={Colors.tx3}
            keyboardType="number-pad"
            maxLength={4}
          />
        </Section>

        {/* Reset password */}
        <TouchableOpacity onPress={onResetPassword} activeOpacity={0.85} style={s.resetBtn}>
          <Text style={s.resetBtnText}>{t('admin.teacher_detail.reset_pwd_btn')}</Text>
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity onPress={onDelete} activeOpacity={0.85} style={s.deleteBtn}>
          <Text style={s.deleteBtnText}>🗑️ {t('admin.teacher_detail.delete_btn')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* New-password reveal modal */}
      <Modal
        visible={!!newPwd}
        animationType="fade"
        transparent
        onRequestClose={() => setNewPwd(null)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalLabel}>{t('admin.teacher_detail.reset_pwd_new_label')}</Text>
            <Text style={s.modalValue} selectable>
              {newPwd}
            </Text>
            <Text style={s.modalHint}>{t('admin.teacher_detail.reset_pwd_share_hint')}</Text>
            <View style={s.modalActions}>
              <TouchableOpacity
                onPress={async () => {
                  if (newPwd) await Clipboard.setStringAsync(newPwd);
                  toast.success(t('admin.add_teacher.toast_copied'));
                }}
                style={s.modalCopyBtn}
                activeOpacity={0.8}
              >
                <Text style={s.modalCopyText}>📋</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (!newPwd) return;
                  const text =
                    `${t('admin.add_teacher.share_subject')}\n` +
                    `${form.name}\n` +
                    `${form.phone ? `${t('admin.add_teacher.field_phone')}: ${form.phone}\n` : ''}` +
                    `${form.email ? `${t('admin.add_teacher.field_email')}: ${form.email}\n` : ''}` +
                    `${t('admin.add_teacher.temp_password')}: ${newPwd}\n\n` +
                    `${t('admin.add_teacher.login_hint')}`;
                  const uri = `${FileSystem.documentDirectory}credentials.txt`;
                  await FileSystem.writeAsStringAsync(uri, text);
                  if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri, {
                      mimeType: 'text/plain',
                      dialogTitle: t('admin.add_teacher.share_subject'),
                    });
                  } else {
                    await Clipboard.setStringAsync(text);
                    toast.success(t('admin.add_teacher.toast_copied'));
                  }
                }}
                style={s.modalShareBtn}
                activeOpacity={0.8}
              >
                <Text style={s.modalShareText}>📤 {t('admin.add_teacher.share')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setNewPwd(null)}
              style={s.modalClose}
              activeOpacity={0.8}
            >
              <Text style={s.modalCloseText}>{t('admin.teacher_detail.reset_pwd_close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sticky save bar */}
      <View style={[s.saveBar, { paddingBottom: Math.max(12, insets.bottom + 4) }]}>
        <TouchableOpacity
          onPress={onSave}
          disabled={!dirty || saving}
          activeOpacity={0.85}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={Gradients.primaryCta as unknown as [string, string, ...string[]]}
            start={GradientDirection.button.start}
            end={GradientDirection.button.end}
            style={[s.saveBtn, (!dirty || saving) && { opacity: 0.5 }]}
          >
            <Text style={s.saveBtnText}>
              {saving ? t('admin.teacher_detail.saving') : t('admin.teacher_detail.save_btn')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Header({
  insets,
  title,
  onClose,
}: {
  insets: { top: number };
  title: string;
  onClose: () => void;
}) {
  return (
    <LinearGradient
      colors={Gradients.admin as unknown as [string, string, ...string[]]}
      start={GradientDirection.hero.start}
      end={GradientDirection.hero.end}
      style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}
    >
      <View style={s.headerRow}>
        <TouchableOpacity onPress={onClose} hitSlop={10} style={s.closeBtn}>
          <Text style={s.closeIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 30 }} />
      </View>
    </LinearGradient>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionBody}>{children}</View>
    </View>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.labeled}>
      <Text style={s.labeledLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ChipGrid({ children }: { children: React.ReactNode }) {
  return <View style={s.chipGrid}>{children}</View>;
}

function Chip({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, on && s.chipOn]}>
      <Text style={[s.chipText, on && s.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 14,
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
    fontSize: 28,
    color: Colors.white,
    fontWeight: '600',
    lineHeight: 30,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  statusBanner: {
    backgroundColor: Colors.gdl,
    borderWidth: 1,
    borderColor: '#F5E0A0',
    borderRadius: 12,
    padding: 11,
    marginBottom: 14,
  },
  statusBannerText: {
    fontSize: 12.5,
    color: '#7A6000',
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
  },

  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 9,
  },
  sectionBody: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    ...Shadows.card,
  },

  labeled: {},
  labeledLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    marginBottom: 5,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 13.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx,
  },
  hint: {
    fontSize: 11,
    color: Colors.tx3,
    fontStyle: 'italic',
    marginTop: 4,
  },

  radioRow: {
    flexDirection: 'row',
    gap: 9,
  },
  radio: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  radioOn: {
    borderColor: Colors.sf,
    backgroundColor: Colors.sfl,
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

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
  },
  chipOn: {
    backgroundColor: Colors.sf,
    borderColor: Colors.sf,
  },
  chipText: {
    fontSize: 12,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
    color: Colors.tx2,
  },
  chipTextOn: {
    color: Colors.white,
  },

  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.cr,
  },
  langName: {
    fontSize: 13,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
    color: Colors.tx,
  },
  langPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  langPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  langAddRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  langAddBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.cr2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langAddBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.tx2,
    fontFamily: FontFamily.sansBold,
  },

  resetBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.sf,
    alignItems: 'center',
  },
  resetBtnText: {
    color: Colors.sfd,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  deleteBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.ur,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: Colors.ur,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  saveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.bd,
    flexDirection: 'row',
  },
  saveBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  notFoundCard: {
    margin: 18,
    padding: 24,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    ...Shadows.card,
  },
  notFoundText: {
    fontSize: 13,
    color: Colors.tx2,
    fontStyle: 'italic',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    ...Shadows.card,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.tx3,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.tx,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalHint: {
    fontSize: 12,
    color: Colors.tx2,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 9,
    width: '100%',
    marginBottom: 10,
  },
  modalCopyBtn: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.cr2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCopyText: { fontSize: 18 },
  modalShareBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: Colors.sf,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalShareText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  modalClose: {
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  modalCloseText: {
    color: Colors.tx2,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
});
