'use client';

import { CircleNotch } from '@phosphor-icons/react/dist/ssr';

export default function PesanLoading() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <CircleNotch size={32} weight="bold" className="text-white animate-spin" />
        <p className="text-sm font-medium text-zinc-400">Mempersiapkan formulir...</p>
      </div>
    </div>
  );
}
