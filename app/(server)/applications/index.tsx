/**
 * Server Applications (My Service) — implements `specs/17-server-applications.md`.
 *
 * Prototype-faithful port of `app.html:2823–2862` (`ServerApps`).
 */

import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes, routeTo } from '@/routes';
import { Colors, StatusColors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import { serverApplications, type ServerApplication } from '@/data';

const SV_ACCENT = '#9B6B14';

function statusBorderColor(status: ServerApplication['status']) {
  switch (status) {
    case 'approved':
      return Colors.fo;
    case 'pending':
      return SV_ACCENT;
    case 'rejected':
      return Colors.bd2;
    default:
      return Colors.bd2;
  }
}

function statusPillStyle(status: ServerApplication['status']) {
  switch (status) {
    case 'approved':
      return { bg: StatusColors.approved.bg, color: StatusColors.approved.text };
    case 'pending':
      return { bg: StatusColors.pending.bg, color: StatusColors.pending.text };
    case 'rejected':
      return { bg: StatusColors.rejected.bg, color: StatusColors.rejected.text };
    default:
      return { bg: Colors.cr2, color: Colors.tx2 };
  }
}

export default function ServerApplicationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const total = serverApplications.length;
  const confirmed = serverApplications.filter((a) => a.status === 'approved').length;

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header (white) ──────────────────────────────────────────── */}
        <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
          <Text style={s.title}>{t('server.applications.title')}</Text>
          <Text style={s.subtitle}>
            {total} {t('server.applications.applications_lbl')} · {confirmed}{' '}
            {t('server.applications.confirmed_lbl')}
          </Text>
        </View>

        {/* ─── Cream gap ───────────────────────────────────────────────── */}
        <View style={{ height: 8, backgroundColor: Colors.cr }} />

        {/* ─── Cards / empty state ─────────────────────────────────────── */}
        {serverApplications.length === 0 ? (
          <Text style={s.emptyState}>{t('server.applications.empty_state')}</Text>
        ) : (
          serverApplications.map((a) => {
            const pill = statusPillStyle(a.status);
            const durationLabel = a.partial
              ? `${t('server.applications.partial_lbl')}: ${a.days ?? ''}`
              : t('server.applications.full_course');
            const isRejected = a.status === 'rejected';
            const hasReason = isRejected && Boolean(a.reason);

            return (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.85}
                onPress={() => router.push(routeTo.serverApplicationDetail(a.id))}
                style={[
                  s.card,
                  {
                    borderLeftWidth: 4,
                    borderLeftColor: statusBorderColor(a.status),
                  },
                ]}
              >
                <View style={s.topRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={s.center}>{a.center}</Text>
                    <Text style={s.typeDates}>
                      {a.type} · {a.dates}
                    </Text>
                    <Text style={s.appliedLine}>
                      {t('server.applications.applied_lbl')} {a.applied} · {durationLabel}
                    </Text>
                  </View>
                  <View style={[s.spill, { backgroundColor: pill.bg }]}>
                    <Text style={[s.spillText, { color: pill.color }]}>
                      {t(`server.applications.status.${a.status}`)}
                    </Text>
                  </View>
                </View>

                <View style={[s.chipsRow, { marginBottom: hasReason ? 8 : 0 }]}>
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

                {hasReason && (
                  <View style={s.reasonBox}>
                    <Text style={s.reasonHeader}>{t('server.applications.reason_lbl')}</Text>
                    <Text style={s.reasonBody}>{a.reason}</Text>
                  </View>
                )}

                <Text style={s.viewDetails}>{t('server.applications.view_details')}</Text>
              </TouchableOpacity>
            );
          })
        )}

        {/* ─── Browse More CTA ─────────────────────────────────────────── */}
        <View style={s.browseWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(Routes.serverOpportunities)}
            style={s.browseBtn}
          >
            <Text style={s.browseText}>{t('server.applications.browse_more')}</Text>
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

  // Empty state
  emptyState: {
    fontSize: 13,
    color: Colors.tx3,
    textAlign: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  center: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  typeDates: {
    fontSize: 12.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  appliedLine: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },

  // Status pill (.spill base — fontSize 11.5)
  spill: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    flexShrink: 0,
  },
  spillText: {
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Area chips
  chipsRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  areaChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: Colors.svl,
  },
  areaChipText: {
    fontSize: 10,
    color: SV_ACCENT,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Reason box
  reasonBox: {
    backgroundColor: Colors.url,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  reasonHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.ur,
    marginBottom: 2,
    fontFamily: FontFamily.sansBold,
  },
  reasonBody: {
    fontSize: 12,
    color: Colors.ur,
    fontFamily: FontFamily.sansRegular,
  },

  // View Details link (visual only)
  viewDetails: {
    textAlign: 'right',
    fontSize: 11,
    color: SV_ACCENT,
    fontWeight: '600',
    marginTop: 6,
    fontFamily: FontFamily.sansSemiBold,
  },

  // Browse More CTA
  browseWrap: {
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  browseBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 13,
    backgroundColor: Colors.svl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseText: {
    fontSize: 14,
    fontWeight: '700',
    color: SV_ACCENT,
    fontFamily: FontFamily.sansBold,
  },
});
