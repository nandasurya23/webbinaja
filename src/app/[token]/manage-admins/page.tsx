import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminToken, parseSession } from '@/lib/adminAuth';
import { listAdmins } from '@/lib/db';
import LoginForm from '../LoginForm';
import RegisterAdminForm from './RegisterAdminForm';
import { ArrowLeft, UsersThree } from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Only reads from Neon (via listAdmins) and inserts a new admin row, same as
// the inbox pages — no filesystem writes, so this is production-safe too.
export default async function ManageAdminsPage({ params }: { params: Promise<{ token: string }> }) {
  if (!isAdminConfigured()) notFound();

  const { token } = await params;
  if (!isValidAdminToken(token)) notFound();

  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]">
        <main className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Kelola Admin</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">Masuk untuk melanjutkan.</p>
          <LoginForm token={token} />
        </main>
      </div>
    );
  }

  // Session valid but wrong role — redirect quietly rather than showing a
  // 404 (which would be confusing for a logged-in user) or the content
  // (RBAC has to hold here, not just hide the nav link on the main page).
  if (session.role !== 'super_admin') {
    redirect(`/${token}`);
  }

  const admins = await listAdmins().catch(() => []);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]">
      <main className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
        <Link href={`/${token}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 mb-6">
          <ArrowLeft size={14} />
          Kembali ke Admin
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight mb-1">Kelola Admin</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">
          Daftarkan akun admin baru. Hanya super admin yang bisa mengakses halaman ini.
        </p>

        <div className="flex flex-col gap-8">
          <RegisterAdminForm token={token} />

          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-1.5">
              <UsersThree size={14} />
              Akun Terdaftar ({admins.length})
            </h2>
            <ul className="flex flex-col gap-2">
              {admins.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 text-sm py-1.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <span className="font-medium">{a.username}</span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      a.role === 'super_admin' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-500' : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {a.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
