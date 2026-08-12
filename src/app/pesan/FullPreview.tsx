'use client';

import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { X } from '@phosphor-icons/react/dist/ssr';
import { getSubmissionAssetUrl } from '@/lib/assets';
import type { CustomerConfig } from '@/types/config';
import type { ThemePalette } from '@/lib/themePalettes';

// Loaded on demand only (see OrderForm.tsx's `dynamic(..., { ssr: false })`
// import of this file) — never part of the public order form's initial
// bundle. Only the one template the customer picked is fetched, same
// per-template code-splitting pattern as src/app/sites/[customer]/page.tsx.
const TEMPLATES = {
  barber: dynamic(() => import('@/templates/BarberTemplate').then((m) => m.BarberTemplate)),
  restaurant: dynamic(() => import('@/templates/RestaurantTemplate').then((m) => m.RestaurantTemplate)),
  professional: dynamic(() => import('@/templates/ProfessionalTemplate').then((m) => m.ProfessionalTemplate)),
  bakery: dynamic(() => import('@/templates/BakeryTemplate').then((m) => m.BakeryTemplate)),
  rental: dynamic(() => import('@/templates/RentalTemplate').then((m) => m.RentalTemplate)),
  gamecafe: dynamic(() => import('@/templates/GameCafeTemplate').then((m) => m.GameCafeTemplate)),
  gym: dynamic(() => import('@/templates/GymTemplate').then((m) => m.GymTemplate)),
  petshop: dynamic(() => import('@/templates/PetshopTemplate').then((m) => m.PetshopTemplate)),
} as const;

interface Service { name: string; price: string; desc: string }
interface CatalogItem { name: string; price: string; desc: string; image: string }

export default function FullPreview({
  template,
  submissionId,
  businessName,
  tagline,
  description,
  whatsapp,
  address,
  mapsLink,
  instagram,
  facebook,
  tiktok,
  marketplace,
  openingHours,
  hero,
  ambiance,
  gallery,
  services,
  catalog,
  palette,
  onClose,
}: {
  template: string;
  submissionId: string;
  businessName: string;
  tagline: string;
  description: string;
  whatsapp: string;
  address: string;
  mapsLink: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  marketplace: string;
  openingHours: string;
  hero: string;
  ambiance: string;
  gallery: string[];
  services: Service[];
  catalog: CatalogItem[];
  palette: ThemePalette;
  onClose: () => void;
}) {
  const Template = TEMPLATES[template as keyof typeof TEMPLATES];
  if (!Template) return null;

  const resolve = (filename: string) => (filename ? getSubmissionAssetUrl(submissionId, filename) : undefined);

  const config: CustomerConfig = {
    package: 'basic',
    businessName: businessName || 'Nama Bisnis Anda',
    tagline: tagline || 'Tagline bisnis Anda',
    description: description || '',
    template: template as CustomerConfig['template'],
    theme: {
      primaryColor: palette.primaryColor,
      secondaryColor: palette.secondaryColor,
      accentColor: palette.accentColor,
    },
    contact: {
      whatsapp: whatsapp || '62800000000',
      address: address || '',
      mapsLink: mapsLink || '',
      instagram: instagram || undefined,
      facebook: facebook || undefined,
      tiktok: tiktok || undefined,
      marketplace: marketplace || undefined,
    },
    business: openingHours ? { openingHours: [openingHours] } : undefined,
    services: services.filter((s) => s.name && s.price),
    catalog: catalog.filter((c) => c.name && c.price).map((c) => ({ ...c, image: resolve(c.image) || '' })),
    images: {
      hero: resolve(hero),
      gallery: gallery.map(resolve).filter((u): u is string => Boolean(u)),
      ambiance: resolve(ambiance),
    },
  };

  // Rendered via portal straight into <body> — OrderForm's tree has several
  // `motion.div` ancestors, and framer/motion animates via CSS `transform`,
  // which creates a new containing block for any `position: fixed`
  // descendant (a standard CSS behavior, not a bug in motion). Without the
  // portal this overlay would be positioned relative to that ancestor
  // instead of the viewport, showing as a small transparent patch instead
  // of covering the screen.
  // Fully opaque background (no alpha) on purpose: at 90-97% opacity, the
  // long form's high-contrast white text still faintly shows through —
  // correct CSS behavior, but reads as a rendering glitch on this overlay.
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050505]">
      {/* `relative z-[60]`: without its own stacking context, this static
          toolbar would sit below any `position: fixed` descendant that has
          a z-index (every template's own internal nav is `fixed top-0
          z-50`), regardless of DOM order — since static content stacks at
          the base layer, under any positioned element with z-index >= 0. */}
      <div className="relative z-60 flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-white/10 shrink-0">
        <span className="text-sm font-medium text-zinc-300">Preview Template Asli — data sesuai yang sudah Anda isi</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition"
        >
          <X size={14} weight="bold" /> Tutup
        </button>
      </div>
      {/* Templates render color via Tailwind's bg-primary/text-secondary/
          text-accent, which resolve against these CSS custom properties —
          same mechanism as src/app/sites/[customer]/page.tsx. Without this
          wrapper the template renders with undefined --primary etc., so
          the chosen palette never visibly applies. */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          '--primary': palette.primaryColor,
          '--secondary': palette.secondaryColor,
          '--accent': palette.accentColor,
        } as React.CSSProperties}
      >
        <Template config={config} />
      </div>
    </div>,
    document.body
  );
}
