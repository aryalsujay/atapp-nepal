/**
 * Server Opportunities — implements `specs/14-server-opportunities.md`.
 *
 * Prototype-faithful port of `app.html:2618–2677` (`ServerCourses`).
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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Path } from 'react-native-svg';

import { routeTo } from '@/routes';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { SERVICE_AREAS, type ServiceAreaId } from '@/data/serviceAreas';
import { serverCourses } from '@/data';

const SV_ACCENT = '#9B6B14';
const APPLY_GRAD: [string, string] = ['#9B6B14', '#6B4610'];

type Filter = 'All' | ServiceAreaId;

export default function ServerOpportunitiesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selArea, setSelArea] = useState<Filter>('All');

  const filtered =
    selArea === 'All' ? serverCourses : serverCourses.filter((c) => c.areas.includes(selArea));

  const openSlots = serverCourses.reduce((sum, c) => sum + (c.total - c.filled), 0);

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header (white) ─────────────────────────────────────────── */}
        <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
          <Text style={s.title}>{t('server.opportunities.title')}</Text>
          <Text style={s.subtitle}>
            {t('server.opportunities.subtitle')} · {openSlots}{' '}
            {t('server.opportunities.open_slots_short')}
          </Text>
        </View>

        {/* ─── Search + filter row (white wrapper) ────────────────────── */}
        <View style={s.filterWrap}>
          <View style={s.sbar}>
            <SearchIcon />
            <Text style={s.sbarText}>{t('server.opportunities.search_placeholder')}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.frowContent}
          >
            <FilterChip
              label={t('server.opportunities.filter_all')}
              active={selArea === 'All'}
              onPress={() => setSelArea('All')}
            />
            {SERVICE_AREAS.map((a) => (
              <FilterChip
                key={a.id}
                label={`${a.emoji} ${a.label}`}
                active={selArea === a.id}
                onPress={() => setSelArea(a.id as ServiceAreaId)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ─── Cream gap ──────────────────────────────────────────────── */}
        <View style={{ height: 8, backgroundColor: Colors.cr }} />

        {/* ─── Course cards ───────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <Text style={s.noResults}>{t('server.opportunities.no_results')}</Text>
        ) : (
          filtered.map((c) => {
            const open = c.total - c.filled;
            const pct = c.total > 0 ? Math.round((c.filled / c.total) * 100) : 0;
            const fillColor = pct > 80 ? Colors.ur : pct > 50 ? SV_ACCENT : Colors.fo;
            const slotsLeftColor = open <= 3 ? Colors.ur : SV_ACCENT;

            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.85}
                onPress={() => router.push(routeTo.serverOpportunityDetail(c.id))}
                style={s.card}
              >
                <View style={s.oppTopRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={s.oppTitle}>{c.center}</Text>
                    <Text style={s.oppCity}>{c.city}</Text>
                    <Text style={s.oppMeta}>
                      📅 {c.dates} · {c.type} · {c.days} days
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                    <Text style={[s.openCount, { color: slotsLeftColor }]}>{open} open</Text>
                    <Text style={s.slotsBreakdown}>
                      {c.mServers}M + {c.fServers}F
                    </Text>
                  </View>
                </View>

                <View style={s.progressRow}>
                  <View style={s.progressTrack}>
                    <View
                      style={[
                        s.progressFill,
                        {
                          width: `${pct}%` as DimensionValue,
                          backgroundColor: fillColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={s.progressLabel}>
                    {c.filled}/{c.total} filled
                  </Text>
                </View>

                <View style={s.chipsRow}>
                  {c.areas.map((aid) => {
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

                <View style={s.ctaRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push(routeTo.serverOpportunityDetail(c.id))}
                    style={[s.btnSm, { backgroundColor: Colors.cr2 }]}
                  >
                    <Text style={[s.btnSmText, { color: Colors.tx2 }]}>
                      {t('server.opportunities.view_details')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push(routeTo.serverApply(c.id))}
                  >
                    <LinearGradient
                      colors={APPLY_GRAD}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={s.btnSm}
                    >
                      <Text style={[s.btnSmText, { color: Colors.white }]}>
                        {t('server.opportunities.apply_serve')}
                      </Text>
                    </LinearGradient>
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

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={Colors.tx3} strokeWidth={1.8} />
      <Path d="M16.5 16.5L21 21" stroke={Colors.tx3} strokeWidth={1.8} strokeLinecap="round" />
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
          ? { backgroundColor: SV_ACCENT, borderColor: SV_ACCENT }
          : { backgroundColor: Colors.white, borderColor: Colors.bd2 },
      ]}
    >
      <Text style={[s.fchipText, { color: active ? Colors.white : Colors.tx2 }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },

  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.tx,
    fontFamily: FontFamily.sansExtraBold,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.tx2,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },

  filterWrap: {
    backgroundColor: Colors.white,
    paddingBottom: 10,
  },

  sbar: {
    marginHorizontal: 18,
    marginBottom: 13,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sbarText: {
    fontSize: 13.5,
    color: Colors.tx3,
    fontFamily: FontFamily.sansRegular,
  },

  frowContent: {
    paddingHorizontal: 18,
    paddingBottom: 4,
    gap: 7,
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

  noResults: {
    fontSize: 13,
    color: Colors.tx3,
    textAlign: 'center',
    paddingVertical: 40,
    fontFamily: FontFamily.sansRegular,
  },

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

  oppTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  oppTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  oppCity: {
    fontSize: 12.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  oppMeta: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  openCount: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
  },
  slotsBreakdown: {
    fontSize: 10,
    color: Colors.tx3,
    fontFamily: FontFamily.sansRegular,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: Colors.cr3,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.tx3,
    flexShrink: 0,
    fontFamily: FontFamily.sansRegular,
  },

  chipsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    marginBottom: 8,
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

  ctaRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
  },
  btnSm: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
});
