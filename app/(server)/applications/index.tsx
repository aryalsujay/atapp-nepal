import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, StatusColors } from '../../../src/theme/colors';
import { FontSize, FontWeight } from '../../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../../src/theme/spacing';
import { Shadows } from '../../../src/theme/shadows';
import { FadeInView } from '../../../src/components/ui/FadeInView';
import { SERVICE_AREAS } from '../../../src/data/serviceAreas';
import serverApplicationsData from '../../../src/data/serverApplications.json';

type AppStatus = 'approved' | 'pending' | 'rejected';
type TabFilter = 'all' | AppStatus;

const STATUS_LABELS: Record<AppStatus, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
};

const STATUS_EMOJI: Record<AppStatus, string> = {
  approved: '✓',
  pending: '⏳',
  rejected: '✗',
};

function AreaChip({ areaId }: { areaId: string }) {
  const area = SERVICE_AREAS.find((a) => a.id === areaId);
  if (!area) return null;
  return (
    <View style={[styles.areaChip, { backgroundColor: Colors.svl }]}>
      <Text style={styles.areaChipText}>{area.emoji} {area.label}</Text>
    </View>
  );
}

export default function ApplicationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<TabFilter>('all');

  const filtered = filter === 'all'
    ? serverApplicationsData
    : serverApplicationsData.filter((a) => a.status === filter);

  const counts = {
    all: serverApplicationsData.length,
    approved: serverApplicationsData.filter((a) => a.status === 'approved').length,
    pending: serverApplicationsData.filter((a) => a.status === 'pending').length,
    rejected: serverApplicationsData.filter((a) => a.status === 'rejected').length,
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>My Applications</Text>
        <Text style={styles.headerSubtitle}>{serverApplicationsData.length} total</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['all', 'approved', 'pending', 'rejected'] as TabFilter[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filter === tab && styles.tabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
              {tab === 'all' ? 'All' : STATUS_LABELS[tab as AppStatus]}
            </Text>
            {counts[tab] > 0 && (
              <View style={[styles.tabBadge, filter === tab && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, filter === tab && styles.tabBadgeTextActive]}>
                  {counts[tab]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110, paddingTop: 8 }}>
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No applications in this category.</Text>
          </View>
        )}

        {filtered.map((app, i) => {
          const status = app.status as AppStatus;
          const sc = StatusColors[status];

          return (
            <FadeInView key={app.id} delay={60 + i * 50}>
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => router.push(`/(server)/applications/${app.id}` as any)}
              >
                {/* Status bar */}
                <View style={[styles.statusBar, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusBarText, { color: sc.text }]}>
                    {STATUS_EMOJI[status]} {STATUS_LABELS[status]}
                  </Text>
                  <Text style={[styles.appliedText, { color: sc.text }]}>Applied {app.applied}</Text>
                </View>

                <View style={styles.cardBody}>
                  {/* Center + type */}
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.centerName}>{app.center}</Text>
                      <Text style={styles.courseMeta}>{app.type} · {app.dates}</Text>
                    </View>
                  </View>

                  {/* Partial */}
                  {app.partial && app.days && (
                    <View style={styles.partialBadge}>
                      <Text style={styles.partialText}>Partial · {app.days}</Text>
                    </View>
                  )}

                  {/* Areas */}
                  <View style={styles.chipRow}>
                    {app.areas.map((a) => <AreaChip key={a} areaId={a} />)}
                  </View>

                  {/* Approved: coordinator + arrive info */}
                  {status === 'approved' && (
                    <View style={styles.approvedInfo}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Arrive by</Text>
                        <Text style={styles.infoValue}>{app.arriveBy}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Coordinator</Text>
                        <Text style={styles.infoValue}>{app.coordinator}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{app.coordPhone}</Text>
                      </View>
                    </View>
                  )}

                  {/* Rejected: reason */}
                  {'reason' in app && app.reason && (
                    <View style={styles.rejectionBox}>
                      <Text style={styles.rejectionLabel}>Reason</Text>
                      <Text style={styles.rejectionText}>{app.reason}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </FadeInView>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.cr,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  headerTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.extrabold,
    color: Colors.tx,
  },
  headerSubtitle: {
    fontSize: FontSize.smPlus,
    color: Colors.tx3,
    marginTop: 2,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.cr,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: 0,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.sv,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.tx3,
  },
  tabTextActive: {
    color: Colors.sv,
    fontWeight: FontWeight.bold,
  },
  tabBadge: {
    backgroundColor: Colors.cr3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.full,
    minWidth: 18,
    alignItems: 'center',
  },
  tabBadgeActive: { backgroundColor: Colors.svl },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.tx3,
  },
  tabBadgeTextActive: { color: Colors.sv },

  empty: {
    alignItems: 'center',
    padding: 48,
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: FontSize.md, color: Colors.tx3 },

  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 5,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusBarText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  appliedText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  cardBody: {
    padding: Layout.cardPad,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  centerName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  courseMeta: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    marginTop: 2,
  },
  partialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gdl,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  partialText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.gd,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  areaChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  areaChipText: {
    fontSize: FontSize.xs,
    color: Colors.sv,
    fontWeight: FontWeight.semibold,
  },
  approvedInfo: {
    backgroundColor: Colors.fol,
    borderRadius: Radius.md,
    padding: 10,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.fo,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    fontWeight: FontWeight.bold,
  },
  rejectionBox: {
    backgroundColor: Colors.url,
    borderRadius: Radius.md,
    padding: 10,
    gap: 3,
  },
  rejectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.ur,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rejectionText: {
    fontSize: FontSize.smPlus,
    color: Colors.ur,
    lineHeight: FontSize.smPlus * 1.5,
  },
});
