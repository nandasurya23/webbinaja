// Runs every .sql file in migrations/ that hasn't been applied yet, in
// filename order, each inside its own transaction. Tracks what's already
// run in a `schema_migrations` table so re-running this script is a no-op
// once everything is applied. Works against both Neon (DATABASE_URL from
// the Neon dashboard, already includes sslmode=require) and local Postgres
// — this always speaks plain `pg` over TCP, unlike the app runtime in
// src/lib/db.ts which uses Neon's HTTP driver for edge compatibility;
// migrations run from a developer/CI machine, not the edge, so that
// constraint doesn't apply here.
import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set. Copy .env.local.example to .env.local and fill it in.');
    process.exit(1);
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found in migrations/.');
    return;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1') ? undefined : { rejectUnauthorized: true },
  });

  try {
    await pool.query(`
      create table if not exists schema_migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      )
    `);

    const { rows } = await pool.query<{ name: string }>('select name from schema_migrations');
    const applied = new Set(rows.map((r) => r.name));

    const pending = files.filter((f) => !applied.has(f));
    if (pending.length === 0) {
      console.log('Database already up to date — no pending migrations.');
      return;
    }

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      const client = await pool.connect();
      try {
        await client.query('begin');
        await client.query(sql);
        await client.query('insert into schema_migrations (name) values ($1)', [file]);
        await client.query('commit');
        console.log(`Applied: ${file}`);
      } catch (err) {
        await client.query('rollback');
        console.error(`Failed: ${file}`);
        throw err;
      } finally {
        client.release();
      }
    }

    console.log(`Done — applied ${pending.length} migration(s).`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
