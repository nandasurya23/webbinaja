'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeSlash, ArrowRight, WarningCircle } from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';
import { loginAction } from './actions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';

export default function LoginForm({ token }: { token: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="w-full max-w-sm mx-auto"
    >
      <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-8 shadow-xl backdrop-blur-xl relative overflow-hidden">
        
        {/* Decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-zinc-900/50 mb-5 border border-white/5 overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Image src="/logos.png" alt="Logo" fill className="object-contain p-2" sizes="64px" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Admin Area</h2>
          <p className="text-sm text-zinc-400 mt-1">Masuk untuk melanjutkan</p>
        </div>

        <form
          className="flex flex-col gap-5 relative z-10"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            startTransition(async () => {
              const res = await loginAction(token, username, password);
              if (res.ok) {
                router.refresh();
              } else {
                setError(res.error);
              }
            });
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-300">Username</span>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              placeholder="Masukkan username"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-300">Password</span>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isPending}
            className="mt-2 group"
          >
            {isPending ? 'Memeriksa...' : 'Masuk'}
            {!isPending && <ArrowRight size={18} weight="bold" className="ml-1.5 transition-transform group-hover:translate-x-1" />}
          </Button>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }} 
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-sm font-medium text-red-400">
                  <WarningCircle size={18} weight="fill" className="shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </motion.div>
  );
}
