import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { MAIN_DOMAIN, resolveCustomerByHost } from '@/lib/customers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  const customerMatch = await resolveCustomerByHost(host);

  const activeDomain = customerMatch 
    ? (customerMatch.config.customDomain ? `https://${customerMatch.config.customDomain}` : `https://${customerMatch.slug}.${MAIN_DOMAIN}`)
    : `https://${MAIN_DOMAIN}`;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${activeDomain}/sitemap.xml`,
  };
}
