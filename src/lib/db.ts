// Neon Postgres — used by the public order form (/pesan), the public status
// lookup (/status), and the admin panel (/[token]). All three run in
// production, so unlike most of this codebase this file's DATABASE_URL is
// read at runtime on Vercel too (see .env.local.example). No ORM — this
// project has none anywhere else, and a handful of small tables don't need one.
import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';
import crypto from 'node:crypto';
import type { ServiceInput, CatalogItemInput } from './customerScaffold';
import type { AdminRole } from './adminAuth';
import type { CustomerConfig } from '@/types/config';
import { getCustomerAssetUrl, resolveCustomerImages } from './assets';

type SqlTag = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown[]>;

let localPool: Pool | undefined;

// Local Postgres (docs/local-dev — DATABASE_URL pointing at localhost) can't
// speak Neon's HTTP `/sql` protocol that `neon()` requires, so this falls
// back to plain `pg` over TCP for that one case, wrapped in a same-shaped
// tagged-template function so every query below is written once and works
// against both. Never taken in production, where DATABASE_URL is a real
// Neon endpoint — this exists purely so `npm run dev` can be tested
// end-to-end against a real Postgres without needing Neon's proxy infra.
function localSql(url: string): SqlTag {
  localPool ??= new Pool({ connectionString: url });
  const pool = localPool;
  return async (strings, ...values) => {
    let text = '';
    strings.forEach((s, i) => {
      text += s;
      if (i < values.length) text += `$${i + 1}`;
    });
    const res = await pool.query(text, values);
    return res.rows;
  };
}

let neonClient: SqlTag | undefined;

function sql(): SqlTag {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return localSql(url);
  }
  if (!neonClient) {
    neonClient = neon(url) as unknown as SqlTag;
  }
  return neonClient;
}

type RawQuery = (text: string, params: unknown[]) => Promise<unknown[]>;

/**
 * For queries whose WHERE clause is conditional (search/filter combos on the
 * paginated list pages) — the tagged-template `sql()` above can't express
 * "include this condition only if the filter is set" without building the
 * template string dynamically, which defeats its safety. This takes plain
 * `$1, $2, ...`-style SQL + a params array instead (same shape `pg.Pool.query`
 * and `neon().query` both already accept), still fully parameterized.
 */
let neonRawClient: unknown;

function rawSql(): RawQuery {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    localPool ??= new Pool({ connectionString: url });
    const pool = localPool;
    return async (text, params) => (await pool.query(text, params)).rows;
  }
  if (!neonRawClient) {
    neonRawClient = neon(url);
  }
  const client = neonRawClient as { query: (text: string, params: unknown[]) => Promise<unknown[]> };
  return async (text, params) => (await client.query(text, params)) as unknown[];
}

export type SubmissionStatus = 'pending' | 'processed';
export type WorkStatus = 'not_started' | 'in_progress' | 'done';
export type PaymentStatus = 'unchecked' | 'confirmed' | 'rejected';

export interface Submission {
  id: string;
  status: SubmissionStatus;
  businessName: string;
  template: string | null;
  tagline: string | null;
  description: string | null;
  whatsapp: string;
  address: string | null;
  mapsLink: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  marketplace: string | null;
  openingHours: string | null;
  logoFilename: string | null;
  heroFilename: string | null;
  ambianceFilename: string | null;
  packageTier: string | null;
  themePaletteId: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  gallery: string[];
  services: ServiceInput[];
  catalog: CatalogItemInput[];
  processedSlug: string | null;
  workStatus: WorkStatus;
  paymentStatus: PaymentStatus;
  queueNumber: number | null;
  lookupCode: string;
  createdAt: string;
}

