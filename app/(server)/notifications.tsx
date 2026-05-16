/**
 * Server Notifications — implements `specs/20-server-notifications.md`.
 *
 * Prototype-faithful port of `app.html:3307–3374` (`ServerNotifs`).
 */

import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { Routes } from '@/routes';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { serverNotifications, type ServerNotification } from '@/data';

const CTA_GRAD: [string, string] = ['#9B6B14', '#6B4610'];
const SV_ACCENT = '#9B6B14';

function notifIcon(type: string): string {
  if (type === 'approval') return '✅';
  if (type === 'rejection') return '⚠️';
  if (type === 'reminder') return '⏰';
  return '🔔';
}

function notifColor(type: string): string {
  if (type === 'approval') return Colors.fo;
  if (type === 'rejection') return '#B85040';
  if (type === 'reminder') return SV_ACCENT;
  return Colors.bl;
}

export default function ServerNotificationsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lang = i18n.language;
  const [open, setOpen] = useState<ServerNotification | null>(null);

  // ─── Detail view ───────────────────────────────────────────────────
  if (open) {
    const n = open;
    const accent = notifColor(n.type);
    return (
      <View style={[s.flex, { backgroundColor: Colors.cr }]}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
            <TouchableOpacity
              onPress={() => setOpen(null)}
              activeOpacity={0.7}
              style={s.backRow}
              hitSlop={8}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 18L9 12L15 6"
                  stroke={SV_ACCENT}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={s.backText}>{t('common.back')}</Text>
            </TouchableOpacity>

            <View style={s.detailIdentity}>
              <View style={[s.detailIconTile, { backgroundColor: `${accent}22` }]}>
                <Text style={s.detailIconGlyph}>{notifIcon(n.type)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.detailSubject}>{n.subj}</Text>
                <Text style={s.detailMeta}>
                  {n.center} · {n.time}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: 8, backgroundColor: Colors.cr }} />

          <View style={s.bodyCard}>
            <Text style={s.bodyText}>{lang === 'ne' ? n.np : n.en}</Text>
          </View>

          {n.type === 'approval' && (
            <View style={s.ctaWrap}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setOpen(null);
                  router.push(Routes.serverApplications);
                }}
              >
                <LinearGradient
                  colors={CTA_GRAD}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.ctaBtn}
                >
                  <Text style={s.ctaText}>{t('server.notifications.view_apps')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    );
  }

  // ─── List view ─────────────────────────────────────────────────────
  const unread = serverNotifications.filter((n) => !n.read).length;
  const total = serverNotifications.length;

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
          <Text style={s.title}>{t('server.notifications.title')}</Text>
          <Text style={s.subtitle}>
            {unread} {t('server.notifications.new_lbl')} · {total}{' '}
            {t('server.notifications.total_lbl')}
          </Text>
        </View>

        <View style={{ height: 8, backgroundColor: Colors.cr }} />

        {serverNotifications.length === 0 ? (
          <Text style={s.emptyState}>{t('server.notifications.empty_state')}</Text>
        ) : (
          serverNotifications.map((n) => {
            const accent = notifColor(n.type);
            return (
              <TouchableOpacity
                key={n.id}
                activeOpacity={0.85}
                onPress={() => setOpen(n)}
                style={[
                  s.listCard,
                  {
                    borderLeftWidth: 4,
                    borderLeftColor: accent,
                    backgroundColor: n.read ? Colors.white : Colors.fol,
                  },
                ]}
              >
                <View style={s.listRow}>
                  <View style={[s.listIconTile, { backgroundColor: `${accent}22` }]}>
                    <Text style={s.listIconGlyph}>{notifIcon(n.type)}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={s.listTopRow}>
                      <Text style={[s.listSubject, { fontWeight: n.read ? '600' : '800' }]}>
                        {n.subj}
                      </Text>
                      {!n.read && <View style={s.unreadDot} />}
                    </View>
                    <Text style={s.listCenter}>{n.center}</Text>
                    <Text style={s.listTime}>{n.time}</Text>
                  </View>
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

const s = StyleSheet.create({
  flex: { flex: 1 },

  // White header (used by both list and detail)
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
  subtitle: {
    fontSize: 13,
    color: Colors.tx2,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },

  // Detail header internals
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  backText: {
    fontSize: 13,
    color: SV_ACCENT,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  detailIdentity: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'flex-start',
  },
  detailIconTile: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailIconGlyph: { fontSize: 22 },
  detailSubject: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.tx,
    lineHeight: 20.8,
    fontFamily: FontFamily.sansExtraBold,
  },
  detailMeta: {
    fontSize: 12,
    color: Colors.tx3,
    marginTop: 3,
    fontFamily: FontFamily.sansRegular,
  },

  // Body card (detail)
  bodyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    margin: 14,
    shadowColor: Colors.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
  },
  bodyText: {
    fontSize: 13.5,
    color: Colors.tx,
    lineHeight: 21.6,
    fontFamily: FontFamily.sansRegular,
  },

  // Approval CTA
  ctaWrap: {
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  ctaBtn: {
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
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

  // List card
  listCard: {
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
  listRow: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'flex-start',
  },
  listIconTile: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listIconGlyph: { fontSize: 18 },
  listTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  listSubject: {
    fontSize: 13.5,
    color: Colors.tx,
    lineHeight: 17.55,
    flex: 1,
    fontFamily: FontFamily.sansBold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SV_ACCENT,
    flexShrink: 0,
    marginTop: 5,
  },
  listCenter: {
    fontSize: 11.5,
    color: Colors.tx3,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },
  listTime: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
});
