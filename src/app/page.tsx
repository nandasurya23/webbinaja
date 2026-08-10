"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight, Code, Lightning, PaintBrush, CheckCircle, XCircle, WhatsappLogo, Storefront, MonitorPlay, ChalkboardTeacher, CookingPot, Cat, Barbell, Car } from '@phosphor-icons/react';

const templates = [
  { id: 'barberagus', name: 'Barber', style: 'Ultra-Premium Brutalist', icon: <Storefront size={24} />, color: 'from-zinc-500 to-zinc-900' },
  { id: 'restobunda', name: 'Restaurant', style: 'Michelin-Star Fine Dining', icon: <CookingPot size={24} />, color: 'from-amber-600 to-orange-950' },
  { id: 'gamershub', name: 'Game Cafe', style: 'Deep Cyberpunk HUD', icon: <MonitorPlay size={24} />, color: 'from-cyan-400 to-blue-900' },
  { id: 'tokokue', name: 'Bakery', style: 'Approachable Premium', icon: <Storefront size={24} />, color: 'from-pink-400 to-rose-900' },
  { id: 'kliniksehat', name: 'Professional', style: 'Trust-First Corporate', icon: <ChalkboardTeacher size={24} />, color: 'from-slate-400 to-indigo-950' },
  { id: 'rentalku', name: 'Rental', style: 'Sleek & Technical', icon: <Car size={24} />, color: 'from-emerald-400 to-teal-950' },
  { id: 'fitnespro', name: 'Gym', style: 'Kinetic Brutalist', icon: <Barbell size={24} />, color: 'from-red-500 to-red-950' },
  { id: 'petlover', name: 'Petshop', style: 'Friendly & Organic', icon: <Cat size={24} />, color: 'from-yellow-400 to-amber-900' },
];

const steps = [
  {
    title: "1. Pilih Template",
    desc: "Eksplorasi 8 template premium di atas. Pilih satu yang memiliki gaya visual dan fungsionalitas paling sesuai dengan karakter bisnis Anda.",
    icon: <PaintBrush size={32} weight="duotone" />
  },
  {
    title: "2. Siapkan Data",
    desc: "Kumpulkan aset bisnis Anda: Nama Bisnis, Tagline, Deskripsi, Daftar Menu/Layanan beserta Harga, Link Medsos/Kontak, serta Foto/Galeri resolusi tinggi.",
    icon: <Code size={32} weight="duotone" />
  },
  {
    title: "3. Kirim & Launch",
    desc: "Kirimkan seluruh data tersebut melalui WhatsApp kami. Tim kami akan merakit website Anda dan mempublikasikannya secara live dalam 24 jam!",
    icon: <Lightning size={32} weight="duotone" />
  }
];

