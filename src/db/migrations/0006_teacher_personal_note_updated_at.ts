/**
 * 0006_teacher_personal_note_updated_at — stamps every change to the
 * teacher's free-text `personal_note` so the profile screen's "Personal
 * Notes" card can render a real "Last updated …" line instead of a
 * hard-coded string.
 *
 * Column is nullable: existing rows have no recorded edit time, so the
 * card falls back to hiding the timestamp until the user next saves.
 */

import type { Migration } from '../migrate';

export const migration0006TeacherPersonalNoteUpdatedAt: Migration = {
  name: '0006_teacher_personal_note_updated_at',
  up(db) {
    db.exec(`ALTER TABLE teachers ADD COLUMN personal_note_updated_at INTEGER`);
  },
};
