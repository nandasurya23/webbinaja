export interface Service {
  name: string;
  price: string;
  desc?: string;
}

export interface Testimonial {
  name: string;
  text: string;
}

/**
 * Bare R2 object filenames for this customer (e.g. "hero.webp"), not full
 * URLs. `getCustomerAssetUrl`/`resolveCustomerImages` in `@/lib/assets`
 * turn these into `https://cdn.webbinaja.com/{slug}/{filename}`.
 */
export interface CustomerAssets {
  logo?: string;
  hero?: string;
  gallery?: string[];
  ambiance?: string;
}

export interface CustomerConfig {
  package: 'basic' | 'business';
  businessName: string;
  tagline: string;
  description: string;
  template: 'barber' | 'restaurant' | 'professional' | 'bakery' | 'rental' | 'gamecafe' | 'gym' | 'petshop';
  customDomain?: string;
  /** R2 asset filenames for this customer. Preferred over `images`. */
  assets?: CustomerAssets;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  business?: {
    name?: string;
    description?: string;
    phone?: string;
    address?: {
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry?: string;
    };
    openingHours?: string[]; // e.g. ["Mo-Fr 09:00-17:00"]
    socialLinks?: string[];
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  contact: {
    whatsapp: string;
    address: string;
    mapsLink: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    marketplace?: string;
  };
  services: Service[];
  catalog?: {
    name: string;
    price: string;
    desc?: string;
    image: string;
  }[];
  testimonials?: Testimonial[];
  images?: {
    hero?: string;
    gallery?: string[];
    ambiance?: string;
  };
}
