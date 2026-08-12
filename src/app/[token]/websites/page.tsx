import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminToken, parseSession } from '@/lib/adminAuth';
import { listCustomersPage } from '@/lib/db';
import { MAIN_DOMAIN } from '@/lib/customers';
import { CUSTOMER_TEMPLATES, isKnownTemplate } from '@/lib/customerScaffold';
import LoginForm from '../LoginForm';
import ListSearchFilterBar from '../ListSearchFilterBar';
import Pagination from '../Pagination';
import SuspendToggle from './SuspendToggle';
import { Globe, ArrowSquareOut, Pencil } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const PACKAGE_LABELS: Record<string, string> = {
  basic: 'Basic',
  business: 'Business Kit',
};

const PAGE_SIZE = 20;

function isKnownPackage(v: string): v is 'basic' | 'business' {
  return v === 'basic' || v === 'business';
}

// Only reads from Neon (listCustomersPage) — no filesystem writes, so this
// runs in production the same as the inbox and manage-admins pages. Lists
// DB-backed customers only (created via createCustomerAction); the 8
// file-based demo sites under src/customers/ aren't included here since
// they're template showcases, not real orders, and have no DB row to list.
export default async function WebsitesPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!isAdminConfigured()) notFound();

  const { token } = await params;
  if (!isValidAdminToken(token)) notFound();

  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    return <LoginForm token={token} />;
  }

  const sp = await searchParams;
  const search = sp.q ?? '';
  const template = sp.template && isKnownTemplate(sp.template) ? sp.template : undefined;
  const packageTier = sp.packageTier && isKnownPackage(sp.packageTier) ? sp.packageTier : undefined;
  const suspended = sp.status === 'suspended' ? true : sp.status === 'active' ? false : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  let websites: Awaited<ReturnType<typeof listCustomersPage>>['items'] = [];
  let total = 0;
  let loadError: string | null = null;
  try {
    const result = await listCustomersPage({ search, template, packageTier, suspended, page, pageSize: PAGE_SIZE });
    websites = result.items;
    total = result.total;
  } catch {
    loadError = 'Gagal memuat data — pastikan DATABASE_URL sudah dikonfigurasi.';
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Kelola Website</h1>
          <p className="text-sm text-zinc-400">
            Semua website customer yang sudah dibuat lewat form &quot;Buat Customer&quot; ({total}).
          </p>
        </div>
      </div>

      <ListSearchFilterBar
        searchPlaceholder="Cari nama bisnis atau slug..."
        filters={[
          {
            param: 'template',
            allLabel: 'Semua template',
            options: CUSTOMER_TEMPLATES.map((t) => ({ value: t, label: t })),
          },
          {
            param: 'packageTier',
            allLabel: 'Semua paket',
            options: Object.entries(PACKAGE_LABELS).map(([value, label]) => ({ value, label })),
          },
          {
            param: 'status',
            allLabel: 'Semua status (aktif + disuspend)',
            options: [
              { value: 'active', label: 'Aktif' },
              { value: 'suspended', label: 'Disuspend' },
            ],
          },
        ]}
      />

      {loadError && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-400 mb-6">
          {loadError}
        </div>
      )}

      {websites.length === 0 && !loadError && (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-white/10 bg-zinc-950/30">
          <p className="text-sm text-zinc-400">
            {search || template || packageTier ? 'Tidak ada website yang cocok.' : 'Belum ada website yang dibuat.'}
          </p>
        </div>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {websites.map((w) => {
          const url = w.customDomain ? `https://${w.customDomain}` : `https://${w.slug}.${MAIN_DOMAIN}`;
          return (
            <li
              key={w.slug}
              className={`group flex flex-col justify-between gap-4 rounded-xl border bg-zinc-950/60 p-5 shadow-sm transition-all hover:bg-zinc-900/80 ${
                w.suspended 
                  ? 'border-red-500/20 hover:border-red-500/40' 
                  : 'border-white/5 hover:border-blue-500/30'
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between min-w-0">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 border group-hover:scale-105 transition-transform ${
                      w.suspended 
                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}
                  >
                    <Globe size={18} weight="fill" />
                  </div>
                  {w.suspended && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      Disuspend
                    </span>
                  )}
                </div>
                
                <div className="min-w-0 mt-2">
                  <p className="font-semibold text-white truncate text-lg mb-1">{w.businessName}</p>
                  <p className="text-xs text-zinc-400 truncate flex items-center gap-1.5 mb-1.5">
                    {w.template} <span className="text-zinc-600">•</span> {PACKAGE_LABELS[w.packageTier] ?? w.packageTier}
                  </p>
                  {w.customDomain && (
                    <p className="text-[10px] font-mono text-blue-400/80 uppercase tracking-wider">
                      ★ Custom Domain
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
                <SuspendToggle token={token} slug={w.slug} suspended={w.suspended} />
                
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${token}/websites/${w.slug}/edit`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-700/50 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10"
                  >
                    Edit
                    <Pencil size={14} weight="bold" />
                  </Link>
                  {!w.suspended && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-400 hover:underline transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20"
                    >
                      Buka
                      <ArrowSquareOut size={14} weight="bold" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath={`/${token}/websites`} searchParams={sp} />
    </div>
  );
}
