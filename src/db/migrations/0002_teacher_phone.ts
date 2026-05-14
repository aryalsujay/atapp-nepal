/**
 * 0002_teacher_phone — adds the `phone` column to the `teachers` table so
 * teachers can sign in by phone number (the demo login uses this).
 *
 * Adding columns is the safest schema change: existing rows get NULL for the
 * new column; queries that don't reference it are unaffected.
 */

import type { Migration } from '../migrate';

export const migration0002TeacherPhone: Migration = {
  name: '0002_teacher_phone',
  up(db) {
    db.exec(`ALTER TABLE teachers ADD COLUMN phone TEXT`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_teachers_phone ON teachers(phone)`);
  },
};
