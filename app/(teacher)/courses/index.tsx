import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../src/store/authStore';
import { useProfileStore } from '../../../src/store/profileStore';
import { useApplicationsStore } from '../../../src/store/applicationsStore';
import { Colors } from '../../../src/theme/colors';
import { FontSize, FontWeight } from '../../../src/theme/typography';
import { Layout, Spacing } from '../../../src/theme/spacing';
import { SearchBar } from '../../../src/components/ui/SearchBar';
import { FilterRow } from '../../../src/components/ui/FilterChip';
import { CourseCard } from '../../../src/components/cards/CourseCard';
import { SectionHeader } from '../../../src/components/layout/SectionHeader';
import { useCoursesStore } from '../../../src/store/coursesStore';
import { Course } from '../../../src/types';
import { enrichCoursesWithMatch } from '../../../src/utils/matching';
import centresData from '../../../src/data/centers.json';

const TYPE_OPTIONS = ['All', '10-Day', 'Satipatthana', '20-Day', "Children's", '1-Day'];

// centreId → region lookup
const CENTRE_REGION: Record<string, string> = Object.fromEntries(
  (centresData as any[]).map((c) => [c.id, c.region as string])
);

const REGION_OPTIONS = ['All Nepal', 'Kathmandu Valley', 'Pokhara & Gandaki', 'Lumbini & Terai'];

export default function CoursesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId) ?? '';
  const { profile, loadProfile } = useProfileStore();
  const { applications, loadApplications } = useApplicationsStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All Nepal');

  useEffect(() => {
    loadProfile(userId);
    loadApplications(userId);
  }, [userId]);

  const courses = useCoursesStore((s) => s.courses) as Course[];
  const visibleCourses = useMemo(
    () => courses.filter((c) => (c.needCount ?? 1) > 0),
    [courses]
  );
  const enriched = useMemo(
    () => (profile ? enrichCoursesWithMatch(visibleCourses, profile) : visibleCourses),
    [visibleCourses, profile]
  );

  const filtered = enriched.filter((c) => {
    const matchesSearch =
      search === '' ||
      c.center.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'All' ||
      c.type.includes(filter) ||
      (filter === 'Satipatthana' && c.type === 'Satipatthana Sutta') ||
      (filter === "Children's" && c.type === "Children's Anapana");

    const courseRegion = CENTRE_REGION[c.centerId] ?? '';
    const matchesRegion =
      regionFilter === 'All Nepal' || courseRegion === regionFilter;

    return matchesSearch && matchesFilter && matchesRegion;
  });

  const appliedIds = new Set(applications.map((a) => a.courseId));
  const approvedIds = new Set(
    applications.filter((a) => a.status === 'approved').map((a) => a.courseId)
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      {/* Header */}
      <View style={styles.header}>
        <SectionHeader title={t('courses.title')} style={styles.sectionHeader} />
      </View>

      {/* Search */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={t('courses.search')}
      />

      {/* Type filters */}
      <FilterRow
        options={TYPE_OPTIONS}
        active={filter}
        onSelect={setFilter}
        activeColor={Colors.sf}
      />

      {/* Region filter */}
      <View style={styles.locationRow}>
        <Text style={styles.locationLabel}>🗺</Text>
        <FilterRow
          options={REGION_OPTIONS}
          active={regionFilter}
          onSelect={setRegionFilter}
          activeColor={Colors.bl}
        />
      </View>

      {/* Course list */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('courses.noResults')}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              isApplied={appliedIds.has(item.id)}
              isAssigned={approvedIds.has(item.id)}
              onPress={() => router.push(`/(teacher)/courses/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.cr,
  },
  sectionHeader: {
    marginTop: 0,
    paddingTop: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  locationLabel: {
    fontSize: 14,
    paddingLeft: 14,
    paddingRight: 2,
  },
  list: {
    paddingBottom: 110,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.horizontalPad,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.tx3,
    textAlign: 'center',
  },
});
