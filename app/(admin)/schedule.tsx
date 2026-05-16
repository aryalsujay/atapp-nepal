/**
 * Admin Auto-Schedule — implements `specs/25-admin-auto-schedule.md`.
 *
 * Prototype-faithful port of `app.html:2291–2427` (`AdminAuto`).
 */

import React, { useState } from 'react';
import {
  Alert,
  Modal,
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

import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero } from '@/components/ui/HeroDecorations';

type Confidence = 'high' | 'review' | 'none';

interface DraftRow {
  center: string;
  dates: string;
  type: string;
  teacher: string | null;
  score: number;
  conf: Confidence;
  note: string;
}

const AVAILABLE_TEACHERS = [
  { name: 'Bhikkhu Ananda', match: 97, langs: 'English, Hindi, Nepali' },
  { name: 'Kamala Gurung', match: 91, langs: 'Nepali, English' },
  { name: 'Asha Mehta', match: 94, langs: 'English, Nepali' },
  { name: 'Ram Prasad Sharma', match: 87, langs: 'Nepali, Hindi' },
  { name: 'Gopal Thapa', match: 76, langs: 'Nepali, English' },
  { name: 'Priya Nair', match: 88, langs: 'Hindi, Kannada' },
  { name: 'Hans Weber', match: 82, langs: 'German, English' },
];

const DRAFT: DraftRow[] = [
  {
    center: 'Dhamma Shringa, Kathmandu 🇳🇵',
    dates: 'Jul 7–18',
    type: '10-Day',
    teacher: 'Bhikkhu Ananda',
    score: 97,
    conf: 'high',
    note: '',
  },
  {
    center: 'Dhamma Pokhara 🇳🇵',
    dates: 'Jul 15–26',
    type: '10-Day',
    teacher: 'Kamala Gurung',
    score: 91,
    conf: 'high',
    note: '',
  },
  {
    center: 'Dhamma Adhara, Kathmandu 🇳🇵',
    dates: 'Aug 2–13',
    type: '10-Day',
    teacher: 'Asha Mehta',
    score: 89,
    conf: 'high',
    note: '',
  },
  {
    center: 'Dhamma Janani, Lumbini 🇳🇵',
    dates: 'Aug 20–31',
    type: '10-Day',
    teacher: 'Ram Prasad Sharma',
    score: 87,
    conf: 'review',
    note: 'First time at Dhamma Janani',
  },
  {
    center: 'Dhamma Shringa, Kathmandu 🇳🇵',
    dates: 'Nov 1–21',
    type: '20-Day',
    teacher: 'Gopal Thapa',
    score: 76,
    conf: 'review',
    note: '20-Day needs senior oversight',
  },
  {
    center: 'Dhamma Shringa, Kathmandu 🇳🇵',
    dates: 'Dec 1–30',
    type: '30-Day',
    teacher: null,
    score: 0,
    conf: 'none',
    note: 'No authorized 30-Day AT yet',
  },
];

const CONF_BORDER: Record<Confidence, string> = {
  high: Colors.fo,
  review: Colors.sf,
  none: Colors.ur,
};
const CONF_BG: Record<Confidence, string> = {
  high: Colors.fol,
  review: Colors.sfl,
  none: Colors.url,
};
const CONF_LABEL: Record<Confidence, string> = {
  high: '✓ High',
  review: '⚠ Review',
  none: '✗ None',
};

const CRITERIA = [
  'Language',
  'Location',
  'Availability',
  'Festival blocks',
  'Rest gap',
  'Course type',
  'Gender',
  'Travel distance',
];

const REASONS = [
  'Better language/location match',
  'Rest gap concern',
  'Teacher request',
  'Experience at center',
  'Other',
];

function mbadgeStyle(score: number) {
  if (score >= 90) return { bg: Colors.fol, color: Colors.fo };
  if (score >= 70) return { bg: Colors.bll, color: Colors.bl };
  return { bg: Colors.cr2, color: Colors.tx3 };
}

