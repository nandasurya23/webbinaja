export const config = {
  package: 'basic',
  businessName: "Barber Agus",
  tagline: "Potongan Rapi, Gaya Masa Kini",
  description: "Barbershop terbaik di kota dengan layanan potong rambut, cuci, dan pijat. Berpengalaman lebih dari 5 tahun melayani pelanggan setia.",
  template: "barber",
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
      "https://images.unsplash.com/photo-1512496015851-a1dc8a4781fa?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800"
    ]
  },
  catalog: [
    { name: "Matte Clay Pomade", price: "Rp 120.000", desc: "Hold kuat, finish natural matte. Cocok untuk rambut ikal/lurus tebal.", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" },
    { name: "Hair Tonic Ginseng", price: "Rp 85.000", desc: "Menyuburkan rambut dan mencegah kerontokan, aroma fresh.", image: "https://images.unsplash.com/photo-1608248593842-8021c640d21a?auto=format&fit=crop&q=80&w=800" },
    { name: "Water Based Pomade", price: "Rp 95.000", desc: "Mudah dicuci, kilau tinggi, hold medium.", image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=800" }
  ]
};
