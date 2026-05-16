/**
 * WhatToBringCard — vertical list of checklist items (icon + text). Items
 * are sourced from i18n by the parent screen so this component stays
 * presentational. Rows render a dashed underline between siblings.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { Shadows } from '@/theme/shadows';

export interface ChecklistItem {
  icon: string;
  text: string;
}

interface Props {
  items: ChecklistItem[];
}

export const WhatToBringCard: React.FC<Props> = ({ items }) => (
  <View style={styles.card}>
    {items.map((item, idx) => (
      <View
        key={idx}
        style={[styles.checklistRow, idx < items.length - 1 && styles.checklistRowBorder]}
      >
        <Text style={styles.checklistIcon}>{item.icon}</Text>
        <Text style={styles.checklistText}>{item.text}</Text>
      </View>
    ))}
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
  checklistRow: {
    flexDirection: 'row',
    gap: 11,
    paddingVertical: 7,
    alignItems: 'flex-start',
  },
  checklistRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    borderStyle: 'dashed',
  },
  checklistIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
    flexShrink: 0,
  },
  checklistText: {
    fontSize: 12.5,
    color: Colors.tx2,
    lineHeight: 18,
    flex: 1,
  },
});