export default function Home() {
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
        <a 
          href="#workflow"
          className="flex items-center gap-2 px-5 py-2 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors rounded"
        >
          Order Now
        </a>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold mb-8 text-zinc-300"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Solusi Website Cepat untuk UMKM
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-[6rem] font-black tracking-tighter leading-[0.9] text-white mb-8 font-outfit max-w-5xl"
        >
          Website Bisnis Profesional, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">Jadi Dalam 1 Hari.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 font-medium"
        >
          Mulai Rp499 ribu. Pilih template, kirim data bisnis, dan biarkan kami mengurus sisanya.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a href="#pricing" className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded w-full sm:w-auto">
            Buat Website Saya <ArrowRight weight="bold" />
          </a>
          <a href="#templates" className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-wider hover:bg-white/5 transition-colors rounded w-full sm:w-auto">
            Lihat Template
          </a>
        </motion.div>
      </section>

      {/* Templates Grid */}
      <section id="templates" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white font-outfit mb-4">Pilih Tampilan Bisnis Anda</h2>
          <p className="text-zinc-400 max-w-xl font-medium">Bukan sekadar template biasa. Setiap desain diriset khusus secara mendalam agar relevan dengan industri Anda dan meyakinkan pelanggan untuk membeli.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((tpl, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              key={tpl.id}
            >
              <Link href={`/sites/${tpl.id}`} className="group block relative h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-500">
                <div className={`w-full h-40 bg-gradient-to-br ${tpl.color} opacity-80 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center`}>
                   <div className="w-16 h-16 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 group-hover:scale-110 transition-transform duration-500">
                     {tpl.icon}
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
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white font-outfit mb-4">Website Bisnis Siap Pakai</h2>
          <p className="text-zinc-400 max-w-xl font-medium">Pilih paket yang paling sesuai untuk bisnis Anda. Harga transparan tanpa biaya tersembunyi.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Paket Basic */}
          <div className="bg-gradient-to-b from-zinc-900 to-[#050505] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col h-full shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <div className="border-b border-white/10 pb-6 mb-6 flex flex-col gap-3">
              <div>
                <h3 className="text-2xl font-black text-white font-outfit mb-1">Paket Basic</h3>
                <p className="text-zinc-400 text-xs font-medium">Website bisnis siap online dalam 24 jam.</p>
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
                <span className="text-zinc-300 text-xs font-medium">1× revisi teks</span>
              </div>
              
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-[10px] text-red-400 font-medium leading-relaxed">
                  <strong className="font-bold text-red-300">Desain menggunakan template yang tersedia dan tidak dapat diubah secara custom.</strong>
                </p>
              </div>
            </div>
            
            <a 
              href="https://wa.me/6281339684249?text=Halo%20WebbinAja,%20saya%20ingin%20memesan%20Paket%20Basic%20(Rp%20499k)!"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 rounded"
            >
              Pesan Basic
            </a>
          </div>

          {/* Paket Pro */}
          <div className="bg-gradient-to-b from-zinc-900 to-[#050505] border-2 border-blue-500/50 rounded-3xl p-6 relative overflow-hidden flex flex-col h-full shadow-[0_0_50px_rgba(59,130,246,0.15)] scale-100 lg:scale-105 z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[80px] pointer-events-none"></div>
            <div className="absolute top-4 right-4 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Paling Laris</div>
            
            <div className="border-b border-white/10 pb-6 mb-6 flex flex-col gap-3 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-white font-outfit mb-1">Paket Pro</h3>
                <p className="text-zinc-400 text-xs font-medium">Tampil lebih profesional dengan domain sendiri.</p>
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
                <span className="text-zinc-300 text-xs font-medium">Custom domain <strong className="text-white">.com / .id</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Domain tahun pertama</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Setup domain & SSL</span>
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
                  <strong className="font-bold text-white">Anda cukup kirim data bisnis. Domain dan pengaturan teknis kami yang urus.</strong>
                </p>
              </div>
            </div>
            
            <a 
              href="https://wa.me/6281339684249?text=Halo%20WebbinAja,%20saya%20ingin%20memesan%20Paket%20Pro%20(Rp%20799k)!"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-500 transition-all duration-300 rounded shadow-[0_0_20px_rgba(37,99,235,0.4)] relative z-10"
            >
              Pesan Pro
            </a>
          </div>

          {/* Paket Custom */}
          <div className="bg-gradient-to-b from-zinc-900 to-[#050505] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col h-full shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <div className="border-b border-white/10 pb-6 mb-6 flex flex-col gap-3">
              <div>
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 font-outfit mb-1">Paket Custom</h3>
                <p className="text-zinc-400 text-xs font-medium">Website yang dirancang sesuai kebutuhan bisnis Anda.</p>
              </div>
              <div className="flex flex-col items-start mt-1">
                <span className="text-zinc-500 line-through text-[10px] font-mono mb-1">Rp 4.500.000</span>
                <div className="text-3xl font-black text-white font-outfit tracking-tighter">
                  <span className="text-xl">Mulai</span> Rp 1.500.000
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mb-8 flex-grow">
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Semua fitur di Paket Pro</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-amber-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-100 text-xs font-bold">Custom desain & layout</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-amber-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-100 text-xs font-bold">Fitur tambahan sesuai kebutuhan</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Animasi interaktif tambahan</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Estimasi pengerjaan 3-5 hari kerja</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="text-blue-500 mt-0.5 shrink-0" size={18} />
                <span className="text-zinc-300 text-xs font-medium">Support prioritas</span>
              </div>

              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-[10px] text-amber-300 font-medium leading-relaxed">
                  <strong className="font-bold text-white">Harga final menyesuaikan kompleksitas desain dan fitur.</strong>
                </p>
              </div>
            </div>
            
            <a 
              href="https://wa.me/6281339684249?text=Halo%20WebbinAja,%20saya%20ingin%20berkonsultasi%20untuk%20Paket%20Custom!"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all duration-300 rounded shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Konsultasi Custom
            </a>
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section id="workflow" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white font-outfit mb-4">Hanya 3 Langkah Mudah</h2>
          <p className="text-zinc-400 max-w-xl font-medium">Anda tidak perlu pusing memikirkan hal teknis. Siapkan materinya, dan tim ahli kami yang akan merakit semuanya untuk Anda.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div 
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
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-zinc-900 to-black border border-white/10 p-8 md:p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
        >
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white font-outfit mb-2">Mulai Transformasi Digital Anda</h3>
            <p className="text-zinc-400 font-medium max-w-md">Ambil langkah pertama sekarang. Hubungi kami, dan saksikan bisnis Anda memiliki wajah baru besok pagi.</p>
          </div>
          <a 
            href="https://wa.me/6281339684249?text=Halo%20WebbinAja,%20saya%20tertarik%20untuk%20memesan%20website!"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors rounded shadow-[0_0_30px_rgba(37,99,235,0.3)] shrink-0"
          >
            <WhatsappLogo size={24} weight="fill" /> Hubungi WhatsApp
          </a>
        </motion.div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-6 md:px-12 text-center border-t border-white/5 relative z-10">
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">
          &copy; {new Date().getFullYear()} Webbin Aja. Engineered with Precision.
        </p>
      </footer>
    </div>
  );
}
