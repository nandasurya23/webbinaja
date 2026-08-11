// Auth for the admin panel (src/app/[token]) — a secret URL segment
// (ADMIN_TOKEN) gates entry to a per-account username/password login backed
// by the `admins` table in Neon (src/lib/db.ts). No external auth library:
// scrypt for password hashing (Node's own crypto module) and a signed,
// expiring session cookie (HMAC-SHA256) carrying the logged-in admin's id
// and role, so server actions can enforce RBAC without a DB round-trip on
// every request.
import crypto from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours
export const ADMIN_SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;

export type AdminRole = 'admin' | 'super_admin';

export function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on length mismatch — compare against a
  // same-length buffer first so a length difference doesn't itself leak
  // timing information (or throw) before the real comparison runs.
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function sign(payload: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * True when the two env vars every deployment needs are present — the URL
 * gate (ADMIN_TOKEN) and the session-signing secret. Does NOT check
 * SUPER_ADMIN_USERNAME/PASSWORD (those are only consulted once, to bootstrap
 * the first account — see loginAction in src/app/[token]/actions.ts) or
 * whether any admin accounts exist yet (that's a DB question, not an env one).
 */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_TOKEN && process.env.ADMIN_SESSION_SECRET);
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || !token) return false;
  return timingSafeEqualStr(token, expected);
}

const SCRYPT_KEY_LENGTH = 64;

/** Stored as `salt:hash`, both hex — scrypt is Node's built-in, no dependency needed. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex');
  return timingSafeEqualStr(candidate, hash);
}

/** '.' can't appear in a uuid or in the fixed role strings, so it's a safe field separator. */
export function createSessionCookieValue(adminId: string, role: AdminRole): string {
  const expires = String(Date.now() + SESSION_TTL_MS);
  const payload = `${adminId}.${role}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export interface SessionInfo {
  adminId: string;
  role: AdminRole;
}

/**
 * Verifies the signature and expiry, then trusts `adminId`/`role` from the
 * payload — safe because nothing reaches this far without a valid HMAC over
 * the exact payload, so a client can't forge a different id or escalate
 * `admin` to `super_admin` by editing the cookie.
 */
export function parseSession(value: string | undefined | null): SessionInfo | null {
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length !== 4) return null;
  const [adminId, role, expiresStr, sig] = parts;
  if (role !== 'admin' && role !== 'super_admin') return null;

  const payload = `${adminId}.${role}.${expiresStr}`;
  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return null;
  }
  if (!timingSafeEqualStr(sig, expected)) return null;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires <= Date.now()) return null;

  return { adminId, role };
}
