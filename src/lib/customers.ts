import fs from 'fs';
import path from 'path';
import { CustomerConfig } from '@/types/config';
import { isValidCustomerSlug, resolveCustomerImages } from '@/lib/assets';

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

/**
 * Get customer config by slug, with `assets` (R2 filenames) resolved into
 * absolute CDN URLs and merged into `images`. The slug is validated first —
 * it ends up in a dynamic import path, so this also guards against path
 * traversal (`../`, etc.) reaching the bundler-resolved module map.
 */
export async function getCustomerConfig(slug: string): Promise<CustomerConfig | null> {
  if (!isValidCustomerSlug(slug)) return null;
  try {
    const data = await import(`@/customers/${slug}/config`);
    const config = data.config as CustomerConfig;

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

  // 2. If it's not a known subdomain, it might be a custom domain (e.g. kliniksehat.com)
  // We need to loop through all customers and find a matching customDomain
  const slugs = getAllCustomerSlugs();
  for (const slug of slugs) {
    const config = await getCustomerConfig(slug);
    if (config && config.customDomain === cleanHost) {
      return { slug, config };
    }
  }

  return null;
}
