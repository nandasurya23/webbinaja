import fs from 'fs';
import path from 'path';
import { CustomerConfig } from '@/types/config';
import { isValidCustomerSlug, resolveCustomerImages } from '@/lib/assets';
import {
  getCustomerFromDb,
  getCustomerByCustomDomainFromDb,
  getCustomerSuspendedBySlugFromDb,
  getCustomerSuspendedByCustomDomainFromDb,
} from '@/lib/db';

// Define the root domain
export const MAIN_DOMAIN = 'webbinaja.com';

/**
 * Get all available customer slugs by reading the directory names in src/customers
 */
export function getAllCustomerSlugs(): string[] {
  const customersDir = path.join(process.cwd(), 'src', 'customers');
  if (!fs.existsSync(customersDir)) return [];
  
  return fs.readdirSync(customersDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

/**
 * Returns up to `limit` customer slugs, most-recently-created first, using
 * the ordered manifest maintained by src/lib/customerScaffold.ts. Any
 * customer directory not yet in the manifest (created before this feature
 * existed, or added by hand) is treated as older than every tracked slug —
 * it still works normally (customer pages render on-demand and get cached
 * regardless of prerender status), it just isn't prioritized for the
 * build-time prerender budget.
 *
 * Exists so `generateStaticParams` in src/app/sites/[customer]/page.tsx can
 * pre-render a bounded number of pages instead of every customer — without
 * this, build time grows without bound as the customer count grows.
 */
export function getRecentCustomerSlugs(limit: number): string[] {
  const manifestPath = path.join(process.cwd(), 'src', 'customers', 'manifest.json');
  let manifestOrder: string[] = [];
  if (fs.existsSync(manifestPath)) {
    try {
      manifestOrder = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      manifestOrder = [];
    }
  }

  const all = new Set(getAllCustomerSlugs());
  const manifestSet = new Set(manifestOrder);
  const untracked = [...all].filter((slug) => !manifestSet.has(slug));
  const trackedNewestFirst = manifestOrder.filter((slug) => all.has(slug)).reverse();

  return [...trackedNewestFirst, ...untracked].slice(0, limit);
}

function withResolvedImages(slug: string, config: CustomerConfig): CustomerConfig {
  const resolved = resolveCustomerImages(slug, config.assets, config.images);
  return {
    ...config,
    images: {
      ...config.images,
      ...(resolved.hero !== undefined && { hero: resolved.hero }),
      ...(resolved.gallery !== undefined && { gallery: resolved.gallery }),
      ...(resolved.ambiance !== undefined && { ambiance: resolved.ambiance }),
    },
  };
}

/**
 * Get customer config by slug, with `assets` (R2 filenames) resolved into
 * absolute CDN URLs and merged into `images`. The slug is validated first —
 * it ends up in a dynamic import path for the file-based fallback, so this
 * also guards against path traversal (`../`, etc.) reaching the
 * bundler-resolved module map.
 *
 * Checks the `customers` table (customers created via the admin panel in
 * production — see migrations/0002_customers.sql) first, then falls back to
 * the file-based src/customers/<slug>/config.ts (the original handful of
 * template showcase sites, which don't need to be DB-backed since they're
 * only ever edited by a developer with repo access anyway).
 */
export async function getCustomerConfig(slug: string): Promise<CustomerConfig | null> {
  if (!isValidCustomerSlug(slug)) return null;

  const fromDb = await getCustomerFromDb(slug).catch(() => null);
  if (fromDb) return withResolvedImages(slug, fromDb);

  try {
    const data = await import(`@/customers/${slug}/config`);
    return withResolvedImages(slug, data.config as CustomerConfig);
  } catch {
    return null;
  }
}

/**
 * Reads customer config from the local file system only.
 * Used to avoid N+1 DB queries when looping through all file-based customers.
 */
async function getLocalCustomerConfig(slug: string): Promise<CustomerConfig | null> {
  if (!isValidCustomerSlug(slug)) return null;
  try {
    const data = await import(`@/customers/${slug}/config`);
    return withResolvedImages(slug, data.config as CustomerConfig);
  } catch {
    return null;
  }
}

/**
 * Resolve a given hostname to a customer config
 * Useful for sitemap and robots generation
 */
export async function resolveCustomerByHost(hostname: string): Promise<{ slug: string; config: CustomerConfig } | null> {
  // If it's the main domain or a dev version of it, it's not a customer
  const cleanHost = hostname.split(':')[0]; // remove port
  if (cleanHost === MAIN_DOMAIN || cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
    return null;
  }

  // 1. Check if it's a subdomain (e.g. barberagus.webbinaja.com)
  if (cleanHost.endsWith(`.${MAIN_DOMAIN}`)) {
    const slug = cleanHost.replace(`.${MAIN_DOMAIN}`, '');
    const config = await getCustomerConfig(slug);
    if (config) {
      return { slug, config };
    }
  }

  // 2. Custom domain (e.g. kliniksehat.com) — DB customers are looked up by
  // an indexed column directly (see migrations/0002_customers.sql), so this
  // is a single query rather than loading every customer's config to check.
  const dbMatch = await getCustomerByCustomDomainFromDb(cleanHost).catch(() => null);
  if (dbMatch) {
    return { slug: dbMatch.slug, config: withResolvedImages(dbMatch.slug, dbMatch.config) };
  }

  // File-based demo customers are few enough (see src/customers/) that
  // looping is fine — none of them are expected to carry a customDomain in
  // practice, but this keeps the feature working for them too if one ever does.
  const slugs = getAllCustomerSlugs();
  for (const slug of slugs) {
    const config = await getLocalCustomerConfig(slug);
    if (config && config.customDomain === cleanHost) {
      return { slug, config };
    }
  }

  return null;
}

export type CustomerHostStatus =
  | { status: 'active'; slug: string; config: CustomerConfig }
  | { status: 'suspended'; slug: string }
  | { status: 'not_found' };

/**
 * Like resolveCustomerByHost, but distinguishes "suspended" from "never
 * existed" — resolveCustomerByHost's `null` conflates the two (see
 * getCustomerFromDb's `and not suspended` filter), which used to leave
 * proxy.ts unable to tell a suspended site apart from an unregistered
 * hostname. proxy.ts uses this to route suspended visitors to a dedicated
 * "website dinonaktifkan" page instead of falling through to the main
 * marketing homepage.
 */
export async function resolveCustomerHostStatus(hostname: string): Promise<CustomerHostStatus> {
  const cleanHost = hostname.split(':')[0];
  if (cleanHost === MAIN_DOMAIN || cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
    return { status: 'not_found' };
  }

  if (cleanHost.endsWith(`.${MAIN_DOMAIN}`)) {
    const slug = cleanHost.replace(`.${MAIN_DOMAIN}`, '');
    if (isValidCustomerSlug(slug)) {
      const suspended = await getCustomerSuspendedBySlugFromDb(slug).catch(() => null);
      if (suspended === true) return { status: 'suspended', slug };
      if (suspended === false) {
        const config = await getCustomerConfig(slug);
        if (config) return { status: 'active', slug, config };
      }
    }
  }

  const dbMatch = await getCustomerByCustomDomainFromDb(cleanHost).catch(() => null);
  if (dbMatch) {
    return { status: 'active', slug: dbMatch.slug, config: withResolvedImages(dbMatch.slug, dbMatch.config) };
  }
  const suspendedDomainMatch = await getCustomerSuspendedByCustomDomainFromDb(cleanHost).catch(() => null);
  if (suspendedDomainMatch?.suspended) {
    return { status: 'suspended', slug: suspendedDomainMatch.slug };
  }

  const slugs = getAllCustomerSlugs();
  for (const slug of slugs) {
    const config = await getLocalCustomerConfig(slug);
    if (config && config.customDomain === cleanHost) {
      return { status: 'active', slug, config };
    }
  }

  return { status: 'not_found' };
}
