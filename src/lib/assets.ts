// Public read-only helpers for resolving customer asset URLs served from
// Cloudflare R2. This module never talks to R2 directly and holds no
// credentials — it only builds and validates URLs. Uploading is done
// exclusively by scripts/assets/cli.ts.
import { CustomerAssets } from '@/types/config';

// Set via ASSET_CDN_DOMAIN in Vercel env vars — the bucket's public R2.dev
// hostname (Settings → Public Access → "r2.dev subdomain" in the Cloudflare
// dashboard, looks like "pub-xxxxxxxx.r2.dev"), or a real custom domain if
// one is ever set up again. No default: an unset value would silently point
// every asset URL at a domain nobody owns, which is worse than failing loudly
// at build/asset-check time.
export const ASSET_CDN_DOMAIN = 
  process.env.NEXT_PUBLIC_R2_CDN_BASE_URL?.replace(/^https?:\/\//, '') ||
  process.env.NEXT_PUBLIC_ASSET_CDN_DOMAIN || 
  process.env.ASSET_CDN_DOMAIN || 
  process.env.R2_CDN_BASE_URL?.replace(/^https?:\/\//, '') || 
  '';
export const ASSET_CDN_BASE_URL = ASSET_CDN_DOMAIN ? `https://${ASSET_CDN_DOMAIN}` : '';

// Same slug shape used for subdomains: lowercase letters, digits, single
// hyphens between segments. No leading/trailing hyphen, no dots, no slashes.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Filenames are flat (no directories) and restricted to the formats the
// upload pipeline actually produces/accepts.
const ASSET_FILENAME_PATTERN = /^[a-z0-9][a-z0-9._-]*\.(webp|avif|jpg|jpeg|png)$/;

export function isValidCustomerSlug(slug: string | undefined | null): slug is string {
  if (!slug || typeof slug !== 'string') return false;
  if (slug.length > 63) return false;
  return SLUG_PATTERN.test(slug);
}

export function isValidAssetFilename(filename: string | undefined | null): filename is string {
  if (!filename || typeof filename !== 'string') return false;
  // Reject path traversal / nested paths outright, before the regex check,
  // so the intent is explicit even though the pattern already excludes '/'.
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) return false;
  if (filename.length > 128) return false;
  return ASSET_FILENAME_PATTERN.test(filename);
}

/**
 * Builds the public CDN URL for a single customer asset.
 * Returns undefined (never a malformed/unsafe URL) if the slug or filename
 * fails validation, so callers can fall back to a legacy/default image.
 */
export function getCustomerAssetUrl(slug: string, filename: string): string | undefined {
  if (!ASSET_CDN_BASE_URL || !isValidCustomerSlug(slug) || !isValidAssetFilename(filename)) return undefined;
  return `${ASSET_CDN_BASE_URL}/${slug}/${filename}`;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isValidSubmissionId(id: string | undefined | null): id is string {
  return typeof id === 'string' && UUID_PATTERN.test(id);
}

/**
 * Builds the public CDN URL for a photo uploaded via the public order form
 * (src/app/pesan) before a customer slug exists — stored under
 * `_submissions/<id>/...` rather than `<slug>/...`. Separate from
 * `getCustomerAssetUrl` because submission ids are UUIDs, not slugs, and the
 * leading underscore keeps this prefix visually and structurally distinct
 * from real customer folders.
 */
export function getSubmissionAssetUrl(submissionId: string, filename: string): string | undefined {
  if (!ASSET_CDN_BASE_URL || !isValidSubmissionId(submissionId) || !isValidAssetFilename(filename)) return undefined;
  return `${ASSET_CDN_BASE_URL}/_submissions/${submissionId}/${filename}`;
}

export interface ResolvedCustomerImages {
  logo?: string;
  hero?: string;
  gallery?: string[];
  ambiance?: string;
}

/**
 * Resolves a customer's `assets` (bare R2 filenames) into absolute CDN URLs
 * scoped to that customer's slug, falling back to the legacy `images` field
 * (used by earlier customers whose images are plain absolute URLs, e.g.
 * Unsplash placeholders) when no matching asset filename is configured.
 */
export function resolveCustomerImages(
  slug: string,
  assets: CustomerAssets | undefined,
  legacyImages: { hero?: string; gallery?: string[]; ambiance?: string } | undefined
): ResolvedCustomerImages {
  const logo = assets?.logo ? getCustomerAssetUrl(slug, assets.logo) : undefined;
  const hero = (assets?.hero && getCustomerAssetUrl(slug, assets.hero)) || legacyImages?.hero;
  const ambiance = (assets?.ambiance && getCustomerAssetUrl(slug, assets.ambiance)) || legacyImages?.ambiance;

  const gallery = assets?.gallery?.length
    ? assets.gallery
        .map((filename) => getCustomerAssetUrl(slug, filename))
        .filter((url): url is string => Boolean(url))
    : legacyImages?.gallery;

  return { logo, hero, gallery, ambiance };
}
