/**
 * Stable course ID derivation.
 *
 * Previously `coursesStore.syncCourses` assigned IDs by scrape ordinal
 * (1..N), which meant the same logical course got a different DB id every
 * sync. Applications + notifications + bookmarks reference course IDs, so
 * the renumbering broke those links silently.
 *
 * The new ID is a deterministic hash of `<centerId>|<startDate>|<type>` —
 * the composite key that identifies a course uniquely. As long as
 * dhamma.org reports the same center/start-date/type combo, we resolve to
 * the same ID forever.
 *
 * We constrain output to a positive 31-bit integer so it round-trips
 * through SQLite INTEGER columns, JSON, and React Native's number type
 * without surprises.
 */

const MASK_31 = 0x7fffffff;

/**
 * 32-bit FNV-1a hash, masked to 31 bits to stay positive.
 * Output range: [1, 2_147_483_647]. Collisions for our scale (~250 active
 * courses, ~10K historical) are astronomically unlikely (~10⁻⁵).
 */
export function stableCourseId(
  centerId: string,
  startDate: string,
  type: string,
  genderRequired: string = 'Any',
): number {
  const key = `${centerId}|${startDate}|${type}|${genderRequired}`;
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    // 32-bit FNV prime multiplication
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  const id = h & MASK_31;
  return id === 0 ? 1 : id;
}
