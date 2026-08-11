import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminToken, parseSession } from '@/lib/adminAuth';
import { listSubmissionsPage, type Submission, type SubmissionStatus, type WorkStatus, type PaymentStatus } from '@/lib/db';
import LoginForm from '../LoginForm';
import ListSearchFilterBar from '../ListSearchFilterBar';
import Pagination from '../Pagination';
import { ArrowLeft, Envelope, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const WORK_STATUS_LABELS: Record<WorkStatus, string> = {
  not_started: 'Belum Dikerjakan',
  in_progress: 'Dikerjakan',
  done: 'Selesai',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unchecked: 'Belum Dicek',
  confirmed: 'Dikonfirmasi',
  rejected: 'Ditolak',
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Belum Diproses',
  processed: 'Sudah Jadi Website',
};

const PAGE_SIZE = 20;

function isSubmissionStatus(v: string): v is SubmissionStatus {
  return v === 'pending' || v === 'processed';
}

function isWorkStatus(v: string): v is WorkStatus {
  return v === 'not_started' || v === 'in_progress' || v === 'done';
}

function isPaymentStatus(v: string): v is PaymentStatus {
  return v === 'unchecked' || v === 'confirmed' || v === 'rejected';
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
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]">
        <main className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Inbox Submission</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">Masuk untuk melanjutkan.</p>
          <LoginForm token={token} />
        </main>
      </div>
    );
  }

  const sp = await searchParams;
  const search = sp.q ?? '';
  // 'pending' unless the operator explicitly asks for something else — an
  // already-processed submission (its site is live) has no reason to keep
  // showing up mixed in with ones still needing action; that's what was
  // making the list look like it had duplicate/stale entries.
  const status = sp.status && isSubmissionStatus(sp.status) ? sp.status : 'pending';
  const workStatus = sp.workStatus && isWorkStatus(sp.workStatus) ? sp.workStatus : undefined;
  const paymentStatus = sp.paymentStatus && isPaymentStatus(sp.paymentStatus) ? sp.paymentStatus : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  let submissions: Submission[] = [];
  let total = 0;
  let loadError: string | null = null;
  try {
    const result = await listSubmissionsPage({ search, status, workStatus, paymentStatus, page, pageSize: PAGE_SIZE });
    submissions = result.items;
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

        <h1 className="text-3xl font-semibold tracking-tight mb-1">Inbox Submission</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Data yang dikirim customer lewat form pemesanan publik.
        </p>

        <ListSearchFilterBar
          searchPlaceholder="Cari nama bisnis atau nomor WhatsApp..."
          filters={[
            {
              param: 'status',
              allLabel: 'Semua (termasuk yang sudah jadi)',
              defaultValue: 'pending',
              options: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
            },
            {
              param: 'workStatus',
              allLabel: 'Semua status pengerjaan',
              options: Object.entries(WORK_STATUS_LABELS).map(([value, label]) => ({ value, label })),
            },
            {
              param: 'paymentStatus',
              allLabel: 'Semua status pembayaran',
              options: Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
            },
          ]}
        />

        {loadError && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-6">{loadError}</p>
        )}

        {submissions.length === 0 && !loadError && (
          <p className="text-sm text-neutral-400">
            {search || workStatus || paymentStatus
              ? 'Tidak ada submission yang cocok.'
              : status === 'pending'
              ? 'Tidak ada submission yang belum diproses — cek filter "Semua" di atas untuk lihat yang sudah jadi website.'
              : 'Belum ada submission masuk.'}
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {submissions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/${token}/inbox/${s.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-4 sm:p-5 hover:border-amber-400 dark:hover:border-amber-600 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 shrink-0">
                    <Envelope size={16} weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.businessName}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                      <WhatsappLogo size={12} />
                      {s.whatsapp}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {typeof s.queueNumber === 'number' && (
                    <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-500">#{s.queueNumber}</span>
                  )}
                  <div className="flex items-center gap-1.5">
                    {s.status === 'processed' && (
                      <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400">
                        Website Jadi
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        s.workStatus === 'done'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : s.workStatus === 'in_progress'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                          : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {WORK_STATUS_LABELS[s.workStatus]}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        s.paymentStatus === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : s.paymentStatus === 'rejected'
                          ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                          : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[s.paymentStatus]}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath={`/${token}/inbox`} searchParams={sp} />
      </main>
    </div>
  );
}