export interface NewSubmissionInput {
  /**
   * Client-generated (crypto.randomUUID()) — photos are uploaded to
   * `_submissions/<id>/...` in R2 *before* the row exists (see
   * src/app/pesan/actions.ts), so the row has to be inserted under that
   * same id afterward rather than a server-generated one, or the uploaded
   * filenames referenced by the row would point at the wrong prefix.
   */
  id: string;
  businessName: string;
  template: string;
  tagline: string;
  description: string;
  whatsapp: string;
  address: string;
  mapsLink: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  marketplace: string;
  openingHours: string;
  logoFilename?: string;
  heroFilename?: string;
  ambianceFilename?: string;
  packageTier?: string;
  themePaletteId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  gallery: string[];
  services: ServiceInput[];
  catalog: CatalogItemInput[];
}

// Row shape as it comes back from Postgres (snake_case) before mapping to
// the camelCase `Submission` shape the rest of the app uses.
interface SubmissionRow {
  id: string;
  status: string;
  business_name: string;
  template: string | null;
  tagline: string | null;
  description: string | null;
  whatsapp: string;
  address: string | null;
  maps_link: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  marketplace: string | null;
  opening_hours: string | null;
  logo_filename: string | null;
  hero_filename: string | null;
  ambiance_filename: string | null;
  package_tier: string | null;
  theme_palette_id: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  gallery: string[];
  services: ServiceInput[];
  catalog: CatalogItemInput[];
  processed_slug: string | null;
  work_status: string;
  payment_status: string;
  queue_number: number | null;
  lookup_code: string;
  created_at: string;
}

function mapRow(row: SubmissionRow): Submission {
  return {
    id: row.id,
    status: row.status === 'processed' ? 'processed' : 'pending',
    businessName: row.business_name,
    template: row.template,
    tagline: row.tagline,
    description: row.description,
    whatsapp: row.whatsapp,
    address: row.address,
    mapsLink: row.maps_link,
    instagram: row.instagram,
    facebook: row.facebook,
    tiktok: row.tiktok,
    marketplace: row.marketplace,
    openingHours: row.opening_hours,
    logoFilename: row.logo_filename,
    heroFilename: row.hero_filename,
    ambianceFilename: row.ambiance_filename,
    packageTier: row.package_tier,
    themePaletteId: row.theme_palette_id,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    accentColor: row.accent_color,
    gallery: row.gallery ?? [],
    services: row.services ?? [],
    catalog: row.catalog ?? [],
    processedSlug: row.processed_slug,
    workStatus: row.work_status === 'in_progress' || row.work_status === 'done' ? row.work_status : 'not_started',
    paymentStatus: row.payment_status === 'confirmed' || row.payment_status === 'rejected' ? row.payment_status : 'unchecked',
    queueNumber: row.queue_number,
    lookupCode: row.lookup_code,
    createdAt: row.created_at,
  };
}

/** Not meant to be typed by hand — customer support reads this back to the customer over the phone/WA, so it avoids visually similar characters (0/O, 1/I/L). */
function generateLookupCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i++) code += alphabet[bytes[i] % alphabet.length];
  return code;
}

export async function insertSubmission(input: NewSubmissionInput): Promise<{ id: string; lookupCode: string }> {
  const db = sql();
  const lookupCode = generateLookupCode();
  const rows = (await db`
    insert into submissions (
      id, business_name, template, tagline, description, whatsapp, address,
      maps_link, instagram, facebook, tiktok, marketplace, opening_hours, logo_filename, hero_filename,
      ambiance_filename, package_tier, theme_palette_id, primary_color,
      secondary_color, accent_color, gallery, services, catalog, lookup_code
    ) values (
      ${input.id}, ${input.businessName}, ${input.template}, ${input.tagline}, ${input.description},
      ${input.whatsapp}, ${input.address}, ${input.mapsLink}, ${input.instagram}, ${input.facebook},
      ${input.tiktok}, ${input.marketplace}, ${input.openingHours},
      ${input.logoFilename ?? null}, ${input.heroFilename ?? null}, ${input.ambianceFilename ?? null},
      ${input.packageTier ?? null},
      ${input.themePaletteId ?? null}, ${input.primaryColor ?? null}, ${input.secondaryColor ?? null}, ${input.accentColor ?? null},
      ${JSON.stringify(input.gallery)}, ${JSON.stringify(input.services)}, ${JSON.stringify(input.catalog)}, ${lookupCode}
    )
    returning id, lookup_code
  `) as { id: string; lookup_code: string }[];
  return { id: rows[0].id, lookupCode: rows[0].lookup_code };
}

