import { stableCourseId } from '../courseId';

describe('stableCourseId', () => {
  it('returns the same id for the same composite key', () => {
    const a = stableCourseId('dhamma-shringa', '2026-06-14', '10-Day');
    const b = stableCourseId('dhamma-shringa', '2026-06-14', '10-Day');
    expect(a).toBe(b);
  });

  it('differs when any axis changes', () => {
    const base = stableCourseId('dhamma-shringa', '2026-06-14', '10-Day', 'Any');
    expect(stableCourseId('dhamma-pokhara', '2026-06-14', '10-Day', 'Any')).not.toBe(base);
    expect(stableCourseId('dhamma-shringa', '2026-06-15', '10-Day', 'Any')).not.toBe(base);
    expect(stableCourseId('dhamma-shringa', '2026-06-14', 'Satipatthana Sutta', 'Any')).not.toBe(
      base,
    );
    expect(stableCourseId('dhamma-shringa', '2026-06-14', '10-Day', 'M')).not.toBe(base);
  });

  it('stays inside the positive 31-bit range (safe for SQLite + JSON)', () => {
    const id = stableCourseId('dhamma-shringa', '2026-06-14', '10-Day');
    expect(id).toBeGreaterThan(0);
    expect(id).toBeLessThan(2 ** 31);
    expect(Number.isInteger(id)).toBe(true);
  });

  it('treats undefined gender as "Any" by default', () => {
    const withDefault = stableCourseId('dhamma-shringa', '2026-06-14', '10-Day');
    const withAny = stableCourseId('dhamma-shringa', '2026-06-14', '10-Day', 'Any');
    expect(withDefault).toBe(withAny);
  });
});
