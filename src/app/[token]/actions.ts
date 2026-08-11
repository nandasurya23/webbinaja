'use server';

import { cookies } from 'next/headers';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createSessionCookieValue,
  hashPassword,
  isAdminConfigured,
  isValidAdminToken,
  parseSession,
  timingSafeEqualStr,
  verifyPassword,
  type AdminRole,
  type SessionInfo,
} from '@/lib/adminAuth';
import {
  CUSTOMER_TEMPLATES,
  customerDirExists,
  isKnownTemplate,
  type CatalogItemInput,
  type ServiceInput,
  type PackageTier,
} from '@/lib/customerScaffold';
import { MAX_GALLERY_PHOTOS, MAX_CATALOG_ITEMS } from '@/lib/customerLimits';
import { getCustomerAssetUrl, isValidAssetFilename, isValidCustomerSlug } from '@/lib/assets';
import { isSafeUrl, sanitizeWhatsapp } from '@/lib/url';
import { MAIN_DOMAIN } from '@/lib/customers';
import { clientIp } from '@/lib/clientIp';
import { revalidatePath } from 'next/cache';
import { PutObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import {
  getSubmission,
  markSubmissionProcessed,
  isRateLimited,
  recordRateLimitHit,
  countAdmins,
  getAdminByUsername,
  createAdmin,
  updateSubmissionStatus,
  customerSlugExistsInDb,
  insertCustomerToDb,
  updateCustomerCustomDomainInDb,
  type StatusPatch,
} from '@/lib/db';
import { getSubmissionAssetUrl, isValidSubmissionId } from '@/lib/assets';
import type { CustomerConfig } from '@/types/config';
// Reused unchanged from the CLI pipeline (scripts/assets/*) so a photo
// uploaded here and one uploaded via `npm run assets:upload` go through the
// exact same validation, resize, and WebP re-encode logic.
import { processImage, type AssetKind } from '../../../scripts/assets/imageProcessor';
import { createR2Client } from '../../../scripts/assets/r2Client';
import { R2_BUCKET_NAME, MAX_INPUT_FILE_BYTES, loadR2Credentials } from '../../../scripts/assets/config';

// Matches the fixed port in package.json's "dev" script — the only place
// this app runs locally, since the whole admin UI is dev-only.
const LOCAL_DEV_PORT = 8765;

type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

// Token + config validity check, re-checked on every action (not just page
// render — the token gate on the page component only protects the initial
// HTML; these server actions are their own endpoints and must enforce it
// independently). Every action in this file is production-safe now: customer
// creation/updates go through the `customers` table (see src/lib/db.ts and
// migrations/0002_customers.sql) instead of writing to the filesystem, which
// is what used to require a separate dev-only gate here.
function assertAdminIdentity(token: string): void {
  if (!isAdminConfigured()) {
    throw new Error('Admin belum dikonfigurasi — set ADMIN_TOKEN, ADMIN_SESSION_SECRET di .env.local.');
  }
  if (!isValidAdminToken(token)) {
    throw new Error('Unauthorized.');
  }
}

async function requireSession(): Promise<SessionInfo> {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) {
    throw new Error('Sesi habis — silakan login ulang.');
  }
  return session;
}

/** RBAC check — throws (not a silent redirect) so it fails loudly if ever called incorrectly, same philosophy as the other assert* guards in this file. */
async function requireRole(role: AdminRole): Promise<SessionInfo> {
  const session = await requireSession();
  if (session.role !== role) {
    throw new Error('Anda tidak punya akses untuk aksi ini.');
  }
  return session;
}

