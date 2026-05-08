import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHallsStore } from '../../../src/store/hallsStore';
import { Hall } from '../../../src/types';
import { Colors } from '../../../src/theme/colors';
import { FontSize, FontWeight } from '../../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../../src/theme/spacing';
import { Shadows } from '../../../src/theme/shadows';
import { SectionHeader } from '../../../src/components/layout/SectionHeader';
import centresData from '../../../src/data/centers.json';

const GENDER_OPTIONS: Hall['genderRequired'][] = ['Any', 'M', 'F'];
const GENDER_LABELS = { Any: 'Any Gender', M: 'Male Only', F: 'Female Only' };

export default function AdminCentreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { halls, loadHalls, createHall, updateHall, deleteHall } = useHallsStore();

  const [showModal, setShowModal] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [form, setForm] = useState({
    name: '',
    teacherSlots: '1',
    genderRequired: 'Any' as Hall['genderRequired'],
    notes: '',
  });

  useEffect(() => {
    loadHalls();
  }, []);

  const centre = (centresData as any[]).find((c) => c.id === id);
  const centreHalls = halls.filter((h) => h.centreId === id);

  if (!centre) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.cr, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.tx3 }}>Centre not found</Text>
      </View>
    );
  }

  const openCreate = () => {
    setEditingHall(null);
    setForm({ name: '', teacherSlots: '1', genderRequired: 'Any', notes: '' });
    setShowModal(true);
  };

  const openEdit = (hall: Hall) => {
    setEditingHall(hall);
    setForm({
      name: hall.name,
      teacherSlots: String(hall.teacherSlots),
      genderRequired: hall.genderRequired,
      notes: hall.notes ?? '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      Alert.alert('Validation', 'Hall name is required.');
      return;
    }
    const slots = parseInt(form.teacherSlots, 10);
    if (isNaN(slots) || slots < 1 || slots > 10) {
      Alert.alert('Validation', 'Teacher slots must be between 1 and 10.');
      return;
    }

    const data: Omit<Hall, 'id'> = {
      centreId: id,
      name,
      teacherSlots: slots,
      genderRequired: form.genderRequired,
      notes: form.notes.trim() || undefined,
    };

    if (editingHall) {
      await updateHall(editingHall.id, data);
    } else {
      await createHall(data);
    }
    setShowModal(false);
  };

  const handleDelete = (hall: Hall) => {
    Alert.alert(
      'Delete Hall',
      `Delete "${hall.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHall(hall.id),
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cr }}>
      <SectionHeader
        title={centre.name}
        style={styles.header}
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {/* Centre info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>City</Text>
            <Text style={styles.infoValue}>{centre.city}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Region</Text>
            <Text style={styles.infoValue}>{centre.region}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Altitude</Text>
            <Text style={styles.infoValue}>{centre.altitude}m</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Total Teacher Slots</Text>
            <Text style={[styles.infoValue, { color: Colors.sf, fontWeight: FontWeight.bold }]}>
              {centreHalls.reduce((s, h) => s + h.teacherSlots, 0)}
            </Text>
          </View>
        </View>

        {/* Halls */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Halls ({centreHalls.length})</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openCreate} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Add Hall</Text>
          </TouchableOpacity>
        </View>

        {centreHalls.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No halls configured yet.</Text>
            <Text style={styles.emptySubtext}>Add halls to define teacher slots for this centre.</Text>
          </View>
        ) : (
          centreHalls.map((hall) => (
            <View key={hall.id} style={styles.hallCard}>
              <View style={styles.hallHeader}>
                <Text style={styles.hallName}>{hall.name}</Text>
                <View style={styles.hallActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEdit(hall)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(hall)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.hallMeta}>
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>👥 {hall.teacherSlots} teacher{hall.teacherSlots > 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>
                    {hall.genderRequired === 'Any' ? '⚧ Any gender' : hall.genderRequired === 'F' ? '👩 Female only' : '👨 Male only'}
                  </Text>
                </View>
              </View>

              {hall.notes && (
                <Text style={styles.hallNotes}>{hall.notes}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Hall Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{editingHall ? 'Edit Hall' : 'Add Hall'}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hall Name *</Text>
              <TextInput
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                style={styles.input}
                placeholder="e.g. Main Dhamma Hall"
                placeholderTextColor={Colors.tx3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Teacher Slots Required *</Text>
              <TextInput
                value={form.teacherSlots}
                onChangeText={(v) => setForm((f) => ({ ...f, teacherSlots: v }))}
                style={styles.input}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={Colors.tx3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Gender Requirement</Text>
              <View style={styles.genderRow}>
                {GENDER_OPTIONS.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderChip, form.genderRequired === g && styles.genderChipActive]}
                    onPress={() => setForm((f) => ({ ...f, genderRequired: g }))}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.genderChipText, form.genderRequired === g && { color: Colors.white }]}>
                      {GENDER_LABELS[g]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (optional)</Text>
              <TextInput
                value={form.notes}
                onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
                style={[styles.input, { minHeight: 60 }]}
                placeholder="Special requirements, language notes, etc."
                placeholderTextColor={Colors.tx3}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>{editingHall ? 'Save Changes' : 'Add Hall'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 20 },
  list: { paddingBottom: 110, paddingTop: 8 },

  infoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  infoLabel: {
    fontSize: FontSize.smPlus,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
  },
  infoValue: {
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    fontWeight: FontWeight.semibold,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  addBtn: {
    backgroundColor: Colors.fo,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },

  emptyCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.tx3,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    textAlign: 'center',
  },

  hallCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginVertical: 5,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: 8,
  },
  hallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hallName: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
    flex: 1,
  },
  hallActions: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    backgroundColor: Colors.bll,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  editBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.bl,
  },
  deleteBtn: {
    backgroundColor: Colors.url,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deleteBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.ur,
  },
  hallMeta: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaChip: {
    backgroundColor: Colors.cr2,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaChipText: {
    fontSize: FontSize.xs,
    color: Colors.tx2,
    fontWeight: FontWeight.medium,
  },
  hallNotes: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    fontStyle: 'italic',
    lineHeight: FontSize.sm * 1.5,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Layout.horizontalPad,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
    marginBottom: 4,
  },
  formGroup: { gap: 6 },
  formLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.tx2,
  },
  input: {
    backgroundColor: Colors.cr2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    padding: 12,
    fontSize: FontSize.smPlus,
    color: Colors.tx,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    alignItems: 'center',
  },
  genderChipActive: {
    backgroundColor: Colors.bl,
    borderColor: Colors.bl,
  },
  genderChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.tx2,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.bd,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
    color: Colors.tx2,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: Radius.lg,
    backgroundColor: Colors.fo,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
