/**
 * 0005_course_open_slots — adds the `open_slots_json` column to the
 * `courses` table so centres can declare each open AT slot's gender
 * separately instead of relying on a single `gender_required` value.
 *
 * Examples (JSON-encoded into the column):
 *   `["M"]`        → one open slot for a Male AT.
 *   `["M","F"]`    → two open slots, one Male + one Female.
 *   `["Any"]`      → one open slot, no gender preference.
 *
 * NULL means "derive from `gender_required` + `need_count` − confirmed
 * ATs", which keeps the schema backward-compatible with existing rows.
 */

import type { Migration } from '../migrate';

export const migration0005CourseOpenSlots: Migration = {
  name: '0005_course_open_slots',
  up(db) {
    db.exec(`ALTER TABLE courses ADD COLUMN open_slots_json TEXT`);
  },
};
