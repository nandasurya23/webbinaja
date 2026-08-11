'use server';

import { cookies } from 'next/headers';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createSessionCookieValue,
  hashPassword,
  timingSafeEqualStr,
  verifyPassword,
  type AdminRole,
} from '@/lib/adminAuth';
import { isRateLimited, recordRateLimitHit, countAdmins, getAdminByUsername, createAdmin } from '@/lib/db';
import { clientIp } from '@/lib/clientIp';
import { assertAdminIdentity, requireRole, type ActionResult } from './shared';

export async function loginAction(token: string, username: string, password: string): Promise<ActionResult> {
  assertAdminIdentity(token);

  const cleanUsername = username.trim();
  if (!cleanUsername || !password) {
    return { ok: false, error: 'Username dan password wajib diisi.' };
  }

  const ip = await clientIp();
  // Rate limit check only actually matters once the panel is reachable in
  // production (see src/lib/db.ts) — running it here too is harmless in
  // dev, and keeps this one code path correct everywhere instead of two.
  try {
    if (await isRateLimited('login', ip, 5, 15)) {
      return { ok: false, error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' };
    }
  } catch {
    // DATABASE_URL not configured (e.g. plain local dev without Neon set up
    // yet) — fail open on rate limiting rather than blocking login entirely.
  }

  let admin = await getAdminByUsername(cleanUsername).catch(() => null);

  // Bootstrap: the very first login, before any admin account exists yet.
  // Only takes effect while the `admins` table is genuinely empty — once
  // any account is created (including this one), this branch is
  // permanently unreachable, bootstrap env vars or not.
  if (!admin) {
    const bootstrapUsername = process.env.SUPER_ADMIN_USERNAME;
    const bootstrapPassword = process.env.SUPER_ADMIN_PASSWORD;
    const noAdminsYet = (await countAdmins().catch(() => -1)) === 0;

    if (
      noAdminsYet &&
      bootstrapUsername &&
      bootstrapPassword &&
      timingSafeEqualStr(cleanUsername, bootstrapUsername) &&
      timingSafeEqualStr(password, bootstrapPassword)
    ) {
      admin = await createAdmin({ username: cleanUsername, passwordHash: hashPassword(password), role: 'super_admin' });
    }
  }

  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    try {
      await recordRateLimitHit('login', ip);
    } catch {
      // Same as above — rate limiting is best-effort, not a hard dependency.
    }
    return { ok: false, error: 'Username atau password salah.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionCookieValue(admin.id, admin.role), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  return { ok: true };
}

export async function logoutAction(token: string): Promise<ActionResult> {
  assertAdminIdentity(token);
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return { ok: true };
}

export interface RegisterAdminInput {
  username: string;
  password: string;
  role: AdminRole;
}

/** super_admin only — enforced here, not just hidden in the UI (see requireRole). */
export async function registerAdminAction(token: string, input: RegisterAdminInput): Promise<ActionResult> {
  assertAdminIdentity(token);
  const session = await requireRole('super_admin');

  const username = input.username.trim();
  if (username.length < 3) return { ok: false, error: 'Username minimal 3 karakter.' };
  if (input.password.length < 12) return { ok: false, error: 'Password minimal 12 karakter.' };
  if (input.role !== 'admin' && input.role !== 'super_admin') return { ok: false, error: 'Role tidak dikenali.' };

  const existing = await getAdminByUsername(username).catch(() => null);
  if (existing) return { ok: false, error: `Username "${username}" sudah dipakai.` };

  try {
    await createAdmin({ username, passwordHash: hashPassword(input.password), role: input.role, createdBy: session.adminId });
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  return { ok: true, message: `Akun "${username}" (${input.role}) berhasil dibuat.` };
}
