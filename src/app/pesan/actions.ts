'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { insertSubmission, isRateLimited, recordRateLimitHit, type NewSubmissionInput } from '@/lib/db';
import { getSubmissionAssetUrl, isValidAssetFilename, isValidSubmissionId } from '@/lib/assets';
import { isSafeUrl, sanitizeWhatsapp } from '@/lib/url';
import { clientIp } from '@/lib/clientIp';
import { MAX_GALLERY_PHOTOS, MAX_CATALOG_ITEMS } from '@/lib/customerLimits';
import type { ServiceInput, CatalogItemInput } from '@/lib/customerScaffold';

/**
 * Both public endpoints below (upload + submit) have no session/auth —
 * anyone on the internet can call them, so volume itself has to be the
 * defense against cost/storage abuse (thousands of image uploads or DB
 * rows). Fails open (returns false) if Neon isn't reachable, so a DB
 * hiccup degrades to "no rate limiting" rather than "form completely
 * broken" — an acceptable trade for a low-traffic SMB order form.
 */
async function checkRateLimit(bucket: 'order_submit' | 'asset_upload', ip: string, maxHits: number, windowMinutes: number): Promise<boolean> {
  try {
    if (await isRateLimited(bucket, ip, maxHits, windowMinutes)) return true;
    await recordRateLimitHit(bucket, ip);
    return false;
  } catch {
    return false;
  }
}

// Free-text fields have no other size constraint before hitting the DB —
// without a cap, a single request could stuff megabytes of text into one
// row. Generous enough for real business descriptions, nowhere near what a
// deliberate abuse payload would need.
const MAX_SHORT_FIELD_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 4000;
// Same image pipeline the admin upload button already uses (see
// src/app/[token]/actions.ts) — reused as-is, just uploaded under
// `_submissions/<id>/...` instead of `<slug>/...` since no slug exists yet.
import { processImage, type AssetKind } from '../../../scripts/assets/imageProcessor';
import { createR2Client } from '../../../scripts/assets/r2Client';
import { R2_BUCKET_NAME, MAX_INPUT_FILE_BYTES, loadR2Credentials } from '../../../scripts/assets/config';

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
    .replace(/[̀-ͯ]/g, '') // strip accents (é -> e)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || 'file';
}

export interface UploadSubmissionAssetResult {
  ok: boolean;
  filename?: string;
  url?: string;
  error?: string;
}

/**
 * Public-facing equivalent of uploadAssetAction — no admin token, since a
 * customer filling out /pesan isn't logged in as anything. Safety comes
 * from validation instead of auth: strict file-type/size checks (same as
 * admin), and the destination is always `_submissions/<submissionId>/...`,
 * never an arbitrary path a caller could point elsewhere.
 */
export async function uploadSubmissionAssetAction(formData: FormData): Promise<UploadSubmissionAssetResult> {
  const submissionId = String(formData.get('submissionId') || '').trim();
  const kind = UPLOAD_KIND_MAP[String(formData.get('kind') || '').trim()];
  const baseNameRaw = String(formData.get('baseName') || '').trim();
  const file = formData.get('file');

  if (!isValidSubmissionId(submissionId)) {
    return { ok: false, error: 'Sesi form tidak valid — muat ulang halaman.' };
  }
  if (!kind) {
    return { ok: false, error: 'Jenis asset tidak dikenali.' };
  }

  // Generous cap (a full submission legitimately needs up to ~23 uploads:
  // logo + hero + ambiance + 8 gallery + 12 catalog), but bounds an
  // unauthenticated script from hammering R2 storage indefinitely.
  const ip = await clientIp();
  if (await checkRateLimit('asset_upload', ip, 40, 60)) {
    return { ok: false, error: 'Terlalu banyak upload dari alamat Anda. Coba lagi nanti.' };
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
    loadR2Credentials();
  } catch {
    return { ok: false, error: 'Upload sedang tidak tersedia, coba lagi nanti.' };
  }

  const raw = Buffer.from(await file.arrayBuffer());

  let processed;
  try {
    processed = await processImage(raw, kind);
  } catch (err) {
    return { ok: false, error: `Gagal memproses gambar: ${(err as Error).message}` };
  }

  const key = `_submissions/${submissionId}/${outputFilename}`;
  try {
    const client = createR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: processed.buffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=3600, must-revalidate',
      })
    );
  } catch {
    return { ok: false, error: 'Upload gagal, coba lagi.' };
  }

  return { ok: true, filename: outputFilename, url: getSubmissionAssetUrl(submissionId, outputFilename) };
}

export interface SubmitOrderInput {
  id: string;
  businessName: string;
  template: string;
  packageTier: string;
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
  // Honeypot — real users never see or fill this field (hidden via CSS).
  website: string;
}

const PACKAGE_LABELS: Record<string, string> = {
  basic: 'Paket Basic (Rp 499k)',
  business_kit: 'Paket Business Kit (Rp 799k)',
};

export type SubmitOrderResult =
  | { ok: true; whatsappUrl: string; lookupCode: string }
  | { ok: false; error: string };

// WebbinAja's own contact number (who the customer is paying) for the
// post-submit "lanjut ke WhatsApp" CTA — not the customer's own number they
// just entered in the form. Same number used by every other WA CTA on the
// landing page (see src/app/HomeClient.tsx).
const BUSINESS_WHATSAPP = '6281339684249';

