'use server';

import { cookies } from 'next/headers';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createSessionCookieValue,
  isAdminConfigured,
  isValidAdminPassword,
  isValidAdminToken,
  isValidSessionCookieValue,
} from '@/lib/adminAuth';
import {
  CUSTOMER_TEMPLATES,
  customerDirExists,
  isKnownTemplate,
  writeNewCustomerConfig,
  updateCustomerCustomDomain,
  type CatalogItemInput,
  type ServiceInput,
  type PackageTier,
} from '@/lib/customerScaffold';
import { MAX_GALLERY_PHOTOS, MAX_CATALOG_ITEMS } from '@/lib/customerLimits';
import { getCustomerAssetUrl, isValidAssetFilename, isValidCustomerSlug } from '@/lib/assets';
import { isSafeUrl, sanitizeWhatsapp } from '@/lib/url';
import { MAIN_DOMAIN } from '@/lib/customers';
import { PutObjectCommand } from '@aws-sdk/client-s3';
// Reused unchanged from the CLI pipeline (scripts/assets/*) so a photo
// uploaded here and one uploaded via `npm run assets:upload` go through the
// exact same validation, resize, and WebP re-encode logic.
import { processImage, type AssetKind } from '../../../../scripts/assets/imageProcessor';
import { createR2Client } from '../../../../scripts/assets/r2Client';
import { R2_BUCKET_NAME, MAX_INPUT_FILE_BYTES, loadR2Credentials } from '../../../../scripts/assets/config';

// Matches the fixed port in package.json's "dev" script — the only place
// this app runs locally, since the whole admin UI is dev-only.
const LOCAL_DEV_PORT = 8765;

type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

// Re-checked on every action, not just page render — the token/production
// gate on the page component only protects the initial HTML; these server
// actions are their own endpoints and must enforce it independently.
function assertAdminAccess(token: string): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Admin UI ini hanya untuk pengembangan lokal, tidak tersedia di production.');
  }
  if (!isAdminConfigured()) {
    throw new Error('Admin belum dikonfigurasi — set ADMIN_TOKEN, ADMIN_PASSWORD, ADMIN_SESSION_SECRET di .env.local.');
  }
  if (!isValidAdminToken(token)) {
    throw new Error('Unauthorized.');
  }
}

async function requireSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionCookieValue(session)) {
    throw new Error('Sesi habis — silakan login ulang.');
  }
}

