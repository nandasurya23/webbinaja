'use client';

import { CheckCircle, SignOut, Plus, LinkSimple, Sparkle } from '@phosphor-icons/react/dist/ssr';
import { CopyButton, DomainManagerCard } from './CustomerFormPieces';
import type { CreateCustomerResult } from './actions';

type SuccessResult = Extract<CreateCustomerResult, { ok: true }>;

/** The "customer created" success view shown in place of the form after a successful submit — see CustomerForm's `result?.ok` branch. */
export default function CustomerCreatedPanel({
  token,
  result,
  isLoggingOut,
  onCreateAnother,
  onLogout,
}: {
  token: string;
  result: SuccessResult;
  isLoggingOut: boolean;
  onCreateAnother: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-6 sm:p-8">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 mb-5">
          <CheckCircle size={24} weight="fill" />
        </div>
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-1">Customer berhasil dibuat</h2>
        <p className="text-sm text-blue-800/80 dark:text-blue-300/80 mb-6">{result.message}</p>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700/80 dark:text-blue-400/80 mb-1.5">
              Link untuk customer (sudah aktif)
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-blue-300/70 dark:border-blue-800 bg-white dark:bg-neutral-950 px-3 py-2">
              <LinkSimple size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-sm font-mono truncate flex-1">{result.productionUrl}</span>
              <CopyButton text={result.productionUrl} />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700/80 dark:text-blue-400/80 mb-1.5">
              Preview lokal (npm run dev harus aktif)
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-blue-300/70 dark:border-blue-800 bg-white dark:bg-neutral-950 px-3 py-2">
              <LinkSimple size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <a href={result.localUrl} target="_blank" rel="noreferrer" className="text-sm font-mono truncate flex-1 hover:underline">
                {result.localUrl}
              </a>
              <CopyButton text={result.localUrl} />
            </div>
          </div>

          {result.localPromoUrl && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-700/80 dark:text-blue-400/80 mb-1.5">
                Kit Promosi Instan — preview lokal (npm run dev harus aktif)
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-blue-300/70 dark:border-blue-800 bg-white dark:bg-neutral-950 px-3 py-2">
                <Sparkle size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <a href={result.localPromoUrl} target="_blank" rel="noreferrer" className="text-sm font-mono truncate flex-1 hover:underline">
                  {result.localPromoUrl}
                </a>
                <CopyButton text={result.localPromoUrl} />
              </div>
            </div>
          )}

          {result.promoUrl && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-700/80 dark:text-blue-400/80 mb-1.5">
                Kit Promosi Instan — link production (sudah aktif)
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-blue-300/70 dark:border-blue-800 bg-white dark:bg-neutral-950 px-3 py-2">
                <Sparkle size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <a href={result.promoUrl} target="_blank" rel="noreferrer" className="text-sm font-mono truncate flex-1 hover:underline">
                  {result.promoUrl}
                </a>
                <CopyButton text={result.promoUrl} />
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onCreateAnother}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
      >
        <Plus size={16} weight="bold" />
        Buat customer lain
      </button>

      <DomainManagerCard token={token} />

      <button
        type="button"
        disabled={isLoggingOut}
        className="self-start inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-50"
        onClick={onLogout}
      >
        <SignOut size={14} />
        Keluar
      </button>
    </div>
  );
}
