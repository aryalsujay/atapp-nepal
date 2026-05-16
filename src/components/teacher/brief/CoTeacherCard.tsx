/**
 * CoTeacherCard — co-teacher info card. Shows a gendered avatar (dhamma
 * wheel for male, 🙏🏻 emoji for female), name, gender/center line,
 * confirmed chip, and a tap-to-call phone row. Falls back to an italic
 * "no co-teacher" message when the Course has no coTeacher record.
 */
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/theme/colors';
import { Shadows } from '@/theme/shadows';
import type { Course } from '@/types';

const DHAMMA_WHEEL = require('../../../../assets/logo-dhamma.gif');

interface Props {
  coTeacher: Course['coTeacher'];
  onCall: (phone: string) => void;
  labels: {
    confirmed: string;
    call: string;
    femaleAt: string;
    maleAt: string;
    noCoTeacher: string;
  };
}

export const CoTeacherCard: React.FC<Props> = ({ coTeacher, onCall, labels }) => {
  return (
    <View style={styles.card}>
      {coTeacher ? (
        <CoTeacherRow
          co={coTeacher}
          onCall={() => coTeacher.phone && onCall(coTeacher.phone)}
          labels={labels}
        />
      ) : (
        <Text style={styles.emptyText}>{labels.noCoTeacher}</Text>
      )}
    </View>
  );
};

function CoTeacherRow({
  co,
  onCall,
  labels,
}: {
  co: NonNullable<Course['coTeacher']>;
  onCall: () => void;
  labels: Props['labels'];
}) {
  const isFemale = co.gender === 'F';
  const genderLabel = isFemale ? labels.femaleAt : labels.maleAt;
  return (
    <View>
      <View style={styles.coTeacherRow}>
        <View
          style={[
            styles.coTeacherAvatar,
            isFemale ? styles.coTeacherAvatarFemale : styles.coTeacherAvatarMale,
          ]}
        >
          {isFemale ? (
            <Text style={{ fontSize: 22 }}>🙏🏻</Text>
          ) : (
            <Image source={DHAMMA_WHEEL} style={styles.coTeacherDhammaWheel} resizeMode="contain" />
          )}
        </View>
        <View style={styles.coTeacherMid}>
          <Text style={styles.coTeacherName}>{co.name}</Text>
          <Text style={styles.coTeacherSub}>
            {genderLabel}
            {co.languages && co.languages.length > 0 ? ` · ${co.languages.join(', ')}` : ''}
          </Text>
        </View>
        <View style={styles.coTeacherConfirmedChip}>
          <Text style={styles.coTeacherConfirmedChipText}>{labels.confirmed}</Text>
        </View>
      </View>
      {co.phone ? (
        <TouchableOpacity onPress={onCall} activeOpacity={0.7} style={styles.phoneRow}>
          <Text style={styles.phoneText}>📞 {co.phone}</Text>
          <Text style={[styles.callLink, { color: Colors.fo }]}>{labels.call}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginBottom: 11,
    ...Shadows.card,
  },
  emptyText: {
    fontSize: 12.5,
    color: Colors.tx2,
    fontStyle: 'italic',
  },
  coTeacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coTeacherAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1.5,
  },
  coTeacherAvatarFemale: {
    backgroundColor: '#FBE8F0',
    borderColor: '#F0C8D8',
  },
  coTeacherAvatarMale: {
    backgroundColor: Colors.fol,
    borderColor: Colors.fom,
  },
  coTeacherDhammaWheel: {
    width: 30,
    height: 30,
  },
  coTeacherMid: { flex: 1 },
  coTeacherName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.tx,
  },
  coTeacherSub: {
    fontSize: 11.5,
    color: Colors.tx2,
    marginTop: 1,
  },
  coTeacherConfirmedChip: {
    backgroundColor: Colors.fol,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  coTeacherConfirmedChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.fo,
  },
  phoneRow: {
    marginTop: 11,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.cr,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneText: {
    fontSize: 12.5,
    color: Colors.tx2,
  },
  callLink: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});
