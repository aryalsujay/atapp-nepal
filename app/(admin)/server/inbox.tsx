import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { SERVICE_AREAS } from '@/data/serviceAreas';

type AppStatus = 'pending' | 'approved' | 'rejected';

interface ServerApp {
  id: number;
  name: string;
  email: string;
  gender: 'M' | 'F';
  coursesServed: number;
  courseId: number;
  center: string;
  dates: string;
  areas: string[];
  partial: boolean;
  days: string | null;
  appliedOn: string;
  status: AppStatus;
  note: string;
}

const APPS: ServerApp[] = [
  {
    id: 1,
    name: 'Priya Thapa',
    email: 'priya@dhamma.np',
    gender: 'F',
    coursesServed: 12,
    courseId: 1,
    center: 'Dhamma Shringa',
    dates: 'Jul 7–18',
    areas: ['kitchen', 'dining'],
    partial: false,
    days: null,
    appliedOn: 'Apr 20',
    status: 'pending',
    note: '',
  },
  {
    id: 2,
    name: 'Bikram KC',
    email: 'bikram.kc@gmail.com',
    gender: 'M',
    coursesServed: 5,
    courseId: 2,
    center: 'Dhamma Pokhara',
    dates: 'Jul 15–26',
    areas: ['compound'],
    partial: false,
    days: null,
    appliedOn: 'Apr 21',
    status: 'pending',
    note: '',
  },
  {
    id: 3,
    name: 'Anita Shrestha',
    email: 'anita.shresta@yahoo.com',
    gender: 'F',
    coursesServed: 8,
    courseId: 1,
    center: 'Dhamma Shringa',
    dates: 'Jul 7–18',
    areas: ['dhamma', 'at_assist'],
    partial: true,
    days: 'Day 3–8',
    appliedOn: 'Apr 22',
    status: 'pending',
    note: '',
  },
  {
    id: 4,
    name: 'Ram Bahadur',
    email: 'ram.bdr@gmail.com',
    gender: 'M',
    coursesServed: 3,
    courseId: 3,
    center: 'Dhamma Adhara',
    dates: 'Aug 2–13',
    areas: ['kitchen'],
    partial: false,
    days: null,
    appliedOn: 'Apr 19',
    status: 'approved',
    note: 'Experienced kitchen seva.',
  },
];

const STATUS_COLOR: Record<AppStatus, { bg: string; text: string }> = {
  pending: { bg: Colors.gdl, text: Colors.gd },
  approved: { bg: Colors.fol, text: Colors.fo },
  rejected: { bg: Colors.url, text: Colors.ur },
};

