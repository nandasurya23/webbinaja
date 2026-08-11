'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Prohibit, ArrowCounterClockwise } from '@phosphor-icons/react/dist/ssr';
import { toggleCustomerSuspendedAction } from '../actions';

export default function SuspendToggle({ token, slug, suspended }: { token: string; slug: string; suspended: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    setError(null);
    startTransition(async () => {
      const res = await toggleCustomerSuspendedAction(token, slug, !suspended);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
          suspended
            ? 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            : 'border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
        }`}
      >
        {suspended ? <ArrowCounterClockwise size={13} /> : <Prohibit size={13} />}
        {isPending ? 'Memproses...' : suspended ? 'Aktifkan' : 'Suspend'}
      </button>
      {error && <span className="text-[11px] text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}
