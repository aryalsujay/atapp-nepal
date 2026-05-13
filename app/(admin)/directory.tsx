import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTeachersStore, StoredTeacher } from '@/store/teachersStore';

const ALL_LANGUAGES = ['All', 'Nepali', 'English', 'Hindi'];

export default function AdminDirectory() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('All');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    gender: 'M' as 'M' | 'F',
    yearAuthorized: '',
    region: '',
    authorizations: [] as string[],
    contactMethod: 'email' as 'email' | 'phone',
    contact: '',
  });
  const [inviteResult, setInviteResult] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);

  const { allTeachers, addTeacher } = useTeachersStore();

  const teachers = allTeachers.filter((teacher) => {
    const matchSearch =
      search === '' ||
      teacher.name.toLowerCase().includes(search.toLowerCase()) ||
      (teacher.region ?? '').toLowerCase().includes(search.toLowerCase());

    const matchLang =
      langFilter === 'All' ||
      Object.entries(teacher.languages as Record<string, string>).some(
        ([lang, level]) => lang === langFilter && level !== 'off',
      );

    return matchSearch && matchLang;
  });

  const handleCreateTeacher = async () => {
    if (!newTeacher.name.trim()) {
      toast.error('Please enter teacher name.', 'Required');
      return;
    }
    const num = String(allTeachers.length + 1).padStart(3, '0');
    const code = `AT-${num}`;
    const id = `teacher-${Date.now()}`;
    const teacher: StoredTeacher = {
      id,
      name: newTeacher.name.trim(),
      gender: newTeacher.gender,
      email: newTeacher.contact.includes('@') ? newTeacher.contact.trim() : `${id}@dhamma.np`,
      inviteCode: code,
      passwordHash: 'demo123',
      region: newTeacher.region.trim() || 'Nepal',
      flag: '🇳🇵',
      authorizedSince: parseInt(newTeacher.yearAuthorized) || new Date().getFullYear(),
      totalCourses: 0,
      centersServed: 0,
      coursesThisYear: 0,
      authorizations: newTeacher.authorizations,
      languages: { Nepali: 'primary', English: 'secondary' },
      preferredRegions: newTeacher.region ? [newTeacher.region] : ['Kathmandu Valley'],
      availableMonths: [],
      festivalMonths: [],
      personalNote: '',
      teachingHistory: [],
      isOnboarded: false,
    };
    await addTeacher(teacher);
    setInviteResult({ name: newTeacher.name, email: teacher.email, password: 'demo123' });
  };

  const langLabel = (langs: Record<string, string>) =>
    Object.entries(langs)
      .filter(([, v]) => v === 'primary')
      .map(([k]) => k)
      .slice(0, 2)
      .join(', ');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <SectionHeader
        title={t('admin.directory.title')}
        action={`+ ${t('admin.directory.addTeacher')}`}
        onAction={() => setShowAddSheet(true)}
        style={styles.header}
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={t('admin.directory.search')}
      />

      {/* Language filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {ALL_LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang}
            onPress={() => setLangFilter(lang)}
            style={[
              styles.filterChip,
              langFilter === lang && { backgroundColor: Colors.bl, borderColor: Colors.bl },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: langFilter === lang ? Colors.white : Colors.tx2 },
              ]}
            >
              {lang}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {teachers.map((teacher) => {
          const primaryLangs = langLabel(teacher.languages);
          const isAvailable = teacher.availableMonths.length > 0;

          return (
            <View key={teacher.id} style={styles.teacherCard}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: teacher.gender === 'F' ? '#FBE8F0' : Colors.fol },
                  ]}
                >
                  <Text style={styles.avatarText}>{teacher.name.charAt(0)}</Text>
                </View>
                <View style={styles.teacherInfo}>
                  <Text style={styles.teacherName}>{teacher.name}</Text>
                  <Text style={styles.teacherMeta}>
                    {teacher.gender === 'F' ? '👩' : '👨'} · {primaryLangs} · {teacher.region}
                  </Text>
                  <Text style={styles.teacherStats}>
                    {teacher.totalCourses} courses · Since {teacher.authorizedSince}
                  </Text>
                </View>
                <View
                  style={[
                    styles.availBadge,
                    { backgroundColor: isAvailable ? Colors.fol : Colors.cr3 },
                  ]}
                >
                  <Text style={[styles.availText, { color: isAvailable ? Colors.fo : Colors.tx3 }]}>
                    {isAvailable ? 'Available' : 'Busy'}
                  </Text>
                </View>
              </View>

              {/* Authorizations */}
              <View style={styles.authRow}>
                {(teacher.authorizations as string[]).slice(0, 3).map((auth: string) => (
                  <Chip key={auth} label={auth} variant="green" style={styles.authChip} />
                ))}
                {(teacher.authorizations as string[]).length > 3 && (
                  <Chip
                    label={`+${(teacher.authorizations as string[]).length - 3}`}
                    variant="gray"
                  />
                )}
              </View>

              {/* Action buttons */}
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.profileBtn} activeOpacity={0.8}>
                  <Text style={styles.profileBtnText}>{t('admin.directory.viewProfile')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.assignBtn} activeOpacity={0.8}>
                  <Text style={styles.assignBtnText}>{t('admin.directory.assign')} →</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Add Teacher Bottom Sheet */}
      <Modal
        visible={showAddSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddSheet(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowAddSheet(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          {inviteResult ? (
            <View style={styles.inviteSuccess}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successTitle}>Teacher Added!</Text>
              <Text style={styles.successName}>{inviteResult.name}</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Login Credentials</Text>
                <Text style={styles.codeValue} numberOfLines={1} adjustsFontSizeToFit>
                  {inviteResult.email}
                </Text>
                <Text style={styles.codeHint}>Password: {inviteResult.password}</Text>
              </View>
              <Text style={styles.codeInstructions}>
                Share these credentials with the teacher. They will complete onboarding on first
                login.
              </Text>
              <Button
                label="Done"
                variant="primary"
                fullWidth
                onPress={() => {
                  setShowAddSheet(false);
                  setInviteResult(null);
                  setNewTeacher({
                    name: '',
                    gender: 'M',
                    yearAuthorized: '',
                    region: '',
                    authorizations: [],
                    contactMethod: 'email',
                    contact: '',
                  });
                }}
              />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>{t('admin.addTeacher.title')}</Text>

              <Text style={styles.fieldLabel}>{t('admin.addTeacher.name')}</Text>
              <TextInput
                value={newTeacher.name}
                onChangeText={(v) => setNewTeacher((p) => ({ ...p, name: v }))}
                style={styles.sheetInput}
                placeholder={t('admin.addTeacher.namePlaceholder')}
                placeholderTextColor={Colors.tx3}
              />

              <Text style={styles.fieldLabel}>{t('admin.addTeacher.gender')}</Text>
              <View style={styles.genderRow}>
                {(['M', 'F'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setNewTeacher((p) => ({ ...p, gender: g }))}
                    style={[
                      styles.genderBtn,
                      newTeacher.gender === g && {
                        backgroundColor: Colors.sf,
                        borderColor: Colors.sf,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderBtnText,
                        { color: newTeacher.gender === g ? Colors.white : Colors.tx2 },
                      ]}
                    >
                      {g === 'M' ? '👨 Male' : '👩 Female'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>{t('admin.addTeacher.yearAuthorized')}</Text>
              <TextInput
                value={newTeacher.yearAuthorized}
                onChangeText={(v) => setNewTeacher((p) => ({ ...p, yearAuthorized: v }))}
                style={styles.sheetInput}
                placeholder="e.g. 2014"
                placeholderTextColor={Colors.tx3}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>{t('admin.addTeacher.homeRegion')}</Text>
              <TextInput
                value={newTeacher.region}
                onChangeText={(v) => setNewTeacher((p) => ({ ...p, region: v }))}
                style={styles.sheetInput}
                placeholder="e.g. Kathmandu Valley"
                placeholderTextColor={Colors.tx3}
              />

              <Text style={styles.fieldLabel}>{t('admin.addTeacher.authorizations')}</Text>
              <View style={styles.authToggleRow}>
                {[
                  '10-Day',
                  '20-Day',
                  'Satipatthana Sutta',
                  "Children's Anapana",
                  'Teen Course',
                ].map((type) => {
                  const selected = newTeacher.authorizations.includes(type);
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() =>
                        setNewTeacher((p) => ({
                          ...p,
                          authorizations: selected
                            ? p.authorizations.filter((a) => a !== type)
                            : [...p.authorizations, type],
                        }))
                      }
                      style={[
                        styles.authToggle,
                        selected && { backgroundColor: Colors.fo, borderColor: Colors.fo },
                      ]}
                    >
                      <Text
                        style={[
                          styles.authToggleText,
                          { color: selected ? Colors.white : Colors.tx2 },
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>{t('admin.addTeacher.contact')}</Text>
              <TextInput
                value={newTeacher.contact}
                onChangeText={(v) => setNewTeacher((p) => ({ ...p, contact: v }))}
                style={styles.sheetInput}
                placeholder="Email or phone"
                placeholderTextColor={Colors.tx3}
                autoCapitalize="none"
              />

              <View style={styles.sheetActions}>
                <Button
                  label={t('common.cancel')}
                  variant="outline"
                  onPress={() => setShowAddSheet(false)}
                  style={styles.cancelBtn}
                />
                <Button
                  label={t('admin.addTeacher.sendInvite')}
                  variant="primary"
                  onPress={handleCreateTeacher}
                  style={styles.inviteBtn}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 20 },
  filterRow: {
    paddingHorizontal: Layout.horizontalPad,
    paddingVertical: 8,
    gap: 6,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
  },
  filterChipText: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
  },
  list: { paddingBottom: 110, paddingTop: 4 },

  teacherCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 5,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.fo,
  },
  teacherInfo: { flex: 1, gap: 2 },
  teacherName: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  teacherMeta: {
    fontSize: FontSize.sm,
    color: Colors.tx2,
  },
  teacherStats: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
  },
  availBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  availText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  authRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  authChip: {},
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.bd,
    paddingTop: 10,
  },
  profileBtn: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: Colors.cr2,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  profileBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.tx2,
  },
  assignBtn: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: Colors.bll,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  assignBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.bl,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Layout.horizontalPad,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.bd2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.tx2,
    marginBottom: 6,
    marginTop: 10,
  },
  sheetInput: {
    backgroundColor: Colors.cr2,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FontSize.md,
    color: Colors.tx,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    alignItems: 'center',
  },
  genderBtnText: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
  },
  authToggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  authToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
  },
  authToggleText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  cancelBtn: { flex: 1 },
  inviteBtn: { flex: 2 },

  inviteSuccess: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  successEmoji: { fontSize: 52 },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  successName: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
  },
  codeBox: {
    backgroundColor: Colors.sfl,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    width: '100%',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.sfm,
  },
  codeLabel: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeValue: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.extrabold,
    color: Colors.sf,
    letterSpacing: 2,
  },
  codeHint: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },
  codeInstructions: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    textAlign: 'center',
    lineHeight: FontSize.sm * 1.5,
  },
});
