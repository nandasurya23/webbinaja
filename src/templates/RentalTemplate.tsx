"use client";
import React from 'react';
import { CustomerConfig } from '@/types/config';
import { sanitizeUrl, sanitizeWhatsapp } from '@/lib/url';
import { m } from 'motion/react';
import Image from 'next/image';
import { Slider } from '@/components/Slider';
import { Car, Key, SteeringWheel, GasPump, RoadHorizon, MapPin, InstagramLogo, FacebookLogo, ArrowRight } from '@phosphor-icons/react/dist/ssr';

export const RentalTemplate = ({ config }: { config: CustomerConfig }) => {
  return (
    <div className="min-h-screen font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden bg-white text-slate-900">
      
      {/* CSS Grid Pattern Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '2rem 2rem'
        }}
      />

      {/* Utilitarian Navbar */}
      <nav className="w-full px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 flex justify-between items-center sticky top-0 z-50">
        <div className="text-xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-md flex items-center justify-center shadow-sm">
            <Car weight="fill" size={16} />
          </div>
          {config.businessName}
        </div>
        <a 
          href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20menyewa%20kendaraan`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-md hover:bg-blue-600 transition-colors text-sm font-mono tracking-wide"
        >
          <span>[ BOOK_NOW ]</span>
          <ArrowRight weight="bold" />
        </a>
      </nav>

      {/* Tech/Precise Hero */}
      <section className="relative px-6 py-20 lg:py-32 overflow-hidden border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          <div className="lg:col-span-6 flex flex-col items-start">
            <m.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-mono mb-8 uppercase tracking-widest"
            >
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Available for Booking
            </m.div>
            
            <m.h1 
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[1.05] text-slate-900 mb-8 font-sans"
            >
              {config.tagline}
            </m.h1>
            
            <m.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 mb-12 max-w-lg font-medium leading-relaxed"
            >
              {config.description}
            </m.p>
            
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4">
               <div className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                 <Key weight="duotone" size={24} className="text-blue-600" />
                 <div className="flex flex-col">
                   <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Process</span>
                   <span className="font-semibold text-sm">Instant Approval</span>
                 </div>
               </div>
               <div className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                 <RoadHorizon weight="duotone" size={24} className="text-blue-600" />
                 <div className="flex flex-col">
                   <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Coverage</span>
                   <span className="font-semibold text-sm">Nationwide</span>
                 </div>
               </div>
            </m.div>
          </div>
          
          <div className="lg:col-span-6 relative">
            <m.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="relative p-2 bg-white border border-slate-200 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
            >
              <div className="absolute top-4 left-4 flex gap-1.5 z-20">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>
              <div className="w-full aspect-[4/3] md:aspect-video relative rounded-lg overflow-hidden bg-slate-100">
                {config.images?.gallery && config.images.gallery.length > 0 ? (
                  <Slider images={config.images.gallery} aspectRatio="aspect-[4/3] md:aspect-video" rounded="rounded-lg" fullWidth />
                ) : config.images?.hero ? (
                  <Image src={config.images.hero} alt="Fleet" fill sizes="100vw" priority className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-slate-400">NO_DATA</div>
                )}
              </div>
            </m.div>
            
            {/* Tech decorations */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 border-r border-b border-blue-600 pointer-events-none" />
            <div className="absolute -left-4 -top-4 w-12 h-12 border-l border-t border-slate-300 pointer-events-none" />
          </div>
          
        </div>
      </section>

      {/* Fleet Price List */}
      <section className="py-24 px-6 max-w-[1600px] mx-auto relative z-10">
        <div className="mb-12 flex items-end justify-between border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-sans text-slate-900 mb-2">Fleet Options</h2>
            <p className="text-slate-500 font-medium">Select your preferred vehicle.</p>
          </div>
          <span className="hidden md:inline-block font-mono text-xs text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded">
            SYS.FLEET_DATA
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.services.map((svc, i) => {
            const iconsList = [
              <Car key={0} weight="light" size={40} />,
              <Key key={1} weight="light" size={40} />,
              <SteeringWheel key={2} weight="light" size={40} />,
              <GasPump key={3} weight="light" size={40} />
            ];
            const Icon = iconsList[i % iconsList.length];
            return (
              <m.div 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, amount: 0.1 }} 
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={i} 
                className="bg-white border border-slate-200 rounded-lg p-8 hover:border-blue-600 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-blue-600 transition-all transform group-hover:scale-110 pointer-events-none">
                  {Icon}
                </div>
                
                <div className="w-12 h-12 bg-slate-50 rounded text-slate-700 flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-slate-100">
                  {Icon}
                </div>
                
                <h3 className="text-2xl font-bold tracking-tight mb-3 text-slate-900 font-sans group-hover:text-blue-600 transition-colors">{svc.name}</h3>
                
                {svc.desc && <p className="text-slate-500 text-sm mb-8 flex-grow leading-relaxed">{svc.desc}</p>}
                
                <div className="w-full h-px bg-slate-100 mb-6 group-hover:bg-blue-100 transition-colors" />
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Rate</span>
                  <div className="text-xl font-bold font-mono text-slate-900 group-hover:text-blue-600 transition-colors">
                    {svc.price}
                  </div>
                </div>
              </m.div>
            );
          })}
        </div>
      </section>

      {/* Structured Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 relative z-10 border-t-4 border-blue-600">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center">
                <Car weight="fill" size={16} />
              </div>
              <h3 className="text-xl font-bold text-white font-sans tracking-tight">{config.businessName}</h3>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Premium fleet rental services with transparent pricing and instant booking capabilities.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-slate-500">Headquarters</span>
            <div className="flex items-start gap-3">
              <MapPin weight="fill" size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-slate-300 text-sm font-medium leading-relaxed">{config.contact.address}</p>
            </div>
            <a href={sanitizeUrl(config.contact.mapsLink)} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-white transition-colors text-sm font-medium w-max">
              Open in Maps &rarr;
            </a>
          </div>
          
          <div className="flex flex-col gap-4">
             <span className="font-mono text-xs uppercase tracking-widest text-slate-500">Connect</span>
             <div className="flex flex-col gap-3 font-medium text-sm">
               <a href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20menyewa%20kendaraan`} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white transition-colors w-max">
                 WhatsApp Support
               </a>
               {config.contact.instagram && (
                 <a href={sanitizeUrl(config.contact.instagram)} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 w-max">
                   <InstagramLogo weight="fill" size={18} /> Instagram
                 </a>
               )}
               {config.contact.facebook && (
                 <a href={sanitizeUrl(config.contact.facebook)} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 w-max">
                   <FacebookLogo weight="fill" size={18} /> Facebook
                 </a>
               )}
             </div>
          </div>
          
        </div>
        
        <div className="max-w-[1600px] mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono">
          <span>&copy; {new Date().getFullYear()} {config.businessName}. ALL_RIGHTS_RESERVED.</span>
          <span className="text-slate-600">SYS_STATUS: ONLINE</span>
        </div>
      </footer>
    </div>
  );
};