export interface SubmissionListFilters {
  /** Matched (case-insensitive, substring) against business_name OR whatsapp. */
  search?: string;
  /** Defaults to 'pending' at the call site (src/app/[token]/inbox/page.tsx) — a submission whose site is already built and live has no reason to keep resurfacing in the default view alongside ones still needing action. */
  status?: SubmissionStatus;
  workStatus?: WorkStatus;
  paymentStatus?: PaymentStatus;
  page: number;
  pageSize: number;
}

export interface SubmissionListResult {
  items: Submission[];
  total: number;
}

/**
 * Backs the Inbox list (src/app/[token]/inbox/page.tsx) — filtered and
 * paginated in SQL (LIMIT/OFFSET + a separate COUNT), not fetched-then-sliced
 * in JS, so the query cost stays bounded as submissions grow regardless of
 * how many total rows exist.
 */
export async function listSubmissionsPage(filters: SubmissionListFilters): Promise<SubmissionListResult> {
  const query = rawSql();
  const search = filters.search?.trim() ? `%${filters.search.trim()}%` : null;
  const page = Math.max(1, filters.page);
  const pageSize = Math.min(Math.max(1, filters.pageSize), 100);
  const offset = (page - 1) * pageSize;

  const params = [search, filters.status ?? null, filters.workStatus ?? null, filters.paymentStatus ?? null];
  const whereClause = `
    where ($1::text is null or business_name ilike $1 or whatsapp ilike $1)
      and ($2::text is null or status = $2)
      and ($3::text is null or work_status = $3)
      and ($4::text is null or payment_status = $4)
  `;

  const [rows, countRows] = await Promise.all([
    query(
      `select * from submissions ${whereClause} order by created_at desc limit $5 offset $6`,
      [...params, pageSize, offset]
    ),
    query(`select count(*)::int as count from submissions ${whereClause}`, params),
  ]);

  return {
    items: (rows as SubmissionRow[]).map(mapRow),
    total: (countRows[0] as { count: number })?.count ?? 0,
  };
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const db = sql();
  const rows = (await db`select * from submissions where id = ${id}`) as SubmissionRow[];
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function markSubmissionProcessed(id: string, slug: string): Promise<void> {
  const db = sql();
  await db`update submissions set status = 'processed', processed_slug = ${slug} where id = ${id}`;
}

export async function deleteSubmission(id: string): Promise<void> {
  const db = sql();
  await db`delete from submissions where id = ${id}`;
}

export interface StatusPatch {
  workStatus?: WorkStatus;
  paymentStatus?: PaymentStatus;
}

/**
 * Updates work/payment status. When paymentStatus is being set to
 * 'confirmed' for a submission that doesn't have a queue number yet, one is
 * assigned atomically in the same statement via `nextval()` — two admins
 * confirming payment on different submissions at the same moment can't ever
 * collide on the same number, and confirming an already-confirmed
 * submission again is a no-op (queue_number only ever gets set once, via
 * the `is null` guard below).
 */
export async function updateSubmissionStatus(id: string, patch: StatusPatch): Promise<Submission | null> {
  const db = sql();
  const assignQueueNumber = patch.paymentStatus === 'confirmed';

  const rows = (await db`
    update submissions set
      work_status = coalesce(${patch.workStatus ?? null}, work_status),
      payment_status = coalesce(${patch.paymentStatus ?? null}, payment_status),
      queue_number = case
        when ${assignQueueNumber} and queue_number is null then nextval('queue_number_seq')
        else queue_number
      end
    where id = ${id}
    returning *
  `) as SubmissionRow[];

  return rows[0] ? mapRow(rows[0]) : null;
}

/** Public status-check lookup — both whatsapp AND lookupCode must match the same row (see src/app/status). */
export async function getSubmissionByLookup(whatsapp: string, lookupCode: string): Promise<Submission | null> {
  const db = sql();
  const rows = (await db`
    select * from submissions where whatsapp = ${whatsapp} and lookup_code = ${lookupCode}
  `) as SubmissionRow[];
  return rows[0] ? mapRow(rows[0]) : null;
}

// --- Admin accounts -------------------------------------------------------

export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
  role: AdminRole;
  createdAt: string;
}

