/**
 * WhatToBringCard — vertical list of checklist items (icon + text).
 * Rows are separated by `<DashedDivider />` because RN's
 * `borderStyle: 'dashed'` renders as a solid line on web + iOS.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { Shadows } from '@/theme/shadows';
import { DashedDivider } from '@/components/ui/DashedDivider';

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
      <React.Fragment key={idx}>
        <View style={styles.checklistRow}>
          <Text style={styles.checklistIcon}>{item.icon}</Text>
          <Text style={styles.checklistText}>{item.text}</Text>
        </View>
        {idx < items.length - 1 && <DashedDivider marginVertical={0} />}
      </React.Fragment>
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
