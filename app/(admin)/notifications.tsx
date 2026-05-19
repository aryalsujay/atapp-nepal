/**
 * Admin Notifications — implements `specs/27-admin-notifications.md`.
 *
 * Prototype-faithful port of `app.html:2487–2523` (`AdminNotifs`).
 */

import React, { useEffect, useMemo, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { useAuthStore } from '@/store/authStore';
import { useNotificationsStore, formatNotifTime } from '@/store/notificationsStore';
import type { NotificationType } from '@/types';

type NotifType =
  | 'approval'
  | 'rejection'
  | 'reminder'
  | 'new_application'
  | 'withdrawal_request'
  | 'update';

const TYPE_BORDER: Record<NotifType, string> = {
  approval: Colors.fo,
  rejection: Colors.ur,
  reminder: Colors.sf,
  new_application: Colors.bl,
  withdrawal_request: Colors.gd,
  update: Colors.bl,
};
const TYPE_TILE_BG: Record<NotifType, string> = {
  approval: Colors.fol,
  rejection: Colors.url,
  reminder: Colors.sfl,
  new_application: Colors.bll,
  withdrawal_request: Colors.gdl,
  update: Colors.bll,
};
const TYPE_ICON: Record<NotifType, string> = {
  approval: '✅',
  rejection: '❌',
  reminder: '📣',
  new_application: '📨',
  withdrawal_request: '↩︎',
  update: '🔄',
};

function typeKey(t: NotificationType): NotifType {
  return t in TYPE_BORDER ? (t as NotifType) : 'update';
}

export default function AdminNotificationsScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const lang = i18n.language;
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const previewLangLabel = lang === 'ne' ? 'नेपाली' : 'English';

  // Live data from the store. Refresh on screen entry so notifications
  // emitted during the previous session (or by another role) show up.
  const userId = useAuthStore((s) => s.userId) ?? '';
  const getForUser = useNotificationsStore((s) => s.getForUser);
  const markRead = useNotificationsStore((s) => s.markRead);
  const loadNotifications = useNotificationsStore((s) => s.loadNotifications);
  // Subscribe to notifications state so re-renders happen after addNotification.
  useNotificationsStore((s) => s.notifications);
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications, userId]);

  const adminNotifs = useMemo(
    () => (userId ? getForUser(userId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, getForUser, useNotificationsStore.getState().notifications.length],
  );

  const toggleExpand = (id: number) => {
    const willExpand = expandedId !== id;
    setExpandedId(willExpand ? id : null);
    if (willExpand) markRead(id);
  };

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header (white) ──────────────────────────────────── */}
        <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
          <Text style={s.title}>{t('admin.notifications.title')}</Text>
          <Text style={s.subtitle}>{t('admin.notifications.sent_to_teachers')}</Text>
        </View>

        {/* ─── Cream gap ───────────────────────────────────────── */}
        <View style={{ height: 8, backgroundColor: Colors.cr }} />

        {/* ─── Notification cards ──────────────────────────────── */}
        {adminNotifs.length === 0 ? (
          <View style={[s.card, { alignItems: 'center', paddingVertical: 24 }]}>
            <Text style={{ fontSize: 13, color: Colors.tx2, fontStyle: 'italic' }}>
              No notifications yet.
            </Text>
          </View>
        ) : null}
        {adminNotifs.map((n) => {
          const expanded = expandedId === n.id;
          const body = lang === 'ne' ? n.bodyNe : n.bodyEn;
          const tk = typeKey(n.type);
          return (
            <TouchableOpacity
              key={n.id}
              activeOpacity={0.85}
              onPress={() => toggleExpand(n.id)}
              style={[
                s.card,
                {
                  borderLeftWidth: 4,
                  borderLeftColor: TYPE_BORDER[tk],
                  opacity: n.read ? 0.88 : 1,
                },
              ]}
            >
              <View style={s.cardTopRow}>
                <View style={[s.iconTile, { backgroundColor: TYPE_TILE_BG[tk] }]}>
                  <Text style={s.iconTileText}>{TYPE_ICON[tk]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.subjRow}>
                    <Text style={s.subj}>{n.subjectEn}</Text>
                    {!n.read && <View style={s.unreadDot} />}
                  </View>
                  <Text style={s.courseLine}>
                    📅 {n.course} · {formatNotifTime(n.timestamp)}
                  </Text>
                </View>
              </View>

              {expanded && (
                <View style={s.previewBlock}>
                  <Text style={s.previewLabel}>
                    {t('admin.notifications.email_preview')} · {previewLangLabel}
                  </Text>
                  <Text style={s.previewBody}>{body}</Text>
                  <View style={s.previewBtnRow}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        Alert.alert(
                          'Copy',
                          'Email text would be copied to clipboard (install expo-clipboard to wire).',
                        )
                      }
                      style={[s.previewBtn, s.previewBtnOu]}
                    >
                      <Text numberOfLines={1} style={[s.previewBtnText, { color: Colors.tx }]}>
                        📋 Copy
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => Alert.alert(t('common.coming_soon'))}
                      style={{ flex: 1, minHeight: 34 }}
                    >
                      <LinearGradient
                        colors={Gradients.primaryCta}
                        start={GradientDirection.button.start}
                        end={GradientDirection.button.end}
                        style={[s.previewBtn, { flex: 1 }]}
                      >
                        <Text numberOfLines={1} style={[s.previewBtnText, { color: Colors.white }]}>
                          📤 Resend
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* ─── Compose CTA ─────────────────────────────────────── */}
        <View style={s.composeWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Alert.alert(t('common.coming_soon'))}
          >
            <LinearGradient
              colors={Gradients.forestCta}
              start={GradientDirection.button.start}
              end={GradientDirection.button.end}
              style={s.composeBtn}
            >
              <Text style={s.composeBtnText}>{t('admin.notifications.compose')}</Text>
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
    paddingBottom: 14,
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
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconTileText: { fontSize: 19 },
  subjRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subj: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.tx,
    flex: 1,
    paddingRight: 8,
    fontFamily: FontFamily.sansBold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.sf,
    flexShrink: 0,
    marginTop: 4,
  },
  recipient: {
    fontSize: 11.5,
    color: Colors.tx2,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },
  courseLine: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },

  // Expanded email preview
  previewBlock: {
    marginTop: 12,
    backgroundColor: Colors.cr,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 7,
    fontFamily: FontFamily.sansBold,
  },
  previewBody: {
    fontSize: 12.5,
    color: Colors.tx,
    lineHeight: 21.25,
    fontFamily: FontFamily.sansRegular,
  },
  previewBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 11,
  },
  previewBtn: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBtnOu: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.bd2,
  },
  previewBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Compose CTA
  composeWrap: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 12,
  },
  composeBtn: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },
});
