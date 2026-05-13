import {
  toAvailabilityArray,
  fromAvailabilityArray,
  isAvailableInMonth,
  isFestivalInMonth,
  availableMonthsCount,
} from '../availability';

describe('availability helpers', () => {
  const profile = {
    availableMonths: [2, 3, 6, 7],
    festivalMonths: [4, 9, 10],
  };

  it('toAvailabilityArray maps months to 12-slot array', () => {
    const arr = toAvailabilityArray(profile);
    expect(arr).toHaveLength(12);
    expect(arr[0]).toBe(0); // Jan — unavailable
    expect(arr[2]).toBe(1); // Mar — available
    expect(arr[3]).toBe(1); // Apr — available
    expect(arr[4]).toBe('f'); // May — festival
    expect(arr[6]).toBe(1); // Jul
    expect(arr[9]).toBe('f'); // Oct — festival
  });

  it('fromAvailabilityArray inverts toAvailabilityArray', () => {
    const arr = toAvailabilityArray(profile);
    const round = fromAvailabilityArray(arr);
    expect(round.availableMonths.sort()).toEqual(profile.availableMonths.sort());
    expect(round.festivalMonths.sort()).toEqual(profile.festivalMonths.sort());
  });

  it('fromAvailabilityArray handles all-zero input', () => {
    const arr = Array(12).fill(0) as (0 | 1 | 'f')[];
    const round = fromAvailabilityArray(arr);
    expect(round.availableMonths).toEqual([]);
    expect(round.festivalMonths).toEqual([]);
  });

  it('isAvailableInMonth returns true only for listed months', () => {
    expect(isAvailableInMonth(profile, 2)).toBe(true);
    expect(isAvailableInMonth(profile, 4)).toBe(false); // festival, not available
    expect(isAvailableInMonth(profile, 0)).toBe(false);
  });

  it('isFestivalInMonth detects festival blocks', () => {
    expect(isFestivalInMonth(profile, 4)).toBe(true);
    expect(isFestivalInMonth(profile, 2)).toBe(false);
  });

  it('availableMonthsCount returns the count', () => {
    expect(availableMonthsCount(profile)).toBe(4);
    expect(availableMonthsCount({ availableMonths: [], festivalMonths: [] })).toBe(0);
  });

  it('out-of-range months in availableMonths are ignored by toAvailabilityArray', () => {
    const bad = { availableMonths: [-1, 0, 12, 15], festivalMonths: [] };
    const arr = toAvailabilityArray(bad);
    expect(arr).toHaveLength(12);
    expect(arr[0]).toBe(1); // valid
    // -1, 12, 15 ignored — array length stays 12
  });
});
