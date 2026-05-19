/**
 * Admin Directory — implements `specs/24-admin-directory.md`.
 *
 * Prototype-faithful port of `app.html:2115–2206` (`AdminDir`).
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
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
import Svg, { Circle, Path } from 'react-native-svg';

import { Routes, routeTo } from '@/routes';
import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { adminApplications } from '@/data';
import { useTeachersStore } from '@/store/teachersStore';
import type { StoredTeacher } from '@/store/teachersStore';

type LangFilter = 'All' | 'Nepali' | 'English' | 'Hindi' | 'German';
const FILTERS: LangFilter[] = ['All', 'Nepali', 'English', 'Hindi', 'German'];

interface DirectoryTeacher {
  name: string;
  gender: 'M' | 'F';
  langs: string[];
  regions: string[];
  types: string;
  total: number;
  avail: boolean;
  flag: string;
}

const TEACHERS: DirectoryTeacher[] = [
  {
    name: 'Bhikkhu Ananda',
    gender: 'M',
    langs: ['Nepali', 'English', 'Hindi'],
    regions: ['Kathmandu', 'Pokhara', 'Lumbini'],
    types: '10-Day, Satip., 20-Day',
    total: 47,
    avail: true,
    flag: '🇳🇵',
  },
  {
    name: 'Asha Mehta',
    gender: 'F',
    langs: ['Nepali', 'English'],
    regions: ['Kathmandu'],
    types: '10-Day, Satip.',
    total: 23,
    avail: true,
    flag: '🇳🇵',
  },
  {
    name: 'Ram Prasad Sharma',
    gender: 'M',
    langs: ['Nepali', 'Hindi'],
    regions: ['Lumbini', 'Madhesh'],
    types: '10-Day',
    total: 18,
    avail: true,
    flag: '🇳🇵',
  },
  {
    name: 'Sita Devi',
    gender: 'F',
    langs: ['Nepali'],
    regions: ['Koshi', 'Itahari'],
    types: '10-Day',
    total: 14,
    avail: false,
    flag: '🇳🇵',
  },
  {
    name: 'Gopal Thapa',
    gender: 'M',
    langs: ['Nepali', 'English'],
    regions: ['Kathmandu', 'Pokhara'],
    types: '10-Day, 20-Day, 30-Day',
    total: 29,
    avail: true,
    flag: '🇳🇵',
  },
  {
    name: 'Kamala Gurung',
    gender: 'F',
    langs: ['Nepali', 'English'],
    regions: ['Pokhara', 'Gandaki'],
    types: '10-Day, Satip.',
    total: 12,
    avail: true,
    flag: '🇳🇵',
  },
];

function toDirectoryRow(t: StoredTeacher): DirectoryTeacher {
  const langs = Object.keys(t.languages ?? {});
  const types =
    (t.authorizations ?? [])
      .map((a) => a.replace(/ Course$/, '').replace('Satipatthana Sutta', 'Satip.'))
      .join(', ') || '—';
  return {
    name: t.name,
    gender: t.gender,
    langs: langs.length ? langs : ['—'],
    regions: t.preferredRegions ?? [],
    types,
    total: t.totalCourses ?? 0,
    avail: true,
    flag: t.flag || '🇳🇵',
  };
}

export default function AdminDirectoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LangFilter>('All');

  const allTeachers = useTeachersStore((s) => s.allTeachers);
  const loadTeachers = useTeachersStore((s) => s.loadTeachers);
  React.useEffect(() => {
    if (allTeachers.length === 0) loadTeachers();
  }, [allTeachers.length, loadTeachers]);

  const dirRows: DirectoryTeacher[] = useMemo(() => {
    const fromStore = allTeachers
      .filter((t) => (t.role ?? 'teacher') === 'teacher')
      .map(toDirectoryRow);
    // Fall back to the hardcoded sample data only when the store is empty
    // (e.g. very first launch before any seeds have run).
    return fromStore.length ? fromStore : TEACHERS;
  }, [allTeachers]);

  const filtered = useMemo(
    () =>
      dirRows.filter(
        (tc) =>
          (query === '' || tc.name.toLowerCase().includes(query.toLowerCase())) &&
          (filter === 'All' || tc.langs.includes(filter)),
      ),
    [dirRows, query, filter],
  );

  const openProfile = (name: string) => {
    // Resolve the directory row's display name back to a teacher record in
    // the store. We match by exact name first; if nothing matches (e.g.
    // the row came from the hardcoded sample TEACHERS list), fall back to
    // the legacy application-review route so the screen still resolves.
    const t = allTeachers.find((x) => x.name === name);
    if (t) {
      router.push(routeTo.adminTeacherDetail(t.id));
      return;
    }
    const match = adminApplications.find((a) => a.name === name) ?? adminApplications[0];
    router.push(routeTo.adminApplicationReview(match.id));
  };

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Header (white) ──────────────────────────────────── */}
        <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
          <View style={s.headerTopRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={s.title}>{t('admin.directory.title')}</Text>
              <Text style={s.subtitle}>{dirRows.length} active assistant teachers</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(Routes.adminDirectoryAdd)}
            >
              <LinearGradient
                colors={Gradients.primaryCta}
                start={GradientDirection.button.start}
                end={GradientDirection.button.end}
                style={s.addBtn}
              >
                <Text numberOfLines={1} style={s.addBtnText}>
                  {t('admin.directory.add_teacher')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Search + filter row (white wrapper) ─────────────── */}
        <View style={s.filterWrap}>
          <View style={s.sbar}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx={11} cy={11} r={7} stroke={Colors.tx3} strokeWidth={1.8} />
              <Path
                d="M16.5 16.5L21 21"
                stroke={Colors.tx3}
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </Svg>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name…"
              placeholderTextColor={Colors.tx3}
              style={s.searchInput}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.frowContent}
          >
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  activeOpacity={0.85}
                  style={[
                    s.fchip,
                    active
                      ? { backgroundColor: Colors.sf, borderColor: Colors.sf }
                      : {
                          backgroundColor: Colors.white,
                          borderColor: Colors.bd2,
                        },
                  ]}
                >
                  <Text style={[s.fchipText, { color: active ? Colors.white : Colors.tx2 }]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── Cream gap ───────────────────────────────────────── */}
        <View style={{ height: 8, backgroundColor: Colors.cr }} />

        {/* ─── Teacher cards ───────────────────────────────────── */}
        {filtered.length === 0 ? (
          <Text style={s.emptyState}>{t('admin.directory.empty_state')}</Text>
        ) : (
          filtered.map((tc) => (
            <View key={tc.name} style={s.card}>
              <View style={s.cardTopRow}>
                <View style={{ position: 'relative' }}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{tc.name[0]}</Text>
                  </View>
                  {tc.avail && <View style={s.availDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.nameRow}>
                    <Text style={s.name} numberOfLines={1}>
                      {tc.name} {tc.flag}
                    </Text>
                    <View
                      style={[
                        s.spill,
                        {
                          backgroundColor: tc.avail ? Colors.fol : Colors.url,
                        },
                      ]}
                    >
                      <Text style={[s.spillText, { color: tc.avail ? Colors.fo : Colors.ur }]}>
                        {tc.avail ? '● Available' : '● Busy'}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.meta}>
                    {tc.gender === 'M' ? 'Male' : 'Female'} AT · {tc.total} courses ·{' '}
                    {tc.regions.join(', ')}
                  </Text>
                  <View style={s.chipsRow}>
                    {tc.langs.map((l) => (
                      <View key={l} style={s.chipBl}>
                        <Text style={s.chipBlText}>{l}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={s.types}>{tc.types}</Text>
                </View>
              </View>
              <View style={s.actionsRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => openProfile(tc.name)}
                  style={[s.actionBtn, s.viewBtn, { flex: 1 }]}
                >
                  <Text numberOfLines={1} style={[s.actionBtnText, { color: Colors.tx }]}>
                    View Profile
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => Alert.alert(t('common.coming_soon'))}
                  style={{ flex: 1, minHeight: 32 }}
                >
                  <LinearGradient
                    colors={Gradients.primaryCta}
                    start={GradientDirection.button.start}
                    end={GradientDirection.button.end}
                    style={[s.actionBtn, { flex: 1 }]}
                  >
                    <Text numberOfLines={1} style={[s.actionBtnText, { color: Colors.white }]}>
                      📨 Assign to Course
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },

  // Header
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.tx,
    fontFamily: FontFamily.sansExtraBold,
  },
  subtitle: {
    fontSize: 13.5,
    color: Colors.tx2,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },
  addBtn: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },

  // Filter wrapper
  filterWrap: {
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  sbar: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: Colors.tx,
    padding: 0,
    fontFamily: FontFamily.sansRegular,
  },
  frowContent: {
    gap: 7,
  },
  fchip: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  fchipText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Empty state
  emptyState: {
    fontSize: 13,
    color: Colors.tx3,
    textAlign: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    fontFamily: FontFamily.sansRegular,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    shadowColor: Colors.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.sfm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.sfd,
    fontFamily: FontFamily.sansBold,
  },
  availDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: Colors.fo,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.tx,
    flexShrink: 1,
    fontFamily: FontFamily.sansBold,
  },
  spill: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    flexShrink: 0,
  },
  spillText: {
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  meta: {
    fontSize: 11.5,
    color: Colors.tx2,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    marginTop: 5,
  },
  chipBl: {
    backgroundColor: Colors.bll,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  chipBlText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.bl,
    fontFamily: FontFamily.sansSemiBold,
  },
  types: {
    fontSize: 10.5,
    color: Colors.tx3,
    marginTop: 4,
    fontFamily: FontFamily.sansRegular,
  },

  // Action buttons
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.bd,
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  viewBtn: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.bd2,
  },
});
