'use client';

import { useState, useTransition } from 'react';
import { WarningCircle, MagnifyingGlass, Hash, LinkSimple, CheckCircle, Clock } from '@phosphor-icons/react/dist/ssr';
import { checkStatusAction, type CheckStatusResult } from './actions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';

export default function StatusCheckForm() {
  const [whatsapp, setWhatsapp] = useState('');
  const [lookupCode, setLookupCode] = useState('');
  const [result, setResult] = useState<CheckStatusResult | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 w-full max-w-md mx-auto">
      <form
        className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-zinc-950/60 p-6 shadow-xl backdrop-blur-xl"
        onSubmit={(e) => {
          e.preventDefault();
          setResult(null);
          startTransition(async () => {
            setResult(await checkStatusAction(whatsapp, lookupCode));
          });
        }}
      >
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Cek Status</h1>
          <p className="text-sm text-zinc-400 mt-1">Lacak progres pesanan Anda</p>
        </div>
        
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-300">Nomor WhatsApp</span>
          <Input 
            placeholder="e.g. 62812xxxxxxx" 
            value={whatsapp} 
            onChange={(e) => setWhatsapp(e.target.value)} 
            required 
          />
        </label>
        
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-300">Kode Pesanan</span>
          <Input
            placeholder="XXXXXXXX"
            value={lookupCode}
            onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
            className="font-mono tracking-widest text-lg"
            required
          />
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="mt-2"
        >
          {isPending ? (
            <><MagnifyingGlass size={18} className="animate-pulse mr-2" /> Mencari...</>
          ) : (
            <><MagnifyingGlass size={18} weight="bold" className="mr-2" /> Cek Status</>
          )}
        </Button>
      </form>

      <AnimatePresence>
        {result && !result.ok && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-sm font-medium text-red-400">
              <WarningCircle size={20} weight="fill" className="shrink-0" />
              {result.error}
            </div>
          </motion.div>
        )}

        {result?.ok && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-blue-500/20 bg-blue-950/30 p-6 flex flex-col gap-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{result.businessName}</h2>
                <p className="text-sm text-zinc-400 mt-1">Pembaruan Status</p>
              </div>
              {typeof result.queueNumber === 'number' && (
                <div className="flex flex-col items-end">
                  <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Antrean</span>
                  <div className="flex items-center gap-1.5 text-blue-400 mt-0.5">
                    <Hash size={16} weight="bold" />
                    <span className="font-mono text-xl font-bold">{result.queueNumber}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-white/5 bg-zinc-900/50">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                {result.statusLabel === 'Selesai' ? <CheckCircle size={14} /> : <Clock size={14} />} Status Pesanan
              </p>
              <p className="font-medium text-white">{result.statusLabel}</p>
            </div>

            {result.websiteUrl && (
              <a
                href={result.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 text-white px-4 py-3 text-sm font-bold hover:bg-blue-400 transition"
              >
                <LinkSimple size={18} weight="bold" />
                Kunjungi Website
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
