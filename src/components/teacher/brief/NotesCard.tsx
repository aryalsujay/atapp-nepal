/**
 * NotesCard — italic quote-style block for free-form notes from the center.
 * Caller is responsible for only rendering this when notes exist; this
 * component just wraps the text in the secondary-tinted inset card.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { Shadows } from '@/theme/shadows';

export const NotesCard: React.FC<{ notes: string }> = ({ notes }) => (
  <View style={[styles.card, styles.notesCard]}>
    <Text style={styles.notesText}>{`"${notes}"`}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    ...Shadows.card,
  },
  notesCard: {
    backgroundColor: Colors.sfl,
    borderWidth: 1,
    borderColor: Colors.sfm,
  },
  notesText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 19,
    color: Colors.tx,
  },
});
