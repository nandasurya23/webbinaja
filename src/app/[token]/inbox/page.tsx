import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminToken, parseSession } from '@/lib/adminAuth';
import { listSubmissionsPage, type Submission, type SubmissionStatus } from '@/lib/db';
import LoginForm from '../LoginForm';
import ListSearchFilterBar from '../ListSearchFilterBar';
import Pagination from '../Pagination';
import { Envelope, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Belum Diproses',
  processed: 'Sudah Jadi Website',
};

const PACKAGE_LABELS: Record<string, string> = {
  basic: 'Basic',
  business_kit: 'Business Kit',
};

const PAGE_SIZE = 20;

function isSubmissionStatus(v: string): v is SubmissionStatus {
  return v === 'pending' || v === 'processed';
}

// Intentionally NO `if (NODE_ENV === 'production') notFound()` gate here —
// unlike the main admin page (../page.tsx), this route only READS from
// Neon, never writes to the filesystem, so it's safe (and meant) to run in
// production. See the plan notes in adminAuth.ts / actions.ts for why the
// main admin page can't do the same.
export default async function InboxPage({
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
  // 'pending' unless the operator explicitly asks for something else — an
  // already-processed submission (its site is live) has no reason to keep
  // showing up mixed in with ones still needing action; that's what was
  // making the list look like it had duplicate/stale entries.
  const status = sp.status && isSubmissionStatus(sp.status) ? sp.status : 'pending';
  const page = Math.max(1, Number(sp.page) || 1);

  let submissions: Submission[] = [];
  let total = 0;
  let loadError: string | null = null;
  try {
    const result = await listSubmissionsPage({ search, status, page, pageSize: PAGE_SIZE });
    submissions = result.items;
    total = result.total;
  } catch {
    loadError = 'Gagal memuat data — pastikan DATABASE_URL sudah dikonfigurasi.';
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Inbox Submission</h1>
          <p className="text-sm text-zinc-400">
            Data yang dikirim customer lewat form pemesanan publik.
          </p>
        </div>
      </div>

      <ListSearchFilterBar
        searchPlaceholder="Cari nama bisnis atau nomor WhatsApp..."
        filters={[
          {
            param: 'status',
            allLabel: 'Semua (termasuk yang sudah jadi)',
            defaultValue: 'pending',
            options: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
          },
        ]}
      />

      {loadError && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-400 mb-6">
          {loadError}
        </div>
      )}

      {submissions.length === 0 && !loadError && (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-white/10 bg-zinc-950/30">
          <p className="text-sm text-zinc-400">
            {search
              ? 'Tidak ada submission yang cocok.'
              : status === 'pending'
              ? 'Tidak ada submission yang belum diproses — cek filter "Semua" di atas untuk lihat yang sudah jadi website.'
              : 'Belum ada submission masuk.'}
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {submissions.map((s) => (
          <li key={s.id}>
            <Link
              href={`/${token}/inbox/${s.id}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/5 bg-zinc-950/60 p-5 hover:border-blue-500/30 hover:bg-zinc-900/80 transition-all shadow-sm"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Envelope size={18} weight="fill" />
                </div>
                <div className="min-w-0 flex flex-col gap-1">
                  <p className="font-semibold text-white truncate flex items-center gap-2 text-base">
                    {s.businessName}
                    {s.packageTier && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                        {PACKAGE_LABELS[s.packageTier] ?? s.packageTier}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                    <WhatsappLogo size={14} weight="fill" className="text-blue-500" />
                    {s.whatsapp}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 shrink-0">
                {typeof s.queueNumber === 'number' && (
                  <span className="text-xs font-mono font-bold text-zinc-500">Antrean #{s.queueNumber}</span>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      s.status === 'processed'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-zinc-800/50 text-zinc-300 border-white/5'
                    }`}
                  >
                    {s.status === 'processed' ? 'Selesai' : 'Sedang Dikerjakan'}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath={`/${token}/inbox`} searchParams={sp} />
    </div>
  );
}