interface AdminRow {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
}

function mapAdminRow(row: AdminRow): Admin {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    role: row.role === 'super_admin' ? 'super_admin' : 'admin',
    createdAt: row.created_at,
  };
}

export async function countAdmins(): Promise<number> {
  const db = sql();
  const rows = (await db`select count(*)::int as count from admins`) as { count: number }[];
  return rows[0]?.count ?? 0;
}

export async function getAdminByUsername(username: string): Promise<Admin | null> {
  const db = sql();
  const rows = (await db`select * from admins where username = ${username}`) as AdminRow[];
  return rows[0] ? mapAdminRow(rows[0]) : null;
}

export async function createAdmin(input: { username: string; passwordHash: string; role: AdminRole; createdBy?: string }): Promise<Admin> {
  const db = sql();
  const rows = (await db`
    insert into admins (username, password_hash, role, created_by)
    values (${input.username}, ${input.passwordHash}, ${input.role}, ${input.createdBy ?? null})
    returning *
  `) as AdminRow[];
  return mapAdminRow(rows[0]);
}

export async function listAdmins(): Promise<Pick<Admin, 'id' | 'username' | 'role' | 'createdAt'>[]> {
  const db = sql();
  const rows = (await db`select id, username, role, created_at from admins order by created_at asc`) as AdminRow[];
  return rows.map((r) => ({ id: r.id, username: r.username, role: r.role === 'super_admin' ? 'super_admin' : 'admin', createdAt: r.created_at }));
}

// Generic, reusable IP rate limiter backed by one small table — every write
// endpoint reachable without an admin session (login attempts, public order
// submissions, public photo uploads) needs *some* volume cap, or it's an
// open door for cost/storage abuse. One shared table keyed by `bucket`
// keeps this to a single mechanism instead of one bespoke table per
// endpoint. Table: `rate_limits (bucket text, ip text, created_at timestamptz)`.
export type RateLimitBucket = 'login' | 'order_submit' | 'asset_upload' | 'status_check';

/**
 * True when this IP has already hit `maxHits` recorded events for `bucket`
 * within the last `windowMinutes`. Callers decide what counts as a "hit"
 * (e.g. only failed logins, but every upload attempt) by choosing when to
 * call `recordRateLimitHit`.
 */
export async function isRateLimited(bucket: RateLimitBucket, ip: string, maxHits: number, windowMinutes: number): Promise<boolean> {
  const db = sql();
  const rows = (await db`
    select count(*)::int as count from rate_limits
    where bucket = ${bucket} and ip = ${ip}
      and created_at > now() - (${windowMinutes}::text || ' minutes')::interval
  `) as { count: number }[];
  return (rows[0]?.count ?? 0) >= maxHits;
}

export async function recordRateLimitHit(bucket: RateLimitBucket, ip: string): Promise<void> {
  const db = sql();
  await db`insert into rate_limits (bucket, ip) values (${bucket}, ${ip})`;
}

// --- Customers (created via the admin panel, works in production) --------
//
// This is the source of truth for customers created from now on — see
// migrations/0002_customers.sql for why. The original handful of demo
// customers under src/customers/*/config.ts stay file-based; getCustomerConfig
// in src/lib/customers.ts checks this table first and falls back to the file
// import, so both kinds of customer work identically to every reader
// (sites/[customer]/page.tsx, the promo route, proxy.ts's host resolver).

