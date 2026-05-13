import { buildEligibilityChecks, langLabel } from '../eligibility';

describe('langLabel', () => {
  it('maps known codes to friendly labels', () => {
    expect(langLabel('ne')).toBe('Nepali');
    expect(langLabel('en')).toBe('English');
    expect(langLabel('hi')).toBe('Hindi');
  });

  it('returns the code unchanged for unknown languages', () => {
    expect(langLabel('zz')).toBe('zz');
  });
});

describe('buildEligibilityChecks', () => {
  const baseProfile = {
    authorizations: ['10-Day', 'Satipatthana Sutta'],
    languages: { Nepali: 'primary', English: 'primary' },
    availableMonths: [6, 7, 8],
    festivalMonths: [0, 1],
    gender: 'F' as const,
  };

  const baseCourse = {
    type: '10-Day' as const,
    languages: ['ne', 'en'],
    startDate: '2026-07-15',
    dates: 'Jul 15–26, 2026',
    genderRequired: 'Any' as const,
  };

  it('passes all checks when teacher matches course', () => {
    const checks = buildEligibilityChecks(baseProfile, baseCourse);
    expect(checks).toHaveLength(5);
    expect(checks.find((c) => c.key === 'authorization')?.passed).toBe(true);
    expect(checks.find((c) => c.key === 'language')?.passed).toBe(true);
    expect(checks.find((c) => c.key === 'availability')?.passed).toBe(true);
    expect(checks.find((c) => c.key === 'gender')?.passed).toBe(true);
  });

  it('fails authorization when teacher lacks the course type', () => {
    const checks = buildEligibilityChecks(
      { ...baseProfile, authorizations: ['10-Day'] },
      { ...baseCourse, type: '30-Day' as const },
    );
    expect(checks.find((c) => c.key === 'authorization')?.passed).toBe(false);
  });

  it('fails availability when course month is not in availableMonths', () => {
    const checks = buildEligibilityChecks(baseProfile, {
      ...baseCourse,
      startDate: '2026-03-15', // March = month 2, not in [6,7,8]
    });
    expect(checks.find((c) => c.key === 'availability')?.passed).toBe(false);
  });

  it('fails gender when course requires a different gender', () => {
    const checks = buildEligibilityChecks(baseProfile, {
      ...baseCourse,
      genderRequired: 'M' as const,
    });
    expect(checks.find((c) => c.key === 'gender')?.passed).toBe(false);
  });

  it('applies translated labels when provided', () => {
    const checks = buildEligibilityChecks(baseProfile, baseCourse, {
      authorization: 'पाठ्यक्रम अनुमति',
    });
    expect(checks.find((c) => c.key === 'authorization')?.label).toBe('पाठ्यक्रम अनुमति');
  });
});
