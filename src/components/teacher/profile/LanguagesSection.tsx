/**
 * Languages the teacher can conduct courses in.
 *
 * Owns the static display metadata (flag emoji, native script name,
 * descriptive note) for each language since none of that information
 * lives on the profile model — it is purely presentational copy.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import type { LanguageLevel } from '@/types/common';

const LANGUAGE_META: Record<string, { flag: string; native?: string }> = {
  Nepali: { flag: '🇳🇵', native: 'नेपाली' },
  English: { flag: '🌐' },
  Hindi: { flag: '🇮🇳' },
  Gujarati: { flag: '🇮🇳' },
  Marathi: { flag: '🇮🇳' },
  Tamil: { flag: '🇮🇳' },
  German: { flag: '🇩🇪' },
  French: { flag: '🇫🇷' },
  Spanish: { flag: '🇪🇸' },
};

const LANGUAGE_NOTES: Record<string, string> = {
  Nepali: 'Dhamma Shringa, Nepal',
  English: 'International courses',
  Hindi: 'Terai & Madhesh',
  Gujarati: 'Secondary',
  Marathi: 'Secondary',
  Tamil: 'Secondary',
  German: 'European courses',
  French: 'European courses',
  Spanish: 'European courses',
};

interface Props {
  activeLanguages: [string, LanguageLevel][];
}

export function LanguagesSection({ activeLanguages }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <Text style={s.sph}>🗣 {t('profile.languages')}</Text>
      <View style={s.card}>
        <Text style={s.cardLabel}>{t('profile.can_conduct')}</Text>
        {activeLanguages.map(([lang, level]) => {
          const meta = LANGUAGE_META[lang] ?? { flag: '🌐' };
          const note = LANGUAGE_NOTES[lang] ?? '';
          const isPrimary = level === 'primary';
          const display = meta.native ? `${lang} (${meta.native})` : lang;
          return (
            <View key={lang} style={s.langRow}>
              <View style={[s.langTile, { backgroundColor: isPrimary ? Colors.fol : Colors.cr2 }]}>
                <Text style={s.langTileText}>{meta.flag}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.langName}>{display}</Text>
                <Text style={s.langNote}>{note}</Text>
              </View>
              <View
                style={[
                  s.levelChip,
                  isPrimary ? { backgroundColor: Colors.fol } : { backgroundColor: Colors.cr2 },
                ]}
              >
                <Text style={[s.levelChipText, { color: isPrimary ? Colors.fo : Colors.tx2 }]}>
                  {isPrimary ? `★ ${t('profile.primary')}` : t('profile.secondary')}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  sph: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
    marginTop: 18,
    marginHorizontal: 18,
    marginBottom: 9,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    ...Shadows.card,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx3,
    textTransform: 'uppercase',
    letterSpacing: 0.55,
    marginBottom: 8,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  langTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  langTileText: { fontSize: 18 },
  langName: {
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  langNote: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 1,
  },
  levelChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  levelChipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
});
