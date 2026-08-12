'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, WarningCircle, Spinner } from '@phosphor-icons/react/dist/ssr';
import { setSubmissionStatusAction } from '../../actions';
import type { WorkStatus, PaymentStatus } from '@/lib/db';

const WORK_OPTIONS: { value: WorkStatus; label: string }[] = [
  { value: 'not_started', label: 'Belum Dikerjakan' },
  { value: 'in_progress', label: 'Dikerjakan' },
  { value: 'done', label: 'Selesai' },
];

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'unchecked', label: 'Belum Dicek' },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'rejected', label: 'Ditolak' },
];

export default function StatusControls({
  token,
  submissionId,
  initialWorkStatus,
  initialPaymentStatus,
  initialQueueNumber,
}: {
  token: string;
  submissionId: string;
  initialWorkStatus: WorkStatus;
  initialPaymentStatus: PaymentStatus;
  initialQueueNumber: number | null;
}) {
  const [workStatus, setWorkStatus] = useState(initialWorkStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [queueNumber, setQueueNumber] = useState(initialQueueNumber);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function apply(patch: { workStatus?: WorkStatus; paymentStatus?: PaymentStatus }) {
    setMessage(null);
    startTransition(async () => {
      const res = await setSubmissionStatusAction(token, submissionId, patch);
      if (res.ok) {
        if (patch.workStatus) setWorkStatus(patch.workStatus);
        if (patch.paymentStatus) setPaymentStatus(patch.paymentStatus);
        setQueueNumber(res.queueNumber);
        setMessage({ ok: true, text: res.message });
        router.refresh();
      } else {
        setMessage({ ok: false, text: res.error });
      }
    });
  }

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8 flex flex-col gap-5">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Status</h2>

      {typeof queueNumber === 'number' && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          Nomor antri: <strong className="font-mono">#{queueNumber}</strong> — sudah bisa disampaikan ke customer.
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-neutral-500">Status Pengerjaan</span>
        <div className="flex flex-wrap gap-2">
          {WORK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={isPending}
              onClick={() => apply({ workStatus: opt.value })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                workStatus === opt.value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-neutral-500">Status Pembayaran</span>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={isPending}
              onClick={() => apply({ paymentStatus: opt.value })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                paymentStatus === opt.value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isPending && (
        <p className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Spinner size={13} className="animate-spin" /> Menyimpan...
        </p>
      )}
      {message && !isPending && (
        <p className={`flex items-center gap-1.5 text-xs ${message.ok ? 'text-blue-700 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
          {message.ok ? <CheckCircle size={13} weight="fill" /> : <WarningCircle size={13} weight="fill" />}
          {message.text}
        </p>
      )}
    </section>
  );
}
