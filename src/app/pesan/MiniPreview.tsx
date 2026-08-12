'use client';

import { Image as ImageIcon } from '@phosphor-icons/react/dist/ssr';
import { getSubmissionAssetUrl } from '@/lib/assets';
import type { ThemePalette } from '@/lib/themePalettes';

// Deliberately NOT the real template — a generic recolored mockup so
// customers get instant, always-visible feedback on their palette choice
// without paying the cost (motion/react, next/image, full markup) of
// mounting an actual template component on the public order form. Plain
// <img> instead of next/image since these are optional low-stakes preview
// thumbnails, not the real site.
export default function MiniPreview({
  submissionId,
  businessName,
  tagline,
  logo,
  hero,
  palette,
}: {
  submissionId: string;
  businessName: string;
  tagline: string;
  logo: string;
  hero: string;
  palette: ThemePalette;
}) {
  const logoUrl = logo ? getSubmissionAssetUrl(submissionId, logo) : undefined;
  const heroUrl = hero ? getSubmissionAssetUrl(submissionId, hero) : undefined;

  return (
    <div
      className="rounded-xl overflow-hidden border border-white/10"
      style={{ backgroundColor: palette.primaryColor }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: `${palette.secondaryColor}22` }}
      >
        <div className="flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-6 w-6 rounded object-contain" />
          ) : (
            <div className="h-6 w-6 rounded flex items-center justify-center" style={{ backgroundColor: `${palette.secondaryColor}22` }}>
              <ImageIcon size={14} style={{ color: palette.secondaryColor }} />
            </div>
          )}
          <span className="text-sm font-semibold tracking-wide" style={{ color: palette.secondaryColor }}>
            {businessName || 'Nama Bisnis Anda'}
          </span>
        </div>
        <span
          className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border"
          style={{ color: palette.accentColor, borderColor: `${palette.accentColor}55` }}
        >
          Menu
        </span>
      </div>

      <div className="relative h-32 flex items-center justify-center overflow-hidden">
        {heroUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: `${palette.secondaryColor}0d` }} />
        )}
        <p className="relative text-center text-xs px-6" style={{ color: palette.secondaryColor }}>
          {tagline || 'Tagline bisnis Anda akan tampil di sini'}
        </p>
      </div>

      <div className="px-4 py-3 flex items-center justify-center">
        <span
          className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full"
          style={{ backgroundColor: palette.accentColor, color: palette.primaryColor }}
        >
          Hubungi Kami
        </span>
      </div>
    </div>
  );
}
