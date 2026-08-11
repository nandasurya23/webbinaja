import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Envelope, UsersThree } from '@phosphor-icons/react/dist/ssr';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminToken, parseSession } from '@/lib/adminAuth';
import LoginForm from './LoginForm';
import CustomerForm from './CustomerForm';

// Never indexed — also gated by the secret token segment itself.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage({ params }: { params: Promise<{ token: string }> }) {
  // "Buat Customer" below still writes files under src/customers/, which
  // only makes sense against a writable, developer-owned filesystem —
  // Vercel's production filesystem is read-only. This page itself (login,
  // navigation) is production-safe; the file-writing action is what's
  // actually gated (see assertAdminAccess in ./actions.ts).
  if (!isAdminConfigured()) notFound();

  const { token } = await params;
  if (!isValidAdminToken(token)) notFound();

  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]">
      <main className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="text-3xl font-semibold tracking-tight">WebbinAja Admin</h1>
          {session && (
            <div className="flex items-center gap-4 shrink-0 mt-1.5">
              <Link
                href={`/${token}/inbox`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline"
              >
                <Envelope size={14} />
                Inbox Submission
              </Link>
              {session.role === 'super_admin' && (
                <Link
                  href={`/${token}/manage-admins`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline"
                >
                  <UsersThree size={14} />
                  Kelola Admin
                </Link>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">
          {session ? 'Tambah customer baru ke dalam sistem.' : 'Masuk untuk melanjutkan.'}
        </p>

        {!session ? (
          <LoginForm token={token} />
        ) : process.env.NODE_ENV === 'production' ? (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-6 sm:p-8 text-sm text-amber-900 dark:text-amber-200">
            "Buat Customer" menulis file langsung ke server dan cuma bisa dijalankan dari komputer developer
            (<code className="text-xs">npm run dev</code>), bukan di production — filesystem production Vercel read-only.
            Pakai <strong>Inbox Submission</strong> di atas untuk lihat data yang sudah masuk.
          </div>
        ) : (
          <CustomerForm token={token} />
        )}
      </main>
    </div>
  );
}
