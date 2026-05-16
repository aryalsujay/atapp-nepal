/**
 * Server Application Detail — implements `specs/18-server-application-detail.md`.
 *
 * Prototype-faithful port of `app.html:3173–3303` (`ServerAppDetail`).
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { Routes } from '@/routes';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero } from '@/components/ui/HeroDecorations';
import { DashedDivider } from '@/components/ui/DashedDivider';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import { serverApplications, serverCourses, type ServerApplication } from '@/data';

const HERO_GRAD: [string, string] = ['#5A3800', '#9B6B14'];
const APPLY_GRAD: [string, string] = ['#9B6B14', '#6B4610'];
const SV_ACCENT = '#9B6B14';
const REJECTED_SOFT = '#B85040';
const PENDING_BG = '#FBF0E0';
const PENDING_BORDER = '#E8C878';
const PENDING_TEXT = '#7A5008';
const WITHDRAW_BORDER = '#E8B0A0';
const WITHDRAW_BG = '#FBE8E0';
const WITHDRAW_BODY = '#7A2A20';

const CHECKLIST_ICONS = ['🪪', '👕', '🧣', '🩴', '🔦', '💊', '🚫'];

function durationAccent(status: ServerApplication['status']): string {
  if (status === 'approved') return Colors.fo;
  if (status === 'pending') return SV_ACCENT;
  return REJECTED_SOFT;
}

export default function ServerApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const numericId = Number(id);
  const a = serverApplications.find((x) => x.id === numericId) ?? serverApplications[0];
  const course = serverCourses.find((c) => c.id === a.courseId);
  const city = course?.city ?? '';

  const [withdrawn, setWithdrawn] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // ─── Withdrawn success state ─────────────────────────────────────────
  if (withdrawn) {
    return (
      <View style={[s.flex, s.withdrawnWrap]}>
        <Text style={s.withdrawnEmoji}>🙏</Text>
        <Text style={s.withdrawnTitle}>{t('server.applicationDetail.withdrawn_title')}</Text>
        <Text style={s.withdrawnBody}>{t('server.applicationDetail.withdrawn_body')}</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.replace(Routes.serverApplications)}
          style={{ width: '100%' }}
        >
          <LinearGradient
            colors={APPLY_GRAD}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.withdrawnCta}
          >
            <Text style={s.withdrawnCtaText}>{t('server.applicationDetail.view_apps')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const accent = durationAccent(a.status);
  const durationText = a.partial
    ? `${t('server.applicationDetail.partial_lbl')} · ${a.days ?? ''}`
    : t('server.applicationDetail.full_course');

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero ─────────────────────────────────────────────────── */}
        <LinearGradient
          colors={HERO_GRAD}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.671, y: 0.97 }}
          style={[s.hero, { paddingTop: Math.max(56, insets.top + 12) }]}
        >
          <LotusHero color="white" opacity={0.08} size={180} />

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={s.backRow}
            hitSlop={8}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={s.backText}>{t('common.back')}</Text>
          </TouchableOpacity>

          <View style={s.statusRow}>
            <View style={s.statusPill}>
              <Text style={s.statusPillText}>
                {t(`server.applicationDetail.status.${a.status}`)}
              </Text>
            </View>
            <Text style={s.appliedText}>
              {t('server.applicationDetail.applied_lbl')} {a.applied}
            </Text>
          </View>

          <Text style={s.title}>{a.center}</Text>
          {city ? <Text style={s.subline}>{city}</Text> : null}
          <Text style={s.dateLine}>📅 {a.dates}</Text>
        </LinearGradient>

        {/* ─── Service areas + duration ─────────────────────────────── */}
        <Text style={s.sph}>🌟 {t('server.applicationDetail.service_areas')}</Text>
        <View style={s.sectionCard}>
          <View style={s.chipsRow}>
            {a.areas.map((aid) => {
              const sa = SERVICE_AREAS.find((x) => x.id === aid);
              if (!sa) return null;
              return (
                <View key={aid} style={s.areaChip}>
                  <Text style={s.areaChipText}>
                    {sa.emoji} {sa.label}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={s.durationLine}>
            {t('server.applicationDetail.duration_lbl')}{' '}
            <Text style={[s.durationValue, { color: accent }]}>{durationText}</Text>
          </Text>
        </View>

        {/* ─── Status-specific sections ─────────────────────────────── */}
        {a.status === 'approved' && (
          <>
            <Text style={s.sph}>✅ {t('server.applicationDetail.confirmed')}</Text>
            <View style={[s.sectionCard, s.confirmedCard]}>
              <Text style={s.confirmedLine}>
                {t('server.applicationDetail.arrive_by_lbl')}{' '}
                <Text style={[s.confirmedBold, { color: Colors.fo }]}>{a.arriveBy}</Text>
              </Text>
              <Text style={s.coordinatorLine}>
                {t('server.applicationDetail.coordinator_lbl')}{' '}
                <Text style={s.coordinatorBold}>{a.coordinator}</Text> · {a.coordPhone}
              </Text>
            </View>

            <Text style={s.sph}>🎒 {t('server.applicationDetail.what_bring')}</Text>
            <View style={s.sectionCard}>
              {CHECKLIST_ICONS.map((icon, i) => (
                <React.Fragment key={icon}>
                  <View style={s.checkRow}>
                    <Text style={s.checkIcon}>{icon}</Text>
                    <Text style={s.checkBody}>
                      {t(`server.applicationDetail.checklist.row_${i}`)}
                    </Text>
                  </View>
                  <DashedDivider marginVertical={0} />
                </React.Fragment>
              ))}
            </View>

            <Text style={s.sph}>🚌 {t('server.applicationDetail.journey')}</Text>
            <View style={s.sectionCard}>
              <Text style={s.journeyBody}>{t('server.applicationDetail.journey_body')}</Text>
            </View>
          </>
        )}

        {a.status === 'pending' && (
          <View style={s.pendingCard}>
            <Text style={s.pendingBody}>{t('server.applicationDetail.pending_body')}</Text>
          </View>
        )}

        {a.status === 'rejected' && a.reason && (
          <View style={s.rejectedCard}>
            <Text style={s.rejectedHeader}>{t('server.applicationDetail.reason')}</Text>
            <Text style={s.rejectedBody}>{a.reason}</Text>
          </View>
        )}

        {/* ─── Actions ──────────────────────────────────────────────── */}
        <View style={s.actionsWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Alert.alert(t('server.applicationDetail.coming_soon'))}
            style={s.messageBtn}
          >
            <Text style={s.messageBtnText}>{t('server.applicationDetail.message_admin')}</Text>
          </TouchableOpacity>

          {a.status !== 'rejected' && !confirming && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setConfirming(true)}
              style={s.withdrawBtn}
            >
              <Text style={s.withdrawBtnText}>{t('server.applicationDetail.withdraw')}</Text>
            </TouchableOpacity>
          )}

          {confirming && (
            <View style={s.confirmPanel}>
              <Text style={s.confirmBody}>{t('server.applicationDetail.withdraw_confirm')}</Text>
              <View style={s.confirmBtnRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setConfirming(false)}
                  style={s.cancelBtn}
                >
                  <Text style={s.cancelBtnText}>{t('server.applicationDetail.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setWithdrawn(true);
                    setConfirming(false);
                  }}
                  style={s.confirmBtn}
                >
                  <Text style={s.confirmBtnText}>
                    {t('server.applicationDetail.withdraw_short')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },

  // Hero
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  backText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: FontFamily.sansRegular,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  statusPill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },
  appliedText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.sansRegular,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    fontFamily: FontFamily.sansExtraBold,
  },
  subline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    fontFamily: FontFamily.sansRegular,
  },
  dateLine: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },

  // Section header (.sph)
  sph: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 9,
    fontFamily: FontFamily.sansBold,
  },

  // Section card (margin 0 18px, no marginBottom)
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 0,
    shadowColor: Colors.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
  },

  // Areas card internals
  chipsRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  areaChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: Colors.svl,
  },
  areaChipText: {
    fontSize: 11,
    color: SV_ACCENT,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  durationLine: {
    fontSize: 12,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  durationValue: {
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Confirmed (approved) card
  confirmedCard: {
    backgroundColor: Colors.fol,
    borderWidth: 1.5,
    borderColor: Colors.fom,
  },
  confirmedLine: {
    fontSize: 12,
    color: Colors.tx2,
    lineHeight: 18.6,
    fontFamily: FontFamily.sansRegular,
  },
  confirmedBold: {
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  coordinatorLine: {
    fontSize: 11.5,
    color: Colors.tx2,
    marginTop: 4,
    fontFamily: FontFamily.sansRegular,
  },
  coordinatorBold: {
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },

  // Checklist rows
  checkRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 7,
    alignItems: 'flex-start',
  },
  checkIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
    flexShrink: 0,
  },
  checkBody: {
    fontSize: 12.5,
    color: Colors.tx2,
    lineHeight: 17.5,
    flex: 1,
    fontFamily: FontFamily.sansRegular,
  },

  // Journey
  journeyBody: {
    fontSize: 12.5,
    color: Colors.tx2,
    lineHeight: 19.4,
    fontFamily: FontFamily.sansRegular,
  },

  // Pending banner
  pendingCard: {
    backgroundColor: PENDING_BG,
    borderWidth: 1,
    borderColor: PENDING_BORDER,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginTop: 14,
    marginBottom: 0,
    shadowColor: Colors.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
  },
  pendingBody: {
    fontSize: 12.5,
    color: PENDING_TEXT,
    lineHeight: 18.75,
    fontFamily: FontFamily.sansRegular,
  },

  // Rejected reason card
  rejectedCard: {
    backgroundColor: Colors.url,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginTop: 14,
    marginBottom: 0,
    shadowColor: Colors.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
  },
  rejectedHeader: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.ur,
    marginBottom: 3,
    fontFamily: FontFamily.sansBold,
  },
  rejectedBody: {
    fontSize: 12.5,
    color: Colors.ur,
    lineHeight: 18.1,
    fontFamily: FontFamily.sansRegular,
  },

  // Actions
  actionsWrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
  },
  messageBtn: {
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.bd2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  messageBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  withdrawBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: WITHDRAW_BORDER,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: REJECTED_SOFT,
    fontFamily: FontFamily.sansBold,
  },

  // Confirm panel
  confirmPanel: {
    padding: 12,
    borderRadius: 13,
    backgroundColor: WITHDRAW_BG,
    borderWidth: 1.5,
    borderColor: WITHDRAW_BORDER,
  },
  confirmBody: {
    fontSize: 12.5,
    color: WITHDRAW_BODY,
    marginBottom: 10,
    lineHeight: 17.5,
    fontFamily: FontFamily.sansRegular,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.bd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.tx2,
    fontFamily: FontFamily.sansBold,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: REJECTED_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },

  // Withdrawn success state
  withdrawnWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: Colors.cr,
  },
  withdrawnEmoji: { fontSize: 60, marginBottom: 16 },
  withdrawnTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: SV_ACCENT,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: FontFamily.sansExtraBold,
  },
  withdrawnBody: {
    fontSize: 13,
    color: Colors.tx2,
    lineHeight: 20.15,
    marginBottom: 24,
    maxWidth: 280,
    textAlign: 'center',
    fontFamily: FontFamily.sansRegular,
  },
  withdrawnCta: {
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawnCtaText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },
});
