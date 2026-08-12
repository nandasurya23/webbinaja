'use client';

import { Storefront, Plus, Trash } from '@phosphor-icons/react/dist/ssr';
import { Section } from './CustomerFormPieces';
import AssetUploadButton from './AssetUploadButton';
import { MAX_CATALOG_ITEMS } from '@/lib/customerLimits';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { getSubmissionAssetUrl, getCustomerAssetUrl } from '@/lib/assets';

export type CatalogItem = { name: string; price: string; desc: string; image: string };
export const emptyCatalogItem = (): CatalogItem => ({ name: '', price: '', desc: '', image: '' });

export default function CatalogEditor({
  token,
  slug,
  catalog,
  setCatalog,
  submissionId,
}: {
  token: string;
  slug: string;
  catalog: CatalogItem[];
  setCatalog: React.Dispatch<React.SetStateAction<CatalogItem[]>>;
  submissionId?: string | null;
}) {
  function getPreviewUrl(filename: string) {
    if (!filename) return null;
    if (submissionId) return getSubmissionAssetUrl(submissionId, filename);
    if (slug) return getCustomerAssetUrl(slug, filename);
    return null;
  }

  const formatNumberDisplay = (val: string) => {
    if (!val) return '';
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    return parseInt(digits, 10).toLocaleString('id-ID');
  };

  return (
    <Section icon={<Storefront size={18} weight="bold" className="text-blue-500" />} title="Katalog" hint={`opsional · ${catalog.length}/${MAX_CATALOG_ITEMS}`}>
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {catalog.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid sm:grid-cols-2 gap-4 rounded-xl border border-white/5 bg-zinc-900/30 p-4"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-400">Nama Produk</span>
                <Input
                  placeholder="mis. Baju Muslim"
                  value={c.name}
                  onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, name: e.target.value } : v)))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-400">Harga</span>
                <Input
                  placeholder="mis. 150000"
                  value={formatNumberDisplay(c.price)}
                  onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, price: e.target.value.replace(/\D/g, '') } : v)))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-400">Gambar Produk</span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Nama file (produk-01.webp)"
                      value={c.image}
                      onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, image: e.target.value } : v)))}
                    />
                    <div className="shrink-0">
                      <AssetUploadButton
                        token={token}
                        slug={slug}
                        kind="catalog"
                        baseNameHint={c.image.replace(/\.[^.]+$/, '') || c.name || `produk-${i + 1}`}
                        onUploaded={(filename) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, image: filename } : v)))}
                      />
                    </div>
                  </div>
                  {getPreviewUrl(c.image) && (
                    <img src={getPreviewUrl(c.image)!} alt={`Catalog ${i + 1} Preview`} className="h-16 w-16 object-cover rounded-lg border border-white/5 bg-zinc-900/50" />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-400">Deskripsi (opsional)</span>
                <Input
                  placeholder="Penjelasan singkat"
                  value={c.desc}
                  onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, desc: e.target.value } : v)))}
                />
              </div>
              <div className="col-span-1 sm:col-span-2 flex justify-end mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCatalog((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash size={14} className="mr-1.5" />
                  Hapus Item
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {catalog.length === 0 && (
          <div className="text-center p-6 border border-dashed border-white/10 rounded-xl text-sm text-zinc-500">
            Katalog kosong. Klik &quot;Tambah item katalog&quot; untuk menambahkan produk.
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={catalog.length >= MAX_CATALOG_ITEMS}
          onClick={() => setCatalog((prev) => [...prev, emptyCatalogItem()])}
          className="self-start"
        >
          <Plus size={14} className="mr-1.5" />
          {catalog.length >= MAX_CATALOG_ITEMS ? `Maksimal ${MAX_CATALOG_ITEMS} item` : 'Tambah item katalog'}
        </Button>
      </div>
    </Section>
  );
}
