/**
 * Admin Inbox — implements `specs/22-admin-inbox.md`.
 *
 * Prototype-faithful port of `app.html:2013–2056` (`AdminInbox`).
 */

import React, { useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { Routes, routeTo } from '@/routes';
import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { adminApplications, type AdminApplication } from '@/data';

type Tab = 'pending' | 'approved' | 'rejected';
const TABS: Tab[] = ['pending', 'approved', 'rejected'];

function borderColorByMatch(match: number): string {
  if (match >= 95) return Colors.fo;
  if (match >= 85) return Colors.sf;
  return Colors.tx3;
}

function mbadgeStyle(match: number) {
  if (match >= 90) return { bg: Colors.fol, color: Colors.fo };
  if (match >= 70) return { bg: Colors.bll, color: Colors.bl };
  return { bg: Colors.cr2, color: Colors.tx3 };
}

const STATS = [
  { n: '4', label: 'Pending', color: Colors.gd, bg: Colors.gdl },
  { n: '2', label: 'Urgent', color: Colors.ur, bg: Colors.url },
  { n: '18', label: 'Month', color: Colors.fo, bg: Colors.fol },
] as const;

export default function AdminInboxScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('pending');

  // v1: all admApps are treated as pending; approved/rejected empty.
  const filtered: AdminApplication[] = tab === 'pending' ? adminApplications : [];

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header (white) ──────────────────────────────────── */}
        <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
          <View style={s.headerTopRow}>
            <View>
              <Text style={s.kicker}>{t('admin.inbox.kicker')}</Text>
              <Text style={s.title}>{t('admin.inbox.title')}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(Routes.adminNotifications)}
              activeOpacity={0.85}
              style={s.bellTile}
              hitSlop={8}
            >
              <BellSvg />
              <View style={s.bellDot} />
            </TouchableOpacity>
          </View>

          <View style={s.statsRow}>
            {STATS.map((stat) => (
              <View key={stat.label} style={[s.statChip, { backgroundColor: stat.bg }]}>
                <Text style={[s.statNumber, { color: stat.color }]}>{stat.n}</Text>
                <Text style={[s.statLabel, { color: stat.color }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Tab bar ─────────────────────────────────────────── */}
        <View style={s.tabBar}>
          {TABS.map((tb) => {
            const active = tab === tb;
            return (
              <TouchableOpacity
                key={tb}
                onPress={() => setTab(tb)}
                activeOpacity={0.7}
                style={[s.tabItem, { borderBottomColor: active ? Colors.sf : 'transparent' }]}
              >
                <Text style={[s.tabText, { color: active ? Colors.sf : Colors.tx2 }]}>{tb}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── Cream gap ───────────────────────────────────────── */}
        <View style={{ height: 8, backgroundColor: Colors.cr }} />

        {/* ─── Cards / empty state ─────────────────────────────── */}
        {filtered.length === 0 ? (
          <Text style={s.emptyState}>{t('admin.inbox.empty_state')}</Text>
        ) : (
          filtered.map((a) => {
            const badge = mbadgeStyle(a.match);
            return (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.85}
                onPress={() => router.push(routeTo.adminApplicationReview(a.id))}
                style={[
                  s.card,
                  {
                    borderLeftWidth: 4,
                    borderLeftColor: borderColorByMatch(a.match),
                  },
                ]}
              >
                <View style={s.cardTopRow}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{a.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.nameRow}>
                      <Text style={s.name}>{a.name}</Text>
                      <View style={[s.mbadge, { backgroundColor: badge.bg }]}>
                        <Text style={[s.mbadgeText, { color: badge.color }]}>{a.match}% match</Text>
                      </View>
                    </View>
                    <Text style={s.course}>{a.course}</Text>
                    <View style={s.chipsRow}>
                      {a.langs.map((l) => (
                        <View key={l} style={s.chipBl}>
                          <Text style={s.chipBlText}>{l}</Text>
                        </View>
                      ))}
                      <View style={s.chipGy}>
                        <Text style={s.chipGyText}>{a.courses} courses</Text>
                      </View>
                    </View>
                    <Text style={s.applied}>Applied {a.applied}</Text>
                  </View>
                </View>
                <View style={s.actionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => Alert.alert(t('common.coming_soon'))}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={Gradients.forestCta}
                      start={GradientDirection.button.start}
                      end={GradientDirection.button.end}
                      style={s.actionBtn}
                    >
                      <Text style={[s.actionBtnText, { color: Colors.white }]}>✓ Approve</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => Alert.alert(t('common.coming_soon'))}
                    style={[s.actionBtn, s.rejectBtn, { flex: 1 }]}
                  >
                    <Text style={[s.actionBtnText, { color: Colors.ur }]}>✗ Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push(routeTo.adminApplicationReview(a.id))}
                    style={[s.actionBtn, s.reviewBtn, { flex: 1 }]}
                  >
                    <Text style={[s.actionBtnText, { color: Colors.tx }]}>Review →</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

function BellSvg() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8C18 6.4 17.37 4.84 16.24 3.71C15.1 2.57 13.55 2 12 2C10.45 2 8.9 2.57 7.76 3.71C6.63 4.84 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
        stroke={Colors.sf}
        strokeWidth={1.8}
      />
      <Path
        d="M13.73 21C13.56 21.3 13.32 21.55 13.03 21.72C12.74 21.89 12.4 21.98 12.06 21.98C11.72 21.98 11.39 21.89 11.1 21.72C10.81 21.55 10.57 21.3 10.4 21"
        stroke={Colors.sf}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
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
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kicker: {
    fontSize: 13,
    color: Colors.tx3,
    fontWeight: '500',
    fontFamily: FontFamily.sansMedium,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.tx,
    fontFamily: FontFamily.sansExtraBold,
  },
  bellTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.sfl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.ur,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },
  statChip: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    opacity: 0.8,
    fontFamily: FontFamily.sansSemiBold,
  },

  // Tab bar
  tabBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingBottom: 10,
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: Colors.bd,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    marginBottom: -2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
    fontFamily: FontFamily.sansBold,
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
    gap: 10,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.sfm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.sfd,
    fontFamily: FontFamily.sansBold,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  name: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.tx,
    flex: 1,
    paddingRight: 8,
    fontFamily: FontFamily.sansBold,
  },
  mbadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  mbadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  course: {
    fontSize: 12,
    color: Colors.tx2,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
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
  chipGy: {
    backgroundColor: Colors.cr2,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  chipGyText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.tx2,
    fontFamily: FontFamily.sansSemiBold,
  },
  applied: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 4,
    fontFamily: FontFamily.sansRegular,
  },

  // Action buttons
  actionsRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
  },
  actionBtn: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  rejectBtn: {
    backgroundColor: Colors.url,
    borderWidth: 1.5,
    borderColor: Colors.urd,
  },
  reviewBtn: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.bd2,
  },
});
