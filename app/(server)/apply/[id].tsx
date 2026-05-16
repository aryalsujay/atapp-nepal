/**
 * Server Apply — implements `specs/16-server-apply.md`.
 *
 * Prototype-faithful port of `app.html:2679–2821` (`ServerApply`).
 * 3-step form (areas, duration, optional note) with disabled-until-
 * area-selected submit and a success-screen swap on submit.
 */

import React, { useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { Routes } from '@/routes';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { LotusHero } from '@/components/ui/HeroDecorations';
import { SERVICE_AREAS } from '@/data/serviceAreas';
import { serverCourses } from '@/data';

const HERO_GRAD: [string, string] = ['#5A3800', '#9B6B14'];
const SUBMIT_GRAD: [string, string] = ['#9B6B14', '#6B4610'];
const SV_ACCENT = '#9B6B14';
const SV_LIGHT = '#FBF0E0';

type PMode = 'duration' | 'exact';
type Period = 'start' | 'middle' | 'end' | 'flexible';

export default function ServerApplyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const numericId = Number(id);
  const c = serverCourses.find((x) => x.id === numericId) ?? serverCourses[0];
  const open = c.total - c.filled;

  const [selAreas, setSelAreas] = useState<string[]>([]);
  const [partial, setPartial] = useState(false);
  const [pMode, setPMode] = useState<PMode>('duration');
  const [duration, setDuration] = useState(5);
  const [startDay, setStartDay] = useState(1);
  const [endDay, setEndDay] = useState(c.days);
  const [period, setPeriod] = useState<Period>('flexible');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  const toggle = (aid: string) =>
    setSelAreas((prev) => (prev.includes(aid) ? prev.filter((x) => x !== aid) : [...prev, aid]));

  const canSubmit = selAreas.length > 0;

  // ─── Success state ─────────────────────────────────────────────────
  if (done) {
    return (
      <View style={[s.flex, s.successWrap, { backgroundColor: Colors.cr }]}>
        <Text style={s.successEmoji}>🙏</Text>
        <Text style={s.successTitle}>{t('server.apply.dhanyabad')}</Text>
        <Text style={s.successBody1}>{t('server.apply.app_submitted', { center: c.center })}</Text>
        <Text style={s.successBody2}>{t('server.apply.review_msg')}</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.replace(Routes.serverApplications)}
          style={{ width: '100%' }}
        >
          <LinearGradient
            colors={SUBMIT_GRAD}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.successPrimary}
          >
            <Text style={s.successPrimaryText}>{t('server.apply.view_apps')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 10 }} />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.replace(Routes.serverHome)}
          style={s.successOutline}
        >
          <Text style={s.successOutlineText}>{t('server.apply.back_dash')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────────
  const availableAreas = SERVICE_AREAS.filter((a) => c.areas.includes(a.id));

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Hero ───────────────────────────────────────────────── */}
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
                stroke="rgba(255,255,255,0.75)"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={s.backText}>{t('common.back')}</Text>
          </TouchableOpacity>

          <Text style={s.kicker}>{t('server.apply.kicker')}</Text>
          <Text style={s.title}>{c.center}</Text>
          <Text style={s.sub}>
            {c.city} · {c.dates}
          </Text>

          <View style={s.pillRow}>
            <View style={s.pill}>
              <Text style={s.pillText}>
                {open} {t('server.apply.slots_open')}
              </Text>
            </View>
            <View style={s.pill}>
              <Text style={s.pillText}>
                {c.mServers}M + {c.fServers}F
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ─── Step 1 — Choose service areas ──────────────────────── */}
        <Text style={[s.sph, { marginTop: 16 }]}>{t('server.apply.step1')}</Text>
        <View style={s.areaGrid}>
          {availableAreas.map((a) => {
            const on = selAreas.includes(a.id);
            const desc = (a.desc ?? '').slice(0, 26) + '…';
            return (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.85}
                onPress={() => toggle(a.id)}
                style={[
                  s.areaTile,
                  {
                    backgroundColor: on ? a.color : Colors.white,
                    borderColor: on ? a.color : Colors.bd2,
                  },
                ]}
              >
                <Text style={s.areaTileEmoji}>{a.emoji}</Text>
                <Text style={[s.areaTileLabel, { color: on ? Colors.white : Colors.tx }]}>
                  {a.label}
                </Text>
                <Text
                  style={[s.areaTileDesc, { color: on ? 'rgba(255,255,255,0.75)' : Colors.tx3 }]}
                >
                  {desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {selAreas.length > 0 && (
          <Text style={s.areasSelected}>
            {t('server.apply.areas_selected', { count: selAreas.length })}
          </Text>
        )}

        {/* ─── Step 2 — Duration ──────────────────────────────────── */}
        <Text style={[s.sph, { marginTop: 16 }]}>{t('server.apply.step2')}</Text>
        <View style={s.fullPartialRow}>
          <DurationTile
            active={!partial}
            emoji="🪷"
            label={t('server.apply.full_course')}
            sub={t('server.apply.full_course_sub', { days: c.days })}
            onPress={() => setPartial(false)}
          />
          <DurationTile
            active={partial}
            emoji="📅"
            label={t('server.apply.partial')}
            sub={t('server.apply.choose_days')}
            onPress={() => setPartial(true)}
          />
        </View>

        {partial && (
          <View style={{ paddingHorizontal: 18 }}>
            {/* mode tabs */}
            <View style={s.modeTabRow}>
              <ModeTab
                active={pMode === 'duration'}
                label={t('server.apply.flexible')}
                onPress={() => setPMode('duration')}
              />
              <ModeTab
                active={pMode === 'exact'}
                label={t('server.apply.exact')}
                onPress={() => setPMode('exact')}
              />
            </View>

            {pMode === 'duration' ? (
              <View style={s.partialCard}>
                <Text style={s.cardTitle}>{t('server.apply.how_many')}</Text>
                <View style={s.dayCountRow}>
                  {[3, 4, 5, 6, 7, 8, 9, 10]
                    .filter((d) => d <= c.days)
                    .map((d) => {
                      const on = duration === d;
                      return (
                        <TouchableOpacity
                          key={d}
                          activeOpacity={0.85}
                          onPress={() => setDuration(d)}
                          style={[
                            s.dayCountCell,
                            {
                              backgroundColor: on ? SV_ACCENT : Colors.cr2,
                            },
                          ]}
                        >
                          <Text style={[s.dayCountText, { color: on ? Colors.white : Colors.tx }]}>
                            {d}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
                <Text style={s.periodLabel}>{t('server.apply.pref_period')}</Text>
                <View style={s.periodRow}>
                  {(['start', 'middle', 'end', 'flexible'] as Period[]).map((p) => {
                    const on = period === p;
                    return (
                      <TouchableOpacity
                        key={p}
                        activeOpacity={0.85}
                        onPress={() => setPeriod(p)}
                        style={[
                          s.periodChip,
                          {
                            backgroundColor: on ? SV_ACCENT : Colors.white,
                            borderColor: on ? SV_ACCENT : Colors.bd2,
                          },
                        ]}
                      >
                        <Text style={[s.periodChipText, { color: on ? Colors.white : Colors.tx2 }]}>
                          {t(`server.apply.period.${p}`)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={s.partialCard}>
                <Text style={s.cardTitle}>{t('server.apply.select_days')}</Text>
                <View style={s.dayStripRow}>
                  {Array.from({ length: c.days }, (_, i) => i + 1).map((d) => {
                    const inR = d >= startDay && d <= endDay;
                    return (
                      <TouchableOpacity
                        key={d}
                        activeOpacity={0.85}
                        onPress={() => {
                          if (d <= startDay) setStartDay(d);
                          else setEndDay(d);
                        }}
                        style={[
                          s.dayStripCell,
                          {
                            backgroundColor: inR ? SV_ACCENT : Colors.cr2,
                          },
                        ]}
                      >
                        <Text style={[s.dayStripText, { color: inR ? Colors.white : Colors.tx }]}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={s.rangeSummary}>
                  {t('server.apply.day_label')} {startDay} → {t('server.apply.day_label')} {endDay}{' '}
                  ({endDay - startDay + 1} {t('server.apply.days_suffix')})
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ─── Step 3 — Optional note ─────────────────────────────── */}
        <Text style={[s.sph, { marginTop: 12 }]}>{t('server.apply.step3')}</Text>
        <View style={s.noteWrap}>
          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
            placeholder={t('server.apply.note_ph')}
            placeholderTextColor={Colors.tx3}
            style={s.noteInput}
          />
        </View>

        {/* ─── Submit ─────────────────────────────────────────────── */}
        <View style={s.submitWrap}>
          {canSubmit ? (
            <TouchableOpacity activeOpacity={0.85} onPress={() => setDone(true)}>
              <LinearGradient
                colors={SUBMIT_GRAD}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.submitBtn}
              >
                <Text style={[s.submitText, { color: Colors.white }]}>
                  {t('server.apply.submit')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={[s.submitBtn, { backgroundColor: Colors.cr3 }]}>
              <Text style={[s.submitText, { color: Colors.tx3 }]}>
                {t('server.apply.select_first')}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function DurationTile({
  active,
  emoji,
  label,
  sub,
  onPress,
}: {
  active: boolean;
  emoji: string;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        s.durTile,
        {
          backgroundColor: active ? SV_LIGHT : Colors.white,
          borderColor: active ? SV_ACCENT : Colors.bd2,
        },
      ]}
    >
      <Text style={s.durEmoji}>{emoji}</Text>
      <Text style={[s.durLabel, { color: active ? SV_ACCENT : Colors.tx }]}>{label}</Text>
      <Text style={s.durSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

function ModeTab({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        s.modeTab,
        {
          backgroundColor: active ? SV_LIGHT : Colors.white,
          borderColor: active ? SV_ACCENT : Colors.bd2,
        },
      ]}
    >
      <Text style={[s.modeTabText, { color: active ? SV_ACCENT : Colors.tx }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

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
    color: 'rgba(255,255,255,0.75)',
    fontFamily: FontFamily.sansRegular,
  },
  kicker: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.sansRegular,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    fontFamily: FontFamily.sansExtraBold,
  },
  sub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: FontFamily.sansRegular,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pillText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Section header (.sph)
  sph: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
    marginHorizontal: 18,
    marginBottom: 9,
    fontFamily: FontFamily.sansBold,
  },

  // Step 1 — service areas
  areaGrid: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  areaTile: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 13,
    borderWidth: 2,
    minWidth: 105,
  },
  areaTileEmoji: { fontSize: 18, marginBottom: 3 },
  areaTileLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  areaTileDesc: {
    fontSize: 9.5,
    lineHeight: 12.35,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  areasSelected: {
    paddingHorizontal: 18,
    paddingTop: 8,
    fontSize: 12,
    color: SV_ACCENT,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Step 2 — full/partial big tiles
  fullPartialRow: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  durTile: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
  },
  durEmoji: { fontSize: 22, marginBottom: 4 },
  durLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  durSub: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 2,
    fontFamily: FontFamily.sansRegular,
  },

  // mode tabs
  modeTabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  modeTab: {
    flex: 1,
    padding: 9,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // partial card (shared by both modes)
  partialCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    shadowColor: Colors.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },

  // day-count grid (flexible mode)
  dayCountRow: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
  },
  dayCountCell: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCountText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  periodLabel: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 10,
    marginBottom: 5,
    fontFamily: FontFamily.sansRegular,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  periodChip: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  periodChipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // day strip (exact mode)
  dayStripRow: {
    flexDirection: 'row',
    gap: 3,
    flexWrap: 'wrap',
  },
  dayStripCell: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayStripText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  rangeSummary: {
    fontSize: 11,
    color: SV_ACCENT,
    marginTop: 8,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },

  // Step 3 — note
  noteWrap: {
    paddingHorizontal: 18,
  },
  noteInput: {
    width: '100%',
    minHeight: 65,
    backgroundColor: Colors.cr,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: Colors.tx,
    fontFamily: FontFamily.sansRegular,
  },

  // Submit
  submitWrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  submitBtn: {
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },

  // Success screen
  successWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  successEmoji: { fontSize: 60, marginBottom: 16 },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.fo,
    marginBottom: 8,
    fontFamily: FontFamily.sansExtraBold,
    textAlign: 'center',
  },
  successBody1: {
    fontSize: 14,
    color: Colors.tx2,
    lineHeight: 22.4,
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: FontFamily.sansRegular,
  },
  successBody2: {
    fontSize: 13,
    color: Colors.tx3,
    marginBottom: 28,
    textAlign: 'center',
    fontFamily: FontFamily.sansRegular,
  },
  successPrimary: {
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },
  successOutline: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.bd2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successOutlineText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
});