export async function loginAction(token: string, username: string, password: string): Promise<ActionResult> {
  assertAdminIdentity(token);

  const cleanUsername = username.trim();
  if (!cleanUsername || !password) {
    return { ok: false, error: 'Username dan password wajib diisi.' };
  }

  const ip = await clientIp();
  // Rate limit check only actually matters once the panel is reachable in
  // production (see src/lib/db.ts) — running it here too is harmless in
  // dev, and keeps this one code path correct everywhere instead of two.
  try {
    if (await isRateLimited('login', ip, 5, 15)) {
      return { ok: false, error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' };
    }
  } catch {
    // DATABASE_URL not configured (e.g. plain local dev without Neon set up
    // yet) — fail open on rate limiting rather than blocking login entirely.
  }

  let admin = await getAdminByUsername(cleanUsername).catch(() => null);

  // Bootstrap: the very first login, before any admin account exists yet.
  // Only takes effect while the `admins` table is genuinely empty — once
  // any account is created (including this one), this branch is
  // permanently unreachable, bootstrap env vars or not.
  if (!admin) {
    const bootstrapUsername = process.env.SUPER_ADMIN_USERNAME;
    const bootstrapPassword = process.env.SUPER_ADMIN_PASSWORD;
    const noAdminsYet = (await countAdmins().catch(() => -1)) === 0;

    if (
      noAdminsYet &&
      bootstrapUsername &&
      bootstrapPassword &&
      timingSafeEqualStr(cleanUsername, bootstrapUsername) &&
      timingSafeEqualStr(password, bootstrapPassword)
    ) {
      admin = await createAdmin({ username: cleanUsername, passwordHash: hashPassword(password), role: 'super_admin' });
    }
  }

  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    try {
      await recordRateLimitHit('login', ip);
    } catch {
      // Same as above — rate limiting is best-effort, not a hard dependency.
    }
    return { ok: false, error: 'Username atau password salah.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionCookieValue(admin.id, admin.role), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  return { ok: true };
}

export async function logoutAction(token: string): Promise<ActionResult> {
  assertAdminIdentity(token);
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return { ok: true };
}

export interface RegisterAdminInput {
  username: string;
  password: string;
  role: AdminRole;
}

/** super_admin only — enforced here, not just hidden in the UI (see requireRole). */
export async function registerAdminAction(token: string, input: RegisterAdminInput): Promise<ActionResult> {
  assertAdminIdentity(token);
  const session = await requireRole('super_admin');

  const username = input.username.trim();
  if (username.length < 3) return { ok: false, error: 'Username minimal 3 karakter.' };
  if (input.password.length < 12) return { ok: false, error: 'Password minimal 12 karakter.' };
  if (input.role !== 'admin' && input.role !== 'super_admin') return { ok: false, error: 'Role tidak dikenali.' };

  const existing = await getAdminByUsername(username).catch(() => null);
  if (existing) return { ok: false, error: `Username "${username}" sudah dipakai.` };

  try {
    await createAdmin({ username, passwordHash: hashPassword(input.password), role: input.role, createdBy: session.adminId });
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  return { ok: true, message: `Akun "${username}" (${input.role}) berhasil dibuat.` };
}

export type SetStatusResult =
  | { ok: true; message: string; queueNumber: number | null }
  | { ok: false; error: string };

/** Either role can set status — the only role-gated action here is admin management above. */
export async function setSubmissionStatusAction(token: string, submissionId: string, patch: StatusPatch): Promise<SetStatusResult> {
  assertAdminIdentity(token);
  await requireSession();

  if (!isValidSubmissionId(submissionId)) {
    return { ok: false, error: 'ID submission tidak valid.' };
  }

  const updated = await updateSubmissionStatus(submissionId, patch);
  if (!updated) return { ok: false, error: 'Submission tidak ditemukan.' };

  return {
    queueNumber: updated.queueNumber,
    ok: true,
    message: updated.queueNumber ? `Status diperbarui. Nomor antri: #${updated.queueNumber}` : 'Status diperbarui.',
  };
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
  assertAdminIdentity(token);
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
    theme: { primaryColor: '#000000', secondaryColor: '#ffffff', accentColor: '#f59e0b' },
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

export type SubmissionPrefillResult =
  | {
      ok: true;
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
    }
  | { ok: false; error: string };

/** Used by CustomerForm to prefill itself from a /pesan submission picked in the inbox — see ?submission= query param handling. */
export async function getSubmissionForPrefillAction(token: string, submissionId: string): Promise<SubmissionPrefillResult> {
  assertAdminIdentity(token);
  await requireSession();

  if (!isValidSubmissionId(submissionId)) {
    return { ok: false, error: 'ID submission tidak valid.' };
  }

  let submission;
  try {
    submission = await getSubmission(submissionId);
  } catch {
    return { ok: false, error: 'Gagal mengambil data submission.' };
  }
  if (!submission) {
    return { ok: false, error: 'Submission tidak ditemukan.' };
  }

  return {
    ok: true,
    businessName: submission.businessName,
    template: submission.template ?? '',
    tagline: submission.tagline ?? '',
    description: submission.description ?? '',
    whatsapp: submission.whatsapp,
    address: submission.address ?? '',
    mapsLink: submission.mapsLink ?? '',
    instagram: submission.instagram ?? '',
    facebook: submission.facebook ?? '',
    logo: submission.logoFilename ?? '',
    hero: submission.heroFilename ?? '',
    ambiance: submission.ambianceFilename ?? '',
    gallery: submission.gallery,
    services: submission.services,
    catalog: submission.catalog,
  };
}

/**
 * Sets or removes the custom domain on an EXISTING customer — the realistic
 * flow for Business Kit customers, who typically buy their own domain after
 * the site is already live (see writeNewCustomerConfig for the at-creation
 * path used when the domain is already known up front).
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
  assertAdminIdentity(token);
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
