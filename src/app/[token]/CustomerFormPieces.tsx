'use client';

import { useState, useTransition } from 'react';
import { CheckCircle, WarningCircle, Copy, Check, Spinner, LinkSimple } from '@phosphor-icons/react/dist/ssr';
import { updateCustomDomainAction } from './actions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export function Field({
  label,
  required,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled,
}: {
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-zinc-300">
        {label}
        {required && <span className="text-blue-500 ml-1">*</span>}
      </span>
      <Input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
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
    <section className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white">
          {icon}
          {title}
        </div>
        {hint && <span className="text-xs text-zinc-500">{hint}</span>}
      </div>
      <div className="flex flex-col gap-5">
        {children}
      </div>
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
      className="inline-flex items-center justify-center h-8 px-2 rounded-md bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition gap-1.5 text-xs font-medium"
    >
      {copied ? <Check size={14} weight="bold" className="text-blue-400" /> : <Copy size={14} />}
      {copied ? 'Tersalin' : label}
    </button>
  );
}

export function DomainManagerCard({ token }: { token: string }) {
  const [domainSlug, setDomainSlug] = useState('');
  const [domainValue, setDomainValue] = useState('');
  const [domainResult, setDomainResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSavingDomain, startDomainTransition] = useTransition();

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center gap-2 text-blue-400">
          <LinkSimple size={20} weight="bold" />
          <CardTitle className="text-white">Manajer Domain Customer</CardTitle>
        </div>
        <CardDescription>
          Atur domain kustom untuk customer. Masukkan slug dan domain (mis. namabisnis.com tanpa https://). Pastikan domain juga ditambahkan di Vercel dan DNS telah dikonfigurasi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Slug Customer" placeholder="cafe-siti" value={domainSlug} onChange={setDomainSlug} />
            <Field label="Domain Kustom" placeholder="namabisnis.com (kosongkan untuk menghapus)" value={domainValue} onChange={setDomainValue} />
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSavingDomain || !domainSlug}
              onClick={() => {
                setDomainResult(null);
                startDomainTransition(async () => {
                  const res = await updateCustomDomainAction(token, domainSlug.trim(), domainValue.trim());
                  setDomainResult(res.ok ? { ok: true, message: res.message ?? 'Success.' } : { ok: false, message: res.error });
                });
              }}
            >
              {isSavingDomain ? <Spinner size={16} className="animate-spin mr-2" /> : <LinkSimple size={16} className="mr-2" />}
              {isSavingDomain ? 'Menyimpan...' : 'Simpan Domain'}
            </Button>
            {domainResult && (
              <span className={`flex items-center gap-1.5 text-sm font-medium ${domainResult.ok ? 'text-blue-400' : 'text-red-400'}`}>
                {domainResult.ok ? <CheckCircle size={16} weight="fill" /> : <WarningCircle size={16} weight="fill" />}
                {domainResult.message}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
