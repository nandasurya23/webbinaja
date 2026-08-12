"use client";
import React from 'react';
import { CustomerConfig } from '@/types/config';
import { sanitizeUrl, sanitizeWhatsapp } from '@/lib/url';
import { m } from 'motion/react';
import Image from 'next/image';
import { Slider } from '@/components/Slider';
import { Car, Key, SteeringWheel, GasPump, RoadHorizon, MapPin, InstagramLogo, FacebookLogo, TiktokLogo, Storefront, Clock, ArrowRight } from '@phosphor-icons/react/dist/ssr';

export const RentalTemplate = ({ config }: { config: CustomerConfig }) => {
  return (
    <div className="min-h-screen font-sans selection:bg-accent selection:text-white overflow-x-hidden bg-primary text-secondary">
      
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
      <nav className="w-full px-6 py-4 bg-primary/80 backdrop-blur-md border-b border-secondary/10 flex justify-between items-center sticky top-0 z-50">
        <div className="text-xl font-bold tracking-tight text-secondary font-sans flex items-center gap-3">
          <div className="w-8 h-8 bg-accent text-white rounded-md flex items-center justify-center shadow-sm overflow-hidden">
            {config.images?.logo ? (
              <Image src={config.images.logo} alt={config.businessName} width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <Car weight="fill" size={16} />
            )}
          </div>
          {config.businessName}
        </div>
        <a 
          href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20menyewa%20kendaraan`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-primary font-medium rounded-md hover:bg-accent transition-colors text-sm font-mono tracking-wide"
        >
          <span>[ BOOK_NOW ]</span>
          <ArrowRight weight="bold" />
        </a>
      </nav>

      {/* Tech/Precise Hero */}
      <section className="relative px-6 py-20 lg:py-32 overflow-hidden border-b border-secondary/10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          <div className="lg:col-span-6 flex flex-col items-start">
            <m.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded text-xs font-mono mb-8 uppercase tracking-widest"
            >
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Available for Booking
            </m.div>
            
            <m.h1 
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[1.05] text-secondary mb-8 font-sans"
            >
              {config.tagline}
            </m.h1>
            
            <m.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-secondary/60 mb-12 max-w-lg font-medium leading-relaxed"
            >
              {config.description}
            </m.p>
            
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4">
               <div className="flex items-center gap-3 px-6 py-4 bg-primary border border-secondary/10 rounded-lg shadow-sm">
                 <Key weight="duotone" size={24} className="text-accent" />
                 <div className="flex flex-col">
                   <span className="text-[10px] text-secondary/40 font-mono uppercase tracking-widest">Process</span>
                   <span className="font-semibold text-sm">Instant Approval</span>
                 </div>
               </div>
               <div className="flex items-center gap-3 px-6 py-4 bg-primary border border-secondary/10 rounded-lg shadow-sm">
                 <RoadHorizon weight="duotone" size={24} className="text-accent" />
                 <div className="flex flex-col">
                   <span className="text-[10px] text-secondary/40 font-mono uppercase tracking-widest">Coverage</span>
                   <span className="font-semibold text-sm">Nationwide</span>
                 </div>
               </div>
            </m.div>
          </div>
          
          <div className="lg:col-span-6 relative">
            <m.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="relative p-2 bg-primary border border-secondary/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
            >
              <div className="absolute top-4 left-4 flex gap-1.5 z-20">
                <div className="w-2.5 h-2.5 rounded-full bg-secondary/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-secondary/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-secondary/10" />
              </div>
              <div className="w-full aspect-[4/3] md:aspect-video relative rounded-lg overflow-hidden bg-secondary/5">
                {config.images?.gallery && config.images.gallery.length > 0 ? (
                  <Slider images={config.images.gallery} aspectRatio="aspect-[4/3] md:aspect-video" rounded="rounded-lg" fullWidth />
                ) : config.images?.hero ? (
                  <Image src={config.images.hero} alt="Fleet" fill sizes="100vw" priority className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-secondary/40">NO_DATA</div>
                )}
              </div>
            </m.div>
            
            {/* Tech decorations */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 border-r border-b border-accent pointer-events-none" />
            <div className="absolute -left-4 -top-4 w-12 h-12 border-l border-t border-secondary/20 pointer-events-none" />
          </div>
          
        </div>
      </section>

      {/* Fleet Price List */}
      <section className="py-24 px-6 max-w-[1600px] mx-auto relative z-10">
        <div className="mb-12 flex items-end justify-between border-b border-secondary/10 pb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-sans text-secondary mb-2">Fleet Options</h2>
            <p className="text-secondary/60 font-medium">Select your preferred vehicle.</p>
          </div>
          <span className="hidden md:inline-block font-mono text-xs text-secondary/40 uppercase tracking-widest border border-secondary/10 px-3 py-1 rounded">
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
                className="bg-primary border border-secondary/10 rounded-lg p-8 hover:border-accent hover:shadow-lg transition-all group relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-accent transition-all transform group-hover:scale-110 pointer-events-none">
                  {Icon}
                </div>
                
                <div className="w-12 h-12 bg-secondary/5 rounded text-secondary/80 flex items-center justify-center mb-6 group-hover:bg-accent/10 group-hover:text-accent transition-colors border border-secondary/5">
                  {Icon}
                </div>
                
                <h3 className="text-2xl font-bold tracking-tight mb-3 text-secondary font-sans group-hover:text-accent transition-colors">{svc.name}</h3>
                
                {svc.desc && <p className="text-secondary/60 text-sm mb-8 flex-grow leading-relaxed">{svc.desc}</p>}
                
                <div className="w-full h-px bg-secondary/5 mb-6 group-hover:bg-accent/20 transition-colors" />
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-secondary/40 uppercase tracking-widest">Rate</span>
                  <div className="text-xl font-bold font-mono text-secondary group-hover:text-accent transition-colors">
                    {svc.price}
                  </div>
                </div>
              </m.div>
            );
          })}
        </div>
      </section>

      {/* Catalog / Produk Tambahan */}
      {config.catalog && config.catalog.length > 0 && (
        <section className="py-24 px-6 max-w-[1600px] mx-auto relative z-10">
          <div className="mb-12 flex items-end justify-between border-b border-secondary/10 pb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight font-sans text-secondary mb-2">Produk Tambahan</h2>
              <p className="text-secondary/60 font-medium">Lengkapi perjalananmu.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.catalog.map((item, i) => (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={i}
                className="bg-primary border border-secondary/10 rounded-lg overflow-hidden hover:border-accent hover:shadow-lg transition-all group flex flex-col"
              >
                {item.image && (
                  <div className="w-full aspect-square relative overflow-hidden">
                    <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                  </div>
                )}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold tracking-tight mb-3 text-secondary font-sans group-hover:text-accent transition-colors">{item.name}</h3>
                  {item.desc && <p className="text-secondary/60 text-sm mb-8 flex-grow leading-relaxed">{item.desc}</p>}
                  <div className="w-full h-px bg-secondary/5 mb-6 group-hover:bg-accent/20 transition-colors" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-secondary/40 uppercase tracking-widest">Harga</span>
                    <div className="text-xl font-bold font-mono text-secondary group-hover:text-accent transition-colors">{item.price}</div>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </section>
      )}

      {/* Structured Footer */}
      <footer className="bg-secondary text-primary/60 py-16 px-6 relative z-10 border-t-4 border-accent">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-accent text-white rounded flex items-center justify-center">
                <Car weight="fill" size={16} />
              </div>
              <h3 className="text-xl font-bold text-primary font-sans tracking-tight">{config.businessName}</h3>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Premium fleet rental services with transparent pricing and instant booking capabilities.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-primary/60">Headquarters</span>
            <div className="flex items-start gap-3">
              <MapPin weight="fill" size={20} className="text-accent shrink-0 mt-0.5" />
              <p className="text-primary/80 text-sm font-medium leading-relaxed">{config.contact.address}</p>
            </div>
            <a href={sanitizeUrl(config.contact.mapsLink)} target="_blank" rel="noreferrer" className="text-primary/80 hover:text-primary transition-colors text-sm font-medium w-max">
              Open in Maps &rarr;
            </a>
          </div>
          
          <div className="flex flex-col gap-4">
             <span className="font-mono text-xs uppercase tracking-widest text-primary/60">Connect</span>
             <div className="flex flex-col gap-3 font-medium text-sm">
               <a href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20menyewa%20kendaraan`} target="_blank" rel="noreferrer" className="text-primary/80 hover:text-primary transition-colors w-max">
                 WhatsApp Support
               </a>
               {config.contact.instagram && (
                 <a href={sanitizeUrl(config.contact.instagram)} target="_blank" rel="noreferrer" className="text-primary/80 hover:text-primary transition-colors flex items-center gap-2 w-max">
                   <InstagramLogo weight="fill" size={18} /> Instagram
                 </a>
               )}
               {config.contact.facebook && (
                 <a href={sanitizeUrl(config.contact.facebook)} target="_blank" rel="noreferrer" className="text-primary/80 hover:text-primary transition-colors flex items-center gap-2 w-max">
                   <FacebookLogo weight="fill" size={18} /> Facebook
                 </a>
               )}
               {config.contact.tiktok && (
                 <a href={sanitizeUrl(config.contact.tiktok)} target="_blank" rel="noreferrer" className="text-primary/80 hover:text-primary transition-colors flex items-center gap-2 w-max">
                   <TiktokLogo weight="fill" size={18} /> TikTok
                 </a>
               )}
               {config.contact.marketplace && (
                 <a href={sanitizeUrl(config.contact.marketplace)} target="_blank" rel="noreferrer" className="text-primary/80 hover:text-primary transition-colors flex items-center gap-2 w-max">
                   <Storefront weight="fill" size={18} /> Marketplace
                 </a>
               )}
               {config.business?.openingHours?.[0] && (
                 <span className="text-primary/80 flex items-center gap-2 w-max">
                   <Clock weight="fill" size={18} /> {config.business.openingHours[0]}
                 </span>
               )}
             </div>
          </div>
          
        </div>
        
        <div className="max-w-[1600px] mx-auto mt-16 pt-8 border-t border-primary/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono">
          <span>&copy; {new Date().getFullYear()} {config.businessName}. ALL_RIGHTS_RESERVED.</span>
          <span className="text-primary/40">SYS_STATUS: ONLINE</span>
        </div>
      </footer>
    </div>
  );
};
