'use server';

import { revalidatePath } from 'next/cache';
import { CopyObjectCommand } from '@aws-sdk/client-s3';
import {
  CUSTOMER_TEMPLATES,
  customerDirExists,
  isKnownTemplate,
  type CatalogItemInput,
  type ServiceInput,
  type PackageTier,
} from '@/lib/customerScaffold';
import { MAX_GALLERY_PHOTOS, MAX_CATALOG_ITEMS } from '@/lib/customerLimits';
import { isValidAssetFilename, isValidCustomerSlug, isValidSubmissionId } from '@/lib/assets';
import { isSafeUrl, sanitizeWhatsapp } from '@/lib/url';
import { MAIN_DOMAIN } from '@/lib/customers';
import {
  markSubmissionProcessed,
  customerSlugExistsInDb,
  insertCustomerToDb,
  updateCustomerInDb,
  updateCustomerCustomDomainInDb,
  setCustomerSuspendedInDb,
} from '@/lib/db';
import type { CustomerConfig } from '@/types/config';
import { createR2Client } from '../../../../scripts/assets/r2Client';
import { R2_BUCKET_NAME } from '../../../../scripts/assets/config';
import { assertAdminIdentity, requireSession, isValidCustomDomain, LOCAL_DEV_PORT, type ActionResult } from './shared';

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
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  /** Set when this customer is being created from a /pesan submission — see promoteSubmissionAssets. */
  submissionId?: string;
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
  assertAdminIdentity(token);
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
  // Checked against both the DB (customers created via this form) and the
  // file-based demo customers (src/customers/) — a slug has to be unique
  // across both, since they're both resolved by the same getCustomerConfig().
  if (customerDirExists(slug) || (await customerSlugExistsInDb(slug).catch(() => false))) {
    return { ok: false, error: `Slug "${slug}" sudah dipakai — pilih slug lain.` };
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

  const config: CustomerConfig = {
    package: input.packageTier,
    businessName,
    tagline,
    description,
    template: template as CustomerConfig['template'],
    ...(customDomain && { customDomain }),
    assets: { logo: logo || undefined, hero: hero || undefined, gallery, ambiance: ambiance || undefined },
    theme: { 
      primaryColor: input.primaryColor || '#000000', 
      secondaryColor: input.secondaryColor || '#ffffff', 
      accentColor: input.accentColor || '#f59e0b' 
    },
    contact: {
      whatsapp,
      address,
      mapsLink,
      ...(instagram && { instagram }),
      ...(facebook && { facebook }),
    },
    services,
    ...(catalog.length > 0 && { catalog }),
  };

  try {
    await insertCustomerToDb(slug, config);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  // Instantly refresh the cached page for this slug — without this, the
  // first visitor after creation would still hit whatever was cached before
  // (a 404, since the slug didn't exist yet) until the cache naturally
  // expires. See src/app/sites/[customer]/page.tsx: no revalidate window is
  // set there because content normally never changes without this action.
  revalidatePath(`/sites/${slug}`);

  if (input.submissionId && isValidSubmissionId(input.submissionId)) {
    // Best-effort: the customer is already created either way (the DB row is
    // inserted above regardless of what happens here). If copying fails for
    // some assets, they just need re-uploading via the button already in
    // this form — same fallback as any other customer's missing asset.
    await promoteSubmissionAssets(input.submissionId, slug, [logo, hero, ambiance, ...gallery, ...catalog.map((c) => c.image)]);
    try {
      await markSubmissionProcessed(input.submissionId, slug);
    } catch {
      // Non-fatal — submission just stays "pending" in the inbox, harmless.
    }
  }

  const productionUrl = `https://${slug}.${MAIN_DOMAIN}`;
  const localUrl = `http://${slug}.localhost:${LOCAL_DEV_PORT}`;

  return {
    ok: true,
    message: `Customer "${slug}" dibuat dan langsung aktif di ${productionUrl}. Kalau semua foto sudah di-upload lewat form di atas, situsnya sudah lengkap.`,
    slug,
    productionUrl,
    localUrl,
    ...(input.packageTier === 'business'
      ? { promoUrl: `${productionUrl}/promo`, localPromoUrl: `${localUrl}/promo` }
      : {}),
  };
}

/**
 * Copies each asset a customer uploaded via the public order form
 * (src/app/pesan) from its temporary `_submissions/<id>/...` location to
 * the real `<slug>/...` path, once that customer has actually been created.
 * Uses R2's CopyObjectCommand (server-side copy, no re-download/re-upload)
 * so this stays cheap regardless of file size.
 */
async function promoteSubmissionAssets(submissionId: string, slug: string, filenames: string[]): Promise<void> {
  const uniqueFilenames = [...new Set(filenames.filter((f) => f && isValidAssetFilename(f)))];
  if (uniqueFilenames.length === 0) return;

  let client;
  try {
    client = createR2Client();
  } catch {
    return; // R2 not configured — customer still created, assets just need manual upload.
  }

  await Promise.all(
    uniqueFilenames.map(async (filename) => {
      try {
        await client.send(
          new CopyObjectCommand({
            Bucket: R2_BUCKET_NAME,
            CopySource: `${R2_BUCKET_NAME}/_submissions/${submissionId}/${filename}`,
            Key: `${slug}/${filename}`,
          })
        );
      } catch {
        // Best-effort per file — see caller.
      }
    })
  );
}

/**
 * Sets or removes the custom domain on an EXISTING customer — the realistic
 * flow for Business Kit customers, who typically buy their own domain after
 * the site is already live.
 */
export async function updateCustomDomainAction(token: string, slug: string, customDomain: string): Promise<ActionResult> {
  assertAdminIdentity(token);
  await requireSession();

  const cleanSlug = slug.trim();
  const domain = customDomain.trim().toLowerCase();

  if (!isValidCustomerSlug(cleanSlug)) {
    return { ok: false, error: 'Slug tidak valid.' };
  }
  if (domain && !isValidCustomDomain(domain)) {
    return { ok: false, error: `Custom domain tidak valid: ${domain} (contoh: namabisnis.com, tanpa https://).` };
  }

  // File-based demo customers (src/customers/) aren't editable from here —
  // they're template showcases, not real orders, and updating them means
  // editing the file directly and redeploying. Only DB-backed customers
  // (created via createCustomerAction) support this.
  if (customerDirExists(cleanSlug)) {
    return { ok: false, error: `"${cleanSlug}" adalah customer demo (file) — custom domain-nya diatur langsung di src/customers/${cleanSlug}/config.ts, bukan lewat sini.` };
  }

  let updated;
  try {
    updated = await updateCustomerCustomDomainInDb(cleanSlug, domain || null);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  if (!updated) {
    return { ok: false, error: `Customer "${cleanSlug}" tidak ditemukan.` };
  }

  revalidatePath(`/sites/${cleanSlug}`);

  return {
    ok: true,
    message: domain
      ? `customDomain diset ke "${domain}" untuk "${cleanSlug}". Jangan lupa tambahkan domain ini di Vercel → Domains, dan arahkan DNS-nya.`
      : `customDomain dihapus dari "${cleanSlug}".`,
  };
}

/**
 * Suspends or reactivates a DB-backed website — the row stays intact (see
 * setCustomerSuspendedInDb / migrations/0003_customers_suspended.sql), it
 * just stops resolving publicly while suspended. File-based demo customers
 * have no suspended column to flip, so they're not eligible here either,
 * same reasoning as updateCustomDomainAction above.
 */
export async function toggleCustomerSuspendedAction(token: string, slug: string, suspended: boolean): Promise<ActionResult> {
  assertAdminIdentity(token);
  await requireSession();

  const cleanSlug = slug.trim();
  if (!isValidCustomerSlug(cleanSlug)) {
    return { ok: false, error: 'Slug tidak valid.' };
  }

  let found: boolean;
  try {
    found = await setCustomerSuspendedInDb(cleanSlug, suspended);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  if (!found) {
    return { ok: false, error: `Customer "${cleanSlug}" tidak ditemukan.` };
  }

  revalidatePath(`/sites/${cleanSlug}`);

  return {
    ok: true,
    message: suspended ? `"${cleanSlug}" disuspend — situsnya sekarang 404 untuk publik.` : `"${cleanSlug}" diaktifkan kembali.`,
  };
}

export async function updateCustomerAction(token: string, slug: string, input: CreateCustomerInput): Promise<CreateCustomerResult> {
  assertAdminIdentity(token);
  await requireSession();

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

  // For updates, the slug is fixed and shouldn't be changed, so we skip slug validation & checking.
  
  if (!businessName) return { ok: false, error: 'Nama bisnis wajib diisi.' };
  if (!isKnownTemplate(template)) return { ok: false, error: `Template tidak dikenali.` };
  if (!whatsapp) return { ok: false, error: 'Nomor WhatsApp wajib diisi.' };
  if (input.packageTier !== 'basic' && input.packageTier !== 'business') return { ok: false, error: 'Paket tidak dikenali.' };
  if (customDomain && !isValidCustomDomain(customDomain)) return { ok: false, error: `Custom domain tidak valid.` };
  if (mapsLink && !isSafeUrl(mapsLink)) return { ok: false, error: 'Google Maps link harus berupa URL http/https yang valid.' };
  if (instagram && !isSafeUrl(instagram)) return { ok: false, error: 'Instagram URL harus berupa URL http/https yang valid.' };
  if (facebook && !isSafeUrl(facebook)) return { ok: false, error: 'Facebook URL harus berupa URL http/https yang valid.' };
  if (logo && !isValidAssetFilename(logo)) return { ok: false, error: `Nama file logo tidak valid: ${logo}` };
  if (hero && !isValidAssetFilename(hero)) return { ok: false, error: `Nama file hero tidak valid: ${hero}` };
  if (ambiance && !isValidAssetFilename(ambiance)) return { ok: false, error: `Nama file ambiance tidak valid: ${ambiance}` };
  for (const filename of gallery) {
    if (!isValidAssetFilename(filename)) return { ok: false, error: `Nama file galeri tidak valid: ${filename}` };
  }
  if (gallery.length > MAX_GALLERY_PHOTOS) return { ok: false, error: `Foto galeri maksimal ${MAX_GALLERY_PHOTOS}.` };

  const services = input.services
    .map((s) => ({ name: s.name.trim(), price: s.price.trim(), desc: s.desc?.trim() }))
    .filter((s) => s.name && s.price);

  const catalog: CatalogItemInput[] = [];
  for (const raw of input.catalog) {
    const item = { name: raw.name.trim(), price: raw.price.trim(), desc: raw.desc?.trim(), image: raw.image.trim() };
    if (!item.name && !item.price) continue;
    if (!item.name || !item.price || !item.image) return { ok: false, error: 'Setiap item katalog butuh nama, harga, dan gambar.' };
    if (!isValidAssetFilename(item.image)) return { ok: false, error: `Nama file gambar katalog tidak valid: ${item.image}` };
    catalog.push(item);
  }
  if (catalog.length > MAX_CATALOG_ITEMS) return { ok: false, error: `Item katalog maksimal ${MAX_CATALOG_ITEMS}.` };

  const config: CustomerConfig = {
    package: input.packageTier,
    businessName,
    tagline,
    description,
    template: template as CustomerConfig['template'],
    ...(customDomain && { customDomain }),
    assets: { logo: logo || undefined, hero: hero || undefined, gallery, ambiance: ambiance || undefined },
    theme: { 
      primaryColor: input.primaryColor || '#000000', 
      secondaryColor: input.secondaryColor || '#ffffff', 
      accentColor: input.accentColor || '#f59e0b' 
    },
    contact: {
      whatsapp,
      address,
      mapsLink,
      ...(instagram && { instagram }),
      ...(facebook && { facebook }),
    },
    services,
    ...(catalog.length > 0 && { catalog }),
  };

  try {
    const success = await updateCustomerInDb(slug, config);
    if (!success) return { ok: false, error: `Customer "${slug}" tidak ditemukan.` };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  revalidatePath(`/sites/${slug}`);

  const productionUrl = `https://${customDomain || `${slug}.${MAIN_DOMAIN}`}`;
  const localUrl = `http://${slug}.localhost:${LOCAL_DEV_PORT}`;

  return {
    ok: true,
    message: `Perubahan pada customer "${slug}" berhasil disimpan.`,
    slug,
    productionUrl,
    localUrl,
    ...(input.packageTier === 'business'
      ? { promoUrl: `${productionUrl}/promo`, localPromoUrl: `${localUrl}/promo` }
      : {}),
  };
}
