'use client';

import { ShieldCheck, CheckCircle, WarningCircle, Spinner, ArrowClockwise } from '@phosphor-icons/react/dist/ssr';
import { Section } from './CustomerFormPieces';
import type { AssetCheckItem } from './actions';

export default function AssetCheckSection({
  slug,
  isChecking,
  onCheck,
  checkError,
  checkResults,
  assetsAreChecked,
}: {
  slug: string;
  isChecking: boolean;
  onCheck: () => void;
  checkError: string | null;
  checkResults: AssetCheckItem[] | null;
  assetsAreChecked: boolean;
}) {
  return (
    <Section icon={<ShieldCheck size={16} />} title="Cek Asset" hint="wajib sebelum membuat customer">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Cek apakah file logo, hero, galeri, dan gambar katalog sudah ter-upload ke CDN (
        <code className="text-xs">npm run assets:upload {slug || '<slug>'}</code>) sebelum website dibuat. Boleh tetap
        lanjut walau ada yang belum ada — cukup jalankan pengecekannya dulu.
      </p>

      <button
        type="button"
        onClick={onCheck}
        disabled={isChecking || !slug}
        className="self-start inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3.5 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isChecking ? <Spinner size={15} className="animate-spin" /> : <ArrowClockwise size={15} />}
        {isChecking ? 'Mengecek...' : 'Cek Asset Sekarang'}
      </button>

      {checkError && (
        <p className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
          <WarningCircle size={15} weight="fill" />
          {checkError}
        </p>
      )}

      {checkResults && checkResults.length > 0 && (
        <ul className="flex flex-col gap-1.5 text-sm">
          {checkResults.map((r, i) => (
            <li key={i} className="flex items-center gap-2">
              {r.ok ? (
                <CheckCircle size={15} weight="fill" className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <WarningCircle size={15} weight="fill" className="text-amber-600 dark:text-amber-500 shrink-0" />
              )}
              <span className="text-neutral-600 dark:text-neutral-300">{r.label}:</span>
              <span className="font-mono text-xs truncate">{r.filename}</span>
              <span className={`ml-auto text-xs ${r.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}`}>
                {r.ok ? `OK ${r.status ?? ''}` : r.error ?? `${r.status ?? 'gagal'}`}
              </span>
            </li>
          ))}
        </ul>
      )}

      {checkResults && checkResults.length === 0 && (
        <p className="text-sm text-neutral-400">Belum ada nama file asset untuk dicek.</p>
      )}

      {assetsAreChecked ? (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
          <CheckCircle size={14} weight="fill" />
          Sudah dicek untuk data saat ini.
        </p>
      ) : (
        <p className="text-xs text-neutral-400">Belum dicek untuk data saat ini — jalankan &quot;Cek Asset Sekarang&quot; dulu.</p>
      )}
    </Section>
  );
}
