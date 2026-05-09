import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/store/authStore';
import { useNotificationsStore, formatNotifTime } from '../../src/store/notificationsStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, FontWeight } from '../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../src/theme/spacing';
import { Shadows } from '../../src/theme/shadows';
import { SectionHeader } from '../../src/components/layout/SectionHeader';

const TYPE_CONFIG: Record<string, { emoji: string; bg: string; label: string }> = {
  assignment: { emoji: '📋', bg: Colors.fo + '22',    label: 'Assignment' },
  invite:     { emoji: '📬', bg: '#5B6FA822',          label: 'Invite' },
  rejection:  { emoji: '✗',  bg: Colors.ur + '18',    label: 'Update' },
  reminder:   { emoji: '⏰', bg: '#9B6B1422',          label: 'Reminder' },
  update:     { emoji: '🔄', bg: Colors.bl + '22',    label: 'Update' },
  approval:   { emoji: '✓',  bg: Colors.fo + '22',    label: 'Approved' },
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { language } = useSettingsStore();
  const userId = useAuthStore((s) => s.userId) ?? '';
  const { getForUser, markRead, respondToInvite, loaded } = useNotificationsStore();

  const [expanded, setExpanded] = useState<number | null>(null);
  const [localResponses, setLocalResponses] = useState<Record<number, 'accepted' | 'declined'>>({});
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineInput, setShowDeclineInput] = useState<number | null>(null);

  const notifs = getForUser(userId);
  const unread = notifs.filter((n) => !n.read).length;

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
      <SectionHeader title={t('notifications.title')} style={styles.header} />
      <Text style={styles.subtitle}>{unread} new · {notifs.length} total</Text>

      {notifs.map((notif) => {
        const isExp = expanded === notif.id;
        const response = localResponses[notif.id] ?? (
          notif.status === 'approved' ? 'accepted' :
          notif.status === 'rejected' ? 'declined' : undefined
        );
        const cfg = TYPE_CONFIG[notif.type] ?? { emoji: '🔔', bg: Colors.tx3 + '22', label: '' };
        const body = language === 'ne' ? notif.bodyNe : notif.bodyEn;
        const showDecline = showDeclineInput === notif.id;

        return (
          <TouchableOpacity
            key={notif.id}
            onPress={() => handleExpand(notif.id, notif.read)}
            activeOpacity={0.88}
            style={[styles.card, !notif.read && styles.unread]}
          >
            {/* Header row */}
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
                <Text style={styles.iconText}>{cfg.emoji}</Text>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.titleRow}>
                  <Text style={[styles.cardTitle, !notif.read && styles.cardTitleUnread]} numberOfLines={2}>
                    {notif.subjectEn}
                  </Text>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.cardMeta}>{notif.center} · {formatNotifTime(notif.timestamp)}</Text>
                <Text style={styles.cardCourse} numberOfLines={1}>{notif.course}</Text>

                {notif.type === 'invite' && (
                  <View style={[
                    styles.statusChip,
                    response === 'accepted'
                      ? { backgroundColor: Colors.fol }
                      : response === 'declined'
                      ? { backgroundColor: Colors.url }
                      : { backgroundColor: Colors.gdl },
                  ]}>
                    <Text style={[
                      styles.statusChipText,
                      response === 'accepted'
                        ? { color: Colors.fo }
                        : response === 'declined'
                        ? { color: Colors.ur }
                        : { color: Colors.gd },
                    ]}>
                      {response === 'accepted' ? '✓ Accepted' : response === 'declined' ? '✗ Declined' : '⏳ Awaiting your response'}
                    </Text>
                  </View>
                )}
                {notif.type === 'assignment' && (
                  <View style={[styles.statusChip, { backgroundColor: Colors.fol }]}>
                    <Text style={[styles.statusChipText, { color: Colors.fo }]}>✓ Confirmed</Text>
                  </View>
                )}
              </View>

              <Text style={styles.chevron}>{isExp ? '▲' : '▼'}</Text>
            </View>

            {/* Expanded */}
            {isExp && (
              <View style={styles.expanded}>
                <View style={styles.expandHeader}>
                  <View style={[styles.iconBoxLg, { backgroundColor: cfg.bg }]}>
                    <Text style={styles.iconTextLg}>{cfg.emoji}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.expandSubject}>{notif.subjectEn}</Text>
                    <Text style={styles.expandMeta}>{notif.center} · {formatNotifTime(notif.timestamp)}</Text>
                  </View>
                </View>

                <Text style={styles.emailBody}>{body}</Text>

                {notif.type === 'invite' && !response && !showDecline && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: Colors.fo }]}
                      onPress={async () => {
                        setLocalResponses((r) => ({ ...r, [notif.id]: 'accepted' }));
                        await respondToInvite(notif.id, 'accepted');
                        setExpanded(null);
                      }}
                    >
                      <Text style={styles.actionBtnText}>✓ Accept Invitation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtnOutline}
                      onPress={() => setShowDeclineInput(notif.id)}
                    >
                      <Text style={styles.actionBtnOutlineText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {notif.type === 'invite' && showDecline && !response && (
                  <View style={styles.declineBox}>
                    <Text style={styles.declineLabel}>Reason for declining (optional)</Text>
                    <TextInput
                      value={declineReason}
                      onChangeText={setDeclineReason}
                      placeholder="e.g. Travel conflict, health, etc."
                      placeholderTextColor={Colors.tx3}
                      style={styles.declineInput}
                      multiline
                      numberOfLines={2}
                    />
                    <View style={styles.declineActions}>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setShowDeclineInput(null)}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { flex: 1, backgroundColor: Colors.url, borderWidth: 1, borderColor: Colors.ur }]}
                        onPress={async () => {
                          setLocalResponses((r) => ({ ...r, [notif.id]: 'declined' }));
                          await respondToInvite(notif.id, 'declined', declineReason);
                          setShowDeclineInput(null);
                          setDeclineReason('');
                          setExpanded(null);
                        }}
                      >
                        <Text style={[styles.actionBtnText, { color: Colors.ur }]}>✗ Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {notif.type === 'assignment' && (
                  <TouchableOpacity style={styles.briefLink}>
                    <Text style={styles.briefLinkText}>View Course Brief →</Text>
                  </TouchableOpacity>
                )}
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
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.tx2,
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Spacing.sm,
  },
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
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: 0,
  },
  unread: {
    backgroundColor: Colors.sfl,
    borderColor: Colors.sfm,
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
  iconText: { fontSize: 17 },
  cardBody: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  cardTitle: {
    flex: 1,
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.tx,
    lineHeight: FontSize.smPlus * 1.4,
  },
  cardTitleUnread: { fontWeight: FontWeight.bold },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.sf,
    flexShrink: 0,
    marginTop: 4,
  },
  cardMeta: { fontSize: FontSize.sm, color: Colors.tx3 },
  cardCourse: { fontSize: FontSize.xs, color: Colors.tx3 },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginTop: 3,
  },
  statusChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  chevron: { fontSize: 10, color: Colors.tx3, flexShrink: 0, marginTop: 3 },

  expanded: {
    borderTopWidth: 1,
    borderTopColor: Colors.bd,
    marginTop: 10,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  expandHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconBoxLg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconTextLg: { fontSize: 22 },
  expandSubject: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.tx },
  expandMeta: { fontSize: FontSize.sm, color: Colors.tx3 },

  emailBody: {
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
    paddingVertical: 11,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  actionBtnOutline: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.ur,
  },
  actionBtnOutlineText: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.ur,
  },

  declineBox: { gap: Spacing.sm },
  declineLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.tx2 },
  declineInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.bd,
    borderRadius: Radius.md,
    padding: 10,
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  declineActions: { flexDirection: 'row', gap: Spacing.sm },
  cancelBtn: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.bd,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: FontSize.smPlus, color: Colors.tx2, fontWeight: FontWeight.semibold },

  briefLink: { paddingVertical: 4 },
  briefLinkText: { fontSize: FontSize.smPlus, fontWeight: FontWeight.bold, color: Colors.gd },
});
