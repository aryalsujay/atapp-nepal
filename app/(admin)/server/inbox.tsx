/**
 * Admin Server Inbox — implements `specs/29-admin-server-inbox.md`.
 *
 * Prototype-faithful port of `app.html:3492–3646` (`AdminServerInbox`).
 */

import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { Routes } from '@/routes';
import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { DashedDivider } from '@/components/ui/DashedDivider';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import { serverApplicants, type ServerApplicant } from '@/data';

type FilterMode = 'all' | 'course';
type Decision = 'approved' | 'rejected';

const AVATAR_BG_F = '#F3DDF0';
const AVATAR_BG_M = '#D6E5F0';
const REJECT_TEXT = '#B85040';
const REJECT_BORDER = '#E8B0A0';

function simplifyCourseLabel(c: string): string {
  return c.replace('Dhamma ', '').replace(' — ', ' · ');
}

export default function AdminServerInboxScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterMode>('all');
  const [filterVal, setFilterVal] = useState<string | null>(null);
  const [sel, setSel] = useState<ServerApplicant | null>(null);
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const [reason, setReason] = useState('');

  const apps = useMemo(
    () =>
      serverApplicants.filter((a) => {
        if (decisions[a.id]) return false;
        if (filter === 'course' && filterVal && a.course !== filterVal) return false;
        return true;
      }),
    [decisions, filter, filterVal],
  );

  const reviewedCount = Object.keys(decisions).length;

  const courseOpts = useMemo(() => Array.from(new Set(serverApplicants.map((a) => a.course))), []);

  const decideAndClose = (id: number, d: Decision) => {
    setDecisions((prev) => ({ ...prev, [id]: d }));
    setSel(null);
    setReason('');
  };

  // ─── Detail view ───────────────────────────────────────────────
  if (sel) {
    const a = sel;
    const avatarBg = a.g === 'F' ? AVATAR_BG_F : AVATAR_BG_M;
    const durationText = a.partial
      ? `${t('admin.serverInbox.partial_lbl')} · ${a.days ?? ''}`
      : t('admin.serverInbox.full_course');

    return (
      <View style={[s.flex, { backgroundColor: Colors.cr }]}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
            <TouchableOpacity
              onPress={() => {
                setSel(null);
                setReason('');
              }}
              activeOpacity={0.7}
              style={s.backRow}
              hitSlop={8}
            >
              <BackArrow />
              <Text style={s.backText}>{t('admin.serverInbox.back_inbox')}</Text>
            </TouchableOpacity>

            <View style={s.detailIdentity}>
              <View style={[s.detailAvatar, { backgroundColor: avatarBg }]}>
                <Text style={s.detailAvatarText}>{a.g === 'F' ? '👩' : '👨'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.detailName}>{a.name}</Text>
                <Text style={s.detailMeta}>
                  {a.courses} {t('admin.serverInbox.courses_served')} ·{' '}
                  {t('admin.serverInbox.last_lbl')}: {a.last}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: 8, backgroundColor: Colors.cr }} />

          {/* Applying for */}
          <Text style={s.sph}>📋 {t('admin.serverInbox.applying_for')}</Text>
          <View style={[s.sectionCard, { borderLeftWidth: 4, borderLeftColor: Colors.bl }]}>
            <Text style={s.courseTitle}>{a.course}</Text>
            <Text style={s.appliedRow}>
              {t('admin.serverInbox.applied_lbl')}: {a.applied}
            </Text>
            <View style={s.areaChipsRow}>
              {a.areas.map((id) => {
                const sa = SERVICE_AREAS.find((x) => x.id === id);
                if (!sa) return null;
                return (
                  <View key={id} style={s.areaChipBig}>
                    <Text style={s.areaChipBigText}>
                      {sa.emoji} {sa.label}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={s.durationLine}>
              {t('admin.serverInbox.duration_lbl')}:{' '}
              <Text style={s.durationValue}>{durationText}</Text>
            </Text>
            <DashedDivider marginVertical={8} />
            <Text style={s.noteText}>&ldquo;{a.note}&rdquo;</Text>
          </View>

          {/* Their history */}
          <Text style={s.sph}>📖 {t('admin.serverInbox.their_history')}</Text>
          <View style={s.sectionCard}>
            <View style={s.statTilesRow}>
              <StatTile n={String(a.courses)} label={t('admin.serverInbox.history_courses')} />
              <StatTile n={a.last} label={t('admin.serverInbox.history_last')} />
              <StatTile n={a.g === 'F' ? '♀' : '♂'} label={t('admin.serverInbox.history_gender')} />
            </View>
            <Text style={s.historyFootnote}>{t('admin.serverInbox.history_footnote')}</Text>
          </View>

          {/* Decision */}
          <Text style={s.sph}>⚖️ {t('admin.serverInbox.decision')}</Text>
          <View style={{ paddingHorizontal: 18 }}>
            <TextInput
              value={reason}
              onChangeText={setReason}
              multiline
              textAlignVertical="top"
              placeholder={t('admin.serverInbox.reason_placeholder')}
              placeholderTextColor={Colors.tx3}
              style={s.reasonInput}
            />
            <View style={s.detailDecisionRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => decideAndClose(a.id, 'rejected')}
                style={[s.detailRejectBtn, { flex: 1 }]}
              >
                <Text style={s.detailRejectBtnText}>{t('admin.serverInbox.reject')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => decideAndClose(a.id, 'approved')}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={Gradients.forestCta}
                  start={GradientDirection.button.start}
                  end={GradientDirection.button.end}
                  style={s.detailApproveBtn}
                >
                  <Text style={s.detailApproveBtnText}>{t('admin.serverInbox.approve')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    );
  }

  // ─── List view ─────────────────────────────────────────────────
  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
          <TouchableOpacity
            onPress={() => router.push(Routes.adminServerBoard)}
            activeOpacity={0.7}
            style={s.backRow}
            hitSlop={8}
          >
            <BackArrow />
            <Text style={s.backText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={s.listTitle}>{t('admin.serverInbox.title')}</Text>
          <Text style={s.listSubtitle}>
            {apps.length} {t('admin.serverInbox.pending_lbl')} · {reviewedCount}{' '}
            {t('admin.serverInbox.reviewed_lbl')}
          </Text>
        </View>

        {/* Filter chips (white wrapper continues) */}
        <View style={s.filterWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterChipsContent}
          >
            <FilterChip
              label={t('admin.serverInbox.filter_all')}
              active={filter === 'all'}
              onPress={() => {
                setFilter('all');
                setFilterVal(null);
              }}
            />
            {courseOpts.map((co) => (
              <FilterChip
                key={co}
                label={simplifyCourseLabel(co)}
                active={filter === 'course' && filterVal === co}
                onPress={() => {
                  setFilter('course');
                  setFilterVal(co);
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Cream gap */}
        <View style={{ height: 8, backgroundColor: Colors.cr }} />

        {/* Cards / empty state */}
        {apps.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>🙏</Text>
            <Text style={s.emptyText}>{t('admin.serverInbox.no_pending')}</Text>
          </View>
        ) : (
          apps.map((a) => {
            const avatarBg = a.g === 'F' ? AVATAR_BG_F : AVATAR_BG_M;
            const durationText = a.partial
              ? `${t('admin.serverInbox.partial_lbl')} · ${a.days ?? ''}`
              : t('admin.serverInbox.full_course');
            return (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.85}
                onPress={() => setSel(a)}
                style={s.card}
              >
                <View style={s.cardTopRow}>
                  <View style={[s.avatar, { backgroundColor: avatarBg }]}>
                    <Text style={s.avatarText}>{a.g === 'F' ? '👩' : '👨'}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={s.nameRow}>
                      <Text style={s.name} numberOfLines={1}>
                        {a.name}
                      </Text>
                      <Text style={s.applied}>{a.applied}</Text>
                    </View>
                    <Text style={s.historyLine}>
                      {a.courses} {t('admin.serverInbox.courses_lbl')} · {a.last}
                    </Text>
                    <Text style={s.courseLine}>{a.course}</Text>
                  </View>
                </View>

                <View style={s.chipsRow}>
                  {a.areas.map((id) => {
                    const sa = SERVICE_AREAS.find((x) => x.id === id);
                    if (!sa) return null;
                    return (
                      <View key={id} style={s.areaChip}>
                        <Text style={s.areaChipText}>
                          {sa.emoji} {sa.label}
                        </Text>
                      </View>
                    );
                  })}
                  <View style={s.durationChip}>
                    <Text style={s.durationChipText}>{durationText}</Text>
                  </View>
                </View>

                <View style={s.actionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setDecisions((d) => ({ ...d, [a.id]: 'rejected' }))}
                    style={[s.actionBtn, s.rejectBtn, { flex: 1 }]}
                  >
                    <Text numberOfLines={1} style={[s.actionBtnText, { color: REJECT_TEXT }]}>
                      {t('admin.serverInbox.reject')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setDecisions((d) => ({ ...d, [a.id]: 'approved' }))}
                    style={{ flex: 1, minHeight: 34 }}
                  >
                    <LinearGradient
                      colors={Gradients.forestCta}
                      start={GradientDirection.button.start}
                      end={GradientDirection.button.end}
                      style={[s.actionBtn, { flex: 1 }]}
                    >
                      <Text numberOfLines={1} style={[s.actionBtnText, { color: Colors.white }]}>
                        {t('admin.serverInbox.approve')}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setSel(a)}
                    style={[s.actionBtn, { flex: 1, backgroundColor: Colors.bl }]}
                  >
                    <Text numberOfLines={1} style={[s.actionBtnText, { color: Colors.white }]}>
                      {t('admin.serverInbox.view_applicant')}
                    </Text>
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

// ─── Sub-components ─────────────────────────────────────────────

function BackArrow() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={Colors.bl}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        s.fchip,
        active
          ? { backgroundColor: Colors.bl, borderColor: Colors.bl }
          : { backgroundColor: Colors.white, borderColor: Colors.bd2 },
      ]}
    >
      <Text numberOfLines={1} style={[s.fchipText, { color: active ? Colors.white : Colors.tx2 }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function StatTile({ n, label }: { n: string; label: string }) {
  return (
    <View style={s.statTile}>
      <Text style={s.statTileNumber}>{n}</Text>
      <Text style={s.statTileLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },

  // Header
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  backText: {
    fontSize: 13,
    color: Colors.bl,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.tx,
    fontFamily: FontFamily.sansExtraBold,
  },
  listSubtitle: {
    fontSize: 13,
    color: Colors.tx2,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },

  // Filter
  filterWrap: {
    backgroundColor: Colors.white,
    paddingBottom: 12,
  },
  filterChipsContent: {
    paddingHorizontal: 18,
    gap: 6,
  },
  fchip: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  fchipText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Empty state
  emptyWrap: {
    paddingVertical: 60,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 46, marginBottom: 12 },
  emptyText: {
    fontSize: 14,
    color: Colors.tx2,
    lineHeight: 21,
    textAlign: 'center',
    fontFamily: FontFamily.sansRegular,
  },

  // List card
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
    gap: 11,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 20 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
    flex: 1,
    fontFamily: FontFamily.sansBold,
  },
  applied: {
    fontSize: 10.5,
    color: Colors.tx3,
    flexShrink: 0,
    fontFamily: FontFamily.sansRegular,
  },
  historyLine: {
    fontSize: 11.5,
    color: Colors.tx2,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  courseLine: {
    fontSize: 11.5,
    color: Colors.bl,
    fontWeight: '600',
    marginTop: 3,
    fontFamily: FontFamily.sansSemiBold,
  },

  // Chips row
  chipsRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
    marginBottom: 9,
  },
  areaChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: Colors.svl,
  },
  areaChipText: {
    fontSize: 10,
    color: '#9B6B14',
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  durationChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: Colors.cr2,
  },
  durationChipText: {
    fontSize: 10,
    color: Colors.tx2,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Action buttons (list)
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 6,
    paddingVertical: 9,
    borderRadius: 10,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  rejectBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: REJECT_BORDER,
  },

  // ─── Detail view ─────────────────────────────────────────────
  detailIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  detailAvatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailAvatarText: { fontSize: 22 },
  detailName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.tx,
    fontFamily: FontFamily.sansExtraBold,
  },
  detailMeta: {
    fontSize: 12,
    color: Colors.tx2,
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

  // Section card (margin 0 18)
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
  courseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  appliedRow: {
    fontSize: 12,
    color: Colors.tx3,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },
  areaChipsRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  areaChipBig: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: Colors.svl,
  },
  areaChipBigText: {
    fontSize: 10.5,
    color: '#9B6B14',
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  durationLine: {
    fontSize: 12,
    color: Colors.tx2,
    marginTop: 8,
    fontFamily: FontFamily.sansRegular,
  },
  durationValue: {
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  noteText: {
    fontSize: 12,
    color: Colors.tx2,
    fontStyle: 'italic',
    fontFamily: FontFamily.sansRegular,
  },

  // History stat tiles
  statTilesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 9,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.cr,
    borderRadius: 11,
    paddingHorizontal: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statTileNumber: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.bl,
    fontFamily: FontFamily.sansExtraBold,
  },
  statTileLabel: {
    fontSize: 9.5,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  historyFootnote: {
    fontSize: 11.5,
    color: Colors.tx3,
    fontFamily: FontFamily.sansRegular,
  },

  // Decision
  reasonInput: {
    width: '100%',
    minHeight: 60,
    backgroundColor: Colors.cr,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: Colors.tx,
    marginBottom: 12,
    fontFamily: FontFamily.sansRegular,
  },
  detailDecisionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailRejectBtn: {
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: REJECT_BORDER,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRejectBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: REJECT_TEXT,
    fontFamily: FontFamily.sansBold,
  },
  detailApproveBtn: {
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailApproveBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },
});
