import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminToken, parseSession } from '@/lib/adminAuth';
import { listAdmins } from '@/lib/db';
import LoginForm from '../LoginForm';
import RegisterAdminForm from './RegisterAdminForm';
import { UsersThree, ShieldCheck } from '@phosphor-icons/react/dist/ssr';

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
    return <LoginForm token={token} />;
  }

  // Session valid but wrong role — redirect quietly rather than showing a
  // 404 (which would be confusing for a logged-in user) or the content
  // (RBAC has to hold here, not just hide the nav link on the main page).
  if (session.role !== 'super_admin') {
    redirect(`/${token}`);
  }

  const admins = await listAdmins().catch(() => []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Kelola Admin</h1>
          <p className="text-sm text-zinc-400">
            Daftarkan akun admin baru. Hanya super admin yang bisa mengakses halaman ini.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <RegisterAdminForm token={token} />

        <section className="rounded-2xl border border-white/5 bg-zinc-950/60 p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <UsersThree size={16} />
              Akun Terdaftar ({admins.length})
            </h2>
          </div>
          
          <ul className="flex flex-col gap-3">
            {admins.map((a) => (
              <li 
                key={a.id} 
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-blue-500/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full border ${
                    a.role === 'super_admin' 
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                      : 'bg-zinc-800 text-zinc-400 border-white/5'
                  }`}>
                    <ShieldCheck size={16} weight={a.role === 'super_admin' ? "fill" : "regular"} />
                  </div>
                  <span className="font-semibold text-white">{a.username}</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    a.role === 'super_admin' 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                      : 'bg-zinc-800/50 text-zinc-300 border-white/5'
                  }`}
                >
                  {a.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
