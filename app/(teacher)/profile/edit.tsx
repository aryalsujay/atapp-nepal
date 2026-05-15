/**
 * Teacher Edit Profile — implements `specs/10-teacher-edit-profile.md`.
 *
 * Prototype-faithful port of `app.html:1585–1715`. Compact orange hero with
 * back chevron + title, blue locked-notice banner, Contact / Languages /
 * Regions / Personal Note / Locked-preview cards, Cancel + Save action row.
 * Local edit buffer + dirty tracking; Save persists through
 * `profileStore.setProfile`, flashes "✓ Saved" for 900 ms, then routes back.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes } from '@/routes';
import { useProfileStore } from '@/store/profileStore';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { LotusHero } from '@/components/ui/HeroDecorations';
import { DashedDivider } from '@/components/ui/DashedDivider';

type LangLevel = 'primary' | 'secondary' | 'off';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TeacherEditProfile() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();
  const toast = useToast();

  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);

  // ─── Local edit buffer (hydrated from profile on mount) ────────────────
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [languages, setLanguages] = useState<Record<string, LangLevel>>({});
  const [regions, setRegions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setPhone(profile.phone ?? '');
    setEmail(profile.email ?? '');
    setLanguages({ ...(profile.languages as Record<string, LangLevel>) });
    setRegions([...(profile.preferredRegions ?? [])]);
    setNote(profile.personalNote ?? '');
    setDirty(false);
  }, [profile]);

  const emailValid = email === '' || EMAIL_RE.test(email);
  const showEmailError = emailTouched && !emailValid;
  const languageEntries = useMemo(() => Object.entries(languages), [languages]);

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.cr }}>
        <StatusBar barStyle="light-content" />
      </View>
    );
  }

  const markDirty = () => setDirty(true);

  const cycleLang = (k: string) => {
    setLanguages((L) => {
      const cur = L[k];
      const next: LangLevel =
        cur === 'primary' ? 'secondary' : cur === 'secondary' ? 'off' : 'primary';
      return { ...L, [k]: next };
    });
    markDirty();
  };

  const moveRegion = (i: number, dir: -1 | 1) => {
    setRegions((arr) => {
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const next = [...arr];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    markDirty();
  };

  const removeRegion = (i: number) => {
    setRegions((arr) => arr.filter((_, k) => k !== i));
    markDirty();
  };

  const onCancel = () => {
    if (!dirty) {
      router.replace(Routes.teacherProfile);
      return;
    }
    confirm({
      title: t('editProfile.discard_title'),
      message: t('editProfile.discard_message'),
      confirmText: t('editProfile.discard_confirm'),
      destructive: true,
      onConfirm: () => router.replace(Routes.teacherProfile),
    });
  };

  const onSave = async () => {
    if (!dirty) return;
    if (!emailValid) {
      setEmailTouched(true);
      return;
    }
    await setProfile({
      ...profile,
      phone: phone.trim() || undefined,
      email: email.trim(),
      languages,
      preferredRegions: regions,
      personalNote: note,
    });
    setSavedFlash(true);
    setDirty(false);
    toast.success(t('editProfile.saved_toast'));
    setTimeout(() => {
      setSavedFlash(false);
      router.replace(Routes.teacherProfile);
    }, 900);
  };

  const lockedRows: { key: string; value: string }[] = [
    { key: t('editProfile.locked_name'), value: profile.name },
    {
      key: t('editProfile.locked_gender'),
      value: profile.gender === 'F' ? t('profile.female_at') : t('profile.male_at'),
    },
    {
      key: t('editProfile.locked_year'),
      value: String(profile.authorizedSince ?? '—'),
    },
    {
      key: t('editProfile.locked_auth'),
      value: t('editProfile.auth_types_count', {
        count: profile.authorizations?.length ?? 0,
      }),
    },
  ];

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#6B3600', Colors.sf] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.hero, { paddingTop: Math.max(54, insets.top + 14) }]}
        >
          <LotusHero color="white" opacity={0.07} size={170} right={-25} bottom={-25} />
          <View style={s.heroRow}>
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.85}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={s.backTile}
            >
              <Text style={s.backChevron}>‹</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>{t('editProfile.title')}</Text>
              <Text style={s.heroSub}>{t('editProfile.sub')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Locked notice banner ──────────────────────────────────────── */}
        <View style={s.noticeWrap}>
          <View style={s.noticeBox}>
            <Text style={s.noticeEmoji}>🔒</Text>
            <Text style={s.noticeText}>{t('editProfile.locked_notice')}</Text>
          </View>
        </View>

        {/* ── 1. Contact ─────────────────────────────────────────────────── */}
        <Text style={s.sph}>📞 {t('editProfile.contact')}</Text>
        <View style={s.card}>
          <View style={s.field}>
            <Text style={s.ilab}>{t('editProfile.phone')}</Text>
            <TextInput
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                markDirty();
              }}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              keyboardType="phone-pad"
              placeholder="+977 98XXXXXXXX"
              placeholderTextColor={Colors.tx3}
              style={[s.inp, phoneFocused ? s.inpFocused : null]}
            />
          </View>
          <View>
            <Text style={s.ilab}>{t('editProfile.email')}</Text>
            <TextInput
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                markDirty();
              }}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => {
                setEmailFocused(false);
                setEmailTouched(true);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="you@dhamma.org.np"
              placeholderTextColor={Colors.tx3}
              style={[
                s.inp,
                emailFocused ? s.inpFocused : null,
                showEmailError ? s.inpError : null,
              ]}
            />
            {showEmailError ? (
              <Text style={s.fieldError}>{t('editProfile.email_invalid')}</Text>
            ) : null}
          </View>
        </View>

        {/* ── 2. Teaching Languages ──────────────────────────────────────── */}
        <Text style={s.sph}>🗣 {t('editProfile.languages')}</Text>
        <View style={s.card}>
          <Text style={s.cardHint}>{t('editProfile.lang_hint')}</Text>
          {languageEntries.map(([k, level]) => {
            const isPrimary = level === 'primary';
            const isSecondary = level === 'secondary';
            const tileBg = isPrimary ? Colors.fol : isSecondary ? Colors.gdl : Colors.cr2;
            const tileFg = isPrimary ? Colors.fo : isSecondary ? Colors.gd : Colors.tx3;
            const icon = isPrimary ? '★' : isSecondary ? '·' : '✗';
            const chipBg = isPrimary ? Colors.fol : isSecondary ? Colors.gdl : Colors.cr2;
            const chipFg = isPrimary ? Colors.fo : isSecondary ? Colors.gd : Colors.tx2;
            const chipLabel = isPrimary
              ? t('editProfile.lang_primary')
              : isSecondary
                ? t('editProfile.lang_secondary')
                : t('editProfile.lang_off');
            return (
              <TouchableOpacity
                key={k}
                onPress={() => cycleLang(k)}
                activeOpacity={0.85}
                style={s.langRow}
              >
                <View style={[s.langTile, { backgroundColor: tileBg }]}>
                  <Text style={[s.langTileIcon, { color: tileFg }]}>{icon}</Text>
                </View>
                <Text style={[s.langName, { color: level === 'off' ? Colors.tx3 : Colors.tx }]}>
                  {k}
                </Text>
                <View style={[s.levelChip, { backgroundColor: chipBg }]}>
                  <Text style={[s.levelChipText, { color: chipFg }]}>{chipLabel}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 3. Preferred Regions ────────────────────────────────────────── */}
        <Text style={s.sph}>📍 {t('editProfile.regions')}</Text>
        <Text style={s.regionsHint}>{t('editProfile.regions_hint')}</Text>
        <View style={s.card}>
          {regions.map((r, i) => {
            const isFirst = i === 0;
            const isLast = i === regions.length - 1;
            return (
              <View key={`${r}-${i}`} style={[s.regionRow, { borderBottomWidth: isLast ? 0 : 1 }]}>
                <View style={s.regionRank}>
                  <Text style={s.regionRankText}>{i + 1}</Text>
                </View>
                <Text style={s.regionName}>{r}</Text>
                <ReorderButton glyph="↑" disabled={isFirst} onPress={() => moveRegion(i, -1)} />
                <ReorderButton glyph="↓" disabled={isLast} onPress={() => moveRegion(i, 1)} />
                <TouchableOpacity
                  onPress={() => removeRegion(i)}
                  activeOpacity={0.7}
                  style={s.removeBtn}
                >
                  <Text style={s.removeBtnText}>×</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* ── 4. Personal Note ────────────────────────────────────────────── */}
        <Text style={s.sph}>💬 {t('editProfile.note')}</Text>
        <View style={s.card}>
          <TextInput
            value={note}
            onChangeText={(v) => {
              setNote(v);
              markDirty();
            }}
            onFocus={() => setNoteFocused(true)}
            onBlur={() => setNoteFocused(false)}
            placeholder={t('editProfile.note_placeholder')}
            placeholderTextColor={Colors.tx3}
            multiline
            textAlignVertical="top"
            style={[s.inp, s.noteInput, noteFocused ? s.inpFocused : null]}
          />
          <Text style={s.charCount}>{note.length} chars</Text>
        </View>

        {/* ── 5. Locked Preview ────────────────────────────────────────── */}
        <Text style={s.sph}>🔒 {t('editProfile.locked_header')}</Text>
        <View style={[s.card, s.lockedCard]}>
          {lockedRows.map((row, i) => (
            <React.Fragment key={row.key}>
              <View style={s.lockedRow}>
                <View style={s.lockedKeyRow}>
                  <Text style={s.lockedKeyText}>🔒 {row.key}</Text>
                </View>
                <Text style={s.lockedValueText}>{row.value}</Text>
              </View>
              {i < lockedRows.length - 1 ? <DashedDivider marginVertical={0} /> : null}
            </React.Fragment>
          ))}
        </View>

        {/* ── 6. Action row ─────────────────────────────────────────────── */}
        <View style={s.actionRow}>
          <TouchableOpacity
            onPress={onCancel}
            activeOpacity={0.85}
            style={[s.btnSm, s.btnOu, { flex: 1 }]}
          >
            <Text style={s.btnOuText}>{t('editProfile.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSave}
            activeOpacity={0.85}
            disabled={!dirty}
            style={[{ flex: 2 }, !dirty ? s.btnDisabled : null]}
          >
            <LinearGradient
              colors={[Colors.sf, Colors.sfd] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.btnSm, s.btnPr]}
            >
              <Text style={s.btnPrText}>
                {savedFlash ? t('editProfile.saved') : t('editProfile.save')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ReorderButton({
  glyph,
  disabled,
  onPress,
}: {
  glyph: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        s.reorderBtn,
        disabled ? s.reorderBtnDisabled : null,
        pressed && !disabled ? { transform: [{ scale: 0.94 }] } : null,
      ]}
    >
      <Text style={[s.reorderBtnText, disabled ? s.reorderBtnTextDisabled : null]}>{glyph}</Text>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex: { flex: 1 },

  // Hero
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    position: 'relative',
  },
  backTile: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.white,
    lineHeight: 16,
    marginTop: -1,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.white,
    lineHeight: 23,
  },
  heroSub: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },

  // Locked notice banner
  noticeWrap: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  noticeBox: {
    backgroundColor: Colors.bll,
    borderWidth: 1,
    borderColor: '#BDD4EE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noticeEmoji: {
    fontSize: 18,
  },
  noticeText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    lineHeight: 17,
  },

  // Section header
  sph: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
    marginTop: 18,
    marginHorizontal: 18,
    marginBottom: 9,
  },

  // Card base
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    ...Shadows.card,
  },
  cardHint: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    fontStyle: 'italic',
    color: Colors.tx3,
    marginBottom: 8,
  },

  // Contact field + .ilab + .inp
  field: {
    marginBottom: 13,
  },
  ilab: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.44,
    marginBottom: 5,
  },
  inp: {
    backgroundColor: Colors.cr,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 14,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx,
  },
  inpFocused: {
    borderColor: Colors.sf,
    backgroundColor: Colors.white,
  },
  inpError: {
    borderColor: Colors.ur,
  },
  fieldError: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.ur,
    marginTop: 4,
  },
  noteInput: {
    minHeight: 130,
    lineHeight: 21,
  },
  charCount: {
    fontSize: 10.5,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 6,
    textAlign: 'right',
  },

  // Languages
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  langTile: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  langTileIcon: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
  },
  langName: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  levelChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  levelChipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Regions
  regionsHint: {
    paddingHorizontal: 18,
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    fontStyle: 'italic',
    marginTop: -4,
    marginBottom: 6,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 9,
    borderBottomColor: Colors.bd,
  },
  regionRank: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: Colors.sf,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  regionRankText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.white,
  },
  regionName: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx,
  },
  reorderBtn: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cr,
    borderWidth: 1,
    borderColor: Colors.bd,
  },
  reorderBtnDisabled: {
    backgroundColor: Colors.cr2,
    borderColor: Colors.bd,
  },
  reorderBtnText: {
    fontSize: 13,
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
  },
  reorderBtnTextDisabled: {
    color: Colors.tx3,
  },
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.url,
    borderWidth: 1,
    borderColor: '#F5C0BB',
  },
  removeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.ur,
  },

  // Locked preview
  lockedCard: {
    backgroundColor: Colors.cr,
    opacity: 0.85,
  },
  lockedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  lockedKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  lockedKeyText: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
  },
  lockedValueText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    flexShrink: 1,
    textAlign: 'right',
  },

  // Action row + .btn.sm variants
  actionRow: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 6,
  },
  btnSm: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOu: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.bd2,
  },
  btnOuText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  btnPr: {
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  btnPrText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.white,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
