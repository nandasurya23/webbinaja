#!/usr/bin/env -S node
// WebbinAja internal asset pipeline CLI.
//
//   npm run assets:upload          (will ask for the customer slug)
//   npm run assets:upload bliss    (or pass it directly)
//   npm run assets:sync   bliss [--delete]
//
// Reads customer-input/<slug>/*.{jpg,jpeg,png,webp,avif}, validates +
// optimizes each image, and uploads it to Cloudflare R2 as
// webbinaja-assets/<slug>/<filename>.webp, served publicly at
// https://cdn.webbinaja.com/<slug>/<filename>.webp
//
// This is a local developer tool, not part of the website. It is the only
// thing that ever holds R2 write credentials.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { isValidCustomerSlug, isValidAssetFilename, ASSET_CDN_BASE_URL } from '../../src/lib/assets';
import { ACCEPTED_INPUT_EXTENSIONS, CUSTOMER_INPUT_DIR, MAX_INPUT_FILE_BYTES, R2_BUCKET_NAME, loadR2Credentials } from './config';
import { processImage, type AssetKind } from './imageProcessor';
import { createR2Client } from './r2Client';
import type { S3Client } from '@aws-sdk/client-s3';

function assetKindFor(baseName: string): AssetKind {
  if (baseName === 'logo') return 'logo';
  if (baseName === 'hero') return 'hero';
  if (baseName === 'ambiance') return 'ambiance';
  return 'gallery';
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)}KB`;
}

interface PlannedAsset {
  inputPath: string;
  outputFilename: string;
  kind: AssetKind;
}

function planAssets(slug: string): PlannedAsset[] {
  const inputDir = path.join(process.cwd(), CUSTOMER_INPUT_DIR, slug);
  if (!fs.existsSync(inputDir)) {
    throw new Error(`no input folder found at ${CUSTOMER_INPUT_DIR}/${slug}/`);
  }

  const entries = fs.readdirSync(inputDir, { withFileTypes: true }).filter((e) => e.isFile());
  if (entries.length === 0) {
    throw new Error(`${CUSTOMER_INPUT_DIR}/${slug}/ is empty`);
  }

  const planned: PlannedAsset[] = [];
  for (const entry of entries) {
    const ext = path.extname(entry.name).toLowerCase();
    const baseName = path.basename(entry.name, path.extname(entry.name)).toLowerCase();

    if (!ACCEPTED_INPUT_EXTENSIONS.has(ext)) {
      console.log(`  \x1b[31m✗\x1b[0m ${entry.name} — unsupported extension "${ext}"`);
      continue;
    }

    const outputFilename = `${baseName}.webp`;
    if (!isValidAssetFilename(outputFilename)) {
      console.log(`  \x1b[31m✗\x1b[0m ${entry.name} — filename produces invalid asset name "${outputFilename}"`);
      continue;
    }

    planned.push({
      inputPath: path.join(inputDir, entry.name),
      outputFilename,
      kind: assetKindFor(baseName),
    });
  }

  return planned;
}

async function uploadOne(client: S3Client, slug: string, plan: PlannedAsset): Promise<{ key: string; url: string } | null> {
  const raw = fs.readFileSync(plan.inputPath);

  if (raw.byteLength > MAX_INPUT_FILE_BYTES) {
    console.log(`  \x1b[31m✗\x1b[0m ${path.basename(plan.inputPath)} exceeds maximum input size (${formatBytes(raw.byteLength)} > ${formatBytes(MAX_INPUT_FILE_BYTES)})`);
    return null;
  }

  let processed;
  try {
    processed = await processImage(raw, plan.kind);
  } catch (err) {
    console.log(`  \x1b[31m✗\x1b[0m ${path.basename(plan.inputPath)} — ${(err as Error).message}`);
    return null;
  }

  const key = `${slug}/${plan.outputFilename}`;

  try {
    await client.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: processed.buffer,
      ContentType: 'image/webp',
      // Filenames are stable (logo.webp, hero.webp, ...), so a long
      // immutable cache would serve stale images after a replacement.
      // Bound staleness to an hour and require revalidation past that.
      CacheControl: 'public, max-age=3600, must-revalidate',
    }));
  } catch (err) {
    console.log(`  \x1b[31m✗\x1b[0m ${path.basename(plan.inputPath)} — upload failed: ${(err as Error).message}`);
    return null;
  }

  console.log(`  \x1b[32m✓\x1b[0m Uploading ${plan.outputFilename} (${processed.width}x${processed.height}, ${formatBytes(processed.bytes)}, q${processed.qualityUsed})`);
  return { key, url: `${ASSET_CDN_BASE_URL}/${key}` };
}

async function cmdUpload(slug: string): Promise<void> {
  console.log('\nWebbinAja Asset Pipeline\n');
  console.log(`Customer: ${slug}\n`);

  if (!isValidCustomerSlug(slug)) {
    console.error(`\x1b[31m✗ invalid slug "${slug}"\x1b[0m — must be lowercase letters/digits with single hyphens, e.g. "barber-agus"`);
    process.exitCode = 1;
    return;
  }

  let planned: PlannedAsset[];
  try {
    planned = planAssets(slug);
  } catch (err) {
    console.error(`\x1b[31m✗ ${(err as Error).message}\x1b[0m`);
    process.exitCode = 1;
    return;
  }

  if (planned.length === 0) {
    console.error('\x1b[31m✗ no valid image files to upload\x1b[0m');
    process.exitCode = 1;
    return;
  }

  let client;
  try {
    loadR2Credentials(); // fail fast with a clear message before doing any work
    client = createR2Client();
  } catch (err) {
    console.error(`\x1b[31m✗ ${(err as Error).message}\x1b[0m`);
    process.exitCode = 1;
    return;
  }

  console.log('✓ Validating files');
  console.log('✓ Optimizing images\n');

  const uploaded: { key: string; url: string }[] = [];
  for (const plan of planned) {
    const result = await uploadOne(client, slug, plan);
    if (result) uploaded.push(result);
  }

  console.log();
  if (uploaded.length === 0) {
    console.error('\x1b[31mNo assets were uploaded — see errors above.\x1b[0m');
    process.exitCode = 1;
    return;
  }

  if (uploaded.length < planned.length) {
    console.log(`\x1b[33m${planned.length - uploaded.length} file(s) failed — see above.\x1b[0m`);
  }

  console.log('Assets uploaded successfully.\n');
  console.log('CDN:');
  console.log(`${ASSET_CDN_BASE_URL}/${slug}/`);
  console.log();
  for (const { url } of uploaded) console.log(`  ${url}`);
  console.log();
  console.log(`Next: reference these filenames in src/customers/${slug}/config.ts under "assets", then commit + deploy.`);
}

async function cmdSync(slug: string, flags: Set<string>): Promise<void> {
  await cmdUpload(slug);
  if (process.exitCode) return;

  if (!isValidCustomerSlug(slug)) return; // already reported by cmdUpload

  const planned = planAssets(slug);
  const currentFilenames = new Set(planned.map((p) => p.outputFilename));

  const client = createR2Client();
  const listed = await client.send(new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, Prefix: `${slug}/` }));
  const remoteKeys = (listed.Contents ?? []).map((o) => o.Key).filter((k): k is string => Boolean(k));

  const stale = remoteKeys.filter((key) => {
    const filename = key.slice(slug.length + 1);
    return filename && !currentFilenames.has(filename);
  });

  if (stale.length === 0) {
    console.log('No stale remote assets found.');
    return;
  }

  console.log(`\n\x1b[33mFound ${stale.length} remote asset(s) no longer referenced locally:\x1b[0m`);
  for (const key of stale) console.log(`  - ${key}`);

  if (!flags.has('--delete')) {
    console.log('\nRun with --delete to remove them (you will be asked to confirm).');
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`\nDelete these ${stale.length} object(s) from R2? Type "yes" to confirm: `);
  rl.close();

  if (answer.trim().toLowerCase() !== 'yes') {
    console.log('Aborted — nothing deleted.');
    return;
  }

  await client.send(new DeleteObjectsCommand({
    Bucket: R2_BUCKET_NAME,
    Delete: { Objects: stale.map((Key) => ({ Key })) },
  }));
  console.log(`Deleted ${stale.length} object(s).`);
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  if (!command) {
    console.error('Usage: npm run assets:upload <slug>');
    console.error('       npm run assets:sync   <slug> [--delete]');
    process.exitCode = 1;
    return;
  }

  // Slug is optional on the command line — if omitted, just ask for it, so
  // `npm run assets:upload` alone works without needing `-- <slug>`.
  const [firstArg, ...flagArgs] = rest;
  let slug = firstArg;
  if (!slug) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    slug = (await rl.question('Slug customer: ')).trim();
    rl.close();
  }
  const flags = new Set(flagArgs);

  if (!slug) {
    console.error('Slug wajib diisi.');
    process.exitCode = 1;
    return;
  }

  try {
    if (command === 'upload') {
      await cmdUpload(slug);
    } else if (command === 'sync') {
      await cmdSync(slug, flags);
    } else {
      console.error(`Unknown command "${command}". Use "upload" or "sync".`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(`\x1b[31m✗ ${(err as Error).message}\x1b[0m`);
    process.exitCode = 1;
  }
}

main();
