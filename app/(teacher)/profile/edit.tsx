import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/authStore';
import { useProfileStore } from '../../../src/store/profileStore';
import { Colors } from '../../../src/theme/colors';
import { FontSize, FontWeight } from '../../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../../src/theme/spacing';
import { Shadows } from '../../../src/theme/shadows';
import { AvailabilityCalendar } from '../../../src/components/ui/AvailabilityCalendar';
import { Button } from '../../../src/components/ui/Button';
import { AvailabilityState, LanguageLevel } from '../../../src/types';

const ALL_LANGUAGES = ['Nepali', 'English', 'Hindi', 'Gujarati', 'German', 'French', 'Spanish'];
const ALL_AUTHORIZATIONS = [
  { key: '10-Day', emoji: '🪷' },
  { key: '20-Day', emoji: '🌿' },
  { key: '30-Day', emoji: '🌳' },
  { key: 'Satipatthana Sutta', emoji: '📿' },
  { key: "Children's Anapana", emoji: '👦' },
  { key: 'Teen Course', emoji: '🧒' },
  { key: 'Executive', emoji: '💼' },
];
const ALL_REGIONS = [
  'Kathmandu Valley',
  'Pokhara & Gandaki',
  'Lumbini & Terai',
  'Koshi',
  'Madhesh',
  'International',
];
const LEVEL_CYCLE: Record<LanguageLevel, LanguageLevel> = {
  off: 'primary',
  primary: 'secondary',
  secondary: 'off',
};

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.userId) ?? '';
  const { profile, loadProfile, updateProfile } = useProfileStore();

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [languages, setLanguages] = useState<Record<string, LanguageLevel>>({});
  const [regions, setRegions] = useState<string[]>([]);
  const [availability, setAvailability] = useState<AvailabilityState[]>(
    Array(12).fill(0) as AvailabilityState[]
  );
  const [note, setNote] = useState('');
  const [authorizations, setAuthorizations] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile(userId).then(() => {
      if (profile) {
        setPhone(profile.phone ?? '');
        setEmail(profile.email ?? '');
        setLanguages({ ...profile.languages } as Record<string, LanguageLevel>);
        setRegions([...profile.preferredRegions]);
        setAvailability([...profile.monthlyAvailability]);
        setNote(profile.personalNote ?? '');
        setAuthorizations([...(profile.authorizations ?? [])]);
      }
    });
  }, [userId]);

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone ?? '');
      setEmail(profile.email ?? '');
      setLanguages({ ...profile.languages } as Record<string, LanguageLevel>);
      setRegions([...profile.preferredRegions]);
      setAvailability([...profile.monthlyAvailability]);
      setNote(profile.personalNote ?? '');
      setAuthorizations([...(profile.authorizations ?? [])]);
    }
  }, [profile?.id]);

  const toggleLanguage = (lang: string) => {
    const current = (languages[lang] ?? 'off') as LanguageLevel;
    setLanguages((prev) => ({ ...prev, [lang]: LEVEL_CYCLE[current] }));
  };

  const toggleRegion = (region: string) => {
    setRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        phone,
        email,
        languages: languages as Record<string, LanguageLevel>,
        preferredRegions: regions,
        monthlyAvailability: availability,
        personalNote: note,
        authorizations: authorizations as any,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const langLevel = (lang: string) => (languages[lang] ?? 'off') as LanguageLevel;
  const langColor = (level: LanguageLevel) =>
    level === 'primary' ? Colors.sf : level === 'secondary' ? Colors.tx3 : Colors.cr3;
  const langTextColor = (level: LanguageLevel) =>
    level === 'primary' ? Colors.white : level === 'secondary' ? Colors.white : Colors.tx3;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t('editProfile.title')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('editProfile.contact')}</Text>
          <Text style={styles.fieldLabel}>{t('editProfile.phone')}</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="+977 98..."
            placeholderTextColor={Colors.tx3}
            keyboardType="phone-pad"
          />
          <Text style={styles.fieldLabel}>{t('editProfile.email')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="email@dhamma.np"
            placeholderTextColor={Colors.tx3}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('editProfile.languages')}</Text>
          <Text style={styles.hint}>{t('editProfile.languageHint')}</Text>
          <View style={styles.langGrid}>
            {ALL_LANGUAGES.map((lang) => {
              const level = langLevel(lang);
              return (
                <TouchableOpacity
                  key={lang}
                  onPress={() => toggleLanguage(lang)}
                  activeOpacity={0.75}
                  style={[styles.langChip, { backgroundColor: langColor(level) }]}
                >
                  <Text style={[styles.langChipText, { color: langTextColor(level) }]}>
                    {lang}
                    {level !== 'off' ? ` · ${level === 'primary' ? '★' : '☆'}` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Regions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('editProfile.regions')}</Text>
          {ALL_REGIONS.map((region) => (
            <TouchableOpacity
              key={region}
              onPress={() => toggleRegion(region)}
              activeOpacity={0.8}
              style={[
                styles.regionRow,
                regions.includes(region) && { backgroundColor: Colors.sfl },
              ]}
            >
              <Text style={[styles.regionText, regions.includes(region) && { color: Colors.sf, fontWeight: FontWeight.bold }]}>
                {region}
              </Text>
              {regions.includes(region) && (
                <Text style={styles.regionCheck}>✓ #{regions.indexOf(region) + 1}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('editProfile.availability')}</Text>
          <Text style={styles.hint}>{t('editProfile.availabilityHint')}</Text>
          <AvailabilityCalendar
            availability={availability}
            editable
            onToggle={toggleAvailability}
          />
        </View>

        {/* Authorizations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Authorizations</Text>
          <Text style={styles.hint}>Tap to toggle your teaching authorizations</Text>
          <View style={styles.authGrid}>
            {ALL_AUTHORIZATIONS.map(({ key, emoji }) => {
              const selected = authorizations.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() =>
                    setAuthorizations((prev) =>
                      selected ? prev.filter((a) => a !== key) : [...prev, key]
                    )
                  }
                  activeOpacity={0.75}
                  style={[
                    styles.authChip,
                    selected && { backgroundColor: Colors.fo, borderColor: Colors.fo },
                  ]}
                >
                  <Text style={styles.authEmoji}>{emoji}</Text>
                  <Text style={[styles.authText, selected && { color: Colors.white }]}>{key}</Text>
                  {selected && <Text style={styles.authCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Personal Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('editProfile.note')}</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            style={[styles.input, styles.textarea]}
            placeholder={t('editProfile.notePlaceholder')}
            placeholderTextColor={Colors.tx3}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Locked fields notice */}
        <View style={styles.lockedNotice}>
          <Text style={styles.lockedText}>🔒 {t('editProfile.lockedFields')}</Text>
        </View>

        {/* Save */}
        <View style={styles.saveSection}>
          <Button
            label={t('editProfile.saveChanges')}
            variant="primary"
            fullWidth
            loading={saving}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: 12,
    backgroundColor: Colors.cr,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  backBtn: { paddingVertical: 4 },
  backText: {
    fontSize: FontSize.smPlus,
    color: Colors.sf,
    fontWeight: FontWeight.semibold,
  },
  navTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },

  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: 10,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    fontStyle: 'italic',
  },

  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.tx2,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.cr2,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: Radius.md,
    paddingHorizontal: Layout.inputPadH,
    paddingVertical: Layout.inputPadV,
    fontSize: FontSize.md,
    color: Colors.tx,
  },
  textarea: {
    height: 100,
    paddingTop: 12,
  },

  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  langChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  regionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.bd,
  },
  regionText: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
    fontWeight: FontWeight.medium,
  },
  regionCheck: {
    fontSize: FontSize.sm,
    color: Colors.sf,
    fontWeight: FontWeight.bold,
  },

  authGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  authChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
  },
  authEmoji: { fontSize: 14 },
  authText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.tx2,
  },
  authCheck: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },

  lockedNotice: {
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.md,
    backgroundColor: Colors.cr2,
    borderRadius: Radius.sm,
    padding: 12,
  },
  lockedText: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    lineHeight: FontSize.sm * 1.5,
  },

  saveSection: {
    padding: Layout.horizontalPad,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },
});
