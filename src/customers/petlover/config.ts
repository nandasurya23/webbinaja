import { CustomerConfig } from "@/types/config";

export const config: CustomerConfig = {
  package: 'basic',
  businessName: "PetLover Care",
  tagline: "Sahabat Terbaik untuk Hewan Kesayangan Anda.",
  description: "Layanan grooming, hotel hewan, dan klinik hewan terpercaya dengan dokter spesialis hewan kecil. Kami memperlakukan mereka seperti keluarga.",
  template: "petshop",
  theme: {
    // secondaryColor (#fed7aa, light peach) was almost as light as
    // primaryColor (#fdf8f6, near-white) — PetshopTemplate uses
    // text-secondary for headings/body text on the primary background, so
    // text was nearly invisible (contrast ~1.26:1). Kept the warm cream
    // background but switched secondary to a dark warm brown for readable
    // text, and deepened the accent orange for the same reason.
    primaryColor: "#fdf8f6",
    secondaryColor: "#4a3728",
    accentColor: "#c2410c",
  },
  contact: {
    whatsapp: "628111222338",
    address: "Jl. Satwa No. 12, Malang",
    mapsLink: "https://maps.google.com/?q=petlover",
    instagram: "https://instagram.com/petlovercare"
  },
  services: [
    { name: "Grooming Kucing Reguler", price: "Rp 75.000", desc: "Mandi anti kutu, potong kuku, dan pembersih telinga." },
    { name: "Hotel Kucing / Anjing", price: "Rp 100.000/hari", desc: "Kandang luas ber-AC, makan 3x sehari, dan playtime." },
    { name: "Vaksinasi Tahunan", price: "Rp 250.000", desc: "Pemeriksaan kesehatan menyeluruh + buku vaksin." }
  ],
  catalog: [
    { name: "Makanan Kucing Premium 1kg", price: "Rp 85.000", desc: "Dry food untuk kucing dewasa, kaya protein hewani.", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800&auto=format&fit=crop" },
    { name: "Mainan Bulu Kucing", price: "Rp 25.000", desc: "Mainan tongkat dengan bulu warna-warni, aman untuk kucing.", image: "https://images.unsplash.com/photo-1526336179256-1347bdb255ee?q=80&w=800&auto=format&fit=crop" },
    { name: "Shampoo Anjing & Kucing", price: "Rp 55.000", desc: "Shampoo lembut bebas paraben, aroma lavender.", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=800&auto=format&fit=crop" }
  ],
  images: {
    hero: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=800&auto=format&fit=crop"
    ]
  }
};
