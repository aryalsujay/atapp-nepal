/**
 * Saffron-tinted card showing the teacher's free-text personal note.
 *
 * The "last updated" line is hard-coded to match the prototype; once the
 * profile model tracks the actual mutation timestamp, the parent screen
 * can pass it in as a prop.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

interface Props {
  note: string;
  updatedLabel?: string;
}

export function PersonalNoteCard({ note, updatedLabel = 'Apr 2026' }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <Text style={s.sph}>💬 {t('profile.personal_note')}</Text>
      <View style={[s.card, s.noteCard]}>
        <Text style={s.noteBody}>&ldquo;{note}&rdquo;</Text>
        <Text style={s.noteUpdated}>{t('profile.last_updated', { date: updatedLabel })}</Text>
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
  noteCard: {
    backgroundColor: Colors.sfl,
    borderWidth: 1,
    borderColor: Colors.sfm,
  },
  noteBody: {
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx,
    lineHeight: 21,
  },
  noteUpdated: {
    fontSize: 11,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx3,
    marginTop: 8,
  },
});
