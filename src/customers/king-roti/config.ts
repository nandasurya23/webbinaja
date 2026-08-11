import { CustomerConfig } from '@/types/config';

export const config: CustomerConfig = {
  package: "business",
  businessName: "King Roti",
  tagline: "Roti Enak",
  description: "roti sangat enak",
  template: "bakery",
  // Filenames only — uploaded separately via `npm run assets:upload king-roti`.
  // Resolved to https://cdn.webbinaja.com/king-roti/... at build time.
  assets: {
    logo: "logo.webp",
    hero: "hero.webp",
    gallery: ["gallery-01.webp"],
  },
  theme: {
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    accentColor: '#f59e0b',
  },
  contact: {
    whatsapp: "628145678900",
    address: "jalan situbundo",
    mapsLink: "",
  },
  services: [
    { name: "Roti Manis/pcs", price: "5000" },
  ],
  catalog: [
    { name: "Paket Kue", price: "40000", image: "test.webp" },
  ],
};
