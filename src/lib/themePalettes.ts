import { contrastRatio, CONTRAST_WARNING } from './colorContrast';

// Curated theme choices for the public /pesan order form. Every template
// (src/templates/*.tsx) renders text via `text-secondary`/`text-accent` on
// top of a full-page `bg-primary` background, so any combo offered here
// must stay readable across all 8 templates — customers pick from this list
// instead of a free color wheel so they can't accidentally pick a
// combination that breaks the site (see src/lib/colorContrast.ts, added
// after a bright pink primaryColor was found to make a template unreadable).
export interface ThemePalette {
  id: string;
  label: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export const THEME_PALETTES: ThemePalette[] = [
  { id: 'classic', label: 'Klasik Hitam-Emas', primaryColor: '#000000', secondaryColor: '#ffffff', accentColor: '#f59e0b' },
  { id: 'midnight', label: 'Biru Malam', primaryColor: '#0f172a', secondaryColor: '#f1f5f9', accentColor: '#38bdf8' },
  { id: 'forest', label: 'Hijau Hutan', primaryColor: '#0f1f13', secondaryColor: '#f0fdf4', accentColor: '#4ade80' },
  { id: 'wine', label: 'Merah Marun', primaryColor: '#1f0a0e', secondaryColor: '#fdf2f4', accentColor: '#f43f5e' },
  { id: 'espresso', label: 'Cokelat Espresso', primaryColor: '#1c1310', secondaryColor: '#faf6f1', accentColor: '#d97706' },
  { id: 'plum', label: 'Ungu Plum', primaryColor: '#170a1f', secondaryColor: '#f5f0fa', accentColor: '#a855f7' },
  { id: 'slate', label: 'Abu Elegan', primaryColor: '#18181b', secondaryColor: '#fafafa', accentColor: '#22d3ee' },
  { id: 'terracotta', label: 'Terracotta Hangat', primaryColor: '#1f1108', secondaryColor: '#fef7ed', accentColor: '#fb923c' },
];

export function findThemePalette(id: string): ThemePalette | undefined {
  return THEME_PALETTES.find((p) => p.id === id);
}

// Dev-time guard, not a runtime check: fails fast (at import time, in any
// environment — including build) if someone adds a palette that doesn't
// actually meet the bar this feature exists to enforce.
for (const p of THEME_PALETTES) {
  const secondary = contrastRatio(p.primaryColor, p.secondaryColor);
  const accent = contrastRatio(p.primaryColor, p.accentColor);
  if ((secondary ?? 0) < CONTRAST_WARNING || (accent ?? 0) < CONTRAST_WARNING) {
    throw new Error(`themePalettes: palette "${p.id}" fails the minimum contrast bar (secondary=${secondary}, accent=${accent})`);
  }
}
