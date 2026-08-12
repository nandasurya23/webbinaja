'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, WarningCircle, UserPlus } from '@phosphor-icons/react/dist/ssr';
import { registerAdminAction } from '../actions';
import type { AdminRole } from '@/lib/adminAuth';

const inputClass =
  'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';

export default function RegisterAdminForm({ token }: { token: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setResult(null);
          startTransition(async () => {
            const res = await registerAdminAction(token, { username, password, role });
            if (res.ok) {
              setResult({ ok: true, text: res.message ?? 'Berhasil dibuat.' });
              setUsername('');
              setPassword('');
              setRole('admin');
              router.refresh();
            } else {
              setResult({ ok: false, text: res.error });
            }
          });
        }}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
              placeholder="minimal 12 karakter"
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">Role</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-left ${
                role === 'admin' ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setRole('super_admin')}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-left ${
                role === 'super_admin' ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              Super Admin
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="self-start inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus size={16} weight="bold" />
          {isPending ? 'Membuat...' : 'Buat Akun Admin'}
        </button>

        {result && (
          <p className={`flex items-center gap-1.5 text-sm ${result.ok ? 'text-blue-700 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
            {result.ok ? <CheckCircle size={15} weight="fill" /> : <WarningCircle size={15} weight="fill" />}
            {result.text}
          </p>
        )}
      </form>
    </div>
  );
}
