/**
 * Draft assignment card for the admin auto-schedule list. Has two variants:
 * - assigned: shows teacher avatar + match badge + Change button
 * - unassigned: shows "⚠ Unassigned" banner + Assign Manually CTA
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import type { ScheduleDraftRow } from '@/data';

import { ConfidencePill, confidenceBorderColor } from './ConfidencePill';

function mbadgeStyle(score: number) {
  if (score >= 90) return { bg: Colors.fol, color: Colors.fo };
  if (score >= 70) return { bg: Colors.bll, color: Colors.bl };
  return { bg: Colors.cr2, color: Colors.tx3 };
}

interface Props {
  row: ScheduleDraftRow;
  onOverride: (row: ScheduleDraftRow) => void;
}

export const DraftCard: React.FC<Props> = ({ row, onOverride }) => {
  const badge = mbadgeStyle(row.score);
  return (
    <View
      style={[
        styles.card,
        { borderLeftWidth: 4, borderLeftColor: confidenceBorderColor(row.conf) },
      ]}
    >
      {/* Top row: course meta + confidence pill */}
      <View style={styles.topRow}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.type}>{row.type}</Text>
          <Text style={styles.center}>{row.center}</Text>
          <Text style={styles.dates}>📅 {row.dates}</Text>
        </View>
        <ConfidencePill conf={row.conf} />
      </View>

      {row.teacher ? (
        /* Assigned variant */
        <View style={styles.assignedRow}>
          <View style={styles.miniAvatar}>
            <Text style={styles.miniAvatarText}>{row.teacher[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.assignedName}>{row.teacher}</Text>
            {row.conf === 'review' && <Text style={styles.assignedNote}>⚠ {row.note}</Text>}
          </View>
          <View style={[styles.miniMbadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.miniMbadgeText, { color: badge.color }]}>{row.score}% match</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onOverride(row)}
            style={styles.changeBtn}
          >
            <Text style={styles.changeBtnText}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Unassigned variant */
        <View style={styles.unassignedBanner}>
          <Text style={styles.unassignedText}>⚠ Unassigned — {row.note}</Text>
          <TouchableOpacity activeOpacity={0.85} onPress={() => onOverride(row)}>
            <LinearGradient
              colors={Gradients.primaryCta}
              start={GradientDirection.button.start}
              end={GradientDirection.button.end}
              style={styles.assignManuallyBtn}
            >
              <Text style={styles.assignManuallyBtnText}>Assign Manually</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 7,
  },
  type: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },
  center: {
    fontSize: 12.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  dates: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },

  // Assigned variant
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.cr,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.sfm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  miniAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.sfd,
    fontFamily: FontFamily.sansBold,
  },
  assignedName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.tx,
    fontFamily: FontFamily.sansSemiBold,
  },
  assignedNote: {
    fontSize: 10.5,
    color: Colors.sf,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  miniMbadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
    flexShrink: 0,
  },
  miniMbadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  changeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.bd2,
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
  },

  // Unassigned variant
  unassignedBanner: {
    backgroundColor: Colors.url,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  unassignedText: {
    fontSize: 12,
    color: Colors.ur,
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: FontFamily.sansSemiBold,
  },
  assignManuallyBtn: {
    width: '100%',
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignManuallyBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.sansBold,
  },
});
