'use client';

import { Storefront, Plus, Trash } from '@phosphor-icons/react/dist/ssr';
import { Section, smallInputClass } from './CustomerFormPieces';
import AssetUploadButton from './AssetUploadButton';
import { MAX_CATALOG_ITEMS } from '@/lib/customerLimits';

export type CatalogItem = { name: string; price: string; desc: string; image: string };
export const emptyCatalogItem = (): CatalogItem => ({ name: '', price: '', desc: '', image: '' });

export default function CatalogEditor({
  token,
  slug,
  catalog,
  setCatalog,
}: {
  token: string;
  slug: string;
  catalog: CatalogItem[];
  setCatalog: React.Dispatch<React.SetStateAction<CatalogItem[]>>;
}) {
  return (
    <Section icon={<Storefront size={16} />} title="Katalog" hint={`opsional · ${catalog.length}/${MAX_CATALOG_ITEMS}`}>
      <div className="flex flex-col gap-3">
        {catalog.map((c, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
            <input
              placeholder="Nama produk"
              value={c.name}
              onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, name: e.target.value } : v)))}
              className={smallInputClass}
            />
            <input
              placeholder="Harga"
              value={c.price}
              onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, price: e.target.value } : v)))}
              className={smallInputClass}
            />
            <div className="flex items-center gap-2">
              <input
                placeholder="Nama file gambar (produk-01.webp)"
                value={c.image}
                onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, image: e.target.value } : v)))}
                className={smallInputClass}
              />
              <AssetUploadButton
                token={token}
                slug={slug}
                kind="catalog"
                baseNameHint={c.image.replace(/\.[^.]+$/, '') || c.name || `produk-${i + 1}`}
                onUploaded={(filename) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, image: filename } : v)))}
              />
            </div>
            <input
              placeholder="Deskripsi (opsional)"
              value={c.desc}
              onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, desc: e.target.value } : v)))}
              className={smallInputClass}
            />
            <button
              type="button"
              onClick={() => setCatalog((prev) => prev.filter((_, idx) => idx !== i))}
              className="col-span-2 self-start inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
            >
              <Trash size={13} />
              Hapus item
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={catalog.length >= MAX_CATALOG_ITEMS}
          onClick={() => setCatalog((prev) => [...prev, emptyCatalogItem()])}
          className="self-start inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline disabled:no-underline disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={13} weight="bold" />
          {catalog.length >= MAX_CATALOG_ITEMS ? `Maksimal ${MAX_CATALOG_ITEMS} item` : 'Tambah item katalog'}
        </button>
      </div>
    </Section>
  );
}