interface CustomerRow {
  slug: string;
  config: CustomerConfig;
  custom_domain: string | null;
  created_at: string;
  suspended: boolean;
}

// `and not suspended` — a suspended site's row stays fully intact, it just
// stops being resolvable by slug/custom-domain, so every public reader
// (sites/[customer]/page.tsx, the promo route, proxy.ts's host resolver —
// all go through getCustomerConfig in src/lib/customers.ts, which calls
// this) 404s exactly as if the customer didn't exist, without deleting anything.
export async function getCustomerFromDb(slug: string): Promise<CustomerConfig | null> {
  const db = sql();
  const rows = (await db`select config from customers where slug = ${slug} and not suspended`) as { config: CustomerConfig }[];
  return rows[0]?.config ?? null;
}

export async function getCustomerByCustomDomainFromDb(domain: string): Promise<{ slug: string; config: CustomerConfig } | null> {
  const db = sql();
  const rows = (await db`select slug, config from customers where custom_domain = ${domain} and not suspended`) as { slug: string; config: CustomerConfig }[];
  return rows[0] ? { slug: rows[0].slug, config: rows[0].config } : null;
}

/**
 * Unlike getCustomerFromDb (which filters out suspended rows so callers see
 * "not found"), this tells proxy.ts's host resolver whether a slug is
 * suspended vs never existed at all — so a suspended site's visitors get a
 * dedicated "website dinonaktifkan" page instead of silently falling
 * through to the main marketing homepage (NextResponse.next() with an
 * unrewritten path renders "/" regardless of hostname).
 */
export async function getCustomerSuspendedBySlugFromDb(slug: string): Promise<boolean | null> {
  const db = sql();
  const rows = (await db`select suspended from customers where slug = ${slug}`) as { suspended: boolean }[];
  return rows.length > 0 ? rows[0].suspended : null;
}

export async function getCustomerSuspendedByCustomDomainFromDb(domain: string): Promise<{ slug: string; suspended: boolean } | null> {
  const db = sql();
  const rows = (await db`select slug, suspended from customers where custom_domain = ${domain}`) as { slug: string; suspended: boolean }[];
  return rows[0] ?? null;
}

/** Admin-only — suspend/reactivate a website without touching its data. See migrations/0003_customers_suspended.sql. */
export async function setCustomerSuspendedInDb(slug: string, suspended: boolean): Promise<boolean> {
  const db = sql();
  const rows = (await db`update customers set suspended = ${suspended} where slug = ${slug} returning slug`) as { slug: string }[];
  return rows.length > 0;
}

export async function customerSlugExistsInDb(slug: string): Promise<boolean> {
  const db = sql();
  const rows = (await db`select 1 from customers where slug = ${slug}`) as unknown[];
  return rows.length > 0;
}

export async function listCustomerSlugsFromDb(): Promise<string[]> {
  const db = sql();
  const rows = (await db`select slug from customers order by created_at asc`) as { slug: string }[];
  return rows.map((r) => r.slug);
}

export interface CustomerListItem {
  slug: string;
  businessName: string;
  template: string;
  packageTier: string;
  customDomain: string | null;
  createdAt: string;
  suspended: boolean;
}

function mapCustomerRow(r: CustomerRow): CustomerListItem {
  return {
    slug: r.slug,
    businessName: r.config.businessName,
    template: r.config.template,
    packageTier: r.config.package,
    customDomain: r.custom_domain,
    createdAt: r.created_at,
    suspended: r.suspended,
  };
}

export interface CustomerListFilters {
  /** Matched (case-insensitive, substring) against businessName OR slug. */
  search?: string;
  template?: string;
  packageTier?: string;
  suspended?: boolean;
  page: number;
  pageSize: number;
}

