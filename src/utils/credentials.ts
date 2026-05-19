/**
 * Credential generators for the admin "Add Teacher" flow (spec 33).
 *
 * Passwords created through this module are hashed with bcrypt (cost 10)
 * before being stored in the `password_hash` column. Legacy seed rows
 * still carry plain-text values (e.g. `demo123`) — `verifyPassword`
 * recognises that and falls back to a constant-time string compare so
 * existing logins keep working without a one-shot migration.
 *
 * Anything newly created (admin "Add Teacher", "Reset password") is
 * bcrypt-hashed from now on.
 */

import bcrypt from 'bcryptjs';

const HEX = '0123456789ABCDEF';

// Base-32 alphabet with ambiguous chars removed (no 0/O, no 1/l/I).
const PASSWORD_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

/**
 * Generate a teacher invite code like `AT-3F2A-9C81` (4+4 hex blocks).
 * The first prefix is fixed to `AT-` so codes are visually
 * self-identifying at a glance.
 */
export function generateInviteCode(): string {
  const block = () =>
    Array.from({ length: 4 }, () => HEX[Math.floor(Math.random() * HEX.length)]).join('');
  return `AT-${block()}-${block()}`;
}

/**
 * Generate a 12-character temporary password from a curated alphabet
 * that excludes commonly-confused characters (0/O, 1/l/I).
 */
export function generateTempPassword(length: number = 12): string {
  return Array.from(
    { length },
    () => PASSWORD_ALPHABET[Math.floor(Math.random() * PASSWORD_ALPHABET.length)],
  ).join('');
}

/** A stored value is a bcrypt hash if it starts with `$2a$`, `$2b$`, or `$2y$`. */
function isBcryptHash(stored: string): boolean {
  return /^\$2[aby]\$/.test(stored);
}

/** Hash a plain password with bcrypt (cost 10) for storage. */
export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

/**
 * Constant-ish-time string compare for legacy plain-text seed rows.
 * Skips the bcrypt cost entirely when the stored value isn't a hash.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Compare `plain` against `stored` regardless of whether `stored` is a
 * bcrypt hash or a legacy plain-text seed value. The whole codebase
 * should funnel password checks through this function instead of `===`.
 */
export function verifyPassword(plain: string, stored: string): boolean {
  if (!stored) return false;
  if (isBcryptHash(stored)) {
    try {
      return bcrypt.compareSync(plain, stored);
    } catch {
      return false;
    }
  }
  return constantTimeEqual(plain, stored);
}

/**
 * Normalise a phone number for storage + login lookup.
 * Strips spaces, hyphens, parens, and a single leading `+`. Lower-cased
 * so it's index-comparable. Matches what `teachersRepo.findByIdentifier`
 * does on the lookup side.
 */
export function normalizePhone(raw: string): string {
  return raw
    .replace(/[\s\-()]/g, '')
    .replace(/^\+/, '')
    .toLowerCase();
}
