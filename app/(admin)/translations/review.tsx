/**
 * Admin Translations — Review screen (spec 31 §3.3).
 *
 * Lists pending suggestions with language filter chips. Approve writes
 * the suggested value to translation_overrides + live re-binds i18next,
 * so the change takes effect across every screen immediately.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { useAuthStore } from '@/store/authStore';
import { useTranslationsStore } from '@/store/translationsStore';
import { readLive, type Lang } from '@/utils/i18nExport';
import { getDb } from '@/db';
import type { SuggestionRow } from '@/db/repositories/translations';

type LangFilter = 'all' | Lang;

export default function AdminTranslationsReview() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const adminId = useAuthStore((s) => s.userId);
  const suggestions = useTranslationsStore((s) => s.suggestions);
  const loadSuggestions = useTranslationsStore((s) => s.loadSuggestions);
  const approveSuggestion = useTranslationsStore((s) => s.approveSuggestion);
  const rejectSuggestion = useTranslationsStore((s) => s.rejectSuggestion);

  const [filter, setFilter] = useState<LangFilter>('all');

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  // Live-value lookup map for the side-by-side preview (bundled + overrides).
  const live = useMemo(() => readLive(getDb()), [suggestions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(
    () => (filter === 'all' ? suggestions : suggestions.filter((s) => s.lang === filter)),
    [suggestions, filter],
  );

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={s.back}>‹ {t('admin.translations.back')}</Text>
        </TouchableOpacity>
        <Text style={s.title}>
          {t('admin.translations.review_title')} ({suggestions.length})
        </Text>
      </View>

      <View style={s.filterRow}>
        {(['all', 'en', 'ne', 'hi'] as LangFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
            style={[s.chip, filter === f && s.chipOn]}
          >
            <Text style={[s.chipText, filter === f && s.chipTextOn]}>
              {t(`admin.translations.filter_${f}` as const)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => `${item.key}__${item.lang}`}
        renderItem={({ item }) => (
          <SuggestionCard
            item={item}
            liveValue={live[item.lang][item.key] ?? ''}
            onApprove={() => approveSuggestion(item.key, item.lang, adminId)}
            onReject={() => rejectSuggestion(item.key, item.lang)}
            approveLabel={t('admin.translations.approve')}
            rejectLabel={t('admin.translations.reject')}
            liveLabel={t('admin.translations.live_label')}
            sugLabel={t('admin.translations.suggestion_label')}
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>{t('admin.translations.empty_pending')}</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 32, paddingTop: 8 }}
      />
    </View>
  );
}

function SuggestionCard({
  item,
  liveValue,
  onApprove,
  onReject,
  approveLabel,
  rejectLabel,
  liveLabel,
  sugLabel,
}: {
  item: SuggestionRow;
  liveValue: string;
  onApprove: () => void;
  onReject: () => void;
  approveLabel: string;
  rejectLabel: string;
  liveLabel: string;
  sugLabel: string;
}) {
  const identical = liveValue === item.value;
  return (
    <View style={s.card}>
      <View style={s.cardHeaderRow}>
        <View style={s.langPill}>
          <Text style={s.langPillText}>{item.lang.toUpperCase()}</Text>
        </View>
        <Text style={s.cardKey} numberOfLines={1}>
          {item.key}
        </Text>
      </View>
      {item.note ? <Text style={s.cardNote}>{item.note}</Text> : null}
      <View style={s.diffRow}>
        <View style={s.diffCol}>
          <Text style={s.diffLabel}>{liveLabel}</Text>
          <Text style={s.diffLive}>{liveValue || '—'}</Text>
        </View>
        <Text style={s.diffArrow}>→</Text>
        <View style={s.diffCol}>
          <Text style={s.diffLabel}>{sugLabel}</Text>
          <Text style={s.diffSug}>{item.value}</Text>
        </View>
      </View>
      <View style={s.ctaRow}>
        <TouchableOpacity onPress={onReject} style={s.outlineBtn} activeOpacity={0.85}>
          <Text style={s.outlineBtnText}>{rejectLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onApprove}
          activeOpacity={0.85}
          style={{ flex: 1 }}
          disabled={identical}
        >
          <LinearGradient
            colors={Gradients.primaryCta as unknown as [string, string, ...string[]]}
            start={GradientDirection.button.start}
            end={GradientDirection.button.end}
            style={[s.primaryBtn, identical && { opacity: 0.5 }]}
          >
            <Text style={s.primaryBtnText}>{approveLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  back: {
    fontSize: 13,
    color: Colors.sf,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.tx,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
  },
  chipOn: {
    backgroundColor: Colors.sf,
    borderColor: Colors.sf,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx2,
  },
  chipTextOn: {
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 18,
    marginTop: 11,
    borderRadius: 14,
    padding: 14,
    ...Shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  langPill: {
    backgroundColor: Colors.sfl,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  langPillText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.sfd,
    letterSpacing: 0.5,
  },
  cardKey: {
    flex: 1,
    fontSize: 11,
    color: Colors.tx3,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
  },
  cardNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: Colors.tx2,
    marginBottom: 7,
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
    marginBottom: 11,
  },
  diffCol: {
    flex: 1,
  },
  diffLabel: {
    fontSize: 9.5,
    color: Colors.tx3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  diffLive: {
    fontSize: 12,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  diffSug: {
    fontSize: 12,
    color: Colors.tx,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  diffArrow: {
    fontSize: 16,
    color: Colors.tx3,
    fontWeight: '700',
    marginTop: 14,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 9,
  },
  outlineBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    color: Colors.tx2,
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  emptyCard: {
    margin: 18,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 14,
    ...Shadows.card,
  },
  emptyText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    color: Colors.tx2,
    textAlign: 'center',
  },
});
