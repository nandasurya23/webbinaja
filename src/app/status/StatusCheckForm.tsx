'use client';

import { useState, useTransition } from 'react';
import { WarningCircle, MagnifyingGlass, Hash, LinkSimple } from '@phosphor-icons/react/dist/ssr';
import { checkStatusAction, type CheckStatusResult } from './actions';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10 placeholder:text-zinc-500 text-white';

export default function StatusCheckForm() {
  const [whatsapp, setWhatsapp] = useState('');
  const [lookupCode, setLookupCode] = useState('');
  const [result, setResult] = useState<CheckStatusResult | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setResult(null);
          startTransition(async () => {
            setResult(await checkStatusAction(whatsapp, lookupCode));
          });
        }}
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-300">Nomor WhatsApp</span>
          <input placeholder="62812xxxxxxx" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} required />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-300">Kode</span>
          <input
            placeholder="XXXXXXXX"
            value={lookupCode}
            onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
            className={`${inputClass} font-mono tracking-widest`}
            required
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-black px-4 py-3 text-sm font-bold hover:bg-zinc-200 transition disabled:opacity-50"
        >
          <MagnifyingGlass size={16} weight="bold" />
          {isPending ? 'Mencari...' : 'Cek Status'}
        </button>
      </form>

      {result && !result.ok && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-red-400">
          <WarningCircle size={16} weight="fill" />
          {result.error}
        </p>
      )}

      {result?.ok && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white">{result.businessName}</h2>
          {typeof result.queueNumber === 'number' && (
            <p className="flex items-center gap-1.5 text-sm text-amber-400">
              <Hash size={14} weight="bold" />
              Nomor antri: <span className="font-mono font-bold">{result.queueNumber}</span>
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Pengerjaan</p>
              <p className="font-medium text-white">{result.workStatusLabel}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Pembayaran</p>
              <p className="font-medium text-white">{result.paymentStatusLabel}</p>
            </div>
          </div>

          {result.websiteUrl && (
            <a
              href={result.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition"
            >
              <LinkSimple size={16} weight="bold" />
              <span className="truncate">{result.websiteUrl}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
