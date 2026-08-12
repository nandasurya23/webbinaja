import { CustomerConfig } from "@/types/config";

export const config: CustomerConfig = {
  package: 'basic',
  businessName: "GamersHub",
  tagline: "Ultimate Gaming Experience in Town.",
  description: "Internet cafe premium dengan PC spesifikasi rata kanan, kursi ergonomis, dan koneksi internet gigabit untuk sesi gaming tanpa lag.",
  template: "gamecafe",
  theme: {
    // secondaryColor (#111827) was nearly as dark as primaryColor
    // (#050505) — GameCafeTemplate uses text-secondary for almost all
    // headings/body copy on the primary background, so text was ~invisible
    // (contrast ~1.15:1). Lightened secondary to a readable off-white,
    // kept the cyan accent that already had good contrast.
    primaryColor: "#0f172a",
    secondaryColor: "#f1f5f9",
    accentColor: "#22d3ee",
  },
  contact: {
    whatsapp: "628111222336",
    address: "Jl. Cyber No. 404, Yogyakarta",
    mapsLink: "https://maps.google.com/?q=gamershub",
    instagram: "https://instagram.com/gamershub",
    facebook: "https://facebook.com/gamershub"
  },
  services: [
    { name: "VIP Room (RTX 4090)", price: "Rp 25.000/jam", desc: "Private room, Monitor 240Hz, Kursi Secretlab." },
    { name: "Regular PC (RTX 3060)", price: "Rp 10.000/jam", desc: "Area terbuka, Monitor 144Hz, AC sentral dingin." },
    { name: "Paket Begadang (Malam)", price: "Rp 50.000/10 jam", desc: "Berlaku dari jam 22.00 - 08.00 pagi. Gratis Es Teh." }
  ],
  images: {
    hero: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop"
    ]
  },
  catalog: [
    { name: "Energy Drink 'Mana Potion'", price: "Rp 15.000", desc: "Minuman energi racikan khusus, boost fokus gaming.", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&q=80&w=800" },
    { name: "Indomie Double Egg", price: "Rp 20.000", desc: "Kunci kemenangan saat begadang, ekstra telur dan keju.", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=800" },
    { name: "RGB Mechanical Keyboard", price: "Rp 850.000", desc: "Keyboard TKL switch merah (Merchandise Khusus).", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800" }
  ]
};
