import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminToken, isValidSessionCookieValue } from '@/lib/adminAuth';
import LoginForm from './LoginForm';
import CustomerForm from './CustomerForm';

// Never indexed, and irrelevant anyway since this route 404s outside dev.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage({ params }: { params: Promise<{ token: string }> }) {
  // Local-only tool: writes files under src/customers/, which only makes
  // sense against a writable, developer-owned filesystem. Vercel's
  // production filesystem is read-only anyway, but this 404s before ever
  // touching it, in case the route is ever reachable there by mistake.
  if (process.env.NODE_ENV === 'production') notFound();
  if (!isAdminConfigured()) notFound();

  const { token } = await params;
  if (!isValidAdminToken(token)) notFound();

  const cookieStore = await cookies();
  const authenticated = isValidSessionCookieValue(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]">
      <main className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Local admin · dev only
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mb-1">WebbinAja Admin</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">
          {authenticated ? 'Tambah customer baru ke dalam sistem.' : 'Masuk untuk melanjutkan.'}
        </p>

        {authenticated ? <CustomerForm token={token} /> : <LoginForm token={token} />}
      </main>
    </div>
  );
}
