import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useToast } from '@/components/ui/Toast';
import { useSettingsStore } from '@/store/settingsStore';
import { useNotificationsStore, formatNotifTime } from '@/store/notificationsStore';
import { useTeachersStore } from '@/store/teachersStore';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { SectionHeader } from '@/components/layout/SectionHeader';

const TYPE_COLOR: Record<string, string> = {
  assignment: Colors.fo,
  approval: Colors.fo,
  rejection: Colors.ur,
  reminder: Colors.sf,
  update: Colors.bl,
  invite: '#5B6FA8',
};
const TYPE_EMOJI: Record<string, string> = {
  assignment: '📋',
  approval: '✅',
  rejection: '❌',
  reminder: '📣',
  update: '🔄',
  invite: '📬',
};

export default function AdminNotifications() {
  const { language } = useSettingsStore();
  const { notifications } = useNotificationsStore();
  const { findTeacher } = useTeachersStore();
  const toast = useToast();
  const [expanded, setExpanded] = useState<number | null>(null);

  // Show: notifications sent to teachers + step-down alerts to admin
  const visible = notifications
    .filter((n) => n.targetUserId.startsWith('teacher-') || n.targetUserId === 'admin')
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleResend = () => {
    toast.info('Notification re-sent to teacher.', 'Resend');
  };

  const handleCompose = () => {
    toast.info('Compose notification — coming soon.', 'Compose');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.cr }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      <SectionHeader title="Notifications" style={styles.header} />
      <Text style={styles.subtitle}>Sent to teachers · {visible.length} total</Text>

      <View style={{ height: 8, backgroundColor: Colors.cr }} />

      {visible.map((n) => {
        const isExp = expanded === n.id;
        const accent = TYPE_COLOR[n.type] ?? Colors.tx3;
        const body = language === 'ne' ? n.bodyNe : n.bodyEn;
        const teacher = findTeacher(n.targetUserId);
        const recipientLabel =
          teacher?.name ?? (n.targetUserId === 'admin' ? '⚠️ Admin Alert' : n.targetUserId);

        return (
          <TouchableOpacity
            key={n.id}
            onPress={() => setExpanded(isExp ? null : n.id)}
            activeOpacity={0.88}
            style={[styles.card, { borderLeftColor: accent }]}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: accent + '22' }]}>
                <Text style={styles.iconText}>{TYPE_EMOJI[n.type] ?? '📩'}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.subject} numberOfLines={2}>
                  {n.subjectEn}
                </Text>
                <Text style={styles.meta}>→ {recipientLabel}</Text>
                <Text style={styles.meta2}>
                  📅 {n.course} · {formatNotifTime(n.timestamp)}
                </Text>
              </View>
              <Text style={styles.chevron}>{isExp ? '▲' : '▼'}</Text>
            </View>

            {isExp && (
              <View style={styles.expanded}>
                <Text style={styles.previewLabel}>
                  Email Preview · {language === 'ne' ? 'नेपाली' : 'English'}
                </Text>
                <Text style={styles.previewBody}>{body}</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.bll }]}
                    onPress={handleResend}
                  >
                    <Text style={[styles.actionBtnText, { color: Colors.bl }]}>📤 Resend</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {visible.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No notifications sent yet.</Text>
        </View>
      )}

      <View style={{ paddingHorizontal: Layout.horizontalPad, paddingTop: Spacing.md }}>
        <TouchableOpacity style={styles.composeBtn} onPress={handleCompose}>
          <Text style={styles.composeBtnText}>✍️ Compose Notification</Text>
        </TouchableOpacity>
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
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 5,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
    borderLeftWidth: 4,
    ...Shadows.card,
    gap: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: { fontSize: 19 },
  cardBody: { flex: 1, gap: 2 },
  subject: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
    lineHeight: FontSize.smPlus * 1.4,
  },
  meta: { fontSize: FontSize.sm, color: Colors.tx2 },
  meta2: { fontSize: FontSize.xs, color: Colors.tx3 },
  chevron: { fontSize: 10, color: Colors.tx3, flexShrink: 0, marginTop: 2 },

  expanded: {
    borderTopWidth: 1,
    borderTopColor: Colors.bd,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  previewLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  previewBody: {
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    lineHeight: FontSize.smPlus * 1.7,
    backgroundColor: Colors.cr,
    borderRadius: Radius.sm,
    padding: 12,
  },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  empty: { alignItems: 'center', padding: 48 },
  emptyText: { fontSize: FontSize.md, color: Colors.tx3 },

  composeBtn: {
    backgroundColor: Colors.fo,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  composeBtnText: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
