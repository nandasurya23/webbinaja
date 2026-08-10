export const config = {
  package: 'basic',
  businessName: "Klinik Sehat Bersama",
  tagline: "Kesehatan Anda, Prioritas Kami",
  description: "Klinik pratama dengan fasilitas modern dan tenaga medis profesional. Melayani pemeriksaan umum, konsultasi spesialis, dan perawatan gigi dengan standar medis terbaik.",
  template: "professional",
  theme: {
    primaryColor: "#1d4ed8", // Blue-700
    secondaryColor: "#eff6ff", // Blue-50
    accentColor: "#0ea5e9", // Sky-500
  },
  contact: {
    whatsapp: "628111222333",
    address: "Gedung Medika, Tower B Lt. 3, Surabaya",
    mapsLink: "https://maps.google.com/?q=klinik+sehat",
    instagram: "https://instagram.com/kliniksehat",
    facebook: "https://facebook.com/kliniksehat"
  },
  services: [
    { name: "Konsultasi Dokter Umum", price: "Mulai Rp 100.000" },
    { name: "Pemeriksaan Gigi Terpadu", price: "Mulai Rp 150.000" },
    { name: "Medical Check Up Dasar", price: "Rp 450.000" },
    { name: "Layanan Home Care", price: "Hubungi Kami" },
  ],
  testimonials: [
    { name: "Budi Santoso", text: "Dokternya ramah dan penjelasannya sangat mudah dipahami. Fasilitas klinik juga sangat bersih." },
    { name: "Siti Aminah", text: "Proses pendaftaran cepat, tidak perlu antre panjang. Harga perawatan gigi juga sangat terjangkau." }
  ],
  images: {
    hero: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1600"
  }
};
