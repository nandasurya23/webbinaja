'use client';

import { Storefront, Plus, Trash } from '@phosphor-icons/react/dist/ssr';
import { Section } from './CustomerFormPieces';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';

export type Service = { name: string; price: string; desc: string };
export const emptyService = (): Service => ({ name: '', price: '', desc: '' });

export default function ServicesEditor({
  services,
  setServices,
}: {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}) {
  const formatNumberDisplay = (val: string) => {
    if (!val) return '';
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    return parseInt(digits, 10).toLocaleString('id-ID');
  };

  return (
    <Section icon={<Storefront size={18} weight="bold" className="text-blue-500" />} title="Layanan">
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid md:grid-cols-[1fr_1fr_1.5fr_auto] gap-3 items-start p-4 rounded-xl border border-white/5 bg-zinc-900/30"
            >
              <Input
                placeholder="mis. Potong Rambut"
                value={s.name}
                onChange={(e) => setServices((prev) => prev.map((v, idx) => (idx === i ? { ...v, name: e.target.value } : v)))}
              />
              <Input
                placeholder="mis. 50000"
                value={formatNumberDisplay(s.price)}
                onChange={(e) => setServices((prev) => prev.map((v, idx) => (idx === i ? { ...v, price: e.target.value.replace(/\D/g, '') } : v)))}
              />
              <Input
                placeholder="Deskripsi (opsional)"
                value={s.desc}
                onChange={(e) => setServices((prev) => prev.map((v, idx) => (idx === i ? { ...v, desc: e.target.value } : v)))}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setServices((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                aria-label="Hapus layanan"
              >
                <Trash size={16} />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {services.length === 0 && (
          <div className="text-center p-6 border border-dashed border-white/10 rounded-xl text-sm text-zinc-500">
            Belum ada layanan. Klik &quot;Tambah layanan&quot; di bawah.
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setServices((prev) => [...prev, emptyService()])}
          className="self-start"
        >
          <Plus size={14} className="mr-1.5" />
          Tambah layanan
        </Button>
      </div>
    </Section>
  );
}
