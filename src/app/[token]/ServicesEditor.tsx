'use client';

import { Storefront, Plus, Trash } from '@phosphor-icons/react/dist/ssr';
import { Section, smallInputClass } from './CustomerFormPieces';

export type Service = { name: string; price: string; desc: string };
export const emptyService = (): Service => ({ name: '', price: '', desc: '' });

export default function ServicesEditor({
  services,
  setServices,
}: {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}) {
  return (
    <Section icon={<Storefront size={16} />} title="Layanan">
      <div className="flex flex-col gap-3">
        {services.map((s, i) => (
          <div key={i} className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-start">
            <input
              placeholder="Nama layanan"
              value={s.name}
              onChange={(e) => setServices((prev) => prev.map((v, idx) => (idx === i ? { ...v, name: e.target.value } : v)))}
              className={smallInputClass}
            />
            <input
              placeholder="Harga (Rp 50.000)"
              value={s.price}
              onChange={(e) => setServices((prev) => prev.map((v, idx) => (idx === i ? { ...v, price: e.target.value } : v)))}
              className={smallInputClass}
            />
            <input
              placeholder="Deskripsi (opsional)"
              value={s.desc}
              onChange={(e) => setServices((prev) => prev.map((v, idx) => (idx === i ? { ...v, desc: e.target.value } : v)))}
              className={smallInputClass}
            />
            <button
              type="button"
              onClick={() => setServices((prev) => prev.filter((_, idx) => idx !== i))}
              className="text-neutral-400 hover:text-red-600 p-1.5 shrink-0"
              aria-label="Hapus layanan"
            >
              <Trash size={15} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setServices((prev) => [...prev, emptyService()])}
          className="self-start inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline"
        >
          <Plus size={13} weight="bold" />
          Tambah layanan
        </button>
      </div>
    </Section>
  );
}
