// CLI-only configuration. Nothing in this file (or anything it imports) is
// ever imported by the Next.js app — the upload tool runs standalone via
// `npm run assets:upload` and is not part of the website build.
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'webbinaja-assets';
export const CDN_BASE_URL = process.env.R2_CDN_BASE_URL || 'https://cdn.webbinaja.com';

export const CUSTOMER_INPUT_DIR = 'customer-input';

export const MAX_INPUT_FILE_BYTES = 20 * 1024 * 1024; // 20MB raw upload from customer
export const MAX_OUTPUT_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5MB after optimization

export const WEBP_QUALITY_STEPS = [82, 72, 62, 50];

export const MAX_DIMENSIONS: Record<'logo' | 'hero' | 'gallery' | 'ambiance' | 'default', number> = {
  logo: 512,
  hero: 1920,
  gallery: 1600,
  ambiance: 1600,
  default: 1920,
};

export const ACCEPTED_INPUT_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

export interface R2Credentials {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
}

/**
 * Reads R2 credentials from the CLI's own process environment (populated via
 * `tsx --env-file=.env.local` or a real shell env var — see docs/asset-pipeline.md).
 * Never read by the website; if any are missing, fail loudly instead of
 * silently uploading to the wrong place or crashing deep in the AWS SDK.
 */
export function loadR2Credentials(): R2Credentials {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  const missing = [
    !accountId && 'R2_ACCOUNT_ID',
    !accessKeyId && 'R2_ACCESS_KEY_ID',
    !secretAccessKey && 'R2_SECRET_ACCESS_KEY',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Missing required R2 credential(s): ${missing.join(', ')}.\n` +
      `Set them in a local, gitignored .env.local (see docs/asset-pipeline.md) — ` +
      `never commit them and never reference them from website code.`
    );
  }

  return { accountId: accountId!, accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! };
}