export default function AdminServerInbox() {
  const toast = useToast();
  const [filter, setFilter] = useState<'all' | AppStatus>('all');
  const [apps, setApps] = useState<ServerApp[]>(APPS);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  const filtered = filter === 'all' ? apps : apps.filter((a) => a.status === filter);

  const handleDecision = (id: number, decision: AppStatus) => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: decision, note: decisionNote } : a)),
    );
    setExpanded(null);
    setDecisionNote('');
    if (decision === 'approved') {
      toast.success(`Application approved. Notification will be sent.`, 'Approved');
    } else {
      toast.info(`Application rejected. Notification will be sent.`, 'Rejected');
    }
  };

  const pending = apps.filter((a) => a.status === 'pending').length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.cr }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      <SectionHeader title="Server Inbox" style={styles.header} />
      <Text style={styles.subtitle}>
        {pending} pending · {apps.length} total
      </Text>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: Layout.horizontalPad, gap: 10, marginTop: Spacing.sm }}>
        {filtered.length === 0 && <Text style={styles.empty}>No {filter} applications.</Text>}

        {filtered.map((app) => {
          const isExp = expanded === app.id;
          const sc = STATUS_COLOR[app.status];

          return (
            <TouchableOpacity
              key={app.id}
              onPress={() => setExpanded(isExp ? null : app.id)}
              activeOpacity={0.88}
              style={styles.card}
            >
              {/* Header row */}
              <View style={styles.cardRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{app.name[0]}</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{app.name}</Text>
                    <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusText, { color: sc.text }]}>{app.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.meta}>
                    {app.center} · {app.dates}
                  </Text>
                  <View style={styles.areaRow}>
                    {app.areas.map((aId) => {
                      const area = SERVICE_AREAS.find((a) => a.id === aId);
                      return area ? (
                        <View
                          key={aId}
                          style={[styles.areaChip, { backgroundColor: area.color + '22' }]}
                        >
                          <Text style={[styles.areaChipText, { color: area.color }]}>
                            {area.label}
                          </Text>
                        </View>
                      ) : null;
                    })}
                    {app.partial && (
                      <View style={styles.partialChip}>
                        <Text style={styles.partialChipText}>{app.days}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.chevron}>{isExp ? '▲' : '▼'}</Text>
              </View>

              {/* Expanded */}
              {isExp && (
                <View style={styles.expanded}>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Gender</Text>
                      <Text style={styles.detailValue}>
                        {app.gender === 'M' ? 'Male' : 'Female'}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Courses Served</Text>
                      <Text style={styles.detailValue}>{app.coursesServed}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Applied On</Text>
                      <Text style={styles.detailValue}>{app.appliedOn}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Full / Partial</Text>
                      <Text style={styles.detailValue}>
                        {app.partial ? `Partial (${app.days})` : 'Full course'}
                      </Text>
                    </View>
                  </View>

                  {app.note ? (
                    <View style={styles.noteBox}>
                      <Text style={styles.noteLabel}>Decision Note</Text>
                      <Text style={styles.noteText}>{app.note}</Text>
                    </View>
                  ) : null}

                  {app.status === 'pending' && (
                    <>
                      <TextInput
                        value={decisionNote}
                        onChangeText={setDecisionNote}
                        placeholder="Add a note (optional)"
                        placeholderTextColor={Colors.tx3}
                        style={styles.noteInput}
                        multiline
                        numberOfLines={2}
                      />
                      <View style={styles.decisionRow}>
                        <TouchableOpacity
                          style={[styles.decisionBtn, { backgroundColor: Colors.url }]}
                          onPress={() => handleDecision(app.id, 'rejected')}
                        >
                          <Text style={[styles.decisionBtnText, { color: Colors.ur }]}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.decisionBtn, { backgroundColor: Colors.fol }]}
                          onPress={() => handleDecision(app.id, 'approved')}
                        >
                          <Text style={[styles.decisionBtnText, { color: Colors.fo }]}>
                            Approve
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 20 },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.tx2,
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Spacing.sm,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
  },
  filterChipActive: { backgroundColor: Colors.bl, borderColor: Colors.bl },
  filterChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.tx2 },
  filterChipTextActive: { color: Colors.white },
  empty: {
    textAlign: 'center',
    color: Colors.tx3,
    fontSize: FontSize.smPlus,
    paddingVertical: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
    gap: 10,
    ...Shadows.card,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bll,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.bl },
  cardBody: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: FontSize.smPlus, fontWeight: FontWeight.bold, color: Colors.tx },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  meta: { fontSize: FontSize.sm, color: Colors.tx2 },
  areaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  areaChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  areaChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  partialChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.gdl,
  },
  partialChipText: { fontSize: FontSize.xs, color: Colors.gd, fontWeight: FontWeight.semibold },
  chevron: { fontSize: 10, color: Colors.tx3, flexShrink: 0, marginTop: 4 },

  expanded: {
    borderTopWidth: 1,
    borderTopColor: Colors.bd,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    backgroundColor: Colors.cr,
    borderRadius: Radius.md,
    padding: 12,
  },
  detailItem: { width: '50%', paddingVertical: 4 },
  detailLabel: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.tx,
    marginTop: 2,
  },

  noteBox: {
    backgroundColor: Colors.gdl,
    borderRadius: Radius.sm,
    padding: 10,
    gap: 4,
  },
  noteLabel: { fontSize: FontSize.xs, color: Colors.gd, fontWeight: FontWeight.bold },
  noteText: { fontSize: FontSize.sm, color: Colors.tx },

  noteInput: {
    backgroundColor: Colors.cr,
    borderWidth: 1,
    borderColor: Colors.bd,
    borderRadius: Radius.md,
    padding: 10,
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  decisionRow: { flexDirection: 'row', gap: 10 },
  decisionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  decisionBtnText: { fontSize: FontSize.smPlus, fontWeight: FontWeight.bold },
});
