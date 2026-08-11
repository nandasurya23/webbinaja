"use client";
import React from 'react';
import { CustomerConfig } from '@/types/config';
import { sanitizeUrl, sanitizeWhatsapp } from '@/lib/url';
import { m } from 'motion/react';
import Image from 'next/image';
import { Slider } from '@/components/Slider';
import { Desktop, GameController, Headset, Keyboard, Mouse, Cpu, MapPin, InstagramLogo, FacebookLogo, ArrowRight, Crosshair } from '@phosphor-icons/react/dist/ssr';

export const GameCafeTemplate = ({ config }: { config: CustomerConfig }) => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-[#00f2fe] selection:text-black overflow-x-hidden">
      
      {/* Deep Cyberpunk Grid & Scanlines */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(0, 242, 254, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 254, 0.1) 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]"></div>
      
      {/* Neon Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#00f2fe]/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#ff0844]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Cyber Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-[#00f2fe]/30 px-6 py-4 flex justify-between items-center transition-all">
        <div className="text-xl md:text-2xl font-black tracking-widest uppercase text-white font-mono drop-shadow-[0_0_15px_rgba(0,242,254,0.8)] flex items-center gap-3">
          <GameController weight="fill" className="text-[#00f2fe] animate-pulse" size={24} />
          {config.businessName}
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-xs font-mono font-bold uppercase tracking-widest text-[#00f2fe]/70">
          <a href="#hero" className="hover:text-[#00f2fe] hover:drop-shadow-[0_0_10px_rgba(0,242,254,0.8)] transition-all">Sys_Core</a>
          <a href="#services" className="hover:text-[#00f2fe] hover:drop-shadow-[0_0_10px_rgba(0,242,254,0.8)] transition-all">Stations</a>
          {config.catalog && <a href="#catalog" className="hover:text-[#00f2fe] hover:drop-shadow-[0_0_10px_rgba(0,242,254,0.8)] transition-all">Market</a>}
          {config.images?.gallery && <a href="#gallery" className="hover:text-[#00f2fe] hover:drop-shadow-[0_0_10px_rgba(0,242,254,0.8)] transition-all">Visuals</a>}
        </div>
        
        <a 
          href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20booking%20PC/Konsol`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-6 py-2 bg-[#00f2fe]/10 border border-[#00f2fe]/50 text-[#00f2fe] font-bold text-xs uppercase tracking-widest hover:bg-[#00f2fe] hover:text-black hover:shadow-[0_0_20px_rgba(0,242,254,0.6)] transition-all duration-300 skew-x-[-15deg]"
        >
          <span className="skew-x-[15deg] flex items-center gap-2">Init <ArrowRight weight="bold" /></span>
        </a>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative px-6 py-24 lg:py-32 max-w-[1600px] mx-auto min-h-[100dvh] flex flex-col justify-center border-b border-[#00f2fe]/20">
        
        {/* Decorative HUD Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 border-l-2 border-t-2 border-[#00f2fe]/30 opacity-50"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 border-r-2 border-b-2 border-[#ff0844]/30 opacity-50"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          <div className="lg:col-span-6 flex flex-col items-start relative">
            <m.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 border border-[#00f2fe]/50 text-[#00f2fe] text-xs font-mono mb-8 uppercase tracking-[0.3em] backdrop-blur"
            >
              <div className="w-2 h-2 bg-[#00f2fe] animate-pulse shadow-[0_0_10px_rgba(0,242,254,1)]" />
              SYS.STATUS: OPTIMAL
            </m.div>
            
            <m.h1 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black uppercase tracking-tighter leading-[0.9] text-white mb-8 font-outfit"
            >
              {config.tagline.split(' ').map((word, i) => (
                <span key={i} className={i % 2 !== 0 ? "text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#4facfe]" : "text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400"}>
                  {word}{" "}
                </span>
              ))}
            </m.h1>
            
            <m.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
              className="text-lg md:text-2xl text-slate-400 max-w-xl mb-12 font-mono"
            >
              {config.description}
            </m.p>
            
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <a 
                href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20booking%20PC/Konsol`}
                target="_blank"
                rel="noreferrer"
                className="relative inline-flex items-center gap-3 px-10 py-5 bg-transparent border-2 border-[#00f2fe] text-[#00f2fe] font-black text-xl uppercase tracking-widest hover:bg-[#00f2fe] hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_40px_rgba(0,242,254,0.8)] skew-x-[-15deg] group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="skew-x-[15deg] flex items-center gap-2 relative z-10">
                  <Crosshair weight="bold" className="animate-spin-slow" /> ENGAGE
                </span>
              </a>
            </m.div>
          </div>
          
          <div className="lg:col-span-6 relative flex justify-end">
            <m.div 
              initial={{ opacity: 0, scale: 0.9, rotateX: 10 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }} transition={{ duration: 1, delay: 0.2 }}
              style={{ perspective: 1000 }}
              className="w-full relative"
            >
              {/* Outer Neon Glow Frame */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00f2fe] via-[#ff0844] to-[#00f2fe] opacity-30 blur-xl rounded-xl animate-pulse"></div>
              
              <div className="relative p-2 bg-black/40 backdrop-blur-2xl border border-[#00f2fe]/30 rounded-xl overflow-hidden shadow-2xl">
                {/* Tech UI overlays */}
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                   <div className="text-[10px] font-mono text-black bg-[#00f2fe] px-2 py-1 font-bold shadow-[0_0_10px_rgba(0,242,254,0.5)]">FPS: 240+</div>
                   <div className="text-[10px] font-mono text-white bg-[#ff0844] px-2 py-1 font-bold shadow-[0_0_10px_rgba(255,8,68,0.5)]">PING: 5ms</div>
                </div>
                
                {/* Crosshairs Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-20 flex items-center justify-center opacity-10">
                   <div className="w-[80%] h-[80%] border border-[#00f2fe] rounded-full border-dashed animate-spin-slow"></div>
                </div>
                
                <div className="w-full aspect-[4/3] md:aspect-video relative rounded-lg overflow-hidden bg-[#030712]">
                  {config.images?.gallery && config.images.gallery.length > 0 ? (
                    <Slider images={config.images.gallery} aspectRatio="aspect-[4/3] md:aspect-video" rounded="rounded-lg" fullWidth />
                  ) : config.images?.hero ? (
                    <Image src={config.images.hero} alt="Game Cafe" fill sizes="100vw" priority className="object-cover mix-blend-luminosity contrast-125" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-[#00f2fe] animate-pulse">NO_SIGNAL</div>
                  )}
                </div>
              </div>
            </m.div>
          </div>
          
        </div>
      </section>

      {/* Hardware Specs & Pricing */}
      <section id="services" className="py-24 px-6 max-w-[1600px] mx-auto relative z-10 border-b border-[#00f2fe]/20">
        <div className="mb-20 flex flex-col items-center text-center">
          <div className="font-mono text-xs text-[#ff0844] bg-[#ff0844]/10 border border-[#ff0844]/30 px-4 py-1.5 uppercase tracking-[0.3em] mb-6">
             DATA_UPLINK_SECURE
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 font-outfit">
            Combat Stations
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {config.services.map((svc, i) => {
            const iconsList = [
              <Desktop key={0} weight="duotone" size={56} />,
              <GameController key={1} weight="duotone" size={56} />,
              <Headset key={2} weight="duotone" size={56} />,
              <Keyboard key={3} weight="duotone" size={56} />,
              <Mouse key={4} weight="duotone" size={56} />,
              <Cpu key={5} weight="duotone" size={56} />
            ];
            const Icon = iconsList[i % iconsList.length];
            return (
              <m.div 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, amount: 0.2 }} 
                transition={{ duration: 0.6, delay: i * 0.1 }}
                key={i} 
                className="group relative"
              >
                {/* Thick Glassmorphism Card */}
                <div className="relative bg-black/60 backdrop-blur-2xl border-l-4 border-l-[#00f2fe] border-t border-r border-b border-white/5 p-8 md:p-10 flex flex-col sm:flex-row justify-between items-start gap-8 hover:bg-[#00f2fe]/5 hover:border-r-[#00f2fe]/50 hover:border-b-[#00f2fe]/50 transition-all duration-300">
                  
                  {/* Left Side: Icon & Info */}
                  <div className="flex flex-col sm:flex-row items-start gap-6 w-full">
                    <div className="text-slate-600 group-hover:text-[#00f2fe] group-hover:drop-shadow-[0_0_15px_rgba(0,242,254,0.8)] transition-all duration-500 shrink-0">
                      {Icon}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase text-white mb-3 font-outfit tracking-tighter group-hover:text-[#00f2fe] transition-colors">{svc.name}</h3>
                      {svc.desc && <p className="text-slate-400 text-sm font-mono leading-relaxed max-w-sm">{svc.desc}</p>}
                    </div>
                  </div>
                  
                  {/* Right Side: Price */}
                  <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between border-t border-white/10 sm:border-t-0 pt-6 sm:pt-0 shrink-0">
                    <span className="text-xs font-mono text-[#ff0844] uppercase tracking-widest sm:mb-2 font-bold">Credits</span>
                    <div className="text-3xl md:text-4xl font-black text-white font-mono group-hover:text-white transition-colors">
                      {svc.price}
                    </div>
                  </div>
                  
                  {/* Tech Corners */}
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/20 group-hover:border-[#00f2fe] transition-colors"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/20 group-hover:border-[#00f2fe] transition-colors"></div>
                </div>
              </m.div>
            );
          })}
        </div>
      </section>

      {/* Cyber Market / Catalog */}
      {config.catalog && config.catalog.length > 0 && (
        <section id="catalog" className="py-24 px-6 max-w-[1600px] mx-auto relative z-10 border-b border-[#00f2fe]/20">
          <div className="mb-16 flex flex-col items-center text-center">
            <div className="font-mono text-xs text-[#00f2fe] bg-[#00f2fe]/10 border border-[#00f2fe]/30 px-4 py-1.5 uppercase tracking-[0.3em] mb-6">
               BLACK_MARKET_ACCESS
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white font-outfit">
              Provisions
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.catalog.map((item, i) => (
              <div key={i} className="group relative bg-black/40 backdrop-blur-md border border-[#00f2fe]/30 hover:border-[#ff0844]/80 hover:shadow-[0_0_30px_rgba(255,8,68,0.3)] transition-all duration-500 overflow-hidden rounded-xl">
                <div className="absolute top-2 right-2 bg-[#ff0844] text-white text-[10px] font-mono font-bold px-2 py-1 z-10 shadow-[0_0_10px_rgba(255,8,68,0.8)]">
                  {item.price}
                </div>
                <div className="w-full aspect-[4/3] relative overflow-hidden bg-[#020617]">
                  <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                  {/* Glitch Overlay */}
                  <div className="absolute inset-0 bg-[#00f2fe]/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2 font-outfit">{item.name}</h3>
                  {item.desc && <p className="text-slate-400 text-sm font-mono leading-relaxed">{item.desc}</p>}
                </div>
                {/* Tech Corners */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-transparent group-hover:border-[#ff0844] transition-colors"></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Visual Data / Gallery */}
      {config.images?.gallery && config.images.gallery.length > 0 && (
        <section id="gallery" className="py-24 px-6 max-w-[1600px] mx-auto relative z-10">
          <div className="mb-16 flex flex-col items-start border-l-4 border-[#00f2fe] pl-6">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white font-outfit mb-2">
              Visual Data
            </h2>
            <p className="text-[#00f2fe] font-mono text-sm uppercase tracking-widest">
               [ Accessing Database... ]
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.images.gallery.map((img, i) => (
              <div key={i} className={`relative rounded-lg overflow-hidden border border-[#00f2fe]/20 group ${i === 0 ? 'md:col-span-2 md:row-span-2 aspect-video lg:aspect-auto' : 'aspect-square'}`}>
                <div className="absolute inset-0 bg-[#00f2fe]/20 opacity-0 group-hover:opacity-100 mix-blend-color z-10 transition-opacity duration-500 pointer-events-none"></div>
                <Image
                  src={img}
                  alt="Gallery image"
                  fill
                  sizes={i === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                  className="object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cyber Footer */}
      <footer className="bg-black py-20 px-6 border-t-4 border-[#00f2fe]/50 relative z-10 overflow-hidden mt-24">
        {/* HUD Background Grid */}
        <div className="absolute bottom-0 left-0 w-full h-full bg-[linear-gradient(transparent_0%,_rgba(0,242,254,0.05)_100%)] pointer-events-none">
           <div className="w-full h-full opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(0,242,254,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.1) 1px, transparent 1px)', backgroundSize: '3rem 3rem', transform: 'perspective(1000px) rotateX(75deg)' }}></div>
        </div>
        
        <div className="max-w-[1600px] mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-12">
          
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <h3 className="text-4xl font-black uppercase text-white font-outfit tracking-widest drop-shadow-[0_0_10px_rgba(0,242,254,0.5)] flex items-center gap-3">
               <Cpu weight="fill" className="text-[#ff0844]" />
               {config.businessName}
            </h3>
            <p className="text-[#00f2fe] font-mono text-sm uppercase tracking-widest border border-[#00f2fe]/30 px-3 py-1 bg-[#00f2fe]/5">
              LOC: {config.contact.address}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-10 font-mono text-sm uppercase font-bold">
            <a href={sanitizeUrl(config.contact.mapsLink)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-[#00f2fe] hover:drop-shadow-[0_0_10px_rgba(0,242,254,0.8)] transition-all">
              <MapPin weight="fill" /> Nav
            </a>
            <a href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20booking%20PC/Konsol`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-[#00f2fe] hover:drop-shadow-[0_0_10px_rgba(0,242,254,0.8)] transition-all">
              Comms
            </a>
            {config.contact.instagram && (
              <a href={sanitizeUrl(config.contact.instagram)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-[#ff0844] hover:drop-shadow-[0_0_10px_rgba(255,8,68,0.8)] transition-all">
                <InstagramLogo weight="fill" /> IG
              </a>
            )}
            {config.contact.facebook && (
              <a href={sanitizeUrl(config.contact.facebook)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-[#3b82f6] hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all">
                <FacebookLogo weight="fill" /> FB
              </a>
            )}
          </div>
          
        </div>
        
        <div className="max-w-[1600px] mx-auto mt-16 pt-8 border-t border-[#00f2fe]/20 text-center font-mono text-xs text-[#00f2fe]/50 uppercase tracking-[0.4em]">
          SYS_ONLINE {'//'} &copy; {new Date().getFullYear()} {config.businessName} {'//'} ALL_SYSTEMS_NOMINAL
        </div>
      </footer>
    </div>
  );
};
