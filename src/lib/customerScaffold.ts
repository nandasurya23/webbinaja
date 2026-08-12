// Shared customer config generator used by both the CLI scaffolder
// (scripts/customer/new.ts) and the local admin UI (src/app/[token]).
// Writes exactly one file: src/customers/<slug>/config.ts.
import fs from 'node:fs';
import path from 'node:path';

export { CUSTOMER_TEMPLATES, isKnownTemplate } from './customerTemplates';
export type { CustomerTemplate } from './customerTemplates';
export { MAX_GALLERY_PHOTOS, MAX_CATALOG_ITEMS } from './customerLimits';
import { MAX_GALLERY_PHOTOS, MAX_CATALOG_ITEMS } from './customerLimits';

export interface ServiceInput {
  name: string;
  price: string;
  desc?: string;
}

export interface CatalogItemInput {
  name: string;
  price: string;
  desc?: string;
  image: string;
}

export interface CustomerAssetsInput {
  logo?: string;
  hero?: string;
  gallery?: string[];
  ambiance?: string;
}

export type PackageTier = 'basic' | 'business';

export interface NewCustomerFields {
  slug: string;
  businessName: string;
  template: string;
  tagline: string;
  description: string;
  whatsapp: string;
  address: string;
  mapsLink: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  marketplace: string;
  assets?: CustomerAssetsInput;
  services?: ServiceInput[];
  catalog?: CatalogItemInput[];
  /** Defaults to 'basic' — only 'business' unlocks the /promo image route. */
  packageTier?: PackageTier;
  /** Bare hostname, e.g. "kliniksehat.com" — no protocol, no "www.". */
  customDomain?: string;
}

function tsString(value: string): string {
  return JSON.stringify(value);
}

export function buildConfigTs(fields: NewCustomerFields): string {
  const { slug, businessName, template, tagline, description, whatsapp, address, mapsLink, instagram, facebook, tiktok, marketplace } = fields;
  const packageTier = fields.packageTier ?? 'basic';

  const logo = fields.assets?.logo || 'logo.webp';
  const hero = fields.assets?.hero || 'hero.webp';
  const gallery = fields.assets?.gallery?.length ? fields.assets.gallery : ['gallery-01.webp'];
  const ambiance = fields.assets?.ambiance;

  const services = fields.services ?? [];
  const catalog = fields.catalog ?? [];

  const servicesTs = services.length
    ? services
        .map(
          (s) =>
            `    { name: ${tsString(s.name)}, price: ${tsString(s.price)}${s.desc ? `, desc: ${tsString(s.desc)}` : ''} },`
        )
        .join('\n')
    : `    // TODO: isi layanan/produk, contoh:\n    // { name: 'Nama Layanan', price: 'Rp 50.000' },`;

  const catalogBlock = catalog.length
    ? `\n  catalog: [\n${catalog
        .map(
          (c) =>
            `    { name: ${tsString(c.name)}, price: ${tsString(c.price)}${c.desc ? `, desc: ${tsString(c.desc)}` : ''}, image: ${tsString(c.image)} },`
        )
        .join('\n')}\n  ],`
    : '';

  const galleryTs = gallery.map((g) => tsString(g)).join(', ');

  return `import { CustomerConfig } from '@/types/config';

export const config: CustomerConfig = {
  package: ${tsString(packageTier)},
  businessName: ${tsString(businessName)},
  tagline: ${tsString(tagline)},
  description: ${tsString(description)},
  template: ${tsString(template)},${fields.customDomain ? `\n  customDomain: ${tsString(fields.customDomain)},` : ''}
  // Filenames only — uploaded separately via \`npm run assets:upload ${slug}\`.
  // Resolved to https://cdn.webbinaja.com/${slug}/... at build time.
  assets: {
    logo: ${tsString(logo)},
    hero: ${tsString(hero)},
    gallery: [${galleryTs}],${ambiance ? `\n    ambiance: ${tsString(ambiance)},` : ''}
  },
  theme: {
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    accentColor: '#f59e0b',
  },
  contact: {
    whatsapp: ${tsString(whatsapp)},
    address: ${tsString(address)},
    mapsLink: ${tsString(mapsLink)},${instagram ? `\n    instagram: ${tsString(instagram)},` : ''}${facebook ? `\n    facebook: ${tsString(facebook)},` : ''}${tiktok ? `\n    tiktok: ${tsString(tiktok)},` : ''}${marketplace ? `\n    marketplace: ${tsString(marketplace)},` : ''}
  },
  services: [
${servicesTs}
  ],${catalogBlock}
};
`;
}

