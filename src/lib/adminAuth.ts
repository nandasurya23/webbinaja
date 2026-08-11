// Auth for the local-only admin UI (src/app/admin/[token]) — a password
// login behind a secret URL segment, gated shut in production. No external
// auth library: just a signed, expiring session cookie (HMAC-SHA256) and
// constant-time comparisons for the token/password themselves.
import crypto from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours
export const ADMIN_SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;

function timingSafeEqualStr(a: string, b: string): boolean {
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

/** True only when every required admin env var is present — fail closed otherwise. */
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_TOKEN && process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET
  );
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || !token) return false;
  return timingSafeEqualStr(token, expected);
}

export function isValidAdminPassword(password: string | undefined | null): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  return timingSafeEqualStr(password, expected);
}

export function createSessionCookieValue(): string {
  const expires = String(Date.now() + SESSION_TTL_MS);
  return `${expires}.${sign(expires)}`;
}

export function isValidSessionCookieValue(value: string | undefined | null): boolean {
  if (!value) return false;
  const dot = value.lastIndexOf('.');
  if (dot === -1) return false;
  const payload = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }
  if (!timingSafeEqualStr(sig, expected)) return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && expires > Date.now();
}
