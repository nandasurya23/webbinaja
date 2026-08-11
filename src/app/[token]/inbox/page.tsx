import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminToken, parseSession } from '@/lib/adminAuth';
import { listSubmissions, type Submission, type WorkStatus, type PaymentStatus } from '@/lib/db';
import LoginForm from '../LoginForm';
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

// Intentionally NO `if (NODE_ENV === 'production') notFound()` gate here —
// unlike the main admin page (../page.tsx), this route only READS from
// Neon, never writes to the filesystem, so it's safe (and meant) to run in
// production. See the plan notes in adminAuth.ts / actions.ts for why the
// main admin page can't do the same.
export default async function InboxPage({ params }: { params: Promise<{ token: string }> }) {
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

  let submissions: Submission[];
  let loadError: string | null = null;
  try {
    submissions = await listSubmissions();
  } catch {
    submissions = [];
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
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">
          Data yang dikirim customer lewat form pemesanan publik.
        </p>

        {loadError && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-6">{loadError}</p>
        )}

        {submissions.length === 0 && !loadError && (
          <p className="text-sm text-neutral-400">Belum ada submission masuk.</p>
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
      </main>
    </div>
  );
}
