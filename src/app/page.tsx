import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { listShowcaseCustomers } from '@/lib/db';
import { MAIN_DOMAIN } from '@/lib/customers';

export const metadata: Metadata = {
  title: 'Jasa Web 1 Hari — Website Bisnis Siap Pakai dalam 24 Jam',
  description:
    'Pilih dari 8 template premium (barbershop, restoran, gym, petshop, bakery, rental, dan lainnya), kirim data bisnis Anda via WhatsApp, website Anda live dalam 24 jam.',
  keywords: ['jasa website', 'website bisnis', 'website UMKM', 'jasa web 1 hari', 'template website'],
  openGraph: {
    title: 'Jasa Web 1 Hari — Website Bisnis Siap Pakai dalam 24 Jam',
    description: 'Pilih template, kirim data via WhatsApp, website Anda live dalam 24 jam.',
    images: ['/logos.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Jasa Web 1 Hari',
    description: 'Website bisnis siap pakai dalam 24 jam.',
  },
};

// ISR, not per-request: the homepage is the highest-traffic page in the app,
// so the "website yang sudah live" trust section below reads from Neon on a
// timer (revalidated in the background at most once every 5 minutes) rather
// than on every visit — visitors still get the fast static/CDN-cached page,
// new customers just take up to 5 minutes to show up here instead of being
// instant (unlike their own site, which goes live immediately — see
// revalidatePath in createCustomerAction).
export const revalidate = 300;

export default async function Home() {
  const showcaseSites = await listShowcaseCustomers(8)
    .then((customers) =>
      customers.map((c) => ({
        businessName: c.businessName,
        template: c.template,
        logoUrl: c.logoUrl,
        url: c.customDomain ? `https://${c.customDomain}` : `https://${c.slug}.${MAIN_DOMAIN}`,
      }))
    )
    // DATABASE_URL unreachable at build/revalidate time shouldn't take the
    // whole homepage down — it just renders without this section.
    .catch(() => []);

  return <HomeClient showcaseSites={showcaseSites} />;
}
