import fs from 'fs';
import path from 'path';
import { CustomerConfig } from '@/types/config';

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
 * Get customer config by slug
 */
export async function getCustomerConfig(slug: string): Promise<CustomerConfig | null> {
  try {
    const data = await import(`@/customers/${slug}/config`);
    return data.config as CustomerConfig;
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
