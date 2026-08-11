#!/usr/bin/env -S node
// WebbinAja customer scaffolding CLI.
//
//   npm run customer:new            (will ask for the customer slug)
//   npm run customer:new bliss
//
// Interactively creates src/customers/<slug>/config.ts from answers, so a
// new customer site starts from a valid, correctly-shaped config instead of
// copy-pasted-and-half-edited boilerplate. Does not touch R2, Vercel, or
// git — just writes one local file.
//
// Same config-writing logic is shared with the local admin UI at
// src/app/admin/[token] — see src/lib/customerScaffold.ts.
import readline from 'node:readline/promises';
import { isValidCustomerSlug } from '../../src/lib/assets';
import { CUSTOMER_TEMPLATES, customerDirExists, writeNewCustomerConfig, type PackageTier } from '../../src/lib/customerScaffold';

// Reads lines via the readline interface's async iterator rather than
// repeated rl.question() calls. With piped/non-TTY stdin, Node's
// readline/promises can drop already-buffered lines between successive
// question() calls (the 'line' listener for the next question attaches
// too late) — this pattern reads correctly under both a real TTY and piped
// input, which matters for both interactive use and scripted testing.
async function ask(
  lines: AsyncIterator<string>,
  question: string,
  opts: { required?: boolean; defaultValue?: string } = {}
): Promise<string> {
  for (;;) {
    const suffix = opts.defaultValue !== undefined ? ` (${opts.defaultValue || 'kosong'})` : '';
    process.stdout.write(`${question}${suffix}: `);
    const { value, done } = await lines.next();
    const answer = (done ? '' : value).trim();
    if (answer) return answer;
    if (opts.defaultValue !== undefined) return opts.defaultValue;
    if (!opts.required) return '';
    console.log('  Wajib diisi.');
  }
}

async function main(): Promise<void> {
  console.log('\nWebbinAja — Customer Scaffold\n');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const lines = rl[Symbol.asyncIterator]();

  let slug = process.argv[2] ?? '';
  for (;;) {
    if (!slug) slug = await ask(lines, 'Slug (contoh: barber-agus)', { required: true });
    if (!isValidCustomerSlug(slug)) {
      console.log('  Slug tidak valid — huruf kecil, angka, dipisah tanda hubung tunggal (contoh: cafe-siti).');
      slug = '';
      continue;
    }
    if (customerDirExists(slug)) {
      console.error(`\n✗ src/customers/${slug}/ sudah ada. Batal — tidak ada yang ditimpa.`);
      rl.close();
      process.exitCode = 1;
      return;
    }
    break;
  }

  const businessName = await ask(lines, 'Nama bisnis', { required: true });

  let template = '';
  console.log(`\nTemplate tersedia: ${CUSTOMER_TEMPLATES.join(', ')}`);
  for (;;) {
    template = await ask(lines, 'Template', { required: true });
    if ((CUSTOMER_TEMPLATES as readonly string[]).includes(template)) break;
    console.log('  Tidak dikenali, pilih salah satu dari daftar di atas.');
  }

  const tagline = await ask(lines, 'Tagline', { defaultValue: '' });
  const description = await ask(lines, 'Deskripsi singkat', { defaultValue: '' });
  const whatsapp = await ask(lines, 'Nomor WhatsApp (format 62xxxxxxxxxx, hanya digit)', { required: true });
  const address = await ask(lines, 'Alamat', { defaultValue: '' });
  const mapsLink = await ask(lines, 'Google Maps link', { defaultValue: '' });
  const instagram = await ask(lines, 'Instagram URL (kosongkan jika tidak ada)', { defaultValue: '' });
  const facebook = await ask(lines, 'Facebook URL (kosongkan jika tidak ada)', { defaultValue: '' });

  let packageTier: PackageTier = 'basic';
  for (;;) {
    const answer = (await ask(lines, 'Paket (basic/business)', { defaultValue: 'basic' })).toLowerCase();
    if (answer === 'basic' || answer === 'business') {
      packageTier = answer;
      break;
    }
    console.log('  Ketik "basic" atau "business".');
  }

  rl.close();

  writeNewCustomerConfig({ slug, businessName, template, tagline, description, whatsapp, address, mapsLink, instagram, facebook, packageTier });

  console.log(`\n✓ Dibuat: src/customers/${slug}/config.ts\n`);
  console.log('Langkah selanjutnya:');
  console.log(`  1. Lengkapi "services" (dan field lain yang masih kosong) di config.ts`);
  console.log(`  2. Taruh foto di customer-input/${slug}/ (logo.jpg, hero.jpg, gallery-01.jpg, ...)`);
  console.log(`  3. npm run assets:upload ${slug}`);
  console.log(`  4. npm run customer:validate ${slug} -- --check-assets`);
  console.log(`  5. Commit + push → Vercel build\n`);
}

main();
