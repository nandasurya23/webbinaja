'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { WarningCircle, Spinner, Trash, Hourglass, CheckCircle } from '@phosphor-icons/react/dist/ssr';
import { deleteSubmissionAction } from '../../actions';
import type { SubmissionStatus } from '@/lib/db';

export default function StatusControls({
  token,
  submissionId,
  status,
  queueNumber,
}: {
  token: string;
  submissionId: string;
  status: SubmissionStatus;
  queueNumber: number | null;
}) {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!window.confirm('Hapus pesanan ini beserta semua gambarnya? Tindakan ini tidak bisa dibatalkan.')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteSubmissionAction(token, submissionId);
      if (res.ok) {
        router.push('/' + token + '/inbox');
        return;
      }
      setMessage({ ok: false, text: res.error });
    });
  }

  const done = status === 'processed';

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8 flex flex-col gap-5">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Status</h2>

      {typeof queueNumber === 'number' && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          Nomor antri: <strong className="font-mono">#{queueNumber}</strong> — sudah bisa disampaikan ke customer.
        </div>
      )}

      <div
        className={`inline-flex w-max items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${
          done
            ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400'
            : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
        }`}
      >
        {done ? <CheckCircle size={14} weight="fill" /> : <Hourglass size={14} weight="fill" />}
        {done ? 'Selesai' : 'Sedang Dikerjakan'}
      </div>
      <p className="text-xs text-neutral-500 -mt-2">
        {done
          ? 'Website customer sudah dibuat.'
          : 'Status ini berubah otomatis menjadi "Selesai" begitu Anda membuat website customer dari pesanan ini.'}
      </p>

      {isPending && (
        <p className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Spinner size={13} className="animate-spin" /> Menghapus...
        </p>
      )}
      {message && !isPending && (
        <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <WarningCircle size={13} weight="fill" />
          {message.text}
        </p>
      )}

      <div className="pt-3 mt-1 border-t border-neutral-200 dark:border-neutral-800">
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-900 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition disabled:opacity-50"
        >
          <Trash size={14} weight="bold" />
          Hapus Pesanan
        </button>
      </div>
    </section>
  );
}
