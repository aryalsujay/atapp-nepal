/**
 * Admin Review — implements `specs/23-admin-review.md`.
 *
 * Prototype-faithful port of `app.html:2059–2112` (`AdminReview`).
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type DimensionValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { Routes } from '@/routes';
import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero } from '@/components/ui/HeroDecorations';
import { adminApplications } from '@/data';
import { useAdminApplicationsStore } from '@/store/adminApplicationsStore';

type Decision = 'approved' | 'rejected' | null;

const NOTE_BORDER = '#F5E0A0';

export default function AdminReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const numericId = Number(id);
  const a = adminApplications.find((x) => x.id === numericId) ?? adminApplications[0];
  const approve = useAdminApplicationsStore((s) => s.approve);
  const reject = useAdminApplicationsStore((s) => s.reject);
  const statusFor = useAdminApplicationsStore((s) => s.statusFor);
  const existingStatus = statusFor(a.id);
  const [dec, setDec] = useState<Decision>(existingStatus !== 'pending' ? existingStatus : null);

  const checks = [
    {
      label: 'Language match',
      ok: a.langs.includes('Nepali') || a.langs.includes('English'),
      desc: `Course: Nepali/English · AT: ${a.langs.join(', ')}`,
    },
    {
      label: 'Location preference',
      ok: true,
      desc: 'Nepal in preferred regions ✓',
    },
    {
      label: 'Rest gap',
      ok: true,
      desc: 'Last taught Feb 2026 · sufficient rest ✓',
    },
    {
      label: 'Match score',
      ok: a.match >= 85,
      desc: `${a.match}% compatibility`,
    },
    {
      label: 'Gender match',
      ok: true,
      desc: 'Meets course requirement ✓',
    },
  ];

  const scoreColor = a.match >= 90 ? Colors.fo : Colors.sf;
  const caption =
    a.match >= 90 ? 'Excellent match 🌟' : a.match >= 80 ? 'Good match' : 'Fair match';

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={Gradients.adminReview}
          start={GradientDirection.hero.start}
          end={GradientDirection.hero.end}
          style={[s.hero, { paddingTop: Math.max(56, insets.top + 12) }]}
        >
          <LotusHero color="white" opacity={0.07} size={200} />

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={s.backRow}
            hitSlop={8}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke="rgba(255,255,255,0.72)"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={s.backText}>{t('admin.review.back_inbox')}</Text>
          </TouchableOpacity>

          <View style={s.identityRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{a.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{a.name}</Text>
              <Text style={s.role}>AT · {a.courses} courses</Text>
              <View style={s.langChipsRow}>
                {a.langs.map((l) => (
                  <View key={l} style={s.langChip}>
                    <Text style={s.langChipText}>{l}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={s.applyingTile}>
            <Text style={s.applyingLabel}>Applying for</Text>
            <Text style={s.applyingCourse}>{a.course}</Text>
          </View>
        </LinearGradient>

        {/* ─── Match score card ─────────────────────────────────── */}
        <View style={[s.card, s.matchCard]}>
          <Text style={s.matchLabel}>{t('admin.review.match_score')}</Text>
          <Text style={[s.matchScore, { color: scoreColor }]}>{a.match}%</Text>
          <View style={s.meterTrack}>
            <View
              style={[
                s.meterFill,
                {
                  width: `${a.match}%` as DimensionValue,
                  backgroundColor: scoreColor,
                },
              ]}
            />
          </View>
          <Text style={s.matchCaption}>{caption}</Text>
        </View>

        {/* ─── Eligibility ──────────────────────────────────────── */}
        <Text style={s.sph}>{t('admin.review.eligibility')}</Text>
        <View style={s.sectionCard}>
          {checks.map((c, i) => {
            const isLast = i === checks.length - 1;
            return (
              <View
                key={c.label}
                style={[
                  s.chkRow,
                  !isLast && {
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.bd,
                  },
                ]}
              >
                <View
                  style={[
                    s.chkIc,
                    {
                      backgroundColor: c.ok ? Colors.fol : Colors.url,
                    },
                  ]}
                >
                  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                    {c.ok ? (
                      <Path
                        d="M5 13L9 17L19 7"
                        stroke={Colors.fo}
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : (
                      <Path
                        d="M18 6L6 18M6 6L18 18"
                        stroke={Colors.ur}
                        strokeWidth={2.2}
                        strokeLinecap="round"
                      />
                    )}
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.chkLabel}>{c.label}</Text>
                  <Text style={s.chkDesc}>{c.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ─── Admin Notes ──────────────────────────────────────── */}
        <Text style={s.sph}>{t('admin.review.admin_notes')}</Text>
        <View style={[s.sectionCard, s.notesCard]}>
          <Text style={s.notesText}>&ldquo;{a.note}&rdquo;</Text>
        </View>

        {/* ─── Decision area ────────────────────────────────────── */}
        {dec === null ? (
          <View style={s.decisionWrap}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                approve(a.id);
                setDec('approved');
              }}
            >
              <LinearGradient
                colors={Gradients.forestCta}
                start={GradientDirection.button.start}
                end={GradientDirection.button.end}
                style={s.approveBtn}
              >
                <Text style={s.approveBtnText}>{t('admin.review.approve_btn')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                reject(a.id);
                setDec('rejected');
              }}
              style={s.rejectBtn}
            >
              <Text style={s.rejectBtnText}>{t('admin.review.reject_btn')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.resultWrap}>
            <View
              style={[
                s.resultCard,
                {
                  backgroundColor: dec === 'approved' ? Colors.fol : Colors.url,
                  borderColor: dec === 'approved' ? Colors.fom : Colors.urd,
                },
              ]}
            >
              <Text style={s.resultEmoji}>{dec === 'approved' ? '✅' : '❌'}</Text>
              <Text style={[s.resultTitle, { color: dec === 'approved' ? Colors.fo : Colors.ur }]}>
                {t(
                  dec === 'approved'
                    ? 'admin.review.approved_title'
                    : 'admin.review.rejected_title',
                )}
              </Text>
              <Text style={s.resultBody}>
                {t(
                  dec === 'approved' ? 'admin.review.approved_body' : 'admin.review.rejected_body',
                )}
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(Routes.adminInbox)}
                style={s.resultBackBtn}
              >
                <Text style={s.resultBackBtnText}>{t('admin.review.back_inbox')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
    marginBottom: 13,
  },
  backText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: FontFamily.sansRegular,
  },
  identityRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    fontFamily: FontFamily.sansExtraBold,
  },
  role: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: FontFamily.sansRegular,
  },
  langChipsRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
    marginTop: 7,
  },
  langChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 20,
  },
  langChipText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  applyingTile: {
    marginTop: 13,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  applyingLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.55,
    marginBottom: 2,
    fontFamily: FontFamily.sansSemiBold,
  },
  applyingCourse: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },

  // Card base
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    shadowColor: Colors.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
  },
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

  // Match card
  matchCard: {
    marginTop: 14,
    marginHorizontal: 18,
    alignItems: 'center',
  },
  matchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.tx2,
    marginBottom: 7,
    fontFamily: FontFamily.sansSemiBold,
  },
  matchScore: {
    fontSize: 52,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
  },
  meterTrack: {
    width: '100%',
    height: 5,
    backgroundColor: Colors.cr3,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 5,
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
  matchCaption: {
    fontSize: 12,
    color: Colors.tx3,
    marginTop: 5,
    fontFamily: FontFamily.sansRegular,
  },

  // Section header
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

  // Check rows
  chkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
  },
  chkIc: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  chkLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  chkDesc: {
    fontSize: 11.5,
    color: Colors.tx2,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },

  // Notes card
  notesCard: {
    backgroundColor: Colors.gdl,
    borderWidth: 1,
    borderColor: NOTE_BORDER,
  },
  notesText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20.15,
    color: Colors.tx,
    fontFamily: FontFamily.sansRegular,
  },

  // Decision (no decision yet)
  decisionWrap: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
    flexDirection: 'column',
    gap: 9,
  },
  approveBtn: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },
  rejectBtn: {
    backgroundColor: Colors.url,
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Colors.urd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ur,
    fontFamily: FontFamily.sansBold,
  },

  // Result card
  resultWrap: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
  },
  resultCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    textAlign: 'center',
  },
  resultBody: {
    fontSize: 12.5,
    color: Colors.tx2,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: FontFamily.sansRegular,
  },
  resultBackBtn: {
    marginTop: 11,
    alignSelf: 'center',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.bd2,
    backgroundColor: 'transparent',
  },
  resultBackBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
});
