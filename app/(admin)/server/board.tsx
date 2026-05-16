/**
 * Admin Server Board — implements `specs/30-admin-server-board.md`.
 *
 * Prototype-faithful port of `app.html:3649–3785` (`AdminServerBoard`).
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Routes } from '@/routes';
import { Colors, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import { serverCourses } from '@/data';

type ViewMode = 'list' | 'grid';

// Mock filled slots per area per day (11-day course)
const FILLED: Record<string, number[]> = {
  kitchen: [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  dining: [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
  dhamma: [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0],
  compound: [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
  reception: [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0],
  at_assist: [1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1],
  manager: [0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
  residence: [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
};

const HEADER_GRAD: [string, string] = [Colors.bl, '#1A4A72'];

function simplifyCourseLabel(c: { center: string; dates: string }): string {
  const center = c.center.replace('Dhamma ', '');
  const firstDates = c.dates.split(',')[0];
  return `${center} · ${firstDates}`;
}

export default function AdminServerBoardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selCourse, setSelCourse] = useState(0);
  const [view, setView] = useState<ViewMode>('list');

  const course = serverCourses[selCourse];
  const days = useMemo(
    () => Array.from({ length: Math.min(course.days, 11) }, (_, i) => i + 1),
    [course.days],
  );
  const open = course.total - course.filled;

  const areasForCourse = SERVICE_AREAS.filter((a) => course.areas.includes(a.id));

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header (white) ──────────────────────────────────── */}
        <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
          <Text style={s.title}>Server Management</Text>
          <Text style={s.subtitle}>Assign & approve servers per course</Text>
        </View>

        {/* ─── Course selector (white wrapper) ─────────────────── */}
        <View style={s.courseWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.courseChipsContent}
          >
            {serverCourses.map((sc, i) => {
              const active = selCourse === i;
              return (
                <TouchableOpacity
                  key={sc.id}
                  onPress={() => setSelCourse(i)}
                  activeOpacity={0.85}
                  style={[
                    s.fchip,
                    active
                      ? { backgroundColor: Colors.bl, borderColor: Colors.bl }
                      : {
                          backgroundColor: Colors.white,
                          borderColor: Colors.bd2,
                        },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[s.fchipText, { color: active ? Colors.white : Colors.tx2 }]}
                  >
                    {simplifyCourseLabel(sc)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── Course stats banner ─────────────────────────────── */}
        <View style={s.courseBanner}>
          <View style={{ flex: 1 }}>
            <Text style={s.courseCenter}>{course.center}</Text>
            <Text style={s.courseMeta}>
              {course.city} · {course.dates} · {course.type}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[s.courseOpen, { color: open <= 3 ? Colors.ur : Colors.bl }]}>
              {open} open
            </Text>
            <Text style={s.courseFilled}>
              {course.filled}/{course.total} filled
            </Text>
          </View>
        </View>

        {/* ─── View toggle ─────────────────────────────────────── */}
        <View style={s.viewToggleRow}>
          {(['list', 'grid'] as ViewMode[]).map((v) => {
            const active = view === v;
            return (
              <TouchableOpacity
                key={v}
                onPress={() => setView(v)}
                activeOpacity={0.85}
                style={[
                  s.viewToggleBtn,
                  {
                    backgroundColor: active ? Colors.bl : Colors.cr2,
                  },
                ]}
              >
                <Text style={[s.viewToggleText, { color: active ? Colors.white : Colors.tx2 }]}>
                  {v === 'list' ? '☰ Area List' : '⊞ Day Grid'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ height: 10 }} />

        {/* ─── List view OR Grid view ──────────────────────────── */}
        {view === 'list' ? (
          areasForCourse.map((a) => {
            const arr = FILLED[a.id] ?? [];
            const filledDays = arr.filter(Boolean).length;
            const total = days.length;
            const pct = total > 0 ? Math.round((filledDays / total) * 100) : 0;
            return (
              <View key={a.id} style={s.card}>
                <View style={s.areaHeader}>
                  <View style={[s.areaIconTile, { backgroundColor: `${a.color}22` }]}>
                    <Text style={s.areaIconText}>{a.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.areaLabel}>{a.label}</Text>
                    <Text style={s.areaDesc}>{a.desc}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[s.areaFilled, { color: pct < 70 ? Colors.ur : a.color }]}>
                      {filledDays}/{total} days
                    </Text>
                    <Text style={s.areaPct}>{pct}% covered</Text>
                  </View>
                </View>

                {/* Day dots row */}
                <View style={s.dayDotsRow}>
                  {days.map((d, i) => {
                    const f = arr[i];
                    return (
                      <View
                        key={d}
                        style={[
                          s.dayDot,
                          {
                            backgroundColor: f ? a.color : Colors.cr3,
                          },
                        ]}
                      >
                        <Text style={[s.dayDotText, { color: f ? Colors.white : Colors.tx3 }]}>
                          {d}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Action buttons */}
                <View style={s.areaActions}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => Alert.alert('Coming soon')}
                    style={[s.areaBtn, { backgroundColor: Colors.bl }]}
                  >
                    <Text numberOfLines={1} style={[s.areaBtnText, { color: Colors.white }]}>
                      + Assign Server
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push(Routes.adminServerInbox)}
                    style={[s.areaBtn, { backgroundColor: Colors.cr2 }]}
                  >
                    <Text numberOfLines={1} style={[s.areaBtnText, { color: Colors.tx2 }]}>
                      View Applicants
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          /* GRID VIEW */
          <View style={{ marginHorizontal: 18 }}>
            <View style={s.gridCard}>
              {/* Header row */}
              <View style={s.gridHeaderRow}>
                <View style={s.gridAreaCol}>
                  <Text style={s.gridHeaderText}>Area</Text>
                </View>
                {days.map((d) => (
                  <View key={d} style={s.gridDayCol}>
                    <Text style={s.gridHeaderText}>D{d}</Text>
                  </View>
                ))}
              </View>
              {/* Area rows */}
              {areasForCourse.map((a) => {
                const arr = FILLED[a.id] ?? [];
                return (
                  <View key={a.id} style={s.gridAreaRow}>
                    <View style={[s.gridAreaCol, { gap: 5 }]}>
                      <Text style={s.gridAreaEmoji}>{a.emoji}</Text>
                      <Text style={s.gridAreaName}>{a.label.split(' ')[0]}</Text>
                    </View>
                    {days.map((d, i) => {
                      const f = arr[i];
                      return (
                        <View key={d} style={s.gridDayCol}>
                          <View
                            style={[
                              s.gridCell,
                              {
                                backgroundColor: f ? a.color : Colors.cr3,
                              },
                            ]}
                          >
                            <Text
                              style={[s.gridCellText, { color: f ? Colors.white : Colors.tx3 }]}
                            >
                              {f ? '✓' : '○'}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
            <Text style={s.gridLegend}>✓ = Filled · ○ = Open slot · Tap to assign</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(Routes.adminServerInbox)}
              style={[s.gridReviewBtn, { backgroundColor: Colors.bl }]}
            >
              <Text style={[s.gridReviewBtnText, { color: Colors.white }]}>
                📨 Review All Server Applications
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Open Server Applications Inbox (always visible) ──── */}
        <View style={s.footerWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(Routes.adminServerInbox)}
          >
            <LinearGradient
              colors={HEADER_GRAD}
              start={GradientDirection.button.start}
              end={GradientDirection.button.end}
              style={s.footerBtn}
            >
              <Text style={s.footerBtnText}>📨 Open Server Applications Inbox →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.tx,
    fontFamily: FontFamily.sansExtraBold,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.tx2,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },

  // Course selector
  courseWrap: {
    backgroundColor: Colors.white,
    paddingBottom: 12,
  },
  courseChipsContent: {
    paddingHorizontal: 18,
    gap: 6,
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

  // Course stats banner
  courseBanner: {
    backgroundColor: Colors.bll,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bld,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  courseCenter: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.bl,
    fontFamily: FontFamily.sansBold,
  },
  courseMeta: {
    fontSize: 11,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  courseOpen: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
  },
  courseFilled: {
    fontSize: 10,
    color: Colors.tx3,
    fontFamily: FontFamily.sansRegular,
  },

  // View toggle
  viewToggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 10,
    gap: 8,
  },
  viewToggleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // List view card
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
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  areaIconTile: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  areaIconText: { fontSize: 20 },
  areaLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  areaDesc: {
    fontSize: 11,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  areaFilled: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  areaPct: {
    fontSize: 9,
    color: Colors.tx3,
    fontFamily: FontFamily.sansRegular,
  },

  // Day dots
  dayDotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 8,
  },
  dayDot: {
    flex: 1,
    height: 22,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotText: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Area buttons
  areaActions: {
    flexDirection: 'row',
    gap: 6,
  },
  areaBtn: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  areaBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Grid view
  gridCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cr3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  gridAreaCol: {
    width: 90,
    paddingHorizontal: 8,
    paddingVertical: 7,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridDayCol: {
    flex: 1,
    paddingHorizontal: 2,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridHeaderText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.tx2,
    textTransform: 'uppercase',
    fontFamily: FontFamily.sansBold,
  },
  gridAreaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    alignItems: 'center',
  },
  gridAreaEmoji: { fontSize: 14 },
  gridAreaName: {
    fontSize: 9.5,
    fontWeight: '600',
    color: Colors.tx,
    fontFamily: FontFamily.sansSemiBold,
  },
  gridCell: {
    width: 22,
    height: 22,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCellText: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  gridLegend: {
    fontSize: 10,
    color: Colors.tx3,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: FontFamily.sansRegular,
  },
  gridReviewBtn: {
    marginTop: 10,
    marginBottom: 4,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridReviewBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Footer button
  footerWrap: {
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  footerBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },
});
