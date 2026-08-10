import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CustomerConfig } from '@/types/config';
import { BarberTemplate } from '@/templates/BarberTemplate';
import { RestaurantTemplate } from '@/templates/RestaurantTemplate';
import { ProfessionalTemplate } from '@/templates/ProfessionalTemplate';
import { BakeryTemplate } from '@/templates/BakeryTemplate';
import { RentalTemplate } from '@/templates/RentalTemplate';
import { GameCafeTemplate } from '@/templates/GameCafeTemplate';
import { GymTemplate } from '@/templates/GymTemplate';
import { PetshopTemplate } from '@/templates/PetshopTemplate';
import { MAIN_DOMAIN } from '@/lib/customers';
import { JsonLd } from '@/components/JsonLd';

export async function generateMetadata({ params }: { params: Promise<{ customer: string }> }): Promise<Metadata> {
  const { customer } = await params;
  try {
    const data = await import(`@/customers/${customer}/config`);
    const config = data.config as CustomerConfig;

    const title = config.seo?.title || `${config.businessName} | ${config.tagline}`;
    const description = config.seo?.description || config.description;
    const keywords = config.seo?.keywords || [];
    const activeDomain = config.customDomain ? `https://${config.customDomain}` : `https://${customer}.${MAIN_DOMAIN}`;
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
  } catch {
    return {
      title: 'Not Found',
      description: 'Customer site not found',
    };
  }
}

export default async function CustomerSite({ params }: { params: Promise<{ customer: string }> }) {
  const { customer } = await params;
  let config: CustomerConfig;
  
  try {
    const data = await import(`@/customers/${customer}/config`);
    config = data.config;
  } catch {
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