export function customerTargetDir(slug: string): string {
  return path.join(process.cwd(), 'src', 'customers', slug);
}

export function customerDirExists(slug: string): boolean {
  return fs.existsSync(customerTargetDir(slug));
}

function customerManifestPath(): string {
  return path.join(process.cwd(), 'src', 'customers', 'manifest.json');
}

/**
 * Tracked, ordered (oldest → newest) list of customer slugs — read by
 * `getRecentCustomerSlugs()` in src/lib/customers.ts so the site can
 * pre-render only the newest N customers at build time instead of all of
 * them (which would make build time grow without bound as customers pile
 * up). File mtimes can't be used for "newest" instead, because a fresh git
 * checkout (e.g. on Vercel) resets every file's mtime to checkout time.
 */
function appendToManifest(slug: string): void {
  const manifestPath = customerManifestPath();
  let slugs: string[] = [];
  if (fs.existsSync(manifestPath)) {
    try {
      slugs = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      slugs = [];
    }
  }
  if (!slugs.includes(slug)) slugs.push(slug);
  fs.writeFileSync(manifestPath, JSON.stringify(slugs, null, 2) + '\n');
}

/**
 * Writes src/customers/<slug>/config.ts. Throws if the directory already
 * exists, or if gallery/catalog exceed MAX_GALLERY_PHOTOS/MAX_CATALOG_ITEMS —
 * enforced here (not just in the admin UI) so it also catches the CLI and
 * any other future caller, since an unbounded per-customer photo count is
 * what actually lets the R2 bucket and page weight grow without limit.
 */
export function writeNewCustomerConfig(fields: NewCustomerFields): void {
  const galleryCount = fields.assets?.gallery?.length ?? 0;
  if (galleryCount > MAX_GALLERY_PHOTOS) {
    throw new Error(`Foto galeri maksimal ${MAX_GALLERY_PHOTOS} (dikirim ${galleryCount}).`);
  }
  const catalogCount = fields.catalog?.length ?? 0;
  if (catalogCount > MAX_CATALOG_ITEMS) {
    throw new Error(`Item katalog maksimal ${MAX_CATALOG_ITEMS} (dikirim ${catalogCount}).`);
  }

  const targetDir = customerTargetDir(fields.slug);
  if (fs.existsSync(targetDir)) {
    throw new Error(`src/customers/${fields.slug}/ sudah ada — tidak ada yang ditimpa.`);
  }
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'config.ts'), buildConfigTs(fields));
  appendToManifest(fields.slug);
}

/**
 * Sets or clears `customDomain` on an existing customer's config.ts — the
 * realistic flow, since a customer usually buys their own domain (Business
 * Kit) after the site already exists, not at creation time. Rewrites only
 * the `customDomain` line via text patching (config.ts is always generated
 * by buildConfigTs, so its shape is predictable); pass an empty string to
 * remove an existing custom domain.
 */
export function updateCustomerCustomDomain(slug: string, customDomain: string): void {
  const targetDir = customerTargetDir(slug);
  const configPath = path.join(targetDir, 'config.ts');
  if (!fs.existsSync(configPath)) {
    throw new Error(`src/customers/${slug}/config.ts tidak ditemukan.`);
  }

  const original = fs.readFileSync(configPath, 'utf8');
  const domainLineRe = /\n {2}customDomain: .*,/;
  let updated: string;

  if (customDomain) {
    const newLine = `\n  customDomain: ${tsString(customDomain)},`;
    updated = domainLineRe.test(original)
      ? original.replace(domainLineRe, newLine)
      : original.replace(/\n( {2}template: .*,)/, `\n$1${newLine}`);
  } else {
    updated = domainLineRe.test(original) ? original.replace(domainLineRe, '') : original;
  }

  fs.writeFileSync(configPath, updated);
}