export interface CustomerListResult {
  items: CustomerListItem[];
  total: number;
}

/**
 * Backs the admin "Websites" list (src/app/[token]/websites) — filtered and
 * paginated in SQL, same reasoning as listSubmissionsPage. businessName/template
 * live inside the `config` JSONB column, so the filters read through `->>`.
 */
export async function listCustomersPage(filters: CustomerListFilters): Promise<CustomerListResult> {
  const query = rawSql();
  const search = filters.search?.trim() ? `%${filters.search.trim()}%` : null;
  const page = Math.max(1, filters.page);
  const pageSize = Math.min(Math.max(1, filters.pageSize), 100);
  const offset = (page - 1) * pageSize;

  const params = [search, filters.template ?? null, filters.packageTier ?? null, filters.suspended ?? null];
  const whereClause = `
    where ($1::text is null or config->>'businessName' ilike $1 or slug ilike $1)
      and ($2::text is null or config->>'template' = $2)
      and ($3::text is null or config->>'package' = $3)
      and ($4::boolean is null or suspended = $4)
  `;

  const [rows, countRows] = await Promise.all([
    query(
      `select slug, config, custom_domain, created_at, suspended from customers ${whereClause} order by created_at desc limit $5 offset $6`,
      [...params, pageSize, offset]
    ),
    query(`select count(*)::int as count from customers ${whereClause}`, params),
  ]);

  return {
    items: (rows as CustomerRow[]).map(mapCustomerRow),
    total: (countRows[0] as { count: number })?.count ?? 0,
  };
}

export interface ShowcaseCustomer {
  slug: string;
  businessName: string;
  template: string;
  logoUrl?: string;
  heroUrl?: string;
  customDomain: string | null;
}

/**
 * Backs the "website yang sudah live" trust section on the landing page
 * (src/app/page.tsx) — real customers only (never the file-based template
 * demos, which aren't real orders), excludes suspended ones, newest first.
 * Called from an ISR page with a multi-minute revalidate window, not on
 * every request, so this being a real DB query is cheap in aggregate
 * despite the homepage being the highest-traffic page in the app.
 */
export async function listShowcaseCustomers(limit: number): Promise<ShowcaseCustomer[]> {
  const db = sql();
  const rows = (await db`
    select slug, config, custom_domain from customers
    where not suspended
    order by created_at desc
    limit ${limit}
  `) as CustomerRow[];

  return rows.map((r) => {
    const images = resolveCustomerImages(r.slug, r.config.assets, r.config.images);
    return {
      slug: r.slug,
      businessName: r.config.businessName,
      template: r.config.template,
      logoUrl: r.config.assets?.logo ? getCustomerAssetUrl(r.slug, r.config.assets.logo) : undefined,
      heroUrl: images.hero,
      customDomain: r.custom_domain,
    };
  });
}

export async function insertCustomerToDb(slug: string, config: CustomerConfig): Promise<void> {
  const db = sql();
  await db`
    insert into customers (slug, config, custom_domain)
    values (${slug}, ${JSON.stringify(config)}, ${config.customDomain ?? null})
  `;
}

export async function updateCustomerInDb(slug: string, config: CustomerConfig): Promise<boolean> {
  const db = sql();
  const rows = await db`
    update customers
    set config = ${JSON.stringify(config)}
    where slug = ${slug}
    returning slug
  `;
  return rows.length > 0;
}

export async function updateCustomerCustomDomainInDb(slug: string, customDomain: string | null): Promise<CustomerConfig | null> {
  const db = sql();
  const rows = (await db`
    update customers set
      config = jsonb_set(config, '{customDomain}', ${customDomain ? JSON.stringify(customDomain) : 'null'}::jsonb, true),
      custom_domain = ${customDomain}
    where slug = ${slug}
    returning config
  `) as { config: CustomerConfig }[];
  return rows[0]?.config ?? null;
}
