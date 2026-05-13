import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes, routeTo } from '@/routes';
import { useHallsStore } from '@/store/hallsStore';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { centres as centresData } from '@/data';

const REGION_COLORS: Record<string, string> = {
  'Kathmandu Valley': Colors.bl,
  'Pokhara & Gandaki': Colors.fo,
  'Lumbini & Terai': Colors.fo,
};

export default function AdminCentresScreen() {
  const router = useRouter();
  const { halls, loadHalls } = useHallsStore();

  useEffect(() => {
    loadHalls();
  }, []);

  const byRegion = centresData.reduce<Record<string, any[]>>((acc, c) => {
    const r = c.region ?? 'Other';
    if (!acc[r]) acc[r] = [];
    acc[r].push(c);
    return acc;
  }, {});

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <SectionHeader title="Centres & Halls" style={styles.header} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.subtitle}>Configure halls and teacher requirements per centre</Text>

        {Object.entries(byRegion).map(([region, centres]) => (
          <View key={region}>
            <View style={styles.regionHeader}>
              <View
                style={[styles.regionDot, { backgroundColor: REGION_COLORS[region] ?? Colors.tx3 }]}
              />
              <Text style={styles.regionLabel}>{region}</Text>
            </View>

            {centres.map((centre) => {
              const centreHalls = halls.filter((h) => h.centreId === centre.id);
              const totalSlots = centreHalls.reduce((sum, h) => sum + h.teacherSlots, 0);

              return (
                <TouchableOpacity
                  key={centre.id}
                  style={styles.card}
                  onPress={() => router.push(routeTo.adminCentreDetail(centre.id))}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardRow}>
                    <View style={styles.cardIcon}>
                      <Text style={{ fontSize: 20 }}>🏛</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.centreName}>{centre.name}</Text>
                      <Text style={styles.centreMeta}>
                        {centre.city} · Alt {centre.altitude}m
                      </Text>
                    </View>
                    <View style={styles.slotsTag}>
                      <Text style={styles.slotsValue}>{totalSlots}</Text>
                      <Text style={styles.slotsLabel}>slots</Text>
                    </View>
                  </View>

                  <View style={styles.hallsRow}>
                    {centreHalls.length === 0 ? (
                      <Text style={styles.noHalls}>No halls configured — tap to add</Text>
                    ) : (
                      centreHalls.map((h) => (
                        <View key={h.id} style={styles.hallChip}>
                          <Text style={styles.hallChipText}>
                            {h.name} ({h.teacherSlots})
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 20 },
  list: { paddingBottom: 110, paddingTop: 8 },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.tx2,
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Spacing.md,
  },

  regionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Layout.horizontalPad,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  regionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  regionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.tx3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  card: {
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.bll,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardInfo: { flex: 1, gap: 2 },
  centreName: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  centreMeta: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
  },
  slotsTag: {
    alignItems: 'center',
    backgroundColor: Colors.sfl,
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexShrink: 0,
  },
  slotsValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.sf,
  },
  slotsLabel: {
    fontSize: 9,
    color: Colors.sf,
    fontWeight: FontWeight.medium,
  },

  hallsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hallChip: {
    backgroundColor: Colors.cr2,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hallChipText: {
    fontSize: FontSize.xs,
    color: Colors.tx2,
    fontWeight: FontWeight.medium,
  },
  noHalls: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
    fontStyle: 'italic',
  },
});
