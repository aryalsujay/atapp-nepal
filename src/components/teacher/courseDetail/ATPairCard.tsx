/**
 * AT Pair card — section header (with admin-managed badge) + card showing
 * the confirmed co-teacher (or empty state) and a "looking for" chip group
 * for any remaining open slots. Prototype-faithful port of `app.html:1118–1136`.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { DashedDivider } from '@/components/ui/DashedDivider';
import { langLabel } from '@/utils/eligibility';
import type { Course } from '@/types';

interface Props {
  coTeacher: Course['coTeacher'];
  lookingForSlots: ('M' | 'F')[];
  labels: {
    sectionTitle: string;
    adminManaged: string;
    confirmed: string;
    femaleAt: string;
    maleAt: string;
    lookingFor: string;
    noCoTeacher: string;
  };
}

export const ATPairCard: React.FC<Props> = ({ coTeacher: co, lookingForSlots, labels }) => {
  return (
    <>
      <View style={s.sphRow}>
        <Text style={s.sphTitle}>🧘 {labels.sectionTitle}</Text>
        <View style={s.adminBadge}>
          <Text style={s.adminBadgeText}>🛠 {labels.adminManaged}</Text>
        </View>
      </View>
      <View style={s.card}>
        {co ? (
          <View style={s.coRow}>
            <View
              style={[
                s.coAvatar,
                co.gender === 'F'
                  ? { backgroundColor: '#FBE8F0', borderColor: '#F0C8D8' }
                  : { backgroundColor: Colors.fol, borderColor: Colors.fom },
              ]}
            >
              <Text style={s.coAvatarEmoji}>{co.gender === 'F' ? '🙏🏻' : '🧘'}</Text>
            </View>
            <View style={s.coInfo}>
              <View style={s.coNameRow}>
                <Text style={s.coName}>{co.name}</Text>
                <View style={s.confirmedChip}>
                  <Text style={s.confirmedChipText}>{labels.confirmed}</Text>
                </View>
              </View>
              <Text style={s.coSub}>
                {co.gender === 'F' ? labels.femaleAt : labels.maleAt} ·{' '}
                {co.languages.map(langLabel).join(', ')}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={s.coEmptyText}>{labels.noCoTeacher}</Text>
        )}

        {lookingForSlots.length > 0 ? (
          <>
            <DashedDivider />
            <View style={s.lookingForRow}>
              <Text style={s.lookingForLabel}>{labels.lookingFor}</Text>
              <View style={s.lookingForChipGroup}>
                {lookingForSlots.map((g, i) => (
                  <View key={`${g}-${i}`} style={s.lookingForChip}>
                    <Text style={s.lookingForChipText}>
                      {g === 'F' ? labels.femaleAt : labels.maleAt}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}
      </View>
    </>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    ...Shadows.card,
  },
  sphRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 9,
  },
  sphTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx2,
    textTransform: 'uppercase',
    letterSpacing: 0.84,
  },
  adminBadge: {
    backgroundColor: Colors.cr2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 9.5,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.tx3,
  },
  coRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    flexShrink: 0,
  },
  coAvatarEmoji: {
    fontSize: 22,
  },
  coInfo: {
    flex: 1,
  },
  coNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  coName: {
    fontSize: 14.5,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  confirmedChip: {
    backgroundColor: Colors.fol,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  confirmedChipText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.fo,
  },
  coSub: {
    fontSize: 11.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
    marginTop: 2,
  },
  coEmptyText: {
    fontSize: 12.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
    fontStyle: 'italic',
  },
  lookingForRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lookingForLabel: {
    fontSize: 11,
    color: Colors.tx3,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.55,
  },
  lookingForChipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flexShrink: 1,
  },
  lookingForChip: {
    backgroundColor: Colors.sfl,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  lookingForChipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.sfd,
  },
});
