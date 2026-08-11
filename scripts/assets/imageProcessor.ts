import sharp from 'sharp';
import { MAX_DIMENSIONS, MAX_OUTPUT_FILE_BYTES, WEBP_QUALITY_STEPS } from './config';

const SUPPORTED_SHARP_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif']);

export type AssetKind = 'logo' | 'hero' | 'gallery' | 'ambiance';

export interface ProcessResult {
  buffer: Buffer;
  width: number;
  height: number;
  bytes: number;
  qualityUsed: number;
}

/**
 * Validates the actual image content (not just the file extension), resizes
 * it to a reasonable maximum, and re-encodes it as WebP. Runs entirely in
 * the CLI process — nothing here executes in the browser or on Vercel.
 */
export async function processImage(input: Buffer, kind: AssetKind): Promise<ProcessResult> {
  const probe = await sharp(input).metadata();
  if (!probe.format || !SUPPORTED_SHARP_FORMATS.has(probe.format)) {
    throw new Error(`unsupported image format "${probe.format ?? 'unknown'}" (allowed: jpeg, png, webp, avif)`);
  }

  const maxDimension = MAX_DIMENSIONS[kind] ?? MAX_DIMENSIONS.default;
  const hasAlpha = Boolean(probe.hasAlpha);

  let qualityUsed = WEBP_QUALITY_STEPS[0];
  let buffer: Buffer | undefined;

  // Step down quality until the output fits the size budget, rather than
  // aggressively compressing every image to the lowest common denominator.
  for (const quality of WEBP_QUALITY_STEPS) {
    const candidate = await sharp(input)
      .resize({
        width: maxDimension,
        height: maxDimension,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality, alphaQuality: hasAlpha ? 100 : undefined, effort: 5 })
      .toBuffer();

    buffer = candidate;
    qualityUsed = quality;
    if (candidate.byteLength <= MAX_OUTPUT_FILE_BYTES) break;
  }

  if (!buffer) {
    throw new Error('image processing produced no output');
  }

  const finalMeta = await sharp(buffer).metadata();

  if (buffer.byteLength > MAX_OUTPUT_FILE_BYTES) {
    throw new Error(
      `optimized image is still ${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB ` +
      `(max ${(MAX_OUTPUT_FILE_BYTES / 1024 / 1024).toFixed(1)}MB) even at lowest quality step — ` +
      `use a smaller source image`
    );
  }

  return {
    buffer,
    width: finalMeta.width ?? 0,
    height: finalMeta.height ?? 0,
    bytes: buffer.byteLength,
    qualityUsed,
  };
}
