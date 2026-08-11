// Shared "who is calling this endpoint" resolver for every rate-limited
// public/unauthenticated action (login, order submit, asset upload, status
// check — see src/lib/db.ts's rate_limits table). Deliberately does NOT read
// the general-purpose `x-forwarded-for` header: on most proxy chains it's
// client-writable (a caller can send their own XFF value, and depending on
// the edge/proxy config it may just get appended to rather than replaced),
// which would let an attacker rotate a fake first value per request to
// dodge rate limiting entirely. `x-vercel-forwarded-for` / `x-real-ip` are
// the headers Vercel's edge itself sets from the actual TCP connection and
// cannot be overridden by the client, so those are trusted instead.
import { headers } from 'next/headers';

export async function clientIp(): Promise<string> {
  const headersList = await headers();
  const ip =
    headersList.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip')?.trim();
  return ip || 'unknown';
}
