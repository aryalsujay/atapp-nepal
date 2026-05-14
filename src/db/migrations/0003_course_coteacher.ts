/**
 * 0003_course_coteacher — adds a `coteacher_json` column to the `courses`
 * table so courses can carry their assigned co-teacher (name, gender,
 * languages, phone) directly. The dhamma.org scrape doesn't ship this; it's
 * populated by admin assignment in production and by the demo-course
 * enrichment pass during local development.
 */

import type { Migration } from '../migrate';

export const migration0003CourseCoteacher: Migration = {
  name: '0003_course_coteacher',
  up(db) {
    db.exec(`ALTER TABLE courses ADD COLUMN coteacher_json TEXT`);
  },
};
