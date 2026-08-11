#!/usr/bin/env -S node
// WebbinAja customer config validator.
//
//   npm run customer:validate            (will ask for the customer slug)
//   npm run customer:validate bliss
//   npm run customer:validate bliss -- --check-assets
//
// Catches config mistakes (bad slug, unsafe URL, malformed asset filename,
// missing required field) locally, before a build/deploy — and, with
// --check-assets, confirms every referenced asset actually resolves on the
// public CDN (a plain HEAD request; no R2 credentials involved or needed).
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import readline from 'node:readline/promises';
import type { CustomerConfig } from '../../src/types/config';
import { isValidCustomerSlug, isValidAssetFilename, resolveCustomerImages } from '../../src/lib/assets';
import { isSafeUrl, sanitizeWhatsapp } from '../../src/lib/url';

const KNOWN_TEMPLATES = new Set([
  'barber', 'restaurant', 'professional', 'bakery', 'rental', 'gamecafe', 'gym', 'petshop', 'custom',
]);

type Level = 'error' | 'warn';
interface Result { level: Level; ok: boolean; label: string; detail?: string; }

function check(level: Level, ok: boolean, label: string, detail?: string): Result {
  return { level, ok, label, detail };
}

async function loadConfig(slug: string): Promise<CustomerConfig> {
  const configPath = path.join(process.cwd(), 'src', 'customers', slug, 'config.ts');
  if (!fs.existsSync(configPath)) {
    throw new Error(`src/customers/${slug}/config.ts tidak ditemukan`);
  }
  const mod = await import(pathToFileURL(configPath).href);
  if (!mod.config) {
    throw new Error(`config.ts tidak meng-export "config"`);
  }
  return mod.config as CustomerConfig;
}

function printResult(r: Result): void {
  const icon = r.ok ? '\x1b[32m✓\x1b[0m' : r.level === 'error' ? '\x1b[31m✗\x1b[0m' : '\x1b[33m!\x1b[0m';
  const detail = r.detail ? ` (${r.detail})` : '';
  console.log(`  ${icon} ${r.label}${detail}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const checkAssets = args.includes('--check-assets');
  let slug = args.find((a) => !a.startsWith('--'));

  if (!slug) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    slug = (await rl.question('Slug customer: ')).trim();
    rl.close();
  }

  if (!slug) {
    console.error('Slug wajib diisi.');
    process.exitCode = 1;
    return;
  }

  console.log('\nWebbinAja — Customer Config Validator\n');
  console.log(`Customer: ${slug}\n`);

  if (!isValidCustomerSlug(slug)) {
    console.error(`\x1b[31m✗ slug "${slug}" tidak valid\x1b[0m — huruf kecil/angka, dipisah tanda hubung tunggal.`);
    process.exitCode = 1;
    return;
  }

  let config: CustomerConfig;
  try {
    config = await loadConfig(slug);
  } catch (err) {
    console.error(`\x1b[31m✗ ${(err as Error).message}\x1b[0m`);
    process.exitCode = 1;
    return;
  }

  const results: Result[] = [
    check('error', Boolean(config.businessName), 'businessName terisi'),
    check('warn', Boolean(config.tagline), 'tagline terisi'),
    check('warn', Boolean(config.description), 'description terisi'),
    check('error', KNOWN_TEMPLATES.has(config.template), 'template dikenal', config.template),
    check('error', Boolean(config.theme?.primaryColor && config.theme?.secondaryColor && config.theme?.accentColor), 'theme lengkap (primary/secondary/accent)'),
    check('error', Boolean(config.contact?.whatsapp), 'contact.whatsapp terisi'),
    check('error', !config.contact?.whatsapp || sanitizeWhatsapp(config.contact.whatsapp) === config.contact.whatsapp, 'whatsapp hanya berisi digit', config.contact?.whatsapp),
    check('warn', Boolean(config.contact?.address), 'contact.address terisi'),
    check('error', !config.contact?.mapsLink || isSafeUrl(config.contact.mapsLink), 'mapsLink pakai http/https', config.contact?.mapsLink),
    check('error', !config.contact?.instagram || isSafeUrl(config.contact.instagram), 'instagram URL pakai http/https', config.contact?.instagram),
    check('error', !config.contact?.facebook || isSafeUrl(config.contact.facebook), 'facebook URL pakai http/https', config.contact?.facebook),
    check('error', Array.isArray(config.services), 'services adalah array'),
    check('warn', (config.services?.length ?? 0) > 0, 'services tidak kosong'),
  ];

  const assetFilenames = [
    config.assets?.logo,
    config.assets?.hero,
    config.assets?.ambiance,
    ...(config.assets?.gallery ?? []),
  ].filter((f): f is string => Boolean(f));

  for (const filename of assetFilenames) {
    results.push(check('error', isValidAssetFilename(filename), `asset filename valid: ${filename}`));
  }

  for (const r of results) printResult(r);

  let hasError = results.some((r) => r.level === 'error' && !r.ok);

  if (checkAssets) {
    console.log('\nMemeriksa asset di CDN (public read, tanpa credential)...');
    const resolved = resolveCustomerImages(slug, config.assets, config.images);
    const urls = [resolved.logo, resolved.hero, resolved.ambiance, ...(resolved.gallery ?? [])].filter(
      (u): u is string => Boolean(u)
    );

    if (urls.length === 0) {
      console.log('  (tidak ada asset untuk dicek)');
    }

    for (const url of urls) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        console.log(`  ${res.ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${url} (${res.status})`);
        if (!res.ok) hasError = true;
      } catch (err) {
        console.log(`  \x1b[31m✗\x1b[0m ${url} — ${(err as Error).message}`);
        hasError = true;
      }
    }
  }

  console.log();
  if (hasError) {
    console.error('\x1b[31mValidasi gagal — perbaiki poin bertanda ✗ sebelum deploy.\x1b[0m');
    process.exitCode = 1;
  } else {
    console.log('\x1b[32mSemua pengecekan wajib lolos.\x1b[0m (! = rekomendasi, boleh diabaikan)');
  }
}

main();
