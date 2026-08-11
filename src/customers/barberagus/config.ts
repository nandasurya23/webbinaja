export const config = {
  package: 'basic',
  businessName: "Barber Agus",
  tagline: "Potongan Rapi, Gaya Masa Kini",
  description: "Barbershop terbaik di kota dengan layanan potong rambut, cuci, dan pijat. Berpengalaman lebih dari 5 tahun melayani pelanggan setia.",
  template: "barber",
  seo: {
    title: "Barber Agus | Barbershop Premium di Jakarta",
    description: "Barbershop terbaik di Jakarta dengan layanan potong rambut, cuci, dan pijat. Pengalaman lebih dari 5 tahun.",
    keywords: ["barbershop jakarta", "potong rambut pria", "cukur rambut"],
  },
  business: {
    name: "Barber Agus",
    description: "Barbershop terbaik di kota dengan layanan potong rambut, cuci, dan pijat.",
    phone: "+6281234567890",
    address: {
      streetAddress: "Jl. Sudirman No. 123",
      addressLocality: "Jakarta",
      addressCountry: "ID"
    },
    openingHours: ["Mo-Su 10:00-22:00"]
  },
  theme: {
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    accentColor: "#f59e0b",
  },
  contact: {
    whatsapp: "6281234567890",
    address: "Jl. Sudirman No. 123, Jakarta",
    mapsLink: "https://maps.google.com/?q=barber+agus",
    instagram: "https://instagram.com/barberagus",
    facebook: "https://facebook.com/barberagus"
  },
  services: [
    { name: "Potong Rambut Dewasa", price: "Rp 50.000" },
    { name: "Cuci + Styling", price: "Rp 25.000" },
    { name: "Cukur Jenggot", price: "Rp 20.000" },
  ],
  images: {
    hero: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1600",
    gallery: [
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800"
    ]
  },
  catalog: [
    { name: "Matte Clay Pomade", price: "Rp 120.000", desc: "Hold kuat, finish natural matte. Cocok untuk rambut ikal/lurus tebal.", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" },
    { name: "Hair Tonic Ginseng", price: "Rp 85.000", desc: "Menyuburkan rambut dan mencegah kerontokan, aroma fresh.", image: "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?auto=format&fit=crop&q=80&w=800" },
    { name: "Water Based Pomade", price: "Rp 95.000", desc: "Mudah dicuci, kilau tinggi, hold medium.", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800" }
  ]
};
