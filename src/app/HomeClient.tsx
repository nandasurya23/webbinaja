"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { m } from 'motion/react';
import { ArrowRight, Code, Lightning, PaintBrush, CheckCircle, Storefront, MonitorPlay, ChalkboardTeacher, CookingPot, Cat, Barbell, Car, Camera, ArrowSquareOut } from '@phosphor-icons/react/dist/ssr';

export interface ShowcaseSite {
  businessName: string;
  template: string;
  logoUrl?: string;
  heroUrl?: string;
  url: string;
}

const SHOWCASE_INITIAL_COUNT = 4;

const templates = [
  { id: 'barberagus', name: 'Barber', style: 'Ultra-Premium Brutalist', icon: <Storefront size={24} />, color: 'from-zinc-500 to-zinc-900', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800' },
  { id: 'restobunda', name: 'Restaurant', style: 'Michelin-Star Fine Dining', icon: <CookingPot size={24} />, color: 'from-amber-600 to-orange-950', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800' },
  { id: 'gamershub', name: 'Game Cafe', style: 'Deep Cyberpunk HUD', icon: <MonitorPlay size={24} />, color: 'from-cyan-400 to-blue-900', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop' },
  { id: 'tokokue', name: 'Bakery', style: 'Approachable Premium', icon: <Storefront size={24} />, color: 'from-pink-400 to-rose-900', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop' },
  { id: 'kliniksehat', name: 'Professional', style: 'Trust-First Corporate', icon: <ChalkboardTeacher size={24} />, color: 'from-slate-400 to-indigo-950', image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800' },
  { id: 'rentalku', name: 'Rental', style: 'Sleek & Technical', icon: <Car size={24} />, color: 'from-emerald-400 to-teal-950', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop' },
  { id: 'fitnespro', name: 'Gym', style: 'Kinetic Brutalist', icon: <Barbell size={24} />, color: 'from-red-500 to-red-950', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop' },
  { id: 'petlover', name: 'Petshop', style: 'Friendly & Organic', icon: <Cat size={24} />, color: 'from-yellow-400 to-amber-900', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop' },
];

const steps = [
  {
    title: "1. Pilih Template",
    desc: "Lihat 8 template yang tersedia di atas, lalu pilih satu yang paling cocok dengan karakter bisnis kamu.",
    icon: <PaintBrush size={32} weight="duotone" />
  },
  {
    title: "2. Kirim Data Bisnis",
    desc: "Siapkan nama bisnis, deskripsi singkat, daftar menu/layanan beserta harga, kontak, dan foto-foto terbaik kamu. Kirim semuanya lewat WhatsApp.",
    icon: <Code size={32} weight="duotone" />
  },
  {
    title: "3. Kami yang Kerjakan",
    desc: "Tim kami memasukkan data, menyusun tampilan, dan mempublikasikan website kamu — biasanya rampung dalam 24 jam.",
    icon: <Lightning size={32} weight="duotone" />
  }
];

const TEMPLATE_LABELS: Record<string, string> = {
  barber: 'Barbershop',
  restaurant: 'Restoran',
  professional: 'Jasa Profesional',
  bakery: 'Bakery',
  rental: 'Rental',
  gamecafe: 'Game Cafe',
  gym: 'Gym',
  petshop: 'Petshop',
};

export default function HomeClient({ showcaseSites = [] }: { showcaseSites?: ShowcaseSite[] }) {
  const [showAllSites, setShowAllSites] = React.useState(false);
  const visibleSites = showAllSites ? showcaseSites : showcaseSites.slice(0, SHOWCASE_INITIAL_COUNT);
  const hasMoreSites = showcaseSites.length > SHOWCASE_INITIAL_COUNT;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* Background Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5 px-6 md:px-12 py-4 flex justify-between items-center">
        <div className="text-xl font-black tracking-tighter text-white flex items-center gap-3 font-outfit">
          <Image src="/logos.png" alt="Webbin Aja Logo" width={32} height={32} className="w-8 h-8 object-contain" /> Webbin<span className="text-zinc-500">Aja</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">
          <a href="#templates" className="hover:text-white transition-colors">Templates</a>
          <a href="#pricing" className="hover:text-white transition-colors">Harga</a>
          <a href="#workflow" className="hover:text-white transition-colors">Cara Pesan</a>
        </div>
        <Link
          href="/pesan"
          className="flex items-center gap-2 px-5 py-2 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors rounded"
        >
          Pesan Sekarang
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <m.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold mb-8 text-zinc-300"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Website Profesional untuk UMKM
        </m.div>

        <m.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-[6rem] font-black tracking-tighter leading-[0.9] text-white mb-8 font-outfit max-w-5xl"
        >
          Website Profesional untuk Bisnis Kamu, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">Tanpa Mulai dari Nol.</span>
        </m.h1>

        <m.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 font-medium"
        >
          Mulai Rp499 ribu, tanpa perlu coding atau belajar WordPress. Pilih template, kirim data bisnis kamu, dan tim kami yang mengerjakan sampai website siap online.
        </m.p>

        <m.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a href="#pricing" className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded w-full sm:w-auto">
            Pilih Website Kamu <ArrowRight weight="bold" />
          </a>
          <a href="#templates" className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-wider hover:bg-white/5 transition-colors rounded w-full sm:w-auto">
            Lihat Template
          </a>
        </m.div>
      </section>

      {/* Templates Grid */}
      <section id="templates" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white font-outfit mb-4">Pilih Tampilan yang Cocok untuk Bisnis Kamu</h2>
          <p className="text-zinc-400 max-w-xl font-medium">Delapan template siap pakai dengan gaya visual yang berbeda-beda, masing-masing dirancang mengikuti karakter industrinya. Klik untuk lihat contohnya langsung.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((tpl, i) => (
            <m.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              key={tpl.id}
            >
              <Link href={`/sites/${tpl.id}`} className="group block relative h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-500">
                <div className="relative w-full h-40 overflow-hidden">
                  <Image
                    src={tpl.image}
                    alt={`Preview template ${tpl.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${tpl.color} opacity-40 group-hover:opacity-30 transition-opacity duration-500`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 group-hover:scale-110 transition-transform duration-500">
                      {tpl.icon}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    {tpl.style}
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight font-outfit group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-500 transition-all duration-300 flex justify-between items-center">
                    {tpl.name}
                    <ArrowRight className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-white" />
                  </h3>
                </div>
              </Link>
            </m.div>
          ))}
        </div>
      </section>

      {/* Website customer yang sudah live — bukti sosial nyata, bukan mockup.
          Cuma render kalau ada datanya (showcaseSites dari Neon, diambil di
          page.tsx dengan ISR 5 menit) — tidak ada network request tambahan
          di sisi browser, tidak ada layout shift kalau kosong. */}
      {showcaseSites.length > 0 && (
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold mb-4 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sekarang
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white font-outfit mb-4">Sudah Dipercaya Bisnis Nyata</h2>
            <p className="text-zinc-400 max-w-xl font-medium">Bukan mockup — ini website customer kami yang beneran live dan diakses publik hari ini.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleSites.map((site, i) => (
              <m.a
                key={site.url}
                href={site.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % SHOWCASE_INITIAL_COUNT) * 0.05 }}
                className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="relative w-full h-36 bg-white/5 overflow-hidden">
                  {site.heroUrl ? (
                    <Image
                      src={site.heroUrl}
                      alt={`Preview website ${site.businessName}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/20">
                      {site.businessName.trim().charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 p-4">
                  {site.logoUrl ? (
                    <Image
                      src={site.logoUrl}
                      alt={site.businessName}
                      width={32}
                      height={32}
                      className="rounded-full object-cover shrink-0 h-8 w-8 border border-white/10"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {site.businessName.trim().charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{site.businessName}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{TEMPLATE_LABELS[site.template] ?? site.template}</p>
                  </div>
                  <ArrowSquareOut size={14} className="text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
                </div>
              </m.a>
            ))}
          </div>

          {hasMoreSites && (
            <div className="flex justify-center mt-10">
              <button
                type="button"
                onClick={() => setShowAllSites((v) => !v)}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded hover:bg-white/10 hover:border-white/30 transition-colors"
              >
                {showAllSites ? 'Tampilkan Lebih Sedikit' : `Lihat Lebih Banyak (${showcaseSites.length - SHOWCASE_INITIAL_COUNT})`}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white font-outfit mb-4">Website Profesional, Harga Jelas dari Awal</h2>
          <p className="text-zinc-400 max-w-xl font-medium">Dua paket, tanpa biaya tersembunyi. Pilih yang paling sesuai dengan kebutuhan bisnis kamu sekarang.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Paket Basic */}
          <div className="bg-gradient-to-b from-zinc-900 to-[#050505] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col h-full shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <div className="border-b border-white/10 pb-6 mb-6 flex flex-col gap-3">
              <div>
                <h3 className="text-2xl font-black text-white font-outfit mb-1">Paket Basic</h3>
                <p className="text-zinc-400 text-xs font-medium">Website siap pakai untuk bisnis yang ingin langsung online tanpa ribet.</p>
              </div>
              <div className="flex flex-col items-start mt-1">
                <span className="text-zinc-500 line-through text-[10px] font-mono mb-1">Rp 1.499.000</span>
                <div className="text-3xl font-black text-white font-outfit tracking-tighter">
                  Rp 499.000
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mb-8 flex-grow">
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Website responsive</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Pilih 1 dari 8 template premium</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Profil bisnis & layanan / produk</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Galeri foto, Maps & Jam operasional</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Subdomain gratis: <strong className="text-white">namabisnis.webbinaja.com</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Tombol WhatsApp & SSL Aman</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">1× revisi teks & warna</span>
              </div>

              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-[10px] text-red-400 font-medium leading-relaxed">
                  <strong className="font-bold text-red-300">Kamu memilih dari template yang sudah tersedia — layout dan struktur mengikuti template pilihan, tanpa desain custom.</strong>
                </p>
              </div>
            </div>
            
            <Link
              href="/pesan?package=basic"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 rounded"
            >
              Pilih Paket Basic
            </Link>
          </div>

          {/* Paket Business Kit */}
          <div className="bg-gradient-to-b from-zinc-900 to-[#050505] border-2 border-blue-500/50 rounded-3xl p-6 relative overflow-hidden flex flex-col h-full shadow-[0_0_50px_rgba(59,130,246,0.15)] scale-100 lg:scale-105 z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[80px] pointer-events-none"></div>
            <div className="absolute top-4 right-4 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Paling Lengkap</div>

            <div className="border-b border-white/10 pb-6 mb-6 flex flex-col gap-3 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-white font-outfit mb-1">Paket Business Kit</h3>
                <p className="text-zinc-400 text-xs font-medium">Website + domain sendiri + materi promosi awal, buat bisnis yang mau tampil lebih siap.</p>
              </div>
              <div className="flex flex-col items-start mt-1">
                <span className="text-zinc-500 line-through text-[10px] font-mono mb-1">Rp 2.499.000</span>
                <div className="text-3xl font-black text-white font-outfit tracking-tighter">
                  Rp 799.000
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-8 flex-grow relative z-10">
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Semua fitur di Paket Basic</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Custom domain sendiri <strong className="text-white">(.com / .id)</strong> — tahun pertama gratis</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Setup domain & SSL, beres tanpa ribet</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Katalog produk/menu tampil rapi di website</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-amber-400 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-100 text-xs font-bold">Business Kit — materi promosi awal (siap post ke Instagram & status WhatsApp), dibuat 1× dari data bisnis kamu</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">1× revisi teks & warna</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Support prioritas via WhatsApp</span>
              </div>

              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-[10px] text-blue-300 font-medium leading-relaxed">
                  <strong className="font-bold text-white">Kamu cukup kirim data bisnis. Domain, teknis, sampai materi promosi awal — kami yang urus.</strong>
                </p>
              </div>
            </div>

            <Link
              href="/pesan?package=business_kit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-500 transition-all duration-300 rounded shadow-[0_0_20px_rgba(37,99,235,0.4)] relative z-10"
            >
              Pilih Paket Business Kit
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-10 flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-5">
          <Camera size={20} weight="duotone" className="text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-zinc-200 text-xs font-bold uppercase tracking-wider mb-1">Ketentuan Foto</p>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Kirim foto sebebas kamu — sistem kami otomatis kompres & optimasi tiap foto (maks 20MB per file, dikonversi ke
              format modern di bawah 1.5MB) supaya website tetap ngebut diakses. Galeri foto maksimal 8 foto dan katalog
              produk/menu maksimal 12 item per website — cukup buat menampilkan yang terbaik tanpa bikin halaman berat.
            </p>
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section id="workflow" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white font-outfit mb-4">Prosesnya Cuma 3 Langkah</h2>
          <p className="text-zinc-400 max-w-xl font-medium">Kamu nggak perlu pusing soal hal teknis. Siapkan data dan materi bisnisnya, sisanya biar tim kami yang kerjakan.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <m.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.2 }}
              key={i} className="flex flex-col bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="text-zinc-700 mb-6">{step.icon}</div>
              <h3 className="text-xl font-black text-white font-outfit mb-4">{step.title}</h3>
              <p className="text-zinc-400 leading-relaxed font-medium">{step.desc}</p>
              
              {/* Subtle background number */}
              <div className="absolute -bottom-6 -right-6 text-[8rem] font-black text-white/5 leading-none font-outfit pointer-events-none select-none">
                {i + 1}
              </div>
            </m.div>
          ))}
        </div>
        
        <m.div 
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-zinc-900 to-black border border-white/10 p-8 md:p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
        >
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white font-outfit mb-2">Siap Punya Website Sendiri?</h3>
            <p className="text-zinc-400 font-medium max-w-md">Isi form pemesanan untuk mulai kirim data bisnis kamu — konfirmasi pembayaran lewat WhatsApp setelah data terkirim.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/pesan"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors rounded shadow-[0_0_30px_rgba(37,99,235,0.3)] w-full sm:w-auto"
            >
              Isi Form Pemesanan <ArrowRight size={20} weight="bold" />
            </Link>
          </div>
        </m.div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-6 md:px-12 text-center border-t border-white/5 relative z-10">
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">
          &copy; {new Date().getFullYear()} Webbin Aja. Website UMKM, Dikerjakan Dengan Rapi.
        </p>
      </footer>
    </div>
  );
}
