import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminToken, parseSession } from '@/lib/adminAuth';
import { listCustomersPage } from '@/lib/db';
import { MAIN_DOMAIN } from '@/lib/customers';
import { CUSTOMER_TEMPLATES, isKnownTemplate } from '@/lib/customerScaffold';
import LoginForm from '../LoginForm';
import ListSearchFilterBar from '../ListSearchFilterBar';
import Pagination from '../Pagination';
import { ArrowLeft, Globe, ArrowSquareOut } from '@phosphor-icons/react/dist/ssr';

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
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]">
        <main className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Website</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">Masuk untuk melanjutkan.</p>
          <LoginForm token={token} />
        </main>
      </div>
    );
  }

  const sp = await searchParams;
  const search = sp.q ?? '';
  const template = sp.template && isKnownTemplate(sp.template) ? sp.template : undefined;
  const packageTier = sp.packageTier && isKnownPackage(sp.packageTier) ? sp.packageTier : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  let websites: Awaited<ReturnType<typeof listCustomersPage>>['items'] = [];
  let total = 0;
  let loadError: string | null = null;
  try {
    const result = await listCustomersPage({ search, template, packageTier, page, pageSize: PAGE_SIZE });
    websites = result.items;
    total = result.total;
  } catch {
    loadError = 'Gagal memuat data — pastikan DATABASE_URL sudah dikonfigurasi.';
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]">
      <main className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
        <Link href={`/${token}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 mb-6">
          <ArrowLeft size={14} />
          Kembali ke Admin
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight mb-1">Website</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Semua website customer yang sudah dibuat lewat form "Buat Customer" ({total}).
        </p>

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
          ]}
        />

        {loadError && <p className="text-sm text-red-600 dark:text-red-400 mb-6">{loadError}</p>}

        {websites.length === 0 && !loadError && (
          <p className="text-sm text-neutral-400">
            {search || template || packageTier ? 'Tidak ada website yang cocok.' : 'Belum ada website yang dibuat.'}
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {websites.map((w) => {
            const url = w.customDomain ? `https://${w.customDomain}` : `https://${w.slug}.${MAIN_DOMAIN}`;
            return (
              <li
                key={w.slug}
                className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-4 sm:p-5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 shrink-0">
                    <Globe size={16} weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{w.businessName}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {w.template} · {PACKAGE_LABELS[w.packageTier] ?? w.packageTier}
                      {w.customDomain && ` · custom domain`}
                    </p>
                  </div>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 shrink-0 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline"
                >
                  Buka
                  <ArrowSquareOut size={14} />
                </a>
              </li>
            );
          })}
        </ul>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath={`/${token}/websites`} searchParams={sp} />
      </main>
    </div>
  );
}
