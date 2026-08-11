import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BarberTemplate } from '@/templates/BarberTemplate';
import { RestaurantTemplate } from '@/templates/RestaurantTemplate';
import { ProfessionalTemplate } from '@/templates/ProfessionalTemplate';
import { BakeryTemplate } from '@/templates/BakeryTemplate';
import { RentalTemplate } from '@/templates/RentalTemplate';
import { GameCafeTemplate } from '@/templates/GameCafeTemplate';
import { GymTemplate } from '@/templates/GymTemplate';
import { PetshopTemplate } from '@/templates/PetshopTemplate';
import { MAIN_DOMAIN, getRecentCustomerSlugs, getCustomerConfig } from '@/lib/customers';
import { JsonLd } from '@/components/JsonLd';

// Only the N most-recently-created customers are pre-rendered as static
// HTML at build time — pre-rendering *every* customer would make build
// time grow without bound as the customer count grows (hundreds/thousands
// of customers = hundreds/thousands of pages re-rendered on every deploy,
// even ones unrelated to any of them). Tunable via env without a code
// change; raise it if build time allows, e.g. after upgrading Vercel plans.
const PRERENDER_CUSTOMER_LIMIT = Number(process.env.PRERENDER_CUSTOMER_LIMIT) || 60;

export async function generateStaticParams(): Promise<{ customer: string }[]> {
  return getRecentCustomerSlugs(PRERENDER_CUSTOMER_LIMIT).map((customer) => ({ customer }));
}

// Customers outside the prerender budget above aren't in generateStaticParams,
// but dynamicParams stays true (the default) so they still render normally —
// on the first request Next renders and caches the page, and every request
// after that is served from cache just like a pre-rendered one. No
// revalidate window is set because this data never changes without a new
// deploy (it's a file in the repo), so the cached render never goes stale.
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ customer: string }> }): Promise<Metadata> {
  const { customer } = await params;
  const config = await getCustomerConfig(customer);
  if (!config) {
    return {
      title: 'Not Found',
      description: 'Customer site not found',
    };
  }

  const title = config.seo?.title || `${config.businessName} | ${config.tagline}`;
  const description = config.seo?.description || config.description;
  const keywords = config.seo?.keywords || [];
  const activeDomain = config.customDomain ? `https://${config.customDomain}` : `https://${customer}.${MAIN_DOMAIN}`;
  // config.images.hero is already resolved to an absolute CDN/legacy URL by
  // getCustomerConfig(), so it's safe to use directly as an OG/Twitter image URL.
  const ogImage = config.seo?.ogImage || config.images?.hero || '';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: activeDomain,
    },
    openGraph: {
      title,
      description,
      url: activeDomain,
      siteName: config.businessName,
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function CustomerSite({ params }: { params: Promise<{ customer: string }> }) {
  const { customer } = await params;
  const config = await getCustomerConfig(customer);
  if (!config) {
    notFound();
  }

  // Template Switcher Logic
  const renderTemplate = () => {
    switch (config.template) {
      case 'barber': return <BarberTemplate config={config} />;
      case 'restaurant': return <RestaurantTemplate config={config} />;
      case 'professional': return <ProfessionalTemplate config={config} />;
      case 'bakery': return <BakeryTemplate config={config} />;
      case 'rental': return <RentalTemplate config={config} />;
      case 'gamecafe': return <GameCafeTemplate config={config} />;
      case 'gym': return <GymTemplate config={config} />;
      case 'petshop': return <PetshopTemplate config={config} />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Template Belum Tersedia</h1>
              <p>Silakan periksa konfigurasi `template` untuk pelanggan ini.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <JsonLd config={config} customerSlug={customer} />
      {renderTemplate()}
    </>
  );
}
