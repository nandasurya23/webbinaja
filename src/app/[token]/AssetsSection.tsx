'use client';

import { Images, Plus, Trash } from '@phosphor-icons/react/dist/ssr';
import { Section, Field } from './CustomerFormPieces';
import AssetUploadButton from './AssetUploadButton';
import { MAX_GALLERY_PHOTOS } from '@/lib/customerLimits';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { getSubmissionAssetUrl, getCustomerAssetUrl } from '@/lib/assets';

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
  submissionId,
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
  submissionId?: string | null;
}) {
  function getPreviewUrl(filename: string) {
    if (!filename) return null;
    if (submissionId) return getSubmissionAssetUrl(submissionId, filename);
    if (slug) return getCustomerAssetUrl(slug, filename);
    return null;
  }

  return (
    <Section icon={<Images size={18} weight="bold" className="text-blue-500" />} title="Galeri & Asset" hint={`cdn.webbinaja.com/${slug || '<slug>'}/...`}>
      <p className="text-sm text-zinc-400">
        Klik <strong>Upload</strong> untuk pilih foto PNG/JPG langsung dari komputer — otomatis dikonversi ke WebP
        (diresize & dikompres) dan diunggah ke folder <code className="text-xs">{slug || '<slug>'}</code> di R2, tanpa
        perlu convert manual. Atau isi nama file manual kalau sudah pernah diunggah sebelumnya. Maks 20MB per foto
        (otomatis dikompres di bawah 1.5MB) — galeri maks {MAX_GALLERY_PHOTOS} foto.
      </p>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field label="Logo (nama file)" placeholder="logo.webp" value={logo} onChange={setLogo} />
            </div>
            <div className="shrink-0 mb-1">
              <AssetUploadButton token={token} slug={slug} kind="logo" baseNameHint="logo" onUploaded={setLogo} />
            </div>
          </div>
          {getPreviewUrl(logo) && (
            <img src={getPreviewUrl(logo)!} alt="Logo Preview" className="h-20 w-auto object-contain rounded-lg border border-white/5 bg-zinc-900/50 p-2" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field label="Hero (nama file)" placeholder="hero.webp" value={hero} onChange={setHero} />
            </div>
            <div className="shrink-0 mb-1">
              <AssetUploadButton token={token} slug={slug} kind="hero" baseNameHint="hero" onUploaded={setHero} />
            </div>
          </div>
          {getPreviewUrl(hero) && (
            <img src={getPreviewUrl(hero)!} alt="Hero Preview" className="h-32 w-full object-cover rounded-lg border border-white/5 bg-zinc-900/50" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field label="Ambiance (opsional)" placeholder="ambiance.webp" value={ambiance} onChange={setAmbiance} />
            </div>
            <div className="shrink-0 mb-1">
              <AssetUploadButton token={token} slug={slug} kind="ambiance" baseNameHint="ambiance" onUploaded={setAmbiance} />
            </div>
          </div>
          {getPreviewUrl(ambiance) && (
            <img src={getPreviewUrl(ambiance)!} alt="Ambiance Preview" className="h-32 w-full object-cover rounded-lg border border-white/5 bg-zinc-900/50" />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4 p-5 rounded-xl border border-white/5 bg-zinc-900/30">
        <div>
          <h3 className="text-sm font-medium text-white">Foto galeri (nama file)</h3>
          <p className="text-xs text-zinc-500 mt-1">({gallery.length}/{MAX_GALLERY_PHOTOS})</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {gallery.map((g, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-2 overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      value={g}
                      placeholder={`gallery-0${i + 1}.webp`}
                      onChange={(e) => setGallery((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                    />
                  </div>
                  <div className="shrink-0">
                    <AssetUploadButton
                      token={token}
                      slug={slug}
                      kind="gallery"
                      baseNameHint={g.replace(/\.[^.]+$/, '') || `gallery-${String(i + 1).padStart(2, '0')}`}
                      onUploaded={(filename) => setGallery((prev) => prev.map((v, idx) => (idx === i ? filename : v)))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                    aria-label="Hapus foto galeri"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
                {getPreviewUrl(g) && (
                  <img src={getPreviewUrl(g)!} alt={`Gallery ${i + 1} Preview`} className="h-24 w-auto object-cover rounded-lg border border-white/5 bg-zinc-900/50" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={gallery.length >= MAX_GALLERY_PHOTOS}
          onClick={() => setGallery((prev) => [...prev, `gallery-${String(prev.length + 1).padStart(2, '0')}.webp`])}
          className="self-start mt-2"
        >
          <Plus size={14} className="mr-1.5" />
          {gallery.length >= MAX_GALLERY_PHOTOS ? `Maksimal ${MAX_GALLERY_PHOTOS} foto` : 'Tambah foto galeri'}
        </Button>
      </div>
    </Section>
  );
}
