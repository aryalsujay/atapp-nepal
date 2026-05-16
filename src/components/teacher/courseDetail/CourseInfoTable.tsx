/**
 * Course info table — 5-row card showing dates, languages, gender, location,
 * type. Prototype-faithful port of `app.html:1102–1116`.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

export interface InfoRowData {
  label: string;
  value: string;
}

interface Props {
  rows: InfoRowData[];
}

export const CourseInfoTable: React.FC<Props> = ({ rows }) => {
  return (
    <View style={[s.card, s.infoCard]}>
      {rows.map((r, i) => (
        <InfoRow key={r.label} label={r.label} value={r.value} isLast={i === rows.length - 1} />
      ))}
    </View>
  );
};

function InfoRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[s.infoRow, isLast && s.infoRowLast]}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    ...Shadows.card,
  },
  infoCard: {
    marginTop: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    gap: 12,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.tx2,
    fontWeight: '500',
    fontFamily: FontFamily.sansMedium,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx,
    textAlign: 'right',
    flex: 1,
    maxWidth: '60%',
  },
});
