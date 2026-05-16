/**
 * Override modal for the admin auto-schedule.
 *
 * Two dropdown-style selectors (Teacher / Reason) that expand inline,
 * mutually exclusive. Confirm requires a selected teacher.
 */
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { availableTeachers, type AvailableTeacher, type ScheduleDraftRow } from '@/data';

const REASONS = [
  'Better language/location match',
  'Rest gap concern',
  'Teacher request',
  'Experience at center',
  'Other',
];

type ExpandedField = 'teacher' | 'reason' | null;

interface Props {
  row: ScheduleDraftRow | null;
  onClose: () => void;
  onConfirm: (params: { row: ScheduleDraftRow; teacher: string; reason: string }) => void;
}

export const OverrideModal: React.FC<Props> = ({ row, onClose, onConfirm }) => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [reason, setReason] = useState('');
  const [expandedField, setExpandedField] = useState<ExpandedField>(null);

  // Reset state whenever a new row opens
  React.useEffect(() => {
    setSelectedTeacher(row?.teacher ?? '');
    setReason('');
    setExpandedField(null);
  }, [row]);

  const teacherLabel = selectedTeacher === '' ? 'Choose a teacher…' : selectedTeacher;
  const reasonLabel = reason === '' ? 'Select reason…' : reason;

  const handleConfirm = () => {
    if (!selectedTeacher || !row) return;
    onConfirm({ row, teacher: selectedTeacher, reason });
  };

  return (
    <Modal transparent visible={row !== null} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={StyleSheet.absoluteFillObject}
        />
        {row && (
          <View style={styles.card}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 4 }}
            >
              <Text style={styles.title}>{row.teacher ? 'Change Teacher' : 'Assign Teacher'}</Text>

              <View style={styles.summary}>
                <Text style={styles.summaryType}>{row.type}</Text>
                <Text style={styles.summaryCenter}>{row.center}</Text>
                <Text style={styles.summaryDates}>📅 {row.dates}</Text>
                {row.teacher && (
                  <Text style={styles.current}>
                    Current:{' '}
                    <Text style={{ fontWeight: '700', color: Colors.tx }}>{row.teacher}</Text> (
                    {row.score}%)
                  </Text>
                )}
              </View>

              <Text style={styles.fieldLabel}>Select Teacher:</Text>
              <DropdownSelect
                isOpen={expandedField === 'teacher'}
                label={teacherLabel}
                placeholderActive={selectedTeacher !== ''}
                onToggle={() => setExpandedField(expandedField === 'teacher' ? null : 'teacher')}
              />
              {expandedField === 'teacher' && (
                <View style={styles.dropdown}>
                  {availableTeachers.map((teach: AvailableTeacher) => {
                    const on = selectedTeacher === teach.name;
                    return (
                      <TouchableOpacity
                        key={teach.name}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedTeacher(teach.name);
                          setExpandedField(null);
                        }}
                        style={[styles.dropdownOption, on && { backgroundColor: Colors.sfl }]}
                      >
                        <Text
                          style={[
                            styles.dropdownTitle,
                            on && { color: Colors.sf, fontWeight: '700' },
                          ]}
                        >
                          {teach.name}
                        </Text>
                        <Text style={styles.dropdownSub}>
                          {teach.match}% · {teach.langs}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Reason (optional):</Text>
              <DropdownSelect
                isOpen={expandedField === 'reason'}
                label={reasonLabel}
                placeholderActive={reason !== ''}
                onToggle={() => setExpandedField(expandedField === 'reason' ? null : 'reason')}
              />
              {expandedField === 'reason' && (
                <View style={styles.dropdown}>
                  {REASONS.map((r) => {
                    const on = reason === r;
                    return (
                      <TouchableOpacity
                        key={r}
                        activeOpacity={0.7}
                        onPress={() => {
                          setReason(on ? '' : r);
                          setExpandedField(null);
                        }}
                        style={[styles.dropdownOption, on && { backgroundColor: Colors.sfl }]}
                      >
                        <Text
                          style={[
                            styles.dropdownTitle,
                            on && { color: Colors.sf, fontWeight: '700' },
                          ]}
                        >
                          {r}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <View style={styles.btnRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onClose}
                  style={[styles.btn, styles.btnOu]}
                >
                  <Text style={[styles.btnText, { color: Colors.tx }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleConfirm}
                  disabled={!selectedTeacher}
                  style={{ flex: 1, opacity: selectedTeacher ? 1 : 0.5 }}
                >
                  <LinearGradient
                    colors={Gradients.primaryCta}
                    start={GradientDirection.button.start}
                    end={GradientDirection.button.end}
                    style={styles.btn}
                  >
                    <Text style={[styles.btnText, { color: Colors.white }]}>Confirm</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
};

interface DropdownSelectProps {
  isOpen: boolean;
  label: string;
  placeholderActive: boolean;
  onToggle: () => void;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  isOpen,
  label,
  placeholderActive,
  onToggle,
}) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onToggle} style={styles.selectBtn}>
    <Text
      numberOfLines={1}
      style={[styles.selectBtnText, { color: placeholderActive ? Colors.tx : Colors.tx3 }]}
    >
      {label}
    </Text>
    <Text style={[styles.selectChevron, isOpen && { transform: [{ rotate: '180deg' }] }]}>▾</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '90%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.tx,
    marginBottom: 12,
    fontFamily: FontFamily.sansBold,
  },
  summary: {
    backgroundColor: Colors.cr,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  summaryType: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.tx,
    fontFamily: FontFamily.sansSemiBold,
  },
  summaryCenter: {
    fontSize: 12,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  summaryDates: {
    fontSize: 11,
    color: Colors.tx3,
    fontFamily: FontFamily.sansRegular,
  },
  current: {
    fontSize: 11,
    color: Colors.tx3,
    marginTop: 4,
    fontFamily: FontFamily.sansRegular,
  },
  fieldLabel: {
    fontSize: 11,
    color: Colors.tx2,
    marginBottom: 5,
    fontFamily: FontFamily.sansRegular,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectBtnText: {
    fontSize: 12,
    flex: 1,
    paddingRight: 8,
    fontFamily: FontFamily.sansRegular,
  },
  selectChevron: {
    fontSize: 14,
    color: Colors.tx3,
    fontFamily: FontFamily.sansBold,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  dropdownTitle: {
    fontSize: 12,
    color: Colors.tx,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
  },
  dropdownSub: {
    fontSize: 10.5,
    color: Colors.tx3,
    marginTop: 1,
    fontFamily: FontFamily.sansRegular,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOu: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.bd2,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
});
