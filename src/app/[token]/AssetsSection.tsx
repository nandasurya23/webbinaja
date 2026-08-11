'use client';

import { Images, Plus, Trash } from '@phosphor-icons/react/dist/ssr';
import { Section, Field, smallInputClass } from './CustomerFormPieces';
import AssetUploadButton from './AssetUploadButton';
import { MAX_GALLERY_PHOTOS } from '@/lib/customerLimits';

/** Logo/hero/ambiance/gallery fields of CustomerForm — extracted as-is, same props (state + setters) the form already held. */
export default function AssetsSection({
  token,
  slug,
  logo,
  setLogo,
  hero,
  setHero,
  ambiance,
  setAmbiance,
  gallery,
  setGallery,
}: {
  token: string;
  slug: string;
  logo: string;
  setLogo: (v: string) => void;
  hero: string;
  setHero: (v: string) => void;
  ambiance: string;
  setAmbiance: (v: string) => void;
  gallery: string[];
  setGallery: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <Section icon={<Images size={16} />} title="Galeri & Asset" hint={`cdn.webbinaja.com/${slug || '<slug>'}/...`}>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-1">
        Klik <strong>Upload</strong> untuk pilih foto PNG/JPG langsung dari komputer — otomatis dikonversi ke WebP
        (diresize & dikompres) dan diunggah ke folder <code className="text-xs">{slug || '<slug>'}</code> di R2, tanpa
        perlu convert manual. Atau isi nama file manual kalau sudah pernah diunggah sebelumnya. Maks 20MB per foto
        (otomatis dikompres di bawah 1.5MB) — galeri maks {MAX_GALLERY_PHOTOS} foto.
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="Logo (nama file)" placeholder="logo.webp" value={logo} onChange={setLogo} />
          </div>
          <AssetUploadButton token={token} slug={slug} kind="logo" baseNameHint="logo" onUploaded={setLogo} />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="Hero (nama file)" placeholder="hero.webp" value={hero} onChange={setHero} />
          </div>
          <AssetUploadButton token={token} slug={slug} kind="hero" baseNameHint="hero" onUploaded={setHero} />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="Ambiance (opsional)" placeholder="ambiance.webp" value={ambiance} onChange={setAmbiance} />
          </div>
          <AssetUploadButton token={token} slug={slug} kind="ambiance" baseNameHint="ambiance" onUploaded={setAmbiance} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Foto galeri (nama file)
          <span className="ml-1.5 font-normal text-neutral-400">
            ({gallery.length}/{MAX_GALLERY_PHOTOS})
          </span>
        </span>
        {gallery.map((g, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={g}
              placeholder={`gallery-0${i + 1}.webp`}
              onChange={(e) => setGallery((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
              className={smallInputClass}
            />
            <AssetUploadButton
              token={token}
              slug={slug}
              kind="gallery"
              baseNameHint={g.replace(/\.[^.]+$/, '') || `gallery-${String(i + 1).padStart(2, '0')}`}
              onUploaded={(filename) => setGallery((prev) => prev.map((v, idx) => (idx === i ? filename : v)))}
            />
            <button
              type="button"
              onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
              className="text-neutral-400 hover:text-red-600 p-1.5 shrink-0"
              aria-label="Hapus foto galeri"
            >
              <Trash size={15} />
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={gallery.length >= MAX_GALLERY_PHOTOS}
          onClick={() => setGallery((prev) => [...prev, `gallery-${String(prev.length + 1).padStart(2, '0')}.webp`])}
          className="self-start inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline disabled:no-underline disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={13} weight="bold" />
          {gallery.length >= MAX_GALLERY_PHOTOS ? `Maksimal ${MAX_GALLERY_PHOTOS} foto` : 'Tambah foto galeri'}
        </button>
      </div>
    </Section>
  );
}
