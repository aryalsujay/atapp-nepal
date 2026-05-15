import { travelFor, travelFromRegionToCenter, formatTravelTime } from '../travel';

describe('formatTravelTime', () => {
  it('formats < 1 hour as minutes', () => {
    expect(formatTravelTime(0.25)).toBe('~15 min');
    expect(formatTravelTime(0.75)).toBe('~45 min');
  });
  it('formats whole hours without minutes', () => {
    expect(formatTravelTime(2)).toBe('~2h');
  });
  it('formats hours + minutes', () => {
    expect(formatTravelTime(3.5)).toBe('~3h 30m');
  });
  it('collapses near-zero to "same city"', () => {
    expect(formatTravelTime(0.04)).toBe('same city');
  });
});

describe('travelFor', () => {
  const durbarmarg = { homeLat: 27.7128, homeLng: 85.3186 };

  it('returns short hop for Dharma Shringa (Budhanilkantha)', () => {
    const t = travelFor(durbarmarg, 'Dharma Shringa');
    expect(t).not.toBeNull();
    expect(t!.distanceKm).toBeLessThan(20);
    expect(t!.altitude).toBe(1337);
  });

  it('returns multi-hour estimate for Dhamma Pokhara', () => {
    const t = travelFor(durbarmarg, 'Dhamma Pokhara');
    expect(t).not.toBeNull();
    expect(t!.distanceKm).toBeGreaterThan(150);
    expect(t!.travelHrs).toBeGreaterThan(3);
  });

  it('falls back to region anchor when no explicit coords', () => {
    const t = travelFor({ preferredRegions: ['Kathmandu Valley'] }, 'Dharma Shringa');
    expect(t).not.toBeNull();
    expect(t!.distanceKm).toBeLessThan(20);
  });

  it('returns null for unknown centre', () => {
    expect(travelFor(durbarmarg, 'Nowhere')).toBeNull();
  });
});

describe('travelFromRegionToCenter', () => {
  it('honors the Kathmandu Valley anchor', () => {
    const t = travelFromRegionToCenter('Kathmandu Valley', 'Dhamma Janani');
    expect(t).not.toBeNull();
    expect(t!.distanceKm).toBeGreaterThan(80);
    expect(t!.distanceKm).toBeLessThan(180);
  });
});
