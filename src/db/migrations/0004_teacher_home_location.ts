/**
 * 0004_teacher_home_location — adds the teacher's specific home address
 * (`home_city`, `home_lat`, `home_lng`) so distance/travel estimates from
 * the teacher to each Dhamma centre can be computed precisely.
 *
 * Before this, distance was inferred from `preferredRegions[0]` mapped to a
 * canonical city anchor (e.g. "Kathmandu Valley" → Kathmandu centroid).
 * That's too coarse for admin auto-scheduling, which needs to know the
 * teacher really lives in Durbarmarg, not "somewhere in the valley".
 */

import type { Migration } from '../migrate';

export const migration0004TeacherHomeLocation: Migration = {
  name: '0004_teacher_home_location',
  up(db) {
    db.exec(`ALTER TABLE teachers ADD COLUMN home_city TEXT`);
    db.exec(`ALTER TABLE teachers ADD COLUMN home_lat REAL`);
    db.exec(`ALTER TABLE teachers ADD COLUMN home_lng REAL`);
  },
};
