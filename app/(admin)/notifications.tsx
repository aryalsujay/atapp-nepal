/**
 * Admin Notifications — implements `specs/27-admin-notifications.md`.
 *
 * Prototype-faithful port of `app.html:2487–2523` (`AdminNotifs`).
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';

type NotifType = 'approval' | 'rejection' | 'reminder';

interface AdminNotif {
  id: number;
  type: NotifType;
  time: string;
  read: boolean;
  teacher: string;
  course: string;
  subj: string;
  en: string;
  np: string;
}

const NOTIFS: AdminNotif[] = [
  {
    id: 1,
    type: 'approval',
    time: '2 hours ago',
    read: false,
    teacher: 'Bhikkhu Ananda',
    course: 'Dhamma Shringa — Jul 10-Day',
    subj: 'Your application has been approved',
    en: 'Dear Ananda Ji,\n\nWith great joy we inform you that your application to serve as Assistant Teacher at Dhamma Shringa (Kathmandu Valley) for the 10-Day course, Jul 7–18, 2026 has been approved.\n\nPlease arrive by 7:00 AM on July 6.\n\nIn Dhamma,\nDhamma Shringa Management',
    np: 'प्रिय आनन्द जी,\n\nधम्म श्रृंग (काठमाडौँ उपत्यका) मा जुलाई ७–१८, २०२६ को १०-दिने पाठ्यक्रमका लागि तपाईंको आवेदन स्वीकृत भएको छ।\n\nकृपया जुलाई ६ को बिहान ७:०० बजेसम्म आइपुग्नुहोस्।\n\nधम्ममा,\nधम्म श्रृंग व्यवस्थापन',
  },
  {
    id: 2,
    type: 'rejection',
    time: 'Yesterday',
    read: true,
    teacher: 'Rajan Pillai',
    course: 'Dhamma Adhara — Aug 10-Day',
    subj: 'Application update — Dhamma Adhara',
    en: 'Dear Rajan Ji,\n\nThank you for your willingness to serve. Another qualified AT was confirmed before your application was processed.\n\nWe will keep you in mind for future courses.\n\nIn Dhamma,\nScheduling Team',
    np: 'प्रिय राजन जी,\n\nतपाईंको आवेदन प्रक्रिया हुनुभन्दा पहिले अर्को योग्य आचार्य पुष्टि भइसकेको थियो।\n\nभविष्यका पाठ्यक्रमहरूका लागि ध्यानमा राख्नेछौं।\n\nधम्ममा,\nतालिका टोली',
  },
  {
    id: 3,
    type: 'reminder',
    time: '3 days ago',
    read: true,
    teacher: 'All Nepal ATs',
    course: 'Dhamma Shringa — Aug 10-Day',
    subj: 'Open course — Nepali-speaking AT needed',
    en: 'Dear Teachers,\n\nDhamma Shringa has an open 10-Day course (Aug 15–26) needing a Nepali-speaking AT.\n\nPlease apply via the Dhamma Nepal app.\n\nSadhu 🙏',
    np: 'प्रिय आचार्यहरू,\n\nधम्म श्रृंगमा अगस्ट १५–२६ को खुला पाठ्यक्रमलाई नेपाली भाषी आचार्य चाहिन्छ।\n\nDhamma Nepal एप मार्फत आवेदन दिनुहोस्।\n\nसाधु 🙏',
  },
];

const TYPE_BORDER: Record<NotifType, string> = {
  approval: Colors.fo,
  rejection: Colors.ur,
  reminder: Colors.sf,
};
const TYPE_TILE_BG: Record<NotifType, string> = {
  approval: Colors.fol,
  rejection: Colors.url,
  reminder: Colors.sfl,
};
const TYPE_ICON: Record<NotifType, string> = {
  approval: '✅',
  rejection: '❌',
  reminder: '📣',
};

export default function AdminNotificationsScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const lang = i18n.language;
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const previewLangLabel = lang === 'ne' ? 'नेपाली' : 'English';

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
        {NOTIFS.map((n) => {
          const expanded = expandedId === n.id;
          const body = lang === 'ne' ? n.np : n.en;
          return (
            <TouchableOpacity
              key={n.id}
              activeOpacity={0.85}
              onPress={() => setExpandedId(expanded ? null : n.id)}
              style={[
                s.card,
                {
                  borderLeftWidth: 4,
                  borderLeftColor: TYPE_BORDER[n.type],
                  opacity: n.read ? 0.88 : 1,
                },
              ]}
            >
              <View style={s.cardTopRow}>
                <View style={[s.iconTile, { backgroundColor: TYPE_TILE_BG[n.type] }]}>
                  <Text style={s.iconTileText}>{TYPE_ICON[n.type]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.subjRow}>
                    <Text style={s.subj}>{n.subj}</Text>
                    {!n.read && <View style={s.unreadDot} />}
                  </View>
                  <Text style={s.recipient}>→ {n.teacher}</Text>
                  <Text style={s.courseLine}>
                    📅 {n.course} · {n.time}
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