export default function AdminScheduleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [finalized, setFinalized] = useState(false);
  const [overrideCourse, setOverrideCourse] = useState<DraftRow | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [reason, setReason] = useState('');
  const [expandedField, setExpandedField] = useState<'teacher' | 'reason' | null>(null);

  const openOverride = (row: DraftRow) => {
    setOverrideCourse(row);
    setSelectedTeacher(row.teacher ?? '');
    setReason('');
    setExpandedField(null);
  };

  const closeOverride = () => {
    setOverrideCourse(null);
    setExpandedField(null);
  };

  const teacherLabel = selectedTeacher === '' ? 'Choose a teacher…' : selectedTeacher;
  const reasonLabel = reason === '' ? 'Select reason…' : reason;

  const confirmOverride = () => {
    if (!selectedTeacher || !overrideCourse) return;
    const action = overrideCourse.teacher ? 'Changed' : 'Assigned';
    Alert.alert(`${action} ${selectedTeacher} for ${overrideCourse.center}`);
    closeOverride();
  };

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={Gradients.autoSchedule}
          start={GradientDirection.hero.start}
          end={GradientDirection.hero.end}
          style={[s.hero, { paddingTop: Math.max(56, insets.top + 12) }]}
        >
          <LotusHero color="white" opacity={0.08} size={210} />

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
            <Text style={s.backText}>Dashboard</Text>
          </TouchableOpacity>

          <Text style={s.title}>{t('admin.schedule.title')}</Text>
          <Text style={s.subline}>Q3 2026 · Jul – Sep · Apr 24</Text>

          <View style={s.statsRow}>
            <View style={s.statChip}>
              <Text style={[s.statNumber, { color: Colors.white }]}>5/6</Text>
              <Text style={s.statLabel}>Assigned</Text>
            </View>
            <View style={s.statChip}>
              <Text style={[s.statNumber, { color: '#FFD580' }]}>3</Text>
              <Text style={s.statLabel}>Review</Text>
            </View>
            <View style={s.statChip}>
              <Text style={[s.statNumber, { color: '#FFB3AE' }]}>1</Text>
              <Text style={s.statLabel}>Unscheduled</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ─── Matching criteria ─────────────────────────────────── */}
        <View style={s.criteriaWrap}>
          <Text style={s.criteriaLabel}>{t('admin.schedule.criteria')}</Text>
          <View style={s.criteriaChips}>
            {CRITERIA.map((c) => (
              <View key={c} style={s.chipFo}>
                <Text numberOfLines={1} style={s.chipFoText}>
                  {c}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Draft assignments ────────────────────────────────── */}
        <Text style={s.sph}>{t('admin.schedule.draft_assignments')}</Text>
        {DRAFT.map((r, i) => {
          const badge = mbadgeStyle(r.score);
          return (
            <View
              key={i}
              style={[s.card, { borderLeftWidth: 4, borderLeftColor: CONF_BORDER[r.conf] }]}
            >
              <View style={s.cardTopRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={s.cardType}>{r.type}</Text>
                  <Text style={s.cardCenter}>{r.center}</Text>
                  <Text style={s.cardDates}>📅 {r.dates}</Text>
                </View>
                <View style={[s.confPill, { backgroundColor: CONF_BG[r.conf] }]}>
                  <Text style={[s.confPillText, { color: CONF_BORDER[r.conf] }]}>
                    {CONF_LABEL[r.conf]}
                  </Text>
                </View>
              </View>

              {r.teacher ? (
                <View style={s.assignedRow}>
                  <View style={s.miniAvatar}>
                    <Text style={s.miniAvatarText}>{r.teacher[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.assignedName}>{r.teacher}</Text>
                    {r.conf === 'review' && <Text style={s.assignedNote}>⚠ {r.note}</Text>}
                  </View>
                  <View style={[s.miniMbadge, { backgroundColor: badge.bg }]}>
                    <Text style={[s.miniMbadgeText, { color: badge.color }]}>{r.score}% match</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => openOverride(r)}
                    style={s.changeBtn}
                  >
                    <Text style={s.changeBtnText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={s.unassignedBanner}>
                  <Text style={s.unassignedText}>⚠ Unassigned — {r.note}</Text>
                  <TouchableOpacity activeOpacity={0.85} onPress={() => openOverride(r)}>
                    <LinearGradient
                      colors={Gradients.primaryCta}
                      start={GradientDirection.button.start}
                      end={GradientDirection.button.end}
                      style={s.assignManuallyBtn}
                    >
                      <Text style={s.assignManuallyBtnText}>Assign Manually</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* ─── Footer actions ───────────────────────────────────── */}
        <View style={s.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Alert.alert(t('common.coming_soon'))}
            style={[s.footerBtn, s.footerBtnOu]}
          >
            <Text style={[s.footerBtnText, { color: Colors.tx }]}>⚡ Re-generate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFinalized(true)}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={Gradients.forestCta}
              start={GradientDirection.button.start}
              end={GradientDirection.button.end}
              style={s.footerBtn}
            >
              <Text style={[s.footerBtnText, { color: Colors.white }]}>
                {finalized ? '✅ Notified!' : '✓ Finalize & Notify'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {finalized && (
          <View style={s.finalizedBanner}>
            <Text style={s.finalizedEmoji}>✅</Text>
            <Text style={s.finalizedTitle}>Schedule Finalized!</Text>
            <Text style={s.finalizedBody}>All teachers notified. Sadhu! 🙏</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ─── Override modal ─────────────────────────────────────── */}
      <Modal
        transparent
        visible={overrideCourse !== null}
        animationType="fade"
        onRequestClose={closeOverride}
      >
        <View style={s.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeOverride}
            style={StyleSheet.absoluteFillObject}
          />
          {overrideCourse && (
            <View style={s.modalCard}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 4 }}
              >
                <Text style={s.modalTitle}>
                  {overrideCourse.teacher ? 'Change Teacher' : 'Assign Teacher'}
                </Text>

                <View style={s.modalSummary}>
                  <Text style={s.modalSummaryType}>{overrideCourse.type}</Text>
                  <Text style={s.modalSummaryCenter}>{overrideCourse.center}</Text>
                  <Text style={s.modalSummaryDates}>📅 {overrideCourse.dates}</Text>
                  {overrideCourse.teacher && (
                    <Text style={s.modalCurrent}>
                      Current:{' '}
                      <Text style={{ fontWeight: '700', color: Colors.tx }}>
                        {overrideCourse.teacher}
                      </Text>{' '}
                      ({overrideCourse.score}%)
                    </Text>
                  )}
                </View>

                <Text style={s.modalFieldLabel}>Select Teacher:</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setExpandedField(expandedField === 'teacher' ? null : 'teacher')}
                  style={s.selectBtn}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      s.selectBtnText,
                      {
                        color: selectedTeacher === '' ? Colors.tx3 : Colors.tx,
                      },
                    ]}
                  >
                    {teacherLabel}
                  </Text>
                  <Text
                    style={[
                      s.selectChevron,
                      expandedField === 'teacher' && {
                        transform: [{ rotate: '180deg' }],
                      },
                    ]}
                  >
                    ▾
                  </Text>
                </TouchableOpacity>
                {expandedField === 'teacher' && (
                  <View style={s.selectDropdown}>
                    {AVAILABLE_TEACHERS.map((teach) => {
                      const on = selectedTeacher === teach.name;
                      return (
                        <TouchableOpacity
                          key={teach.name}
                          activeOpacity={0.7}
                          onPress={() => {
                            setSelectedTeacher(teach.name);
                            setExpandedField(null);
                          }}
                          style={[s.dropdownOption, on && { backgroundColor: Colors.sfl }]}
                        >
                          <Text
                            style={[
                              s.dropdownOptionTitle,
                              on && { color: Colors.sf, fontWeight: '700' },
                            ]}
                          >
                            {teach.name}
                          </Text>
                          <Text style={s.dropdownOptionSub}>
                            {teach.match}% · {teach.langs}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                <Text style={[s.modalFieldLabel, { marginTop: 12 }]}>Reason (optional):</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setExpandedField(expandedField === 'reason' ? null : 'reason')}
                  style={s.selectBtn}
                >
                  <Text
                    numberOfLines={1}
                    style={[s.selectBtnText, { color: reason === '' ? Colors.tx3 : Colors.tx }]}
                  >
                    {reasonLabel}
                  </Text>
                  <Text
                    style={[
                      s.selectChevron,
                      expandedField === 'reason' && {
                        transform: [{ rotate: '180deg' }],
                      },
                    ]}
                  >
                    ▾
                  </Text>
                </TouchableOpacity>
                {expandedField === 'reason' && (
                  <View style={s.selectDropdown}>
                    {REASONS.map((r) => {
                      const on = reason === r;
                      return (
                        <TouchableOpacity
                          key={r}
                          activeOpacity={0.7}
                          onPress={() => {
                            setReason(on ? '' : r);
                            setExpandedField(null);
                          }}
                          style={[s.dropdownOption, on && { backgroundColor: Colors.sfl }]}
                        >
                          <Text
                            style={[
                              s.dropdownOptionTitle,
                              on && { color: Colors.sf, fontWeight: '700' },
                            ]}
                          >
                            {r}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                <View style={s.modalButtonRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={closeOverride}
                    style={[s.modalBtn, s.modalBtnOu]}
                  >
                    <Text style={[s.modalBtnText, { color: Colors.tx }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={confirmOverride}
                    disabled={!selectedTeacher}
                    style={{ flex: 1, opacity: selectedTeacher ? 1 : 0.5 }}
                  >
                    <LinearGradient
                      colors={Gradients.primaryCta}
                      start={GradientDirection.button.start}
                      end={GradientDirection.button.end}
                      style={s.modalBtn}
                    >
                      <Text style={[s.modalBtnText, { color: Colors.white }]}>Confirm</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    fontFamily: FontFamily.sansExtraBold,
  },
  subline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.sansRegular,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 13,
    paddingHorizontal: 6,
    paddingVertical: 9,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
  },
  statLabel: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },

  // Criteria
  criteriaWrap: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  criteriaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.tx2,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.55,
    fontFamily: FontFamily.sansBold,
  },
  criteriaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  chipFo: {
    backgroundColor: Colors.fol,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    // ≈ (100% - 3 gaps × 5) / 4 = 22.6%, but accounting for RN's
    // gap-as-flex-spacing quirks we use a slightly tighter value.
    width: '22.7%',
    alignItems: 'center',
  },
  chipFoText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.fo,
    fontFamily: FontFamily.sansSemiBold,
  },

  // sph
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 7,
  },
  cardType: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  cardCenter: {
    fontSize: 12.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  cardDates: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  confPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  confPillText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Assigned teacher row (inside card)
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.cr,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.sfm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  miniAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.sfd,
    fontFamily: FontFamily.sansBold,
  },
  assignedName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.tx,
    fontFamily: FontFamily.sansSemiBold,
  },
  assignedNote: {
    fontSize: 10.5,
    color: Colors.sf,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  miniMbadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
    flexShrink: 0,
  },
  miniMbadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  changeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.bd2,
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },

  // Unassigned banner
  unassignedBanner: {
    backgroundColor: Colors.url,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  unassignedText: {
    fontSize: 12,
    color: Colors.ur,
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: FontFamily.sansSemiBold,
  },
  assignManuallyBtn: {
    width: '100%',
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignManuallyBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },

  // Footer actions
  actionsRow: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnOu: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.bd2,
  },
  footerBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Finalized banner
  finalizedBanner: {
    marginHorizontal: 18,
    marginTop: 10,
    backgroundColor: Colors.fol,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  finalizedEmoji: { fontSize: 24, marginBottom: 5 },
  finalizedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.fo,
    fontFamily: FontFamily.sansBold,
  },
  finalizedBody: {
    fontSize: 12.5,
    color: Colors.tx2,
    marginTop: 3,
    textAlign: 'center',
    fontFamily: FontFamily.sansRegular,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '90%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.tx,
    marginBottom: 12,
    fontFamily: FontFamily.sansBold,
  },
  modalSummary: {
    backgroundColor: Colors.cr,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  modalSummaryType: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.tx,
    fontFamily: FontFamily.sansSemiBold,
  },
  modalSummaryCenter: {
    fontSize: 12,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  modalSummaryDates: {
    fontSize: 11,
    color: Colors.tx3,
    fontFamily: FontFamily.sansRegular,
  },
  modalCurrent: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 4,
    fontFamily: FontFamily.sansRegular,
  },
  modalFieldLabel: {
    fontSize: 11,
    color: Colors.tx2,
    marginBottom: 5,
    fontFamily: FontFamily.sansRegular,
  },
  // Select-style dropdown
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectBtnText: {
    fontSize: 12,
    flex: 1,
    paddingRight: 8,
    fontFamily: FontFamily.sansRegular,
  },
  selectChevron: {
    fontSize: 14,
    color: Colors.tx3,
    fontFamily: FontFamily.sansBold,
  },
  selectDropdown: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  dropdownOptionTitle: {
    fontSize: 12,
    color: Colors.tx,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  dropdownOptionSub: {
    fontSize: 10.5,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnOu: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.bd2,
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
});
