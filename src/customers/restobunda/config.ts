export const config = {
  package: 'basic',
  businessName: "Resto Bunda",
  tagline: "Rasa Rumahan, Kualitas Restoran",
  description: "Menyajikan masakan nusantara autentik sejak 2010. Menggunakan bahan-bahan segar berkualitas tinggi dengan resep rahasia keluarga yang diwariskan turun-temurun.",
  template: "restaurant",
  theme: {
    // Previously #b91c1c (saturated red) — RestaurantTemplate uses
    // primaryColor as the full-bleed page background (nav/hero/sections),
    // so a loud red painted the entire site instead of reading as an
    // accent. Swapped to a dark wine tone that works as a background,
    // keeping the warm rose accent for a fine-dining feel.
    primaryColor: "#1f0a0e", // Wine, near-black
    secondaryColor: "#fdf2f4", // Warm off-white
    accentColor: "#f43f5e", // Rose-500
  },
  contact: {
    whatsapp: "6289876543210",
    address: "Jl. Pahlawan No. 45, Bandung",
    mapsLink: "https://maps.google.com/?q=resto+bunda",
    instagram: "https://instagram.com/restobunda",
    facebook: "https://facebook.com/restobunda"
  },
  services: [
    { name: "Nasi Goreng Spesial Bunda", price: "Rp 35.000", desc: "Nasi goreng dengan bumbu rempah pilihan, telur mata sapi, ayam suwir, dan udang." },
    { name: "Soto Ayam Ambengan", price: "Rp 28.000", desc: "Soto ayam kuah kuning segar dengan koya kerupuk udang." },
    { name: "Sate Ayam Madura (10 Tusuk)", price: "Rp 30.000", desc: "Sate daging ayam full dengan bumbu kacang kental." },
    { name: "Es Teh Manis Pandan", price: "Rp 8.000", desc: "Es teh manis dengan aroma daun pandan asli." },
  ],
  images: {
    hero: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1600",
    ambiance: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800"
    ]
  },
  catalog: [
    { name: "Nasi Goreng Spesial Bunda", price: "Rp 35.000", desc: "Nasi goreng dengan bumbu rempah pilihan, telur mata sapi, ayam suwir, dan udang.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800" },
    { name: "Sate Ayam Madura", price: "Rp 30.000", desc: "Sate daging ayam full dengan bumbu kacang kental.", image: "https://images.unsplash.com/photo-1529563021893-cc83c992d75d?auto=format&fit=crop&q=80&w=800" },
    { name: "Soto Ayam Ambengan", price: "Rp 28.000", desc: "Soto ayam kuah kuning segar dengan koya kerupuk udang.", image: "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?auto=format&fit=crop&q=80&w=800" }
  ]
};
