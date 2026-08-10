import { CustomerConfig } from "@/types/config";

export const config: CustomerConfig = {
  package: 'basic',
  businessName: "FitnesPro Gym",
  tagline: "NO EXCUSES. JUST RESULTS.",
  description: "Fasilitas gym terlengkap dengan alat standar internasional, personal trainer profesional, dan kelas studio harian (Zumba, Yoga, HIIT).",
  template: "gym",
  theme: {
    primaryColor: "#18181b",
    secondaryColor: "#e4e4e7",
    accentColor: "#ef4444",
  },
  contact: {
    whatsapp: "628111222337",
    address: "Komp. Ruko Iron Blok 1, Semarang",
    mapsLink: "https://maps.google.com/?q=fitnespro",
    instagram: "https://instagram.com/fitnespro"
  },
  services: [
    { name: "Membership 1 Bulan", price: "Rp 300.000", desc: "Akses alat gym sepuasnya tanpa batas waktu." },
    { name: "Membership 1 Tahun", price: "Rp 2.500.000", desc: "Akses alat gym sepuasnya + 12x gratis kelas studio." },
    { name: "Personal Trainer Package", price: "Rp 1.500.000", desc: "10 sesi latihan intensif 1-on-1 dengan trainer bersertifikat." }
  ],
  images: {
    hero: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop"
    ]
  }
};