export async function submitOrderAction(input: SubmitOrderInput): Promise<SubmitOrderResult> {
  // Honeypot: a real visitor never fills this hidden field. A bot filling
  // every input on the page will. Silently pretend success so the bot
  // doesn't learn to skip the field.
  if (input.website.trim()) {
    // Fake code — nothing was actually inserted, so it won't match anything
    // at /status, but the bot has no way to tell that from a real one.
    return { ok: true, whatsappUrl: buildWhatsappUrl(input.businessName, input.packageTier), lookupCode: 'XXXXXXXX' };
  }

  if (!isValidSubmissionId(input.id)) {
    return { ok: false, error: 'Sesi form tidak valid — muat ulang halaman.' };
  }

  const packageTier = PACKAGE_LABELS[input.packageTier] ? input.packageTier : '';
  if (!packageTier) {
    return { ok: false, error: 'Pilih paket terlebih dahulu.' };
  }

  // Checked before any other validation — an unauthenticated endpoint that
  // writes DB rows needs its volume capped regardless of whether individual
  // attempts are well-formed (a script retrying invalid input is still abuse).
  const ip = await clientIp();
  if (await checkRateLimit('order_submit', ip, 5, 60)) {
    return { ok: false, error: 'Terlalu banyak pengiriman dari alamat Anda. Coba lagi nanti atau hubungi kami via WhatsApp.' };
  }

  const businessName = input.businessName.trim();
  const whatsapp = sanitizeWhatsapp(input.whatsapp);
  const mapsLink = input.mapsLink.trim();
  const instagram = input.instagram.trim();
  const facebook = input.facebook.trim();

  if (!businessName) return { ok: false, error: 'Nama bisnis wajib diisi.' };
  if (!whatsapp) return { ok: false, error: 'Nomor WhatsApp wajib diisi.' };
  if (mapsLink && !isSafeUrl(mapsLink)) return { ok: false, error: 'Google Maps link harus berupa URL http/https yang valid.' };
  if (instagram && !isSafeUrl(instagram)) return { ok: false, error: 'Instagram URL harus berupa URL http/https yang valid.' };
  if (facebook && !isSafeUrl(facebook)) return { ok: false, error: 'Facebook URL harus berupa URL http/https yang valid.' };

  for (const [label, value, max] of [
    ['Nama bisnis', businessName, MAX_SHORT_FIELD_LENGTH],
    ['Tagline', input.tagline, MAX_SHORT_FIELD_LENGTH],
    ['Deskripsi', input.description, MAX_DESCRIPTION_LENGTH],
    ['Alamat', input.address, MAX_SHORT_FIELD_LENGTH],
  ] as const) {
    if (value.length > max) return { ok: false, error: `${label} maksimal ${max} karakter.` };
  }

  const gallery = input.gallery.map((g) => g.trim()).filter(Boolean);
  if (gallery.length > MAX_GALLERY_PHOTOS) {
    return { ok: false, error: `Foto galeri maksimal ${MAX_GALLERY_PHOTOS}.` };
  }
  for (const filename of [input.logo, input.hero, input.ambiance, ...gallery]) {
    if (filename && !isValidAssetFilename(filename)) {
      return { ok: false, error: `Nama file gambar tidak valid: ${filename}` };
    }
  }

  const services = input.services
    .slice(0, MAX_CATALOG_ITEMS) // no dedicated services cap exists yet — reuse the catalog one as a sane ceiling
    .map((s) => ({ name: s.name.trim().slice(0, MAX_SHORT_FIELD_LENGTH), price: s.price.trim().slice(0, MAX_SHORT_FIELD_LENGTH), desc: s.desc?.trim().slice(0, MAX_DESCRIPTION_LENGTH) }))
    .filter((s) => s.name && s.price);

  const catalog: CatalogItemInput[] = [];
  for (const raw of input.catalog) {
    const item = {
      name: raw.name.trim().slice(0, MAX_SHORT_FIELD_LENGTH),
      price: raw.price.trim().slice(0, MAX_SHORT_FIELD_LENGTH),
      desc: raw.desc?.trim().slice(0, MAX_DESCRIPTION_LENGTH),
      image: raw.image.trim(),
    };
    if (!item.name && !item.price) continue;
    if (!item.name || !item.price) {
      return { ok: false, error: 'Setiap item katalog butuh nama dan harga (atau kosongkan barisnya).' };
    }
    if (item.image && !isValidAssetFilename(item.image)) {
      return { ok: false, error: `Nama file gambar katalog tidak valid: ${item.image}` };
    }
    catalog.push(item);
  }
  if (catalog.length > MAX_CATALOG_ITEMS) {
    return { ok: false, error: `Item katalog maksimal ${MAX_CATALOG_ITEMS}.` };
  }

  const payload: NewSubmissionInput = {
    id: input.id,
    businessName,
    template: input.template.trim(),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    whatsapp,
    address: input.address.trim(),
    mapsLink,
    instagram,
    facebook,
    logoFilename: input.logo.trim() || undefined,
    heroFilename: input.hero.trim() || undefined,
    ambianceFilename: input.ambiance.trim() || undefined,
    packageTier,
    gallery,
    services,
    catalog,
  };

  let lookupCode: string;
  try {
    ({ lookupCode } = await insertSubmission(payload));
  } catch {
    return { ok: false, error: 'Gagal menyimpan data, coba lagi.' };
  }

  return { ok: true, whatsappUrl: buildWhatsappUrl(businessName, packageTier), lookupCode };
}

function buildWhatsappUrl(businessName: string, packageTier: string): string {
  const packageLabel = PACKAGE_LABELS[packageTier];
  const text = packageLabel
    ? `Halo, saya sudah isi data pemesanan website untuk "${businessName}" (${packageLabel}), mohon info pembayaran.`
    : `Halo, saya sudah isi data pemesanan website untuk "${businessName}", mohon info pembayaran.`;
  return `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
