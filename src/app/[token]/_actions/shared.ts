// Guards and helpers shared by every action file in this folder. Not a
// 'use server' file itself — these aren't server actions to be called
// directly from the client, just plain server-only utilities imported by
// the files that are (same pattern as @/lib/adminAuth, @/lib/db).
import { cookies } from 'next/headers';
import { isAdminConfigured, isValidAdminToken, parseSession, ADMIN_SESSION_COOKIE, type AdminRole, type SessionInfo } from '@/lib/adminAuth';
import { MAIN_DOMAIN } from '@/lib/customers';

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

// Matches the fixed port in package.json's "dev" script — the only place
// this app runs locally, since the whole admin UI is dev-only.
export const LOCAL_DEV_PORT = 8765;

// Token + config validity check, re-checked on every action (not just page
// render — the token gate on the page component only protects the initial
// HTML; these server actions are their own endpoints and must enforce it
// independently). Every action in this app is production-safe now: customer
// creation/updates go through the `customers` table (see src/lib/db.ts and
// migrations/0002_customers.sql) instead of writing to the filesystem, which
// is what used to require a separate dev-only gate here.
export function assertAdminIdentity(token: string): void {
  if (!isAdminConfigured()) {
    throw new Error('Admin belum dikonfigurasi — set ADMIN_TOKEN, ADMIN_SESSION_SECRET di .env.local.');
  }
  if (!isValidAdminToken(token)) {
    throw new Error('Unauthorized.');
  }
}

export async function requireSession(): Promise<SessionInfo> {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) {
    throw new Error('Sesi habis — silakan login ulang.');
  }
  return session;
}

/** RBAC check — throws (not a silent redirect) so it fails loudly if ever called incorrectly, same philosophy as the other assert* guards here. */
export async function requireRole(role: AdminRole): Promise<SessionInfo> {
  const session = await requireSession();
  if (session.role !== role) {
    throw new Error('Anda tidak punya akses untuk aksi ini.');
  }
  return session;
}

// Bare hostname only — no protocol, no path, no trailing dot. Matches
// "kliniksehat.com" or "www.kliniksehat.com", rejects anything that isn't a
// plausible domain (also rejects the platform's own domain/subdomains so a
// customer can't hijack routing for webbinaja.com itself).
const CUSTOM_DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(\.(?!-)[a-z0-9-]{1,63})+$/;

export function isValidCustomDomain(domain: string): boolean {
  return CUSTOM_DOMAIN_RE.test(domain) && domain !== MAIN_DOMAIN && !domain.endsWith(`.${MAIN_DOMAIN}`);
}
