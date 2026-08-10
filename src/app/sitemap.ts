import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { MAIN_DOMAIN, resolveCustomerByHost } from '@/lib/customers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  const customerMatch = await resolveCustomerByHost(host);

  if (customerMatch) {
    // Return customer sitemap
    const activeDomain = customerMatch.config.customDomain 
      ? `https://${customerMatch.config.customDomain}` 
      : `https://${customerMatch.slug}.${MAIN_DOMAIN}`;

    return [
      {
        url: activeDomain,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
      },
    ];
  }

  // Return main site sitemap (webbinaja.com)
  return [
    {
      url: `https://${MAIN_DOMAIN}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
