// Scaffolds an empty, correctly-numbered migration file, e.g.:
//   npm run db:migration:new -- add_promo_flag_to_submissions
// -> migrations/0002_add_promo_flag_to_submissions.sql
import fs from 'node:fs';
import path from 'node:path';

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

function nextNumber(): string {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => /^\d{4}_.*\.sql$/.test(f));
  const max = files.reduce((acc, f) => Math.max(acc, parseInt(f.slice(0, 4), 10)), 0);
  return String(max + 1).padStart(4, '0');
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const rawName = process.argv.slice(2).join(' ').trim();
if (!rawName) {
  console.error('Usage: npm run db:migration:new -- <nama_migrasi>');
  process.exit(1);
}

const filename = `${nextNumber()}_${slugify(rawName)}.sql`;
const filepath = path.join(MIGRATIONS_DIR, filename);

fs.writeFileSync(filepath, `-- ${rawName}\n\n`);
console.log(`Dibuat: migrations/${filename}`);
