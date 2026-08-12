'use client';

import { CircleNotch } from '@phosphor-icons/react/dist/ssr';
import { motion } from 'motion/react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-white/5 bg-zinc-950/60 shadow-xl backdrop-blur-sm"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <CircleNotch size={24} weight="bold" className="animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-semibold text-white tracking-wide">Menghubungkan ke Database...</p>
          <p className="text-xs text-zinc-500">Membangunkan server jika sedang idle (± 4 detik)</p>
        </div>
      </motion.div>
    </div>
  );
}
