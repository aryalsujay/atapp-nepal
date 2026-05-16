/**
 * Admin Calendar — implements `specs/26-admin-calendar.md`.
 *
 * Prototype-faithful port of `app.html:2430–2484` (`AdminCal`).
 */

import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes } from '@/routes';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';

interface Event {
  day: number;
  len: number;
  center: string;
  type: string;
  teacher: string;
  color: string;
}

const EVENTS: Event[] = [
  {
    day: 7,
    len: 11,
    center: 'Dhamma Shringa 🇳🇵',
    type: '10-Day',
    teacher: 'B. Ananda',
    color: Colors.fo,
  },
  {
    day: 15,
    len: 11,
    center: 'Dhamma Pokhara 🇳🇵',
    type: '10-Day',
    teacher: 'K. Gurung',
    color: Colors.sf,
  },
  {
    day: 3,
    len: 11,
    center: 'Dhamma Adhara 🇳🇵',
    type: '10-Day',
    teacher: 'A. Mehta',
    color: Colors.bl,
  },
  {
    day: 20,
    len: 21,
    center: 'Dhamma Shringa 🇳🇵',
    type: '20-Day',
    teacher: 'G. Thapa',
    color: Colors.sfd,
  },
];

const LEGEND = [
  { color: Colors.fo, label: '10-Day' },
  { color: Colors.bl, label: "Children's" },
  { color: Colors.sf, label: 'Satipatthana' },
  { color: Colors.ur, label: 'Unscheduled' },
];

function eventIcon(type: string): string {
  if (type === '10-Day') return '🪷';
  if (type.includes('Child')) return '👦';
  return '🧘';
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function AdminCalendarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mo, setMo] = useState(6); // July

  const monthLabel = t(`admin.calendar.months.${mo}`);

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header (white) ──────────────────────────────────── */}
        <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
          <Text style={s.title}>{t('admin.calendar.title')}</Text>
          <View style={s.monthNavRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={mo === 0}
              onPress={() => setMo((m) => Math.max(0, m - 1))}
              style={[s.navBtn, mo === 0 && { opacity: 0.5 }]}
            >
              <Text style={s.navBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={s.monthLabel}>{monthLabel} 2026</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={mo === 11}
              onPress={() => setMo((m) => Math.min(11, m + 1))}
              style={[s.navBtn, mo === 11 && { opacity: 0.5 }]}
            >
              <Text style={s.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Legend ──────────────────────────────────────────── */}
        <View style={s.legendRow}>
          {LEGEND.map((l) => (
            <View key={l.label} style={s.legendItem}>
              <View style={[s.legendSwatch, { backgroundColor: l.color }]} />
              <Text style={s.legendLabel}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* ─── Day strip card ──────────────────────────────────── */}
        <View style={s.stripCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.stripInner}
          >
            {DAYS.map((d) => {
              const ev = EVENTS.find((e) => d >= e.day && d < e.day + e.len);
              return (
                <View key={d} style={s.dayCol}>
                  <Text style={s.dayNum}>{d}</Text>
                  <View
                    style={[
                      s.dayCell,
                      ev
                        ? { backgroundColor: ev.color, opacity: 1 }
                        : {
                            backgroundColor: Colors.cr3,
                            borderWidth: 1,
                            borderColor: Colors.bd,
                            opacity: 0.6,
                          },
                    ]}
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── Section header ──────────────────────────────────── */}
        <Text style={[s.sph, { marginTop: 14 }]}>
          {t('admin.calendar.courses_in_month', {
            count: EVENTS.length,
            month: monthLabel,
          })}
        </Text>

        {/* ─── Event cards ─────────────────────────────────────── */}
        {EVENTS.map((e, i) => (
          <View key={i} style={[s.card, { borderLeftWidth: 4, borderLeftColor: e.color }]}>
            <View style={s.eventRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={s.eventCenter}>{e.center}</Text>
                <Text style={s.eventMeta}>
                  {e.type} · Day {e.day}–{e.day + e.len - 1}
                </Text>
                <Text style={s.eventTeacher}>👤 {e.teacher}</Text>
              </View>
              <View style={[s.eventIconTile, { backgroundColor: e.color }]}>
                <Text style={s.eventIconText}>{eventIcon(e.type)}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* ─── Unscheduled banner ─────────────────────────────── */}
        <View style={s.unscheduledCard}>
          <Text style={s.unscheduledTitle}>{t('admin.calendar.unscheduled_title')}</Text>
          <Text style={s.unscheduledBody}>Dhamma Shringa — 30-Day (Dec 1–30) · No AT assigned</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(Routes.adminSchedule)}
            style={s.runAutoBtn}
          >
            <Text style={s.runAutoBtnText}>{t('admin.calendar.run_auto_schedule')}</Text>
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
    paddingBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.tx,
    fontFamily: FontFamily.sansExtraBold,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 10,
  },
  navBtn: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.bd2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  navBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 10.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },

  // Day strip card
  stripCard: {
    marginTop: 8,
    marginHorizontal: 18,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    shadowColor: Colors.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
  },
  stripInner: {
    gap: 3,
    paddingBottom: 4,
  },
  dayCol: {
    alignItems: 'center',
    gap: 3,
    minWidth: 22,
  },
  dayNum: {
    fontSize: 10,
    color: Colors.tx3,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  dayCell: {
    width: 22,
    height: 22,
    borderRadius: 5,
  },

  // sph
  sph: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
    marginHorizontal: 18,
    marginBottom: 9,
    fontFamily: FontFamily.sansBold,
  },

  // Event card
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
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventCenter: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  eventMeta: {
    fontSize: 12.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  eventTeacher: {
    fontSize: 11.5,
    color: Colors.tx3,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },
  eventIconTile: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  eventIconText: {
    fontSize: 19,
    color: Colors.white,
  },

  // Unscheduled banner
  unscheduledCard: {
    backgroundColor: Colors.url,
    borderWidth: 1,
    borderColor: Colors.urd,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 12,
    shadowColor: Colors.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
  },
  unscheduledTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ur,
    marginBottom: 4,
    fontFamily: FontFamily.sansBold,
  },
  unscheduledBody: {
    fontSize: 12.5,
    color: Colors.ur,
    fontFamily: FontFamily.sansRegular,
  },
  runAutoBtn: {
    backgroundColor: Colors.url,
    borderWidth: 1.5,
    borderColor: Colors.urd,
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  runAutoBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.ur,
    fontFamily: FontFamily.sansBold,
  },
});
