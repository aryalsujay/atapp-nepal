import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useNotificationsStore, formatNotifTime } from '../../src/store/notificationsStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../src/theme/spacing';
import { Shadows } from '../../src/theme/shadows';
import { SectionHeader } from '../../src/components/layout/SectionHeader';

const TYPE_CONFIG: Record<string, { emoji: string; color: string }> = {
  approval:  { emoji: '✅', color: Colors.fo },
  rejection: { emoji: '❌', color: Colors.ur },
  reminder:  { emoji: '🔔', color: Colors.sv },
  update:    { emoji: 'ℹ️', color: Colors.bl },
  assignment: { emoji: '📋', color: Colors.fo },
};

export default function ServerNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useSettingsStore();
  const userId = useAuthStore((s) => s.userId) ?? '';
  const { getForUser, markRead, loaded } = useNotificationsStore();
  const [expanded, setExpanded] = useState<number | null>(null);

  const notifs = getForUser(userId);

  const handleExpand = (id: number, wasRead: boolean) => {
    setExpanded((prev) => (prev === id ? null : id));
    if (!wasRead) markRead(id);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.cr }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      <View style={{ paddingTop: insets.top }}>
        <SectionHeader title="Notifications" style={styles.header} />
      </View>

      {notifs.map((notif) => {
        const isExpanded = expanded === notif.id;
        const cfg = TYPE_CONFIG[notif.type] ?? { emoji: '📩', color: Colors.tx3 };
        const body = language === 'ne' ? notif.bodyNe : notif.bodyEn;

        return (
          <TouchableOpacity
            key={notif.id}
            onPress={() => handleExpand(notif.id, notif.read)}
            activeOpacity={0.88}
            style={[styles.card, { borderLeftColor: cfg.color }, !notif.read && styles.unread]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardLeft}>
                <Text style={styles.typeEmoji}>{cfg.emoji}</Text>
                <View style={styles.cardTitleWrap}>
                  <Text style={[styles.cardTitle, !notif.read && { fontWeight: FontWeight.bold }]}>
                    {notif.subjectEn}
                  </Text>
                  <Text style={styles.cardMeta}>{notif.center} · {formatNotifTime(notif.timestamp)}</Text>
                </View>
              </View>
              {!notif.read && <View style={styles.unreadDot} />}
              <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
            </View>

            {isExpanded && (
              <View style={styles.expandedContent}>
                <View style={styles.emailPreview}>
                  <Text style={styles.emailSubject}>{notif.subjectEn}</Text>
                  <Text style={styles.emailBody}>{body}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {notifs.length === 0 && loaded && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 20 },
  empty: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.tx3,
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 5,
    borderRadius: Radius.lg,
    padding: Layout.cardPad - 4,
    borderWidth: 1,
    borderColor: Colors.bd,
    borderLeftWidth: 4,
    ...Shadows.card,
    gap: 10,
  },
  unread: { backgroundColor: Colors.svl },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  typeEmoji: { fontSize: 18, marginTop: 1 },
  cardTitleWrap: { flex: 1, gap: 3 },
  cardTitle: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.tx,
  },
  cardMeta: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.sv,
    flexShrink: 0,
  },
  expandIcon: {
    fontSize: 10,
    color: Colors.tx3,
    flexShrink: 0,
  },
  expandedContent: {
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.bd,
    paddingTop: Spacing.md,
  },
  emailPreview: {
    backgroundColor: Colors.cr2,
    borderRadius: Radius.sm,
    padding: 12,
    gap: 8,
  },
  emailSubject: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  emailBody: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
    lineHeight: FontSize.smPlus * 1.7,
  },
});
