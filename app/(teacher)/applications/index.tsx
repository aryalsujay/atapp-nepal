import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../src/store/authStore';
import { useApplicationsStore } from '../../../src/store/applicationsStore';
import { Colors } from '../../../src/theme/colors';
import { FontSize, FontWeight } from '../../../src/theme/typography';
import { Layout, Spacing, Radius } from '../../../src/theme/spacing';
import { SectionHeader } from '../../../src/components/layout/SectionHeader';
import { ApplicationCard } from '../../../src/components/cards/ApplicationCard';
import { FilterRow } from '../../../src/components/ui/FilterChip';
import { Button } from '../../../src/components/ui/Button';
import coursesData from '../../../src/data/courses.json';
import { Course, Application } from '../../../src/types';

type TabKey = 'all' | 'pending' | 'approved' | 'rejected' | 'withdrawal_requested';

export default function ApplicationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId) ?? '';
  const { applications, loadApplications } = useApplicationsStore();
  const [tab, setTab] = useState<TabKey>('all');

  useEffect(() => {
    loadApplications(userId);
  }, [userId]);

  const courses = coursesData as Course[];

  const tabOptions = [
    t('applications.tabs.all'),
    t('applications.tabs.pending'),
    t('applications.tabs.approved'),
    t('applications.tabs.rejected'),
    'Step Down',
  ];
  const tabKeys: TabKey[] = ['all', 'pending', 'approved', 'rejected', 'withdrawal_requested'];

  const filtered =
    tab === 'all' ? applications : applications.filter((a) => a.status === tab);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <SectionHeader title={t('applications.title')} style={styles.header} />

      <FilterRow
        options={tabOptions}
        active={tabOptions[tabKeys.indexOf(tab)]}
        onSelect={(opt) => setTab(tabKeys[tabOptions.indexOf(opt)])}
        activeColor={Colors.sf}
      />

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>{t('applications.noApplications')}</Text>
          <Text style={styles.emptyMsg}>{t('applications.browseMessage')}</Text>
          <Button
            label="Browse Courses"
            variant="primary"
            onPress={() => router.push('/(teacher)/courses')}
            style={styles.emptyBtn}
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const course = courses.find((c) => c.id === item.courseId);
            return (
              <ApplicationCard
                application={item}
                course={course}
                onViewBrief={
                  (item.status === 'approved' || item.status === 'withdrawal_requested')
                    ? () => router.push(`/(teacher)/applications/brief/${item.id}`)
                    : undefined
                }
              />
            );
          }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
  },
  list: {
    paddingBottom: 110,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: Spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
    textAlign: 'center',
  },
  emptyMsg: {
    fontSize: FontSize.smPlus,
    color: Colors.tx3,
    textAlign: 'center',
    lineHeight: FontSize.smPlus * 1.5,
  },
  emptyBtn: {
    marginTop: Spacing.sm,
  },
});