export async function loginAction(token: string, password: string): Promise<ActionResult> {
  assertAdminAccess(token);

  if (!isValidAdminPassword(password)) {
    return { ok: false, error: 'Password salah.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  return { ok: true };
}

export async function logoutAction(token: string): Promise<ActionResult> {
  assertAdminAccess(token);
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return { ok: true };
}

export interface AssetCheckItem {
  label: string;
  filename: string;
  url?: string;
  ok: boolean;
  status?: number;
  error?: string;
}

export type AssetCheckResult = { ok: true; results: AssetCheckItem[] } | { ok: false; error: string };

/**
 * HEAD-requests each asset's public CDN URL — the same check
 * `scripts/customer/validate.ts --check-assets` runs, but against
 * filenames the operator hasn't necessarily saved into a config yet, so it
 * can double as a pre-flight before the customer directory is even created.
 */
export async function checkAssetsAction(
  token: string,
  slug: string,
  items: { label: string; filename: string }[]
): Promise<AssetCheckResult> {
  assertAdminAccess(token);
  await requireSession();

  if (!isValidCustomerSlug(slug)) {
    return { ok: false, error: 'Slug tidak valid — isi slug dulu sebelum cek asset.' };
  }

  const results: AssetCheckItem[] = [];

  for (const { label, filename } of items) {
    if (!filename) continue;

    if (!isValidAssetFilename(filename)) {
      results.push({ label, filename, ok: false, error: 'Nama file tidak valid (huruf kecil/angka, .webp/.avif/.jpg/.jpeg/.png).' });
      continue;
    }

    const url = getCustomerAssetUrl(slug, filename);
    if (!url) {
      results.push({ label, filename, ok: false, error: 'Gagal membentuk URL CDN.' });
      continue;
    }

    try {
      const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      results.push({ label, filename, url, ok: res.ok, status: res.status });
    } catch (err) {
      results.push({ label, filename, url, ok: false, error: (err as Error).message });
    }
  }

  return { ok: true, results };
}

// Bare hostname only — no protocol, no path, no trailing dot. Matches
// "kliniksehat.com" or "www.kliniksehat.com", rejects anything that isn't a
// plausible domain (also rejects the platform's own domain/subdomains so a
// customer can't hijack routing for webbinaja.com itself).
const CUSTOM_DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(\.(?!-)[a-z0-9-]{1,63})+$/;

function isValidCustomDomain(domain: string): boolean {
  return CUSTOM_DOMAIN_RE.test(domain) && domain !== MAIN_DOMAIN && !domain.endsWith(`.${MAIN_DOMAIN}`);
}

export interface CreateCustomerInput {
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
  logo: string;
  hero: string;
  ambiance: string;
  gallery: string[];
  services: ServiceInput[];
  catalog: CatalogItemInput[];
  packageTier: PackageTier;
  customDomain: string;
}

export type CreateCustomerResult =
  | {
      ok: true;
      message: string;
      slug: string;
      productionUrl: string;
      localUrl: string;
      promoUrl?: string;
      localPromoUrl?: string;
    }
  | { ok: false; error: string };

export async function createCustomerAction(token: string, input: CreateCustomerInput): Promise<CreateCustomerResult> {
  assertAdminAccess(token);
  await requireSession();

  const slug = input.slug.trim();
  const businessName = input.businessName.trim();
  const template = input.template.trim();
  const tagline = input.tagline.trim();
  const description = input.description.trim();
  const whatsapp = sanitizeWhatsapp(input.whatsapp);
  const address = input.address.trim();
  const mapsLink = input.mapsLink.trim();
  const instagram = input.instagram.trim();
  const facebook = input.facebook.trim();
  const logo = input.logo.trim();
  const hero = input.hero.trim();
  const ambiance = input.ambiance.trim();
  const gallery = input.gallery.map((g) => g.trim()).filter(Boolean);
  const customDomain = input.customDomain.trim().toLowerCase();

  if (!isValidCustomerSlug(slug)) {
    return { ok: false, error: 'Slug tidak valid — huruf kecil, angka, dipisah tanda hubung tunggal (contoh: cafe-siti).' };
  }
  if (customerDirExists(slug)) {
    return { ok: false, error: `src/customers/${slug}/ sudah ada — pilih slug lain.` };
  }
  if (!businessName) {
    return { ok: false, error: 'Nama bisnis wajib diisi.' };
  }
  if (!isKnownTemplate(template)) {
    return { ok: false, error: `Template tidak dikenali. Pilih salah satu: ${CUSTOMER_TEMPLATES.join(', ')}.` };
  }
  if (!whatsapp) {
    return { ok: false, error: 'Nomor WhatsApp wajib diisi.' };
  }
  if (input.packageTier !== 'basic' && input.packageTier !== 'business') {
    return { ok: false, error: 'Paket tidak dikenali.' };
  }
  if (customDomain && !isValidCustomDomain(customDomain)) {
    return { ok: false, error: `Custom domain tidak valid: ${customDomain} (contoh: namabisnis.com, tanpa https://).` };
  }
  if (mapsLink && !isSafeUrl(mapsLink)) {
    return { ok: false, error: 'Google Maps link harus berupa URL http/https yang valid.' };
  }
  if (instagram && !isSafeUrl(instagram)) {
    return { ok: false, error: 'Instagram URL harus berupa URL http/https yang valid.' };
  }
  if (facebook && !isSafeUrl(facebook)) {
    return { ok: false, error: 'Facebook URL harus berupa URL http/https yang valid.' };
  }
  if (logo && !isValidAssetFilename(logo)) {
    return { ok: false, error: `Nama file logo tidak valid: ${logo}` };
  }
  if (hero && !isValidAssetFilename(hero)) {
    return { ok: false, error: `Nama file hero tidak valid: ${hero}` };
  }
  if (ambiance && !isValidAssetFilename(ambiance)) {
    return { ok: false, error: `Nama file ambiance tidak valid: ${ambiance}` };
  }
  for (const filename of gallery) {
    if (!isValidAssetFilename(filename)) {
      return { ok: false, error: `Nama file galeri tidak valid: ${filename}` };
    }
  }
  if (gallery.length > MAX_GALLERY_PHOTOS) {
    return { ok: false, error: `Foto galeri maksimal ${MAX_GALLERY_PHOTOS} — hapus ${gallery.length - MAX_GALLERY_PHOTOS} foto dulu.` };
  }

  const services = input.services
    .map((s) => ({ name: s.name.trim(), price: s.price.trim(), desc: s.desc?.trim() }))
    .filter((s) => s.name && s.price);

  const catalog: CatalogItemInput[] = [];
  for (const raw of input.catalog) {
    const item = { name: raw.name.trim(), price: raw.price.trim(), desc: raw.desc?.trim(), image: raw.image.trim() };
    // No name and no price means there's no real product here — skip it even
    // if `image` happens to be filled (e.g. the operator clicked "Upload" on
    // that row to try it out, or to pre-stage a photo, without ever naming
    // the item). Only rows showing real intent (a name or a price) enforce
    // the "all fields required" rule below.
    if (!item.name && !item.price) continue;
    if (!item.name || !item.price || !item.image) {
      return { ok: false, error: 'Setiap item katalog butuh nama, harga, dan nama file gambar (atau kosongkan barisnya).' };
    }
    if (!isValidAssetFilename(item.image)) {
      return { ok: false, error: `Nama file gambar katalog tidak valid: ${item.image}` };
    }
    catalog.push(item);
  }
  if (catalog.length > MAX_CATALOG_ITEMS) {
    return { ok: false, error: `Item katalog maksimal ${MAX_CATALOG_ITEMS} — hapus ${catalog.length - MAX_CATALOG_ITEMS} item dulu.` };
  }

  try {
    writeNewCustomerConfig({
      slug,
      businessName,
      template,
      tagline,
      description,
      whatsapp,
      address,
      mapsLink,
      instagram,
      facebook,
      assets: { logo: logo || undefined, hero: hero || undefined, gallery, ambiance: ambiance || undefined },
      services,
      catalog,
      packageTier: input.packageTier,
      customDomain: customDomain || undefined,
    });
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const productionUrl = `https://${slug}.${MAIN_DOMAIN}`;
  const localUrl = `http://${slug}.localhost:${LOCAL_DEV_PORT}`;

  return {
    ok: true,
    message: `Dibuat: src/customers/${slug}/config.ts. Kalau semua foto sudah di-upload lewat form di atas, tinggal commit + push. Kalau belum, jalankan "npm run assets:upload ${slug}" dulu.`,
    slug,
    productionUrl,
    localUrl,
    ...(input.packageTier === 'business'
      ? { promoUrl: `${productionUrl}/promo`, localPromoUrl: `${localUrl}/promo` }
      : {}),
  };
}

/**
 * Sets or removes the custom domain on an EXISTING customer — the realistic
 * flow for Business Kit customers, who typically buy their own domain after
 * the site is already live (see writeNewCustomerConfig for the at-creation
 * path used when the domain is already known up front).
 */
export async function updateCustomDomainAction(token: string, slug: string, customDomain: string): Promise<ActionResult> {
  assertAdminAccess(token);
  await requireSession();

  const cleanSlug = slug.trim();
  const domain = customDomain.trim().toLowerCase();

  if (!isValidCustomerSlug(cleanSlug)) {
    return { ok: false, error: 'Slug tidak valid.' };
  }
  if (!customerDirExists(cleanSlug)) {
    return { ok: false, error: `src/customers/${cleanSlug}/ tidak ditemukan.` };
  }
  if (domain && !isValidCustomDomain(domain)) {
    return { ok: false, error: `Custom domain tidak valid: ${domain} (contoh: namabisnis.com, tanpa https://).` };
  }

  try {
    updateCustomerCustomDomain(cleanSlug, domain);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  return {
    ok: true,
    message: domain
      ? `customDomain diset ke "${domain}" di src/customers/${cleanSlug}/config.ts. Jangan lupa tambahkan domain ini di Vercel → Domains, dan arahkan DNS-nya.`
      : `customDomain dihapus dari src/customers/${cleanSlug}/config.ts.`,
  };
}

export interface UploadAssetResult {
  ok: boolean;
  filename?: string;
  url?: string;
  width?: number;
  height?: number;
  bytes?: number;
  error?: string;
}

// Product photos aren't a distinct asset kind in the CLI pipeline — sized
// like gallery images (1600px max), which fits typical catalog photography.
const UPLOAD_KIND_MAP: Record<string, AssetKind> = {
  logo: 'logo',
  hero: 'hero',
  ambiance: 'ambiance',
  gallery: 'gallery',
  catalog: 'gallery',
};

function sanitizeBaseName(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents (é -> e)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || 'file';
}

/**
 * Takes a raw PNG/JPG/WebP from the operator's computer, resizes + re-encodes
 * it as WebP (scripts/assets/imageProcessor.ts), and uploads it straight to
 * Cloudflare R2 under `<slug>/<filename>.webp` (scripts/assets/r2Client.ts) —
 * the same key shape the CLI uses, so it appears as that customer's
 * "subfolder" automatically; R2/S3 has no separate folder-creation step.
 */
export async function uploadAssetAction(token: string, formData: FormData): Promise<UploadAssetResult> {
  assertAdminAccess(token);
  await requireSession();

  const slug = String(formData.get('slug') || '').trim();
  const kind = UPLOAD_KIND_MAP[String(formData.get('kind') || '').trim()];
  const baseNameRaw = String(formData.get('baseName') || '').trim();
  const file = formData.get('file');

  if (!isValidCustomerSlug(slug)) {
    return { ok: false, error: 'Slug tidak valid — isi slug dulu sebelum upload.' };
  }
  if (!kind) {
    return { ok: false, error: 'Jenis asset tidak dikenali.' };
  }
  if (!(file instanceof File)) {
    return { ok: false, error: 'File tidak ditemukan.' };
  }
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'File harus berupa gambar (PNG/JPG/WebP).' };
  }
  if (file.size > MAX_INPUT_FILE_BYTES) {
    return { ok: false, error: `Ukuran file terlalu besar (maks ${(MAX_INPUT_FILE_BYTES / 1024 / 1024).toFixed(0)}MB).` };
  }

  const outputFilename = `${sanitizeBaseName(baseNameRaw || file.name.replace(/\.[^.]+$/, ''))}.webp`;
  if (!isValidAssetFilename(outputFilename)) {
    return { ok: false, error: `Nama file hasil tidak valid: ${outputFilename}` };
  }

  try {
    loadR2Credentials(); // fail fast, before spending time re-encoding the image
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const raw = Buffer.from(await file.arrayBuffer());

  let processed;
  try {
    processed = await processImage(raw, kind);
  } catch (err) {
    return { ok: false, error: `Gagal memproses gambar: ${(err as Error).message}` };
  }

  const key = `${slug}/${outputFilename}`;
  try {
    const client = createR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: processed.buffer,
        ContentType: 'image/webp',
        // Filenames are stable (logo.webp, hero.webp, ...), so a long
        // immutable cache would serve stale images after a replacement.
        CacheControl: 'public, max-age=3600, must-revalidate',
      })
    );
  } catch (err) {
    return { ok: false, error: `Upload ke R2 gagal: ${(err as Error).message}` };
  }

  return {
    ok: true,
    filename: outputFilename,
    url: getCustomerAssetUrl(slug, outputFilename),
    width: processed.width,
    height: processed.height,
    bytes: processed.bytes,
  };
}
