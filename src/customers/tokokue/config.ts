import { CustomerConfig } from "@/types/config";

export const config: CustomerConfig = {
  package: 'basic',
  businessName: "Kue Sedap Bunda",
  tagline: "Manisnya Setiap Gigitan, Dibuat dengan Cinta.",
  description: "Toko kue artisan yang menyajikan aneka kue ulang tahun, pastry, dan roti segar setiap hari menggunakan bahan premium tanpa pengawet.",
  template: "bakery",
  theme: {
    // secondaryColor (#f9a8d4, light pink) was too close in lightness to
    // primaryColor (#fdfbf7, near-white) — BakeryTemplate uses
    // text-secondary for headings/body text on the primary background
    // (and inverts to bg-secondary/text-primary in the footer), so text
    // was nearly invisible in both places (contrast ~1.73:1). Kept the
    // cream background and pink-adjacent accent, deepened secondary to a
    // dark wine-pink for readable text.
    primaryColor: "#fdfbf7",
    secondaryColor: "#5b2333",
    accentColor: "#be185d",
  },
  contact: {
    whatsapp: "628111222334",
    address: "Jl. Manis No. 8, Bandung",
    mapsLink: "https://maps.google.com/?q=kue+sedap",
    instagram: "https://instagram.com/kuesedap"
  },
  services: [
    { name: "Custom Birthday Cake", price: "Mulai Rp 250.000", desc: "Kue ulang tahun dengan desain khusus sesuai permintaan." },
    { name: "Premium Croissant Box", price: "Rp 120.000", desc: "Isi 6 croissant aneka rasa (Butter, Almond, Chocolate)." },
    { name: "Signature Brownies", price: "Rp 85.000", desc: "Brownies panggang fudgy dengan topping almond dan chocochip." }
  ],
  images: {
    hero: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621236378699-8597faf6a176?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800&auto=format&fit=crop"
    ]
  }
};
