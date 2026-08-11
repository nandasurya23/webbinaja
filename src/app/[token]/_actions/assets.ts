'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getCustomerAssetUrl, isValidAssetFilename, isValidCustomerSlug } from '@/lib/assets';
import { assertAdminIdentity, requireSession } from './shared';
// Reused unchanged from the CLI pipeline (scripts/assets/*) so a photo
// uploaded here and one uploaded via `npm run assets:upload` go through the
// exact same validation, resize, and WebP re-encode logic.
import { processImage, type AssetKind } from '../../../../scripts/assets/imageProcessor';
import { createR2Client } from '../../../../scripts/assets/r2Client';
import { R2_BUCKET_NAME, MAX_INPUT_FILE_BYTES, loadR2Credentials } from '../../../../scripts/assets/config';

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
    .replace(/[̀-ͯ]/g, '') // strip accents (é -> e)
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
