import { CustomerConfig } from "@/types/config";

export const config: CustomerConfig = {
  package: 'basic',
  businessName: "Rentalku Auto",
  tagline: "Sewa Mobil & Motor Nyaman, Aman, Terpercaya.",
  description: "Penyedia layanan sewa kendaraan harian dan bulanan dengan armada terbaru, perawatan rutin, dan asuransi penuh untuk perjalanan Anda.",
  template: "rental",
  theme: {
    primaryColor: "#f3f4f6",
    secondaryColor: "#2563eb",
    accentColor: "#1d4ed8",
  },
  contact: {
    whatsapp: "628111222335",
    address: "Jl. Otomotif No. 99, Jakarta",
    mapsLink: "https://maps.google.com/?q=rentalku",
    instagram: "https://instagram.com/rentalku"
  },
  services: [
    { name: "Sewa SUV Premium", price: "Rp 850.000/hari", desc: "Toyota Fortuner / Pajero Sport. Termasuk asuransi all-risk." },
    { name: "Sewa City Car", price: "Rp 350.000/hari", desc: "Honda Brio / Toyota Agya. Irit bahan bakar, cocok untuk dalam kota." },
    { name: "Sewa Motor NMAX", price: "Rp 150.000/hari", desc: "Yamaha NMAX 155cc. Termasuk 2 helm dan jas hujan." }
  ],
  images: {
    hero: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c3d5?q=80&w=800&auto=format&fit=crop"
    ]
  }
};
