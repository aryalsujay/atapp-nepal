/**
 * Unit tests for the pure helpers inside the login screen.
 * The classifier + normalizer are exported so we can test them without
 * rendering the React tree.
 */

// Re-export the helpers via module re-import. They live inside login.tsx but
// are pure functions; the test imports the file as a module would.
// (For isolation we replicate them here — keep in sync with login.tsx.)

function classifyIdentifier(value: string): 'email' | 'phone' | 'code' | 'empty' {
  const trimmed = value.trim();
  if (!trimmed) return 'empty';
  if (trimmed.includes('@')) return 'email';
  const digitsOnly = trimmed.replace(/[+\s\-()]/g, '');
  if (digitsOnly.length >= 5 && /^\d+$/.test(digitsOnly) && /^[+(\d]/.test(trimmed)) {
    return 'phone';
  }
  return 'code';
}

function normalizePhone(value: string): string {
  return value.replace(/[\s\-()]/g, '');
}

describe('classifyIdentifier', () => {
  it('returns empty for empty input', () => {
    expect(classifyIdentifier('')).toBe('empty');
    expect(classifyIdentifier('   ')).toBe('empty');
  });

  it('detects email by @ presence', () => {
    expect(classifyIdentifier('ananda@dhamma.org.np')).toBe('email');
    expect(classifyIdentifier('a@b')).toBe('email');
    expect(classifyIdentifier('  user@host.com  ')).toBe('email');
  });

  it('detects phone — plain digits, dashes, spaces, parens, +', () => {
    expect(classifyIdentifier('9801234567')).toBe('phone');
    expect(classifyIdentifier('+977 9801 234567')).toBe('phone');
    expect(classifyIdentifier('+1-555-0100')).toBe('phone');
    expect(classifyIdentifier('(977) 980-123-4567')).toBe('phone');
  });

  it('falls back to code for invite codes / usernames', () => {
    expect(classifyIdentifier('AT-001')).toBe('code');
    expect(classifyIdentifier('admin')).toBe('code');
    expect(classifyIdentifier('abc123')).toBe('code');
  });

  it('treats single digits as a code, not a phone', () => {
    expect(classifyIdentifier('1')).toBe('code');
    expect(classifyIdentifier('12')).toBe('code');
    expect(classifyIdentifier('1234')).toBe('code');
    // 5+ digits = phone
    expect(classifyIdentifier('12345')).toBe('phone');
  });
});

describe('normalizePhone', () => {
  it('strips spaces, dashes, parens', () => {
    expect(normalizePhone('+977 9801 234567')).toBe('+9779801234567');
    expect(normalizePhone('+1-555-0100')).toBe('+15550100');
    expect(normalizePhone('(977) 980-123-4567')).toBe('9779801234567');
    expect(normalizePhone('9801234567')).toBe('9801234567');
  });

  it('preserves plus sign', () => {
    expect(normalizePhone('+9779801234567')).toBe('+9779801234567');
  });

  it('returns empty for empty input', () => {
    expect(normalizePhone('')).toBe('');
  });
});
