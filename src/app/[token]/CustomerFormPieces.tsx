'use client';

// Small, state-independent (or self-contained) pieces shared across
// CustomerForm's fields and its "customer created" panel. Split out purely
// to keep CustomerForm.tsx focused on the form's own state/submit flow —
// no behavior changes from when these lived inline in that file.
import { useState, useTransition } from 'react';
import { CheckCircle, WarningCircle, Copy, Check, Spinner, LinkSimple } from '@phosphor-icons/react/dist/ssr';
import { updateCustomDomainAction } from './actions';

export const inputClass =
  'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 placeholder:text-neutral-400';
export const smallInputClass =
  'w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2.5 py-1.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 placeholder:text-neutral-400';

export function Field({
  label,
  required,
  type = 'text',
  placeholder,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-neutral-700 dark:text-neutral-300">
        {label}
        {required && <span className="text-amber-600 dark:text-amber-500"> *</span>}
      </span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

export function Section({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          {icon}
          {title}
        </div>
        {hint && <span className="text-xs text-neutral-400 dark:text-neutral-500">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

export function CopyButton({ text, label = 'Salin' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
    >
      {copied ? <Check size={13} weight="bold" /> : <Copy size={13} />}
      {copied ? 'Disalin' : label}
    </button>
  );
}

export function DomainManagerCard({ token }: { token: string }) {
  const [domainSlug, setDomainSlug] = useState('');
  const [domainValue, setDomainValue] = useState('');
  const [domainResult, setDomainResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSavingDomain, startDomainTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8">
      <Section
        icon={<LinkSimple size={16} />}
        title="Atur Domain Customer"
        hint="untuk customer yang sudah ada"
      >
        <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-1">
          Dipakai kalau customer Business Kit baru beli domain sendiri setelah situsnya sudah jadi. Isi slug
          customer dan domainnya (contoh: <code className="text-xs">namabisnis.com</code>, tanpa
          <code className="text-xs"> https://</code>), lalu jangan lupa tambahkan domain yang sama di Vercel →
          Domains dan arahkan DNS-nya di registrar.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Slug customer" placeholder="cafe-siti" value={domainSlug} onChange={setDomainSlug} />
          <Field label="Custom domain" placeholder="namabisnis.com (kosongkan untuk hapus)" value={domainValue} onChange={setDomainValue} />
        </div>
        <button
          type="button"
          disabled={isSavingDomain || !domainSlug}
          onClick={() => {
            setDomainResult(null);
            startDomainTransition(async () => {
              const res = await updateCustomDomainAction(token, domainSlug.trim(), domainValue.trim());
              setDomainResult(res.ok ? { ok: true, message: res.message ?? 'Berhasil.' } : { ok: false, message: res.error });
            });
          }}
          className="self-start inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3.5 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSavingDomain ? <Spinner size={15} className="animate-spin" /> : <LinkSimple size={15} />}
          {isSavingDomain ? 'Menyimpan...' : 'Simpan Domain'}
        </button>
        {domainResult && (
          <p className={`flex items-center gap-1.5 text-sm ${domainResult.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {domainResult.ok ? <CheckCircle size={15} weight="fill" /> : <WarningCircle size={15} weight="fill" />}
            {domainResult.message}
          </p>
        )}
      </Section>
    </div>
  );
}
